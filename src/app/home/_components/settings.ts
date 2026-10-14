// The hero's tunable star settings (shared by the page, the admin panel and the save route).
// Three layers, later ones win:
//   1. the built-in defaults in STAR_FIELDS ("Reset to default" always goes back to these),
//   2. the saved settings: hero-settings.json, written by "Save new settings" (dev server only, no database yet),
//   3. this browser's unsaved draft (localStorage), so tuning survives a reload before it is saved.

type Field = {
  label: string;
  default: number;
  min: number;
  max: number;
  step: number;
};

/** One row per setting: its default and its slider range live together, so adding a setting is one edit here. */
export const STAR_FIELDS = {
  /** overall brightness, 1 = as designed */
  brightness: {
    label: "Brightness",
    default: 1.3,
    min: 0.2,
    max: 2.5,
    step: 0.05,
  },
  /** number of sharp stars */
  density: { label: "Density", default: 3600, min: 200, max: 6000, step: 100 },
  /** star size multiplier */
  size: { label: "Size", default: 1, min: 0.4, max: 2.5, step: 0.05 },
  /** how far the field drifts with the pointer, 0 = fixed */
  movement: { label: "Movement", default: 1.6, min: 0, max: 4, step: 0.1 },
  /** how much weight the field has: it keeps gliding after the pointer stops, 0 = follows the pointer closely */
  momentum: { label: "Momentum", default: 1, min: 0, max: 3, step: 0.1 },
  /** twinkle speed and depth, 0 = steady */
  twinkle: { label: "Twinkle", default: 1, min: 0, max: 3, step: 0.1 },
  /** how strongly stars light up under the pointer, 0 = off */
  hover: { label: "Hover glow", default: 1, min: 0, max: 2.5, step: 0.05 },
  /** radius around the pointer that wakes stars, px */
  reach: { label: "Hover reach", default: 150, min: 40, max: 400, step: 10 },
  /** number of large out-of-focus stars */
  blurred: { label: "Blurred stars", default: 10, min: 0, max: 60, step: 1 },
} as const satisfies Record<string, Field>;

export type StarKey = keyof typeof STAR_FIELDS;
export type StarSettings = Record<StarKey, number>;

export const STAR_KEYS = Object.keys(STAR_FIELDS) as StarKey[];

export const STAR_DEFAULTS = Object.fromEntries(
  STAR_KEYS.map((key) => [key, STAR_FIELDS[key].default]),
) as StarSettings;

/** Saving writes a file, which only a dev machine can do, so tuning and saving exist off production only. */
export const CAN_TUNE = process.env.NODE_ENV !== "production";

export const SAVED_URL = "/home/landing/hero-settings.json";
export const SAVE_URL = "/home/hero-settings";
// v3: the settings file is flat now (no "stars" wrapper), so older drafts are ignored
const DRAFT_KEY = "renderup.landing.hero.v3";

/** Anything in, valid settings out: unknown keys dropped, numbers clamped to their slider range. */
export function sanitize(input: unknown): StarSettings {
  const src = (input ?? {}) as Record<string, unknown>;
  const settings = { ...STAR_DEFAULTS };
  for (const key of STAR_KEYS) {
    const value = src[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      const { min, max } = STAR_FIELDS[key];
      settings[key] = Math.min(Math.max(value, min), max);
    }
  }
  return settings;
}

export function sameSettings(a: StarSettings, b: StarSettings): boolean {
  return STAR_KEYS.every((k) => a[k] === b[k]);
}

/** A slider value as the panel shows it: whole numbers stay whole, the rest get two decimals. */
export function formatSetting(key: StarKey, value: number): string {
  return STAR_FIELDS[key].step >= 1 ? String(value) : value.toFixed(2);
}

export function loadDraft(): StarSettings | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? sanitize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function storeDraft(settings: StarSettings) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(settings));
  } catch {
    // private windows may refuse storage; the panel still works for this visit
  }
}
