"use client";

// PROTOTYPE: the 3D viewport. Owns one StudioEngine (three.js), draws the picture frame, the thirds
// guides and the axis gizmo over it, and exposes the engine to the page through a ref.

import {
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { type CameraInfo, StudioEngine } from "../_lib/engine";
import type { LoadedModel } from "../_lib/model-loader";
import {
  aspectRatio,
  pixelSize,
  SCENES,
  type StudioConfig,
} from "../_lib/options";

export type ViewportHandle = {
  engine: () => StudioEngine | null;
};

type Props = {
  model: LoadedModel | null;
  config: StudioConfig;
  yaw: number;
  grid: boolean;
  mask: boolean;
  tool: "orbit" | "pan";
  onCamera: (info: CameraInfo) => void;
  children?: ReactNode;
};

const AXES = ["#ff5a4f", "#46c46b", "#4a8cff"] as const;
const PAD_X = 28;
const PAD_Y = 52; // room under the frame for its pixel-size label

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => {
    const v = (n >> shift) & 255;
    return Math.round(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount));
  };
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

export const Viewport = forwardRef<ViewportHandle, Props>(function Viewport(
  { model, config, yaw, grid, mask, tool, onCamera, children },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<StudioEngine | null>(null);
  const gizmoRef = useRef<SVGSVGElement>(null);
  const onCameraRef = useRef(onCamera);
  onCameraRef.current = onCamera;
  const [size, setSize] = useState({ cw: 0, ch: 0 });

  useImperativeHandle(ref, () => ({ engine: () => engineRef.current }), []);

  const ratio = aspectRatio(config.aspect, config.orientation);
  const frame = useMemo(() => {
    const maxW = Math.max(size.cw - PAD_X * 2, 10);
    const maxH = Math.max(size.ch - PAD_Y * 2, 10);
    const fw = Math.min(maxW, maxH * ratio);
    return { fw, fh: fw / ratio };
  }, [size, ratio]);

  // engine lifetime
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const engine = new StudioEngine(canvas);
    engineRef.current = engine;
    let last = 0;
    engine.onCamera = (info) => {
      const lines =
        gizmoRef.current?.querySelectorAll<SVGGElement>("g[data-axis]");
      lines?.forEach((g, i) => {
        const [x, y] = info.axes[i] ?? [0, 0];
        const line = g.querySelector("line");
        const dot = g.querySelector("circle");
        const text = g.querySelector("text");
        line?.setAttribute("x2", String(x * 20));
        line?.setAttribute("y2", String(-y * 20));
        dot?.setAttribute("cx", String(x * 20));
        dot?.setAttribute("cy", String(-y * 20));
        text?.setAttribute("x", String(x * 30));
        text?.setAttribute("y", String(-y * 30));
      });
      const now = performance.now();
      if (now - last > 90) {
        last = now;
        onCameraRef.current(info);
      }
    };
    const observer = new ResizeObserver(() =>
      setSize({ cw: host.clientWidth, ch: host.clientHeight }),
    );
    observer.observe(host);
    setSize({ cw: host.clientWidth, ch: host.clientHeight });
    return () => {
      observer.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (size.cw > 0 && size.ch > 0)
      engineRef.current?.resize(size.cw, size.ch, frame.fw, frame.fh);
  }, [size, frame]);

  useEffect(() => {
    engineRef.current?.setModel(model, model?.nativeUp ?? "y");
  }, [model]);

  useEffect(() => {
    engineRef.current?.setUpAxis(config.upAxis);
  }, [config.upAxis]);

  useEffect(() => {
    engineRef.current?.applyPalette(
      config.materialMode,
      config.primary,
      config.secondary,
    );
  }, [model, config.materialMode, config.primary, config.secondary]);

  useEffect(() => {
    engineRef.current?.setLens(config.lens);
  }, [config.lens]);

  useEffect(() => {
    engineRef.current?.setYaw(yaw);
  }, [yaw]);

  useEffect(() => {
    engineRef.current?.setGrid(grid);
  }, [grid]);

  useEffect(() => {
    engineRef.current?.setTool(tool);
  }, [tool]);

  const scene = SCENES.find((s) => s.id === config.scene) ?? SCENES[0]!;
  useEffect(() => {
    engineRef.current?.applyScene(
      scene,
      config.floor,
      config.haze,
      config.backdrop,
    );
  }, [scene, config.floor, config.haze, config.backdrop]);

  const background =
    !model || scene.id === "transparent"
      ? undefined
      : scene.id === "colour"
        ? `linear-gradient(180deg, ${shade(config.backdrop, 0.12)} 0%, ${config.backdrop} 55%, ${shade(config.backdrop, -0.16)} 100%)`
        : `radial-gradient(120% 90% at 50% 100%, ${scene.bgBottom} 0%, ${scene.bgTop} 70%)`;
  const [pw, ph] = pixelSize(config.resolution, ratio);

  return (
    <div
      ref={hostRef}
      className={`absolute inset-0 ${model && scene.id === "transparent" ? "rs-checker" : ""}`}
      style={{ background }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full cursor-grab touch-none active:cursor-grabbing"
        style={{ opacity: model ? 1 : 0 }}
        aria-label="3D preview of your model. Drag to orbit, scroll to zoom."
      />

      {model && mask && size.cw > 0 && (
        <div
          className="rs-frame"
          style={{
            width: frame.fw,
            height: frame.fh,
            left: (size.cw - frame.fw) / 2,
            top: (size.ch - frame.fh) / 2,
          }}
        >
          <span className="rs-frame-tick -top-px -left-px border-r-0 border-b-0" />
          <span className="rs-frame-tick -top-px -right-px border-b-0 border-l-0" />
          <span className="rs-frame-tick -bottom-px -left-px border-t-0 border-r-0" />
          <span className="rs-frame-tick -right-px -bottom-px border-t-0 border-l-0" />
          {config.thirds && (
            <>
              <span className="absolute inset-y-0 left-1/3 w-px bg-white/30" />
              <span className="absolute inset-y-0 left-2/3 w-px bg-white/30" />
              <span className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
              <span className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
            </>
          )}
          <span className="rs-chip rs-mono absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap">
            {pw} × {ph}
          </span>
        </div>
      )}

      <svg
        ref={gizmoRef}
        viewBox="-40 -40 80 80"
        className="pointer-events-none absolute bottom-3 left-3 size-[72px]"
        aria-hidden
        style={{ opacity: model ? 1 : 0 }}
      >
        <circle r="34" fill="rgba(230,230,230,.92)" />
        {(["X", "Y", "Z"] as const).map((axis, i) => (
          <g key={axis} data-axis={axis}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="0"
              stroke={AXES[i]}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle r="3.2" fill={AXES[i]} />
            <text
              fontSize="9"
              fontWeight="700"
              fill={AXES[i]}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {axis}
            </text>
          </g>
        ))}
      </svg>

      {children}
    </div>
  );
});
