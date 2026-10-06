// The hero's tunable star settings (shared by the page, the admin panel and the save route).
// Three layers, later ones win:
//   1. the built-in defaults below ("Reset to default" always goes back to these),
//   2. the saved settings: hero-settings.json, written by "Save new settings" (dev server only, no database yet),
//   3. this browser's unsaved draft (localStorage), so tuning survives a reload before it is saved.

export type StarSettings = {
  /** overall brightness, 1 = as designed */
  brightness: number;
  /** number of sharp stars */
  density: number;
  /** star size multiplier */
  size: number;
  /** how far the field drifts with the pointer, 0 = fixed */
  movement: number;
  /** how much weight the field has: it keeps gliding after the pointer stops, 0 = follows the pointer closely */
  momentum: number;
  /** twinkle speed and depth, 0 = steady */
  twinkle: number;
  /** how strongly stars light up under the pointer, 0 = off */
  hover: number;
  /** radius around the pointer that wakes stars, px */
  reach: number;
  /** number of large out-of-focus stars */
  blurred: number;
};

export type HeroSettings = {
  stars: StarSettings;
};

export const STAR_DEFAULTS: StarSettings = {
  brightness: 1.3,
  density: 3600,
  size: 1,
  movement: 1.6,
  momentum: 1,
  twinkle: 1,
  hover: 1,
  reach: 150,
  blurred: 10,
};

export const HERO_DEFAULTS: HeroSettings = {
  stars: STAR_DEFAULTS,
};

export const STAR_LIMITS: Record<
  keyof StarSettings,
  { min: number; max: number; step: number; label: string }
> = {
  brightness: { min: 0.2, max: 2.5, step: 0.05, label: "Brightness" },
  density: { min: 200, max: 6000, step: 100, label: "Density" },
  size: { min: 0.4, max: 2.5, step: 0.05, label: "Size" },
  movement: { min: 0, max: 4, step: 0.1, label: "Movement" },
  momentum: { min: 0, max: 3, step: 0.1, label: "Momentum" },
  twinkle: { min: 0, max: 3, step: 0.1, label: "Twinkle" },
  hover: { min: 0, max: 2.5, step: 0.05, label: "Hover glow" },
  reach: { min: 40, max: 400, step: 10, label: "Hover reach" },
  blurred: { min: 0, max: 60, step: 1, label: "Blurred stars" },
};

export const STAR_KEYS = Object.keys(STAR_LIMITS) as (keyof StarSettings)[];

export const SAVED_URL = "/home/landing/hero-settings.json";
export const SAVE_URL = "/home/hero-settings";
// v2: drafts from before the defaults were restored (2026-10-06) are ignored
const DRAFT_KEY = "renderup.landing.hero.v2";

/** Anything in, valid settings out: unknown keys dropped, numbers clamped to their slider range. */
export function sanitize(input: unknown): HeroSettings {
  const src = (input ?? {}) as { stars?: Record<string, unknown> };
  const stars = { ...STAR_DEFAULTS };
  for (const key of STAR_KEYS) {
    const value = src.stars?.[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      const { min, max } = STAR_LIMITS[key];
      stars[key] = Math.min(Math.max(value, min), max);
    }
  }
  return { stars };
}

export function sameSettings(a: HeroSettings, b: HeroSettings): boolean {
  return STAR_KEYS.every((k) => a.stars[k] === b.stars[k]);
}

export function loadDraft(): HeroSettings | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? sanitize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function storeDraft(settings: HeroSettings) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(settings));
  } catch {
    // private windows may refuse storage; the panel still works for this visit
  }
}
