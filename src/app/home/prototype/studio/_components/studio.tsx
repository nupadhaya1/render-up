"use client";

// PROTOTYPE: "What should the create-a-render page look like?"
// One design, as briefed by the owner (full neumorphism in the /home colour theme, shadcn/ui,
// three.js viewport on the left), not the usual set of variants.
// Everything is in memory: no upload, no cart API, no checkout.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Frame,
  Grid3x3,
  Hand,
  HelpCircle,
  Loader2,
  Maximize,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Rotate3d,
  ShoppingCart,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

import type { CameraInfo } from "../_lib/engine";
import { ACCEPT, type LoadedModel, loadModel } from "../_lib/model-loader";
import { sendToUs } from "../_lib/send";
import {
  aspectRatio,
  ASSETS,
  DEFAULT_CONFIG,
  MAX_SHOTS,
  money,
  pixelSize,
  price,
  RESOLUTIONS,
  SCENES,
  type Shot,
  type StepId,
  STEPS,
  type StudioConfig,
  VIEW_PRESETS,
  type ViewPreset,
} from "../_lib/options";
import { Lamp, Seg } from "./controls";
import { Knob } from "./knob";
import {
  FrameStep,
  type Loading,
  LookStep,
  OutputStep,
  ReviewStep,
  SceneStep,
  type Setter,
  UploadStep,
} from "./steps";
import { Viewport, type ViewportHandle } from "./viewport";

type CartItem = {
  id: string;
  name: string;
  thumb: string;
  total: number;
  summary: string;
};

export function Studio() {
  const viewport = useRef<ViewportHandle>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<StudioConfig>(DEFAULT_CONFIG);
  const [step, setStep] = useState<StepId>("upload");
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [loading, setLoading] = useState<Loading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [yaw, setYaw] = useState(0);
  const [grid, setGrid] = useState(true);
  const [mask, setMask] = useState(true);
  const [tool, setTool] = useState<"orbit" | "pan">("orbit");
  const [view, setView] = useState<ViewPreset | "">("hero");
  const [camera, setCamera] = useState<CameraInfo | null>(null);
  const [dims, setDims] = useState<[number, number, number] | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [added, setAdded] = useState<CartItem | null>(null);

  const set: Setter = useCallback(
    (key, value) => setConfig((c) => ({ ...c, [key]: value })),
    [],
  );
  const engine = () => viewport.current?.engine() ?? null;

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const current = STEPS[stepIndex]!;
  const scene = SCENES.find((s) => s.id === config.scene) ?? SCENES[0]!;
  const ratio = aspectRatio(config.aspect, config.orientation);
  const { lines, total } = useMemo(
    () => price(config, shots.length),
    [config, shots.length],
  );

  // a view preset stays lit only while the camera is still on it
  const viewLock = useRef(0); // until this time the camera is still swinging to the chosen preset
  const onCamera = useCallback((info: CameraInfo) => {
    setCamera(info);
    if (performance.now() < viewLock.current) return;
    setView((v) => {
      const preset = VIEW_PRESETS.find((p) => p.id === v);
      if (!preset) return v;
      const dAz = Math.abs(((info.az - preset.az + 540) % 360) - 180);
      const onIt =
        Math.abs(info.el - preset.el) < 2 && (preset.el > 80 || dAz < 2);
      return onIt ? v : "";
    });
  }, []);

  // ------------------------------------------------------------ upload
  const ingest = useCallback(
    async (source: File | { url: string; name: string }) => {
      setError(null);
      setModel(null);
      setShots([]);
      setStep("upload");
      setYaw(0);
      const name = source.name;
      setLoading({ stage: "reading", percent: 8, name });
      try {
        const loaded = await loadModel(source, (stage) =>
          setLoading({
            stage: stage === "reading" ? "reading" : "converting",
            percent:
              stage === "reading" ? 12 : stage === "converting" ? 28 : 46,
            name,
          }),
        );
        setConfig((c) => ({ ...c, upAxis: loaded.nativeUp }));
        setModel(loaded);
        setView("hero");
        // the preview is ready; a file from a tester is also sent to us (the test build's upload)
        if (source instanceof File) {
          setLoading({ stage: "uploading", percent: 62, name });
          try {
            await sendToUs(source, (percent) =>
              setLoading({
                stage: "uploading",
                percent: 62 + Math.round(percent * 0.38),
                name,
              }),
            );
          } catch (e) {
            setError(
              `Your preview is ready, but the file could not be sent to us: ${
                e instanceof Error ? e.message : "upload failed"
              }`,
            );
          }
        }
        setLoading(null);
      } catch (e) {
        setLoading(null);
        setError(
          e instanceof Error ? e.message : "This file could not be read.",
        );
      }
    },
    [],
  );

  useEffect(() => {
    const over = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      setDragOver(true);
    };
    const leave = (e: DragEvent) => {
      if (e.relatedTarget === null) setDragOver(false);
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files[0];
      if (file) void ingest(file);
    };
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [ingest]);

  // model size as oriented (after the viewport has applied the change)
  const refreshDims = useCallback(() => {
    requestAnimationFrame(() =>
      setDims(viewport.current?.engine()?.dimensionsMm() ?? null),
    );
  }, []);
  useEffect(refreshDims, [model, config.upAxis, refreshDims]);

  // ------------------------------------------------------------ shots
  const capture = useCallback((): Shot | null => {
    const e = viewport.current?.engine();
    if (!e || !model) return null;
    const top = scene.id === "colour" ? config.backdrop : scene.bgTop;
    const bottom = scene.id === "colour" ? config.backdrop : scene.bgBottom;
    const shot: Shot = {
      id: crypto.randomUUID(),
      name: `Shot ${shots.length + 1}`,
      thumb: e.capture(top, bottom),
      pose: e.getPose(),
      aspect: config.aspect,
      orientation: config.orientation,
    };
    setShots((s) => (s.length >= MAX_SHOTS ? s : [...s, shot]));
    return shot;
  }, [
    model,
    scene,
    config.backdrop,
    config.aspect,
    config.orientation,
    shots.length,
  ]);

  const restore = (shot: Shot) => {
    setConfig((c) => ({
      ...c,
      aspect: shot.aspect,
      orientation: shot.orientation,
      lens: shot.pose.lens,
    }));
    setView("");
    requestAnimationFrame(() => engine()?.applyPose(shot.pose, true));
  };

  // ------------------------------------------------------------ navigation
  const go = (id: StepId) => {
    if (!model && id !== "upload") return;
    if (id !== "frame" && id !== "upload" && shots.length === 0) capture();
    setStep(id);
  };
  const goRef = useRef(go);
  goRef.current = go;
  const next = () => {
    const to = STEPS[stepIndex + 1];
    if (to) go(to.id);
  };
  const back = () => {
    const to = STEPS[stepIndex - 1];
    if (to) setStep(to.id);
  };

  const addToCart = () => {
    if (!model) return;
    const [w, h] = pixelSize(config.resolution, ratio);
    const item: CartItem = {
      id: crypto.randomUUID(),
      name: model.name,
      thumb: shots[0]?.thumb ?? "",
      total,
      summary: `${shots.length} ${shots.length === 1 ? "shot" : "shots"} · ${scene.name} · ${w} × ${h}`,
    };
    setCart((c) => [...c, item]);
    setAdded(item);
  };

  const startOver = () => {
    setAdded(null);
    setModel(null);
    setShots([]);
    setConfig(DEFAULT_CONFIG);
    setStep("upload");
    setYaw(0);
  };

  const pickFile = () => fileInput.current?.click();

  // dev-only hook so a model can be loaded by URL from the console (used to test STEP files)
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as {
      __studioLoad?: (url: string, name: string) => void;
    };
    w.__studioLoad = (url, name) => void ingest({ url, name });
    return () => {
      delete w.__studioLoad;
    };
  }, [ingest]);

  // shareable state: ?sample=1 loads the sample robot, &step=scene (or look, output, ...) opens that screen
  const pendingStep = useRef<StepId | null>(null);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (!query.has("sample")) return;
    const wanted = STEPS.find((s) => s.id === query.get("step"));
    pendingStep.current = wanted?.id ?? null;
    void ingest({
      url: `${ASSETS}/sample-robot.glb`,
      name: "Yeetus V3 Assembly.glb",
    });
  }, [ingest]);
  useEffect(() => {
    if (!model || loading || !pendingStep.current) return;
    const id = pendingStep.current;
    pendingStep.current = null;
    // wait a frame so the viewport has drawn the model before a shot is captured
    requestAnimationFrame(() => requestAnimationFrame(() => goRef.current(id)));
  }, [model, loading]);

  const turn = (axis: "x" | "y" | "z") => {
    engine()?.rotate(axis, 90);
    refreshDims();
  };

  const res = RESOLUTIONS.find((r) => r.id === config.resolution);

  const stepper = (
    <ol className="rs-seg">
      {STEPS.map((s, i) => {
        const locked = !model && s.id !== "upload";
        return (
          <li key={s.id}>
            <button
              type="button"
              disabled={locked}
              data-state={s.id === step ? "on" : "off"}
              aria-current={s.id === step ? "step" : undefined}
              onClick={() => go(s.id)}
              className="rs-seg-item flex items-center gap-2 disabled:opacity-45"
            >
              <Lamp
                on={s.id === step ? "accent" : i < stepIndex ? "ok" : false}
              />
              {s.label}
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <TooltipProvider delayDuration={250}>
      <div className="rs-root">
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void ingest(file);
          }}
        />

        {/* ------------------------------------------------------------ top bar */}
        <header className="flex h-[72px] flex-none items-center gap-4 px-6">
          <a
            href="/home"
            className="rs-brand text-[26px] leading-none whitespace-nowrap"
            aria-label="Render-Up home"
          >
            RENDER UP
          </a>
          <span className="rs-lcd px-2.5 py-1 text-[10px] font-bold tracking-widest text-[var(--rs-ink-3)] max-sm:hidden">
            PROTOTYPE
          </span>

          <nav aria-label="Steps" className="mx-auto hidden xl:block">
            {stepper}
          </nav>

          <div className="ml-auto flex items-center gap-3 xl:ml-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="rs-btn rs-btn-icon"
                  aria-label="Viewport help"
                >
                  <HelpCircle />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={10}
                className="rs-float w-64 p-5 text-[13px]"
              >
                <p className="mb-2.5 font-bold">Moving around</p>
                <ul className="space-y-2 text-[var(--rs-ink-2)]">
                  <li className="flex justify-between">
                    <span>Orbit</span>
                    <span className="rs-mono text-[12px]">drag</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Pan</span>
                    <span className="rs-mono text-[12px]">right-drag</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Zoom</span>
                    <span className="rs-mono text-[12px]">scroll / pinch</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Spin the robot</span>
                    <span className="rs-mono text-[12px]">turntable</span>
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              className="rs-btn"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart /> Cart
              <span
                className={cn(
                  "rs-mono grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold",
                  cart.length
                    ? "bg-[var(--rs-accent)] text-white"
                    : "rs-lcd text-[var(--rs-ink-3)]",
                )}
              >
                {cart.length}
              </span>
            </Button>
            <span className="rs-pad size-[38px] rounded-full text-[12px] font-bold">
              NU
            </span>
          </div>
        </header>

        <nav
          aria-label="Steps"
          className="flex-none overflow-x-auto px-6 pb-4 xl:hidden"
        >
          {stepper}
        </nav>

        {/* ------------------------------------------------------------ work area */}
        <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-6 pb-6 lg:flex-row lg:overflow-hidden">
          <div className="flex min-w-0 flex-none flex-col gap-5 lg:min-h-0 lg:flex-1">
            <div className="rs-bezel flex min-h-0 flex-1 flex-col gap-3.5">
              {/* viewport tools: pressed-in groups and raised buttons, outside the picture */}
              <div className="flex flex-none flex-wrap items-center gap-x-3 gap-y-2 px-1">
                <Seg
                  label="Camera view"
                  value={view as ViewPreset}
                  onChange={(v) => {
                    if (!model) return;
                    viewLock.current = performance.now() + 900;
                    setView(v);
                    engine()?.setView(v);
                  }}
                  options={VIEW_PRESETS.map((p) => ({
                    value: p.id,
                    label: p.label,
                  }))}
                  className={cn(!model && "pointer-events-none opacity-45")}
                />
                <div className="ml-auto flex items-center gap-2.5">
                  <Seg
                    label="Drag tool"
                    value={tool}
                    onChange={setTool}
                    options={[
                      {
                        value: "orbit",
                        label: <Rotate3d className="size-4" />,
                        title: "Drag to orbit",
                      },
                      {
                        value: "pan",
                        label: <Hand className="size-4" />,
                        title: "Drag to pan",
                      },
                    ]}
                  />
                  <ToolButton
                    label="Floor grid"
                    on={grid}
                    onClick={() => setGrid(!grid)}
                  >
                    <Grid3x3 />
                  </ToolButton>
                  <ToolButton
                    label="Picture frame"
                    on={mask}
                    onClick={() => setMask(!mask)}
                  >
                    <Frame />
                  </ToolButton>
                  <span className="mx-0.5 h-6 w-1 rounded-full shadow-[inset_1px_1px_2px_var(--nm-dark),inset_-1px_-1px_2px_var(--nm-light)]" />
                  <ToolButton
                    label="Zoom out"
                    disabled={!model}
                    onClick={() => engine()?.zoom(1.2)}
                  >
                    <Minus />
                  </ToolButton>
                  <ToolButton
                    label="Zoom in"
                    disabled={!model}
                    onClick={() => engine()?.zoom(1 / 1.2)}
                  >
                    <Plus />
                  </ToolButton>
                  <ToolButton
                    label="Fit robot to frame"
                    disabled={!model}
                    onClick={() => engine()?.fit()}
                  >
                    <Maximize />
                  </ToolButton>
                  <Button
                    variant="ghost"
                    className="rs-btn rs-btn-sm text-[var(--rs-accent-deep)]"
                    disabled={!model || shots.length >= MAX_SHOTS}
                    onClick={capture}
                  >
                    <Camera /> Capture
                  </Button>
                </div>
              </div>

              <div className="rs-screen min-h-[340px] flex-1 lg:min-h-0">
                <Viewport
                  ref={viewport}
                  model={model}
                  config={config}
                  yaw={yaw}
                  grid={grid && !!model}
                  mask={mask}
                  tool={tool}
                  onCamera={onCamera}
                >
                  {model && (
                    <div className="pointer-events-none absolute top-3.5 left-1/2 flex -translate-x-1/2 gap-2">
                      <span className="rs-chip">{scene.name}</span>
                      {config.condition !== "fresh" && (
                        <span className="rs-chip max-md:hidden">
                          <Lamp on="accent" />{" "}
                          {config.condition === "battle"
                            ? "Damage"
                            : "Fingerprints"}{" "}
                          added at render
                        </span>
                      )}
                    </div>
                  )}

                  {!model && !loading && (
                    <div className="absolute inset-0 grid place-items-center p-6 text-center">
                      <div className="max-w-sm">
                        <span className="rs-pad mx-auto size-20 rounded-[28px] shadow-[var(--nm-raise)]">
                          <Upload className="size-8 text-[var(--rs-accent-deep)]" />
                        </span>
                        <h2 className="mt-7 text-[26px] font-bold tracking-tight">
                          Drop your robot here
                        </h2>
                        <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--rs-ink-3)]">
                          Upload the STEP export of your assembly. It opens
                          right here, so you can turn it and frame the picture
                          before we render it.
                        </p>
                        <div className="mt-7 flex justify-center gap-4">
                          <Button className="rs-btn-primary" onClick={pickFile}>
                            Choose a file
                          </Button>
                        </div>
                        <p className="rs-mono mt-6 text-[11px] tracking-wide text-[var(--rs-ink-4)]">
                          STEP · GLB · STL · OBJ
                        </p>
                      </div>
                    </div>
                  )}

                  {loading && !model && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="flex flex-col items-center gap-4">
                        <span className="rs-pad size-16 rounded-full shadow-[var(--nm-raise-sm)]">
                          <Loader2 className="size-7 animate-spin text-[var(--rs-accent-deep)]" />
                        </span>
                        <p className="text-[14px] font-medium text-[var(--rs-ink-3)]">
                          {loading.stage === "converting"
                            ? "Converting CAD surfaces…"
                            : "Reading your model…"}
                        </p>
                      </div>
                    </div>
                  )}

                  {dragOver && (
                    <div className="absolute inset-4 grid place-items-center rounded-[18px] bg-[rgba(230,230,230,.9)] text-[18px] font-bold text-[var(--rs-accent-deep)] outline-2 outline-offset-[-2px] outline-[var(--rs-accent)] outline-dashed">
                      Release to upload
                    </div>
                  )}
                </Viewport>
              </div>
            </div>

            {/* control deck */}
            <div className="rs-panel flex flex-none flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
              <div className="flex items-center gap-4">
                <Knob
                  label="Turntable"
                  value={yaw}
                  min={0}
                  max={360}
                  step={1}
                  wrap
                  ticks={24}
                  size={70}
                  onChange={setYaw}
                  format={(v) => `${v} degrees`}
                />
                <div>
                  <p className="rs-label">Turntable</p>
                  <p className="rs-mono mt-1 text-[16px] font-bold">
                    {Math.round(yaw)}°
                  </p>
                </div>
              </div>

              <div>
                <p className="rs-label mb-2">Quarter turns</p>
                <div className="flex gap-2.5">
                  {(
                    [
                      ["x", "#d93a30", "Tip forward"],
                      ["y", "#1f9a4a", "Spin"],
                      ["z", "#2b6be6", "Roll"],
                    ] as const
                  ).map(([axis, colour, title]) => (
                    <Tooltip key={axis}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className="rs-btn rs-btn-sm gap-1 px-2.5"
                          disabled={!model}
                          onClick={() => turn(axis)}
                          aria-label={`${title} 90 degrees`}
                        >
                          <RotateCw className="size-3.5" />
                          <span
                            className="rs-mono font-bold"
                            style={{ color: colour }}
                          >
                            {axis.toUpperCase()}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{title} 90°</TooltipContent>
                    </Tooltip>
                  ))}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="rs-btn rs-btn-sm rs-btn-icon"
                        disabled={!model}
                        aria-label="Reset orientation"
                        onClick={() => {
                          engine()?.resetOrientation();
                          setYaw(0);
                          refreshDims();
                        }}
                      >
                        <RotateCcw className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset orientation</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="rs-lcd ml-auto hidden min-w-0 flex-1 items-center gap-x-5 gap-y-0.5 rounded-2xl px-4 py-3 sm:flex sm:max-w-[520px] sm:flex-wrap">
                <span className="max-w-[180px] truncate">
                  <b>FILE </b>
                  {model?.name ?? "none"}
                </span>
                <span>
                  <b>AZ </b>
                  {camera && model ? `${camera.az.toFixed(0)}°` : "--"}
                </span>
                <span>
                  <b>EL </b>
                  {camera && model ? `${camera.el.toFixed(0)}°` : "--"}
                </span>
                <span>
                  <b>DIST </b>
                  {camera && model ? `${camera.distance.toFixed(2)} m` : "--"}
                </span>
                <span>
                  <b>LENS </b>
                  <em>{config.lens} mm</em>
                </span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ inspector */}
          <aside
            className="rs-panel flex w-full flex-none flex-col lg:w-[450px]"
            aria-label={current.title}
          >
            <div className="flex-none px-7 pt-6 pb-5">
              <p className="rs-label">
                Step {stepIndex + 1} of {STEPS.length}
              </p>
              <h1 className="mt-2 text-[24px] leading-tight font-bold tracking-tight">
                {current.title}
              </h1>
              <p className="mt-2 text-[13.5px] leading-snug text-[var(--rs-ink-3)]">
                {current.blurb}
              </p>
            </div>
            <hr className="rs-hairline flex-none" />

            <div
              key={step}
              className="rs-scroll min-h-0 flex-1 overflow-y-auto px-7 py-6"
            >
              {step === "upload" && (
                <UploadStep
                  config={config}
                  set={set}
                  model={model}
                  loading={loading}
                  error={error}
                  dims={dims}
                  onPick={pickFile}
                  onRemove={startOver}
                />
              )}
              {step === "frame" && (
                <FrameStep
                  config={config}
                  set={set}
                  shots={shots}
                  onCapture={capture}
                  onRestore={restore}
                  onDelete={(id) =>
                    setShots((s) => s.filter((x) => x.id !== id))
                  }
                  onRename={(id, name) =>
                    setShots((s) =>
                      s.map((x) => (x.id === id ? { ...x, name } : x)),
                    )
                  }
                />
              )}
              {step === "scene" && <SceneStep config={config} set={set} />}
              {step === "look" && <LookStep config={config} set={set} />}
              {step === "output" && <OutputStep config={config} set={set} />}
              {step === "review" && model && (
                <ReviewStep
                  config={config}
                  model={model}
                  shots={shots}
                  lines={lines}
                  total={total}
                  onEdit={setStep}
                />
              )}
            </div>

            <hr className="rs-hairline flex-none" />
            <div className="flex flex-none items-center gap-4 px-7 py-5">
              <div className="rs-lcd min-w-0 flex-1 rounded-2xl px-4 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <b className="text-[10px] tracking-widest">TOTAL</b>
                  <em className="text-[17px]">{model ? money(total) : "--"}</em>
                </div>
                <div className="truncate text-[10.5px] text-[var(--rs-ink-4)]">
                  {model
                    ? `${Math.max(shots.length, 1)} ${shots.length > 1 ? "shots" : "shot"} · ${res?.name} · ${config.turnaround === "rush" ? "24 h" : "48 h"}`
                    : "Upload a model to start"}
                </div>
              </div>
              {stepIndex > 0 && (
                <Button
                  variant="ghost"
                  className="rs-btn h-11 w-11 rounded-2xl p-0"
                  onClick={back}
                  aria-label="Back"
                >
                  <ArrowLeft />
                </Button>
              )}
              {step === "review" ? (
                <Button className="rs-btn-primary" onClick={addToCart}>
                  <ShoppingCart /> Add to cart
                </Button>
              ) : (
                <Button
                  className="rs-btn-primary"
                  onClick={next}
                  disabled={!model || !!loading}
                >
                  Continue <ArrowRight />
                </Button>
              )}
            </div>
          </aside>
        </main>

        {/* ------------------------------------------------------------ cart */}
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent className="rs-float flex flex-col gap-0 rounded-none rounded-l-[30px] p-0 sm:max-w-md">
            <SheetHeader className="px-7 pt-7 pb-5 text-left">
              <SheetTitle className="text-[22px] font-bold tracking-tight">
                Your cart
              </SheetTitle>
              <SheetDescription>
                {cart.length === 0
                  ? "Nothing here yet."
                  : "One payment covers every model in the cart."}
              </SheetDescription>
            </SheetHeader>
            <hr className="rs-hairline" />
            <div className="rs-scroll flex-1 space-y-4 overflow-y-auto p-7">
              {cart.length === 0 && (
                <div className="rs-well grid place-items-center gap-3 px-6 py-12 text-center text-[13px] text-[var(--rs-ink-3)]">
                  <ShoppingCart className="size-6" />
                  Finish setting up a render and add it here.
                </div>
              )}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rs-card flex items-center gap-3.5 p-2.5"
                >
                  <span className="rs-thumb h-14 w-24 flex-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumb}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold">
                      {item.name}
                    </p>
                    <p className="truncate text-[12px] text-[var(--rs-ink-3)]">
                      {item.summary}
                    </p>
                    <p className="rs-mono mt-0.5 text-[12.5px] font-bold text-[var(--rs-commit-deep)]">
                      {money(item.total)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="rs-btn rs-btn-sm rs-btn-icon"
                    aria-label={`Remove ${item.name}`}
                    onClick={() =>
                      setCart((c) => c.filter((x) => x.id !== item.id))
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
            <hr className="rs-hairline" />
            <SheetFooter className="flex-col gap-4 p-7 sm:flex-col sm:space-x-0">
              <div className="flex items-baseline justify-between">
                <span className="text-[13.5px] font-bold">Subtotal</span>
                <span className="rs-mono text-[19px] font-bold text-[var(--rs-commit-deep)]">
                  {money(cart.reduce((s, i) => s + i.total, 0))}
                </span>
              </div>
              <Button className="rs-btn-primary w-full" disabled>
                Checkout
              </Button>
              <p className="text-center text-[12px] text-[var(--rs-ink-3)]">
                Checkout is not part of this prototype.
              </p>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Dialog open={!!added} onOpenChange={(open) => !open && setAdded(null)}>
          <DialogContent className="rs-float gap-5 p-7 sm:max-w-md sm:rounded-[28px]">
            <DialogHeader>
              <span className="rs-pad mb-2 size-12 rounded-full text-[var(--rs-accent-deep)]">
                <Check className="size-6" strokeWidth={3} />
              </span>
              <DialogTitle className="text-[22px] font-bold tracking-tight">
                Added to your cart
              </DialogTitle>
              <DialogDescription>
                Your model is stored for 24 hours. Pay within that time and it
                goes straight to rendering.
              </DialogDescription>
            </DialogHeader>
            {added && (
              <div className="rs-well flex items-center gap-3.5 p-3">
                <span className="rs-thumb h-16 w-28 flex-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={added.thumb}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-bold">
                    {added.name}
                  </p>
                  <p className="truncate text-[12px] text-[var(--rs-ink-3)]">
                    {added.summary}
                  </p>
                  <p className="rs-mono mt-0.5 text-[13px] font-bold text-[var(--rs-commit-deep)]">
                    {money(added.total)}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="gap-4 sm:gap-4">
              <Button
                variant="ghost"
                className="rs-btn h-11 rounded-2xl px-5"
                onClick={startOver}
              >
                Upload another model
              </Button>
              <Button
                className="rs-btn-primary"
                onClick={() => {
                  setAdded(null);
                  setCartOpen(true);
                }}
              >
                View cart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function ToolButton({
  label,
  on,
  disabled,
  onClick,
  children,
}: {
  label: string;
  on?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="rs-btn rs-btn-sm rs-btn-icon"
          aria-label={label}
          aria-pressed={on}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
