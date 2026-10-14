// PROTOTYPE data for the studio mock: every option the customer can pick, plus mock pricing.
// Nothing here talks to a backend.

// under /home because the Clerk middleware only lets /home/** through without a session
export const ASSETS = "/home/prototype-assets/studio";

export type StepId =
  | "upload"
  | "frame"
  | "scene"
  | "look"
  | "output"
  | "review";

export const STEPS: {
  id: StepId;
  label: string;
  title: string;
  blurb: string;
}[] = [
  {
    id: "upload",
    label: "Model",
    title: "Upload your model",
    blurb:
      "Drop in the CAD export of your robot. We read it in your browser so you can frame it straight away.",
  },
  {
    id: "frame",
    label: "Frame",
    title: "Orient and frame",
    blurb:
      "Turn the robot, pick the shape of the picture, then capture each shot you want rendered.",
  },
  {
    id: "scene",
    label: "Scene",
    title: "Choose a background",
    blurb:
      "The scene sets the backdrop, the floor and the lighting. The viewport previews the mood, not the final light.",
  },
  {
    id: "look",
    label: "Look",
    title: "Condition and materials",
    blurb:
      "Fresh off the printer, or straight out of the arena. Damage is generated from your geometry at render time.",
  },
  {
    id: "output",
    label: "Output",
    title: "Resolution and delivery",
    blurb:
      "Pick how large and how fast. Every render is checked by a person before it reaches you.",
  },
  {
    id: "review",
    label: "Review",
    title: "Review your render",
    blurb:
      "Check the shots and settings. You can still change anything after adding it to your cart.",
  },
];

// ---------------------------------------------------------------- framing
export type AspectId = "16:9" | "3:2" | "4:3" | "1:1" | "4:5" | "21:9";

export const ASPECTS: { id: AspectId; w: number; h: number; use: string }[] = [
  { id: "16:9", w: 16, h: 9, use: "Video, slides" },
  { id: "3:2", w: 3, h: 2, use: "Print, posters" },
  { id: "4:3", w: 4, h: 3, use: "Team sheets" },
  { id: "1:1", w: 1, h: 1, use: "Avatars, grids" },
  { id: "4:5", w: 5, h: 4, use: "Social feed" },
  { id: "21:9", w: 21, h: 9, use: "Banners" },
];

export type Orientation = "landscape" | "portrait";

export function aspectRatio(id: AspectId, orientation: Orientation): number {
  const a = ASPECTS.find((x) => x.id === id) ?? ASPECTS[0]!;
  const wide = Math.max(a.w, a.h) / Math.min(a.w, a.h);
  return orientation === "landscape" ? wide : 1 / wide;
}

export type ViewPreset = "hero" | "front" | "side" | "back" | "top";

export const VIEW_PRESETS: {
  id: ViewPreset;
  label: string;
  az: number;
  el: number;
}[] = [
  { id: "hero", label: "Hero", az: 35, el: 13 },
  { id: "front", label: "Front", az: 0, el: 8 },
  { id: "side", label: "Side", az: 90, el: 8 },
  { id: "back", label: "Back", az: 215, el: 18 },
  { id: "top", label: "Top", az: 0, el: 88 },
];

export const LENSES = [24, 35, 50, 85, 135];

export type Pose = {
  position: [number, number, number];
  target: [number, number, number];
  lens: number;
};

export type Shot = {
  id: string;
  name: string;
  thumb: string;
  pose: Pose;
  aspect: AspectId;
  orientation: Orientation;
};

export const MAX_SHOTS = 4;

// ---------------------------------------------------------------- scenes
export type SceneId =
  | "arena"
  | "cinematic"
  | "studio"
  | "colour"
  | "transparent";

export type SceneDef = {
  id: SceneId;
  name: string;
  blurb: string;
  thumb?: string;
  tag?: string;
  // viewport preview
  bgTop: string;
  bgBottom: string;
  floor: string;
  floorRoughness: number;
  envIntensity: number;
  exposure: number;
  dark: boolean;
};

export const SCENES: SceneDef[] = [
  {
    id: "arena",
    name: "Arena",
    blurb: "Dark stage, three spotlights cutting through haze.",
    thumb: `${ASSETS}/renders/arena-battle.jpg`,
    tag: "New",
    bgTop: "#07080a",
    bgBottom: "#191a1e",
    floor: "#0c0d10",
    floorRoughness: 0.22,
    envIntensity: 0.7,
    exposure: 1.05,
    dark: true,
  },
  {
    id: "cinematic",
    name: "Cinematic studio",
    blurb: "Black cyclorama, soft key light, hard rim lights.",
    thumb: `${ASSETS}/renders/scene-cinematic.jpg`,
    bgTop: "#15161a",
    bgBottom: "#3a3c42",
    floor: "#16171a",
    floorRoughness: 0.3,
    envIntensity: 0.85,
    exposure: 1.0,
    dark: true,
  },
  {
    id: "studio",
    name: "Clean studio",
    blurb: "Even, bright light on a seamless grey sweep.",
    thumb: `${ASSETS}/renders/scene-studio.jpg`,
    bgTop: "#3b3c41",
    bgBottom: "#8b8d93",
    floor: "#55575c",
    floorRoughness: 0.5,
    envIntensity: 1.0,
    exposure: 1.0,
    dark: true,
  },
  {
    id: "colour",
    name: "Seamless colour",
    blurb: "A single backdrop colour of your choice.",
    bgTop: "#e9e9ec",
    bgBottom: "#c9cace",
    floor: "#d5d6da",
    floorRoughness: 0.65,
    envIntensity: 1.05,
    exposure: 0.95,
    dark: false,
  },
  {
    id: "transparent",
    name: "Transparent",
    blurb: "No backdrop. PNG with an alpha channel and a soft contact shadow.",
    bgTop: "transparent",
    bgBottom: "transparent",
    floor: "#000000",
    floorRoughness: 1,
    envIntensity: 1.0,
    exposure: 1.0,
    dark: false,
  },
];

export const BACKDROP_COLOURS = [
  "#e6e6ea",
  "#1d1d1f",
  "#f2ead8",
  "#d9432f",
  "#f47b20",
  "#f6c343",
  "#2f7d5b",
  "#1f5fbf",
  "#5b3fa8",
];

export type FloorId = "gloss" | "matte" | "none";

// ---------------------------------------------------------------- look
export type ConditionId = "fresh" | "handled" | "battle";

export const CONDITIONS: { id: ConditionId; name: string; blurb: string }[] = [
  { id: "fresh", name: "Factory fresh", blurb: "Clean parts, no marks." },
  {
    id: "handled",
    name: "Pit-handled",
    blurb: "Fingerprints and smudges only.",
  },
  { id: "battle", name: "Battle-worn", blurb: "Came out of a fight." },
];

export type DamageKey = "breakage" | "blade" | "scratches" | "grime" | "prints";

export const DAMAGE: { key: DamageKey; name: string; blurb: string }[] = [
  {
    key: "breakage",
    name: "Broken prints",
    blurb: "Torn corners, split layers, chipped edges on printed parts.",
  },
  {
    key: "blade",
    name: "Chipped blade",
    blurb: "Flakes and bites off the weapon's edges, worn bright at the rim.",
  },
  {
    key: "scratches",
    name: "Scratches",
    blurb: "Scuffs on plastic and metal, running with the weapon's spin.",
  },
  {
    key: "grime",
    name: "Dust and grime",
    blurb: "Arena dust on flat tops, oily dirt in the recesses.",
  },
  {
    key: "prints",
    name: "Fingerprints",
    blurb: "Prints and wipe marks on carbon plates and flat faces.",
  },
];

export type MaterialMode = "auto" | "original" | "clay";

export const PRINT_COLOURS = [
  "#f26a1b",
  "#1f58c7",
  "#d92b2b",
  "#f2c230",
  "#2f9e5f",
  "#8a4fd3",
  "#e8e8ea",
  "#1c1c1e",
];

export const FILAMENTS = ["PLA glossy", "PLA matte", "PETG", "Nylon CF", "TPU"];

// ---------------------------------------------------------------- output
export type ResolutionId = "1080p" | "1440p" | "4k" | "8k";

export const RESOLUTIONS: {
  id: ResolutionId;
  name: string;
  long: number;
  price: number;
  use: string;
}[] = [
  { id: "1080p", name: "1080p", long: 1920, price: 0, use: "Screens, social" },
  { id: "1440p", name: "1440p", long: 2560, price: 1, use: "Desktop, decks" },
  { id: "4k", name: "4K", long: 3840, price: 2, use: "Print up to A3" },
  { id: "8k", name: "8K", long: 7680, price: 6, use: "Banners, posters" },
];

export function pixelSize(res: ResolutionId, ratio: number): [number, number] {
  const long = RESOLUTIONS.find((r) => r.id === res)?.long ?? 1920;
  const even = (n: number) => Math.round(n / 2) * 2;
  return ratio >= 1 ? [long, even(long / ratio)] : [even(long * ratio), long];
}

export type FormatId = "png" | "jpg" | "exr";
export const FORMATS: { id: FormatId; name: string; blurb: string }[] = [
  { id: "png", name: "PNG", blurb: "16-bit, lossless" },
  { id: "jpg", name: "JPG", blurb: "Small, shareable" },
  { id: "exr", name: "EXR", blurb: "32-bit, for grading" },
];

export type QualityId = "standard" | "hero";
export type TurnaroundId = "standard" | "rush";

// ---------------------------------------------------------------- config + pricing
export type StudioConfig = {
  units: "mm" | "in";
  upAxis: "y" | "z";
  materialMode: MaterialMode;
  primary: string;
  secondary: string;

  aspect: AspectId;
  orientation: Orientation;
  lens: number;
  fstop: number;
  thirds: boolean;

  scene: SceneId;
  floor: FloorId;
  haze: number;
  backdrop: string;

  condition: ConditionId;
  intensity: number;
  damage: Record<DamageKey, boolean>;
  seed: number;
  layerLines: boolean;
  filament: string;

  resolution: ResolutionId;
  format: FormatId;
  quality: QualityId;
  turnaround: TurnaroundId;
  sceneFile: boolean;
};

export const DEFAULT_CONFIG: StudioConfig = {
  units: "mm",
  upAxis: "y",
  materialMode: "auto",
  primary: "#f26a1b",
  secondary: "#1f58c7",

  aspect: "16:9",
  orientation: "landscape",
  lens: 50,
  fstop: 8,
  thirds: false,

  scene: "arena",
  floor: "gloss",
  haze: 50,
  backdrop: "#e6e6ea",

  condition: "fresh",
  intensity: 60,
  damage: {
    breakage: true,
    blade: true,
    scratches: true,
    grime: true,
    prints: true,
  },
  seed: 4207,
  layerLines: true,
  filament: "PLA glossy",

  resolution: "4k",
  format: "png",
  quality: "standard",
  turnaround: "standard",
  sceneFile: false,
};

export type PriceLine = { label: string; amount: number };

// Shot bundles match the live options page: up to 2 photos $12, 3 photos $16, 4 photos $20.
const SHOT_BUNDLES: Record<number, number> = { 1: 12, 2: 12, 3: 16, 4: 20 };

export function price(
  config: StudioConfig,
  shotCount: number,
): { lines: PriceLine[]; total: number } {
  const shots = Math.min(Math.max(shotCount, 1), MAX_SHOTS);
  const lines: PriceLine[] = [
    {
      label: `${shots} rendered ${shots === 1 ? "shot" : "shots"}`,
      amount: SHOT_BUNDLES[shots] ?? 12,
    },
  ];
  const res = RESOLUTIONS.find((r) => r.id === config.resolution);
  if (res && res.price > 0)
    lines.push({ label: `${res.name} resolution`, amount: res.price });
  if (config.condition === "battle")
    lines.push({ label: "Battle damage", amount: 4 });
  if (config.condition === "handled")
    lines.push({ label: "Fingerprints pass", amount: 1 });
  if (config.quality === "hero")
    lines.push({ label: "Hero quality", amount: 4 });
  if (config.turnaround === "rush")
    lines.push({ label: "Rush, 24 hours", amount: 6 });
  if (config.sceneFile) lines.push({ label: "Blender scene file", amount: 5 });
  return { lines, total: lines.reduce((sum, l) => sum + l.amount, 0) };
}

export function money(n: number): string {
  return `$${n.toFixed(2)}`;
}
