"use client";

// PROTOTYPE: rotary knob. Drag up/down (or sideways), or use the arrow keys.

import { useRef } from "react";
import { cn } from "~/lib/utils";

type KnobProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  size?: number;
  /** Degrees of travel from min to max. 360 with `wrap` makes an endless jog wheel. */
  sweep?: number;
  wrap?: boolean;
  ticks?: number;
  label: string;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  className?: string;
};

export function Knob({
  value,
  min,
  max,
  step = 1,
  size = 64,
  sweep = 270,
  wrap = false,
  ticks = 11,
  label,
  onChange,
  format,
  className,
}: KnobProps) {
  const drag = useRef<{ y: number; x: number; value: number } | null>(null);
  const range = max - min;
  const clamp = (v: number) => {
    const snapped = Math.round(v / step) * step;
    if (wrap) return ((((snapped - min) % range) + range) % range) + min;
    return Math.min(max, Math.max(min, snapped));
  };
  const angle = wrap
    ? ((value - min) / range) * 360
    : -sweep / 2 + ((value - min) / range) * sweep;

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={format ? format(value) : String(value)}
      className={cn("rs-knob", className)}
      style={{ width: size, height: size }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { y: e.clientY, x: e.clientX, value };
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const travel =
          drag.current.y - e.clientY + (e.clientX - drag.current.x);
        onChange(clamp(drag.current.value + (travel / 160) * range));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        const big = step * 10;
        const delta =
          e.key === "ArrowUp" || e.key === "ArrowRight"
            ? step
            : e.key === "ArrowDown" || e.key === "ArrowLeft"
              ? -step
              : e.key === "PageUp"
                ? big
                : e.key === "PageDown"
                  ? -big
                  : 0;
        if (delta === 0) return;
        e.preventDefault();
        onChange(clamp(value + delta));
      }}
    >
      {Array.from({ length: ticks }, (_, i) => {
        const a = wrap
          ? (i / ticks) * 360
          : -sweep / 2 + (i / (ticks - 1)) * sweep;
        const lit = !wrap && a <= angle + 0.01;
        return (
          <span
            key={i}
            className="absolute top-1/2 left-1/2 block size-[3px] rounded-full"
            style={{
              background: lit ? "var(--rs-accent)" : "#a3a3a3",
              boxShadow: lit ? "0 0 4px rgba(3,169,252,.8)" : undefined,
              transform: `rotate(${a - 90}deg) translateX(${size / 2 - 7}px)`,
              transformOrigin: "0 50%",
              marginTop: -1.5,
            }}
          />
        );
      })}
      <div className="rs-knob-cap" />
      <div
        className="rs-knob-hand"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <span className="rs-knob-mark" />
      </div>
    </div>
  );
}

/** Knob with a label above and its value pressed into the surface below. */
export function KnobField(props: KnobProps & { caption: string }) {
  const { caption, format, value, size = 64 } = props;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="rs-label">{caption}</span>
      <Knob {...props} size={size} className="mt-1" />
      <span className="rs-lcd rs-mono min-w-16 px-2.5 py-1 text-center text-[11px]">
        {format ? format(value) : value}
      </span>
    </div>
  );
}
