"use client";

// PROTOTYPE: small neumorphic building blocks shared by the studio panels (shadcn primitives underneath).

import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { Switch } from "~/components/ui/switch";
import { Slider } from "~/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { cn } from "~/lib/utils";

export function Section({
  title,
  hint,
  action,
  children,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="rs-label">{title}</h3>
          {hint && (
            <p className="mt-1 text-[12.5px] leading-snug text-[var(--rs-ink-3)]">
              {hint}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Seg<T extends string>({
  value,
  onChange,
  options,
  label,
  stretch,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode; title?: string }[];
  label: string;
  stretch?: boolean;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      aria-label={label}
      onValueChange={(v) => v && onChange(v as T)}
      className={cn("rs-seg", stretch && "flex w-full", className)}
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          title={o.title}
          className={cn("rs-seg-item", stretch && "flex-1")}
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function SwitchRow({
  title,
  blurb,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  blurb?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 py-2.5",
        disabled && "opacity-45",
      )}
    >
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold">{title}</span>
        {blurb && (
          <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--rs-ink-3)]">
            {blurb}
          </span>
        )}
      </span>
      <Switch
        className="rs-switch"
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </label>
  );
}

export function SliderRow({
  title,
  value,
  min,
  max,
  step = 1,
  onChange,
  readout,
}: {
  title: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  readout: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] font-semibold">{title}</span>
        <span className="rs-lcd rs-mono px-2.5 py-1 text-[11px]">
          {readout}
        </span>
      </div>
      <Slider
        className="rs-slider"
        aria-label={title}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
    </div>
  );
}

export function Swatches({
  colours,
  value,
  onChange,
  label,
}: {
  colours: string[];
  value: string;
  onChange: (colour: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {colours.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          data-selected={value === c}
          className="rs-swatch"
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
      <label
        className="rs-swatch relative grid cursor-pointer place-items-center overflow-hidden bg-[conic-gradient(#e33,#fc3,#3c6,#39f,#93f,#e33)]"
        title="Custom colour"
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={`${label}, custom`}
        />
      </label>
    </div>
  );
}

/** Selectable card with a lamp in the corner. */
export function OptionCard({
  selected,
  onSelect,
  children,
  className,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      data-selected={selected}
      onClick={onSelect}
      className={cn("rs-card block w-full text-left", className)}
    >
      {children}
      {selected && (
        <span className="absolute top-2.5 right-2.5 grid size-5 place-items-center rounded-full bg-[var(--rs-accent)] text-white shadow-[2px_2px_5px_rgba(0,0,0,.25),-2px_-2px_5px_rgba(255,255,255,.9)]">
          <Check className="size-3" strokeWidth={3.5} />
        </span>
      )}
    </button>
  );
}

export function Lamp({ on }: { on?: "accent" | "ok" | false }) {
  return <span className="rs-led" data-on={on === false ? undefined : on} />;
}
