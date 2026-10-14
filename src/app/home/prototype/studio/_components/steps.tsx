"use client";

// PROTOTYPE: the six inspector screens of the studio mock (model, frame, scene, look, output, review).
// Neumorphic: raised cards (rs-card), pressed-in wells (rs-well, rs-lcd), pictures in their own wells (rs-thumb).

import { useState } from "react";
import {
  Box,
  Camera,
  CheckCircle2,
  Dices,
  FileUp,
  ImageIcon,
  Info,
  Pencil,
  RefreshCw,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

import {
  type Category,
  CATEGORY_LABEL,
  formatBytes,
  type LoadedModel,
} from "../_lib/model-loader";
import {
  ASPECTS,
  ASSETS,
  aspectRatio,
  BACKDROP_COLOURS,
  CONDITIONS,
  DAMAGE,
  FILAMENTS,
  FORMATS,
  LENSES,
  MAX_SHOTS,
  money,
  pixelSize,
  PRINT_COLOURS,
  type PriceLine,
  RESOLUTIONS,
  SCENES,
  type Shot,
  type StepId,
  type StudioConfig,
} from "../_lib/options";
import {
  Lamp,
  OptionCard,
  Section,
  Seg,
  SliderRow,
  Swatches,
  SwitchRow,
} from "./controls";
import { KnobField } from "./knob";

export type Setter = <K extends keyof StudioConfig>(
  key: K,
  value: StudioConfig[K],
) => void;

export type Loading = {
  stage: "reading" | "converting";
  percent: number;
  name: string;
};

const CATEGORY_DOT: Record<Category, string> = {
  printed: "linear-gradient(135deg, var(--p) 0 50%, var(--s) 50% 100%)",
  carbon: "repeating-linear-gradient(45deg, #17181b 0 3px, #3a3c42 3px 6px)",
  metal: "linear-gradient(135deg, #f1f2f4, #9fa3ab)",
  weapon: "linear-gradient(135deg, #a9adb5, #4c5058)",
  wheel: "#1c1c1f",
  component: "#3a3e47",
};

// ============================================================================ 1. model
export function UploadStep({
  config,
  set,
  model,
  loading,
  error,
  dims,
  onPick,
  onRemove,
}: {
  config: StudioConfig;
  set: Setter;
  model: LoadedModel | null;
  loading: Loading | null;
  error: string | null;
  dims: [number, number, number] | null;
  onPick: () => void;
  onRemove: () => void;
}) {
  if (!model) {
    const stages: { id: Loading["stage"]; label: string }[] = [
      { id: "reading", label: "Reading the file" },
      { id: "converting", label: "Converting CAD surfaces to a preview" },
    ];
    const at = loading ? stages.findIndex((s) => s.id === loading.stage) : -1;
    return (
      <div className="space-y-6">
        {loading ? (
          <div className="rs-card space-y-5 p-5">
            <div className="flex items-center gap-3.5">
              <span className="rs-pad size-11">
                <Box className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold">
                  {loading.name}
                </p>
                <p className="text-[12.5px] text-[var(--rs-ink-3)]">
                  {loading.stage === "converting"
                    ? "Large assemblies can take a minute."
                    : "Almost there."}
                </p>
              </div>
            </div>
            <Progress value={loading.percent} className="rs-progress" />
            <ul className="space-y-2.5">
              {stages.map((s, i) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2.5 text-[13px]"
                >
                  <Lamp on={i < at ? "ok" : i === at ? "accent" : false} />
                  <span className={cn(i > at && "text-[var(--rs-ink-4)]")}>
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onPick}
              className="rs-drop block w-full px-5 py-8 text-center"
            >
              <span className="rs-pad rs-drop-icon mx-auto size-12">
                <Upload className="size-5" />
              </span>
              <span className="mt-4 block text-[15px] font-bold">
                Choose a file
              </span>
              <span className="mt-1 block text-[12.5px] text-[var(--rs-ink-3)]">
                or drop it anywhere on this page
              </span>
            </button>
            {error && (
              <div className="rs-notice" data-tone="error">
                <TriangleAlert className="size-4" />
                <span>{error}</span>
              </div>
            )}
            <Section title="What to upload">
              <ul className="space-y-2.5 text-[13px] leading-snug">
                {[
                  [
                    "STEP (.step, .stp)",
                    "What we render from. Export the whole assembly as one file.",
                  ],
                  [
                    "Keep part names",
                    "We use them to tell printed parts from carbon plates and fasteners.",
                  ],
                  [
                    "GLB, STL, OBJ",
                    "Fine for framing. We will ask for the STEP before rendering.",
                  ],
                ].map(([title, text]) => (
                  <li key={title} className="flex gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 flex-none text-[var(--rs-accent-deep)]" />
                    <span>
                      <b className="font-semibold">{title}</b>
                      <span className="text-[var(--rs-ink-3)]"> · {text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
            <hr className="rs-hairline" />
            <div className="rs-notice">
              <span>
                Test build: your file opens in this browser and is not sent
                anywhere. Rendering is not live yet.
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  const unit = config.units;
  const k = unit === "mm" ? 1 : 1 / 25.4;
  const fmt = (v: number) =>
    unit === "mm" ? v.toFixed(0) : (v * k).toFixed(2);
  const groups = (Object.entries(model.groups) as [Category, number][]).filter(
    ([, n]) => n > 0,
  );

  return (
    <div className="space-y-6">
      <div className="rs-card p-4">
        <div className="flex items-center gap-3.5">
          <span className="rs-pad size-11">
            <Box className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[13.5px] font-semibold"
              title={model.name}
            >
              {model.name}
            </p>
            <p className="flex items-center gap-1.5 text-[12.5px] text-[var(--rs-ink-3)]">
              <Lamp on="ok" /> Stored with your cart ·{" "}
              {formatBytes(model.bytes)}
            </p>
          </div>
          <span className="rs-lcd px-2.5 py-1 text-[11px] font-bold">
            {model.format}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
          {[
            ["PARTS", model.parts.toLocaleString()],
            ["TRIANGLES", model.triangles.toLocaleString()],
            [
              `SIZE ${unit.toUpperCase()}`,
              dims ? dims.map(fmt).join(" × ") : "…",
            ],
          ].map(([label, value]) => (
            <div key={label} className="rs-lcd px-1 py-2">
              <b className="block text-[9.5px] tracking-wider">{label}</b>
              <span className="text-[11.5px] font-semibold">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            variant="ghost"
            className="rs-btn rs-btn-sm flex-1"
            onClick={onPick}
          >
            <FileUp /> Replace
          </Button>
          <Button
            variant="ghost"
            className="rs-btn rs-btn-sm rs-btn-icon"
            onClick={onRemove}
            aria-label="Remove model"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {model.format !== "STEP" && (
        <div className="rs-notice">
          <Info className="size-4" />
          <span>
            {model.format} files are fine for framing. We render from STEP, so
            we will ask for it at checkout.
          </span>
        </div>
      )}

      <Section
        title="Detected materials"
        hint="Sorted from your part names. We render each group with its own material."
      >
        <ul
          className="rs-well px-4 py-1.5"
          style={
            {
              "--p": config.primary,
              "--s": config.secondary,
            } as React.CSSProperties
          }
        >
          {groups.map(([category, count]) => (
            <li
              key={category}
              className="flex items-center gap-3 py-2 text-[13px]"
            >
              <span
                className="size-4 flex-none rounded-[6px] shadow-[2px_2px_4px_var(--nm-dark),-2px_-2px_4px_var(--nm-light)]"
                style={{ background: CATEGORY_DOT[category] }}
              />
              <span className="flex-1 font-medium">
                {CATEGORY_LABEL[category]}
              </span>
              <span className="rs-mono text-[12px] text-[var(--rs-ink-3)]">
                {count} {count === 1 ? "part" : "parts"}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Print colours"
        hint="Printed parts alternate between two filament colours."
      >
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-[12.5px] font-medium text-[var(--rs-ink-2)]">
              Primary
            </p>
            <Swatches
              colours={PRINT_COLOURS}
              value={config.primary}
              onChange={(c) => set("primary", c)}
              label="Primary print colour"
            />
          </div>
          <div>
            <p className="mb-2 text-[12.5px] font-medium text-[var(--rs-ink-2)]">
              Secondary
            </p>
            <Swatches
              colours={PRINT_COLOURS}
              value={config.secondary}
              onChange={(c) => set("secondary", c)}
              label="Secondary print colour"
            />
          </div>
        </div>
      </Section>

      <Section title="Model setup">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13.5px] font-semibold">Preview</span>
            <Seg
              label="Preview materials"
              value={config.materialMode}
              onChange={(v) => set("materialMode", v)}
              options={[
                { value: "auto", label: "Materials" },
                { value: "original", label: "File colours" },
                { value: "clay", label: "Clay" },
              ]}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13.5px] font-semibold">Up axis</span>
            <Seg
              label="Up axis"
              value={config.upAxis}
              onChange={(v) => set("upAxis", v)}
              options={[
                { value: "y", label: "Y up" },
                { value: "z", label: "Z up" },
              ]}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13.5px] font-semibold">Units</span>
            <Seg
              label="Units"
              value={config.units}
              onChange={(v) => set("units", v)}
              options={[
                { value: "mm", label: "mm" },
                { value: "in", label: "inch" },
              ]}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

// ============================================================================ 2. frame
export function FrameStep({
  config,
  set,
  shots,
  onCapture,
  onRestore,
  onDelete,
  onRename,
}: {
  config: StudioConfig;
  set: Setter;
  shots: Shot[];
  onCapture: () => void;
  onRestore: (shot: Shot) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const portrait = config.orientation === "portrait";
  return (
    <div className="space-y-6">
      <Section
        title="Picture shape"
        action={
          <Seg
            label="Orientation"
            value={config.orientation}
            onChange={(v) => set("orientation", v)}
            options={[
              { value: "landscape", label: "Landscape" },
              { value: "portrait", label: "Portrait" },
            ]}
          />
        }
      >
        <div
          className="grid grid-cols-3 gap-3.5"
          role="radiogroup"
          aria-label="Aspect ratio"
        >
          {ASPECTS.map((a) => {
            const long = Math.max(a.w, a.h);
            const short = Math.min(a.w, a.h);
            const r = long / short;
            const w = portrait ? 30 / r : 30;
            const h = portrait ? 30 : 30 / r;
            return (
              <OptionCard
                key={a.id}
                selected={config.aspect === a.id}
                onSelect={() => set("aspect", a.id)}
                className="px-2 pt-3.5 pb-2.5 text-center"
              >
                <span className="rs-card-title mx-auto grid h-[34px] place-items-center text-[var(--rs-ink-3)]">
                  <span
                    className="block rounded-[4px] border-2 border-current"
                    style={{ width: w, height: h }}
                  />
                </span>
                <span className="rs-card-title rs-mono mt-1.5 block text-[12.5px] font-bold">
                  {portrait ? `${short}:${long}` : `${long}:${short}`}
                </span>
                <span className="block text-[11px] text-[var(--rs-ink-3)]">
                  {a.use}
                </span>
              </OptionCard>
            );
          })}
        </div>
      </Section>

      <Section
        title="Lens"
        hint="Short lenses exaggerate the weapon. Long lenses flatten the robot, like a product photo."
      >
        <div className="rs-card flex items-center gap-5 p-5">
          <KnobField
            caption="Focal length"
            label="Focal length"
            value={config.lens}
            min={24}
            max={135}
            step={1}
            size={72}
            onChange={(v) => set("lens", v)}
            format={(v) => `${v} mm`}
          />
          <KnobField
            caption="Aperture"
            label="Aperture"
            value={config.fstop}
            min={2.8}
            max={16}
            step={0.1}
            size={72}
            onChange={(v) => set("fstop", Math.round(v * 10) / 10)}
            format={(v) => `f/${v.toFixed(1)}`}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap gap-2.5">
              {LENSES.map((mm) => (
                <Button
                  key={mm}
                  variant="ghost"
                  aria-pressed={config.lens === mm}
                  className="rs-btn rs-btn-sm rs-mono px-2.5"
                  onClick={() => set("lens", mm)}
                >
                  {mm}
                </Button>
              ))}
            </div>
            <p className="text-[12px] leading-snug text-[var(--rs-ink-3)]">
              Background blur follows the aperture in the final render. The
              preview stays sharp.
            </p>
          </div>
        </div>
        <SwitchRow
          title="Rule-of-thirds guide"
          checked={config.thirds}
          onChange={(v) => set("thirds", v)}
        />
      </Section>

      <Section
        title={`Shots · ${shots.length} of ${MAX_SHOTS}`}
        hint="Each shot becomes one rendered image. Frame the robot on the left, then capture."
        action={
          <Button
            variant="ghost"
            className="rs-btn rs-btn-sm text-[var(--rs-accent-deep)]"
            onClick={onCapture}
            disabled={shots.length >= MAX_SHOTS}
          >
            <Camera /> Capture
          </Button>
        }
      >
        {shots.length === 0 ? (
          <div className="rs-well flex items-center gap-3 p-5 text-[13px] text-[var(--rs-ink-3)]">
            <ImageIcon className="size-5 flex-none" />
            No shots yet. If you continue without one, we use the current view.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4">
            {shots.map((shot) => (
              <li key={shot.id} className="rs-card p-2.5">
                <button
                  type="button"
                  className="rs-thumb w-full"
                  onClick={() => onRestore(shot)}
                  title="Return to this view"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.thumb}
                    alt={shot.name}
                    className="mx-auto block max-h-[96px] w-auto max-w-full"
                  />
                </button>
                <div className="flex items-center gap-1 px-1 pt-2">
                  {editing === shot.id ? (
                    <input
                      autoFocus
                      defaultValue={shot.name}
                      aria-label="Shot name"
                      className="rs-lcd min-w-0 flex-1 px-2 py-1 font-sans text-[12.5px] font-semibold"
                      onBlur={(e) => {
                        onRename(shot.id, e.target.value.trim() || shot.name);
                        setEditing(null);
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && e.currentTarget.blur()
                      }
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">
                      {shot.name}
                    </span>
                  )}
                  <button
                    type="button"
                    className="grid size-6 place-items-center rounded-md text-[var(--rs-ink-3)] hover:bg-black/5 hover:text-[var(--rs-ink)]"
                    onClick={() => setEditing(shot.id)}
                    aria-label={`Rename ${shot.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="grid size-6 place-items-center rounded-md text-[var(--rs-ink-3)] hover:bg-black/5 hover:text-[#b3261e]"
                    onClick={() => onDelete(shot.id)}
                    aria-label={`Delete ${shot.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

// ============================================================================ 3. scene
export function SceneStep({
  config,
  set,
}: {
  config: StudioConfig;
  set: Setter;
}) {
  return (
    <div className="space-y-6">
      <div
        className="grid grid-cols-2 gap-4"
        role="radiogroup"
        aria-label="Scene"
      >
        {SCENES.map((scene) => (
          <OptionCard
            key={scene.id}
            selected={config.scene === scene.id}
            onSelect={() => set("scene", scene.id)}
            className={cn("p-2.5", scene.id === "arena" && "col-span-2")}
          >
            <span
              className={cn(
                "rs-thumb",
                scene.id === "arena" ? "aspect-[21/9]" : "aspect-video",
                scene.id === "transparent" && "rs-checker",
              )}
              style={
                scene.id === "colour"
                  ? {
                      background: `linear-gradient(180deg, ${config.backdrop}, color-mix(in srgb, ${config.backdrop} 78%, #000))`,
                    }
                  : undefined
              }
            >
              {scene.thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={scene.thumb}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {scene.tag && (
                <span className="absolute top-2.5 left-2.5 rounded-full bg-[var(--rs-commit)] px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-white uppercase shadow">
                  {scene.tag}
                </span>
              )}
            </span>
            <span className="block px-1.5 pt-2.5 pb-1">
              <span className="rs-card-title block text-[13.5px] font-bold">
                {scene.name}
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-[var(--rs-ink-3)]">
                {scene.blurb}
              </span>
            </span>
          </OptionCard>
        ))}
      </div>

      {config.scene === "colour" && (
        <Section title="Backdrop colour">
          <Swatches
            colours={BACKDROP_COLOURS}
            value={config.backdrop}
            onChange={(c) => set("backdrop", c)}
            label="Backdrop colour"
          />
        </Section>
      )}

      {config.scene === "arena" && (
        <Section title="Atmosphere">
          <SliderRow
            title="Haze"
            value={config.haze}
            min={0}
            max={100}
            step={5}
            onChange={(v) => set("haze", v)}
            readout={config.haze === 0 ? "OFF" : `${config.haze}%`}
          />
          <p className="text-[12px] text-[var(--rs-ink-3)]">
            More haze makes the light shafts stand out and softens the
            background.
          </p>
        </Section>
      )}

      <Section title="Floor">
        <Seg
          stretch
          label="Floor"
          value={config.scene === "transparent" ? "none" : config.floor}
          onChange={(v) => set("floor", v)}
          options={[
            { value: "gloss", label: "Glossy" },
            { value: "matte", label: "Matte" },
            { value: "none", label: "Shadow only" },
          ]}
        />
        {config.scene === "transparent" && (
          <p className="text-[12px] text-[var(--rs-ink-3)]">
            Transparent renders keep only a soft contact shadow.
          </p>
        )}
      </Section>
    </div>
  );
}

// ============================================================================ 4. look
function Compare() {
  const [split, setSplit] = useState(52);
  return (
    <div className="rs-card p-2.5">
      <div className="rs-thumb aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${ASSETS}/renders/arena-battle.jpg`}
          alt="Battle-worn render"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${ASSETS}/renders/arena-clean.jpg`}
          alt="Factory fresh render"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        />
        <span className="rs-chip absolute top-2.5 left-2.5">Fresh</span>
        <span className="rs-chip absolute top-2.5 right-2.5">Battle-worn</span>
        <span
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.4)]"
          style={{ left: `${split}%` }}
        >
          <span className="absolute top-1/2 left-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--nm-bg)] text-[10px] font-bold text-[var(--rs-accent-deep)] shadow-[3px_3px_8px_rgba(0,0,0,.45),-2px_-2px_5px_rgba(255,255,255,.5)]">
            ◂▸
          </span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          aria-label="Compare fresh and battle-worn"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="px-1.5 pt-2.5 pb-0.5 text-[12px] text-[var(--rs-ink-3)]">
        Real renders of the sample robot. Drag to compare.
      </p>
    </div>
  );
}

export function LookStep({
  config,
  set,
}: {
  config: StudioConfig;
  set: Setter;
}) {
  const battle = config.condition === "battle";
  return (
    <div className="space-y-6">
      <div className="space-y-4" role="radiogroup" aria-label="Condition">
        {CONDITIONS.map((c) => (
          <OptionCard
            key={c.id}
            selected={config.condition === c.id}
            onSelect={() => set("condition", c.id)}
            className="flex items-center gap-3 px-4 py-3.5 pr-11"
          >
            <span className="min-w-0 flex-1">
              <span className="rs-card-title block text-[13.5px] font-bold">
                {c.name}
              </span>
              <span className="block text-[12.5px] text-[var(--rs-ink-3)]">
                {c.blurb}
              </span>
            </span>
            <span className="rs-mono text-[12px] text-[var(--rs-ink-3)]">
              {c.id === "fresh"
                ? "Included"
                : c.id === "handled"
                  ? "+$1"
                  : "+$4"}
            </span>
          </OptionCard>
        ))}
      </div>

      <Compare />

      {battle && (
        <Section
          title="Damage"
          hint="Placed where a fight would put it: the front, the edges, the weapon."
        >
          <div className="rs-card flex items-center gap-5 p-5">
            <KnobField
              caption="Intensity"
              label="Damage intensity"
              value={config.intensity}
              min={10}
              max={100}
              step={5}
              size={84}
              onChange={(v) => set("intensity", v)}
              format={(v) => `${v}%`}
            />
            <div className="min-w-0 flex-1 space-y-2.5">
              <p className="text-[13px] leading-snug">
                {config.intensity < 35
                  ? "One round in. A few chips and scuffs."
                  : config.intensity < 70
                    ? "A full tournament. Torn corners, a chipped blade."
                    : "Barely survived. Heavy breakage everywhere."}
              </p>
              <div className="flex items-center gap-2">
                <span className="rs-lcd rs-mono px-2.5 py-1.5 text-[11px]">
                  <b>SEED </b>
                  {config.seed}
                </span>
                <Button
                  variant="ghost"
                  className="rs-btn rs-btn-sm"
                  onClick={() =>
                    set("seed", 1000 + Math.floor(Math.random() * 9000))
                  }
                >
                  <Dices /> Reshuffle
                </Button>
              </div>
            </div>
          </div>
          <div>
            {DAMAGE.map((d) => (
              <SwitchRow
                key={d.key}
                title={d.name}
                blurb={d.blurb}
                checked={config.damage[d.key]}
                onChange={(v) =>
                  set("damage", { ...config.damage, [d.key]: v })
                }
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Printed parts">
        <SwitchRow
          title="Real layer lines"
          blurb="We slice your printed parts and render every extruded line."
          checked={config.layerLines}
          onChange={(v) => set("layerLines", v)}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] font-semibold">Filament</span>
          <Select
            value={config.filament}
            onValueChange={(v) => set("filament", v)}
          >
            <SelectTrigger
              className="rs-btn w-[176px] justify-between"
              aria-label="Filament"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rs-float rounded-2xl p-1.5">
              {FILAMENTS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Section>
    </div>
  );
}

// ============================================================================ 5. output
export function OutputStep({
  config,
  set,
}: {
  config: StudioConfig;
  set: Setter;
}) {
  const ratio = aspectRatio(config.aspect, config.orientation);
  return (
    <div className="space-y-6">
      <Section title="Resolution">
        <div
          className="grid grid-cols-2 gap-4"
          role="radiogroup"
          aria-label="Resolution"
        >
          {RESOLUTIONS.map((r) => {
            const [w, h] = pixelSize(r.id, ratio);
            return (
              <OptionCard
                key={r.id}
                selected={config.resolution === r.id}
                onSelect={() => set("resolution", r.id)}
                className="px-4 py-3.5"
              >
                <span className="flex items-baseline justify-between pr-6">
                  <span className="rs-card-title text-[17px] font-bold tracking-tight">
                    {r.name}
                  </span>
                  <span className="rs-mono text-[12px] text-[var(--rs-ink-3)]">
                    {r.price === 0 ? "Included" : `+$${r.price}`}
                  </span>
                </span>
                <span className="rs-mono mt-1 block text-[12px] text-[var(--rs-ink-2)]">
                  {w} × {h}
                </span>
                <span className="block text-[12px] text-[var(--rs-ink-3)]">
                  {r.use}
                </span>
              </OptionCard>
            );
          })}
        </div>
      </Section>

      <Section title="File format">
        <Seg
          stretch
          label="File format"
          value={config.format}
          onChange={(v) => set("format", v)}
          options={FORMATS.map((f) => ({ value: f.id, label: f.name }))}
        />
        <p className="text-[12px] text-[var(--rs-ink-3)]">
          {FORMATS.find((f) => f.id === config.format)?.blurb}
          {config.scene === "transparent" &&
            config.format === "jpg" &&
            ". JPG cannot keep transparency, so the backdrop will be white."}
        </p>
      </Section>

      <Section title="Quality">
        <div
          className="grid grid-cols-2 gap-4"
          role="radiogroup"
          aria-label="Quality"
        >
          {(
            [
              {
                id: "standard",
                name: "Standard",
                text: "Clean at screen size.",
                price: "Included",
              },
              {
                id: "hero",
                name: "Hero",
                text: "Extra passes for print and close crops.",
                price: "+$4",
              },
            ] as const
          ).map((q) => (
            <OptionCard
              key={q.id}
              selected={config.quality === q.id}
              onSelect={() => set("quality", q.id)}
              className="px-4 py-3.5"
            >
              <span className="rs-card-title block pr-6 text-[13.5px] font-bold">
                {q.name}
              </span>
              <span className="block text-[12px] text-[var(--rs-ink-3)]">
                {q.text}
              </span>
              <span className="rs-mono mt-1 block text-[12px] text-[var(--rs-ink-2)]">
                {q.price}
              </span>
            </OptionCard>
          ))}
        </div>
      </Section>

      <Section title="Turnaround">
        <div
          className="grid grid-cols-2 gap-4"
          role="radiogroup"
          aria-label="Turnaround"
        >
          {(
            [
              {
                id: "standard",
                name: "48 hours",
                text: "Standard queue.",
                price: "Included",
              },
              {
                id: "rush",
                name: "24 hours",
                text: "Jumps the queue.",
                price: "+$6",
              },
            ] as const
          ).map((t) => (
            <OptionCard
              key={t.id}
              selected={config.turnaround === t.id}
              onSelect={() => set("turnaround", t.id)}
              className="px-4 py-3.5"
            >
              <span className="rs-card-title block pr-6 text-[13.5px] font-bold">
                {t.name}
              </span>
              <span className="block text-[12px] text-[var(--rs-ink-3)]">
                {t.text}
              </span>
              <span className="rs-mono mt-1 block text-[12px] text-[var(--rs-ink-2)]">
                {t.price}
              </span>
            </OptionCard>
          ))}
        </div>
      </Section>

      <Section title="Extras">
        <SwitchRow
          title="Blender scene file"
          blurb="The .blend with your robot, materials and lights, to keep rendering yourself. +$5"
          checked={config.sceneFile}
          onChange={(v) => set("sceneFile", v)}
        />
      </Section>
    </div>
  );
}

// ============================================================================ 6. review
export function ReviewStep({
  config,
  model,
  shots,
  lines,
  total,
  onEdit,
}: {
  config: StudioConfig;
  model: LoadedModel;
  shots: Shot[];
  lines: PriceLine[];
  total: number;
  onEdit: (step: StepId) => void;
}) {
  const ratio = aspectRatio(config.aspect, config.orientation);
  const [w, h] = pixelSize(config.resolution, ratio);
  const scene = SCENES.find((s) => s.id === config.scene);
  const condition = CONDITIONS.find((c) => c.id === config.condition);
  const damage = DAMAGE.filter((d) => config.damage[d.key]).map((d) =>
    d.name.toLowerCase(),
  );
  const rows: {
    step: StepId;
    label: string;
    value: string;
    detail?: string;
  }[] = [
    {
      step: "upload",
      label: "Model",
      value: model.name,
      detail: `${model.parts} parts · ${model.format}`,
    },
    {
      step: "frame",
      label: "Frame",
      value: `${shots.length} ${shots.length === 1 ? "shot" : "shots"} · ${config.lens} mm · f/${config.fstop.toFixed(1)}`,
      detail: `${config.orientation === "landscape" ? "Landscape" : "Portrait"}, ${w} × ${h}`,
    },
    {
      step: "scene",
      label: "Scene",
      value: scene?.name ?? "",
      detail:
        config.scene === "arena"
          ? `Haze ${config.haze}% · ${config.floor === "none" ? "shadow only" : `${config.floor === "gloss" ? "glossy" : "matte"} floor`}`
          : config.scene === "colour"
            ? `Backdrop ${config.backdrop.toUpperCase()}`
            : undefined,
    },
    {
      step: "look",
      label: "Look",
      value: condition?.name ?? "",
      detail:
        config.condition === "battle"
          ? `${config.intensity}% · ${damage.join(", ") || "no damage types selected"}`
          : config.layerLines
            ? `Real layer lines · ${config.filament}`
            : config.filament,
    },
    {
      step: "output",
      label: "Output",
      value: `${RESOLUTIONS.find((r) => r.id === config.resolution)?.name} ${config.format.toUpperCase()} · ${config.quality === "hero" ? "Hero" : "Standard"}`,
      detail: `${config.turnaround === "rush" ? "24 hours" : "48 hours"}${config.sceneFile ? " · with Blender scene file" : ""}`,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="-m-3 flex gap-4 overflow-x-auto p-3">
        {shots.map((shot) => (
          <figure key={shot.id} className="rs-card flex-none p-2.5">
            <span className="rs-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.thumb}
                alt={shot.name}
                className="block h-[84px] w-auto"
              />
            </span>
            <figcaption className="px-1 pt-2 text-[12px] font-bold">
              {shot.name}
            </figcaption>
          </figure>
        ))}
      </div>

      <dl className="rs-well px-4 py-1.5">
        {rows.map((row) => (
          <div key={row.step} className="flex items-start gap-3 py-3">
            <dt className="rs-label w-14 flex-none pt-0.5">{row.label}</dt>
            <dd className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold">
                {row.value}
              </span>
              {row.detail && (
                <span className="block text-[12.5px] text-[var(--rs-ink-3)]">
                  {row.detail}
                </span>
              )}
            </dd>
            <button
              type="button"
              className="text-[12.5px] font-bold text-[var(--rs-accent-deep)] hover:underline"
              onClick={() => onEdit(row.step)}
            >
              Edit
            </button>
          </div>
        ))}
      </dl>

      <Section title="Price">
        <div className="rs-lcd space-y-2 rounded-2xl p-4 text-[12.5px]">
          {lines.map((line) => (
            <div key={line.label} className="flex justify-between">
              <span>{line.label}</span>
              <span>{money(line.amount)}</span>
            </div>
          ))}
          <hr className="rs-hairline !mx-0 !my-3" />
          <div className="flex justify-between text-[14px] font-bold">
            <span>Total</span>
            <em>{money(total)}</em>
          </div>
        </div>
        <p className="flex items-start gap-2 text-[12.5px] leading-snug text-[var(--rs-ink-3)]">
          <RefreshCw className="mt-0.5 size-3.5 flex-none" />
          Every render is checked by a person before delivery. You pay at
          checkout, once for everything in your cart.
        </p>
      </Section>
    </div>
  );
}
