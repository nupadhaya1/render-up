"use client";

// The coming-soon page. One screen: a glass nav bar, a real render of the sample robot floating in space over
// live stars, and a line of copy. No sign-up.
// Black and red, very little blue, no orange in the UI. Glassmorphism (frosted blur), not neumorphism.
// On the dev server, add ?admin to the address to get the Admin button (bottom right) that tunes the stars.

import { useEffect, useState } from "react";

import { AdminPanel } from "./admin-panel";
import { Hero } from "./hero";
import {
  HERO_DEFAULTS,
  type HeroSettings,
  loadDraft,
  sanitize,
  SAVE_URL,
  SAVED_URL,
  storeDraft,
} from "./settings";

// saving writes a file, which only a dev machine can do (see hero-settings/route.ts)
const CAN_TUNE = process.env.NODE_ENV !== "production";

export function Landing() {
  // built-in defaults, then what has been saved for everyone, then (when tuning) this browser's unsaved draft
  const [settings, setSettings] = useState<HeroSettings>(HERO_DEFAULTS);
  const [saved, setSaved] = useState<HeroSettings>(HERO_DEFAULTS);
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setAdmin(
      CAN_TUNE && new URLSearchParams(window.location.search).has("admin"),
    );
    const draft = CAN_TUNE ? loadDraft() : null;
    if (draft) setSettings(draft);
    void fetch(SAVED_URL, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<unknown>) : null))
      .then((json) => {
        if (cancelled || !json) return;
        const stored = sanitize(json);
        setSaved(stored);
        if (!draft) setSettings(stored);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  const update = (next: HeroSettings) => {
    setSettings(next);
    storeDraft(next);
  };
  const save = async () => {
    try {
      const response = await fetch(SAVE_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) return false;
      setSaved(settings);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="lp-root">
      <header className="lp-nav-wrap">
        <div className="lp-nav lp-glass">
          <span className="lp-brand">RENDER UP</span>
        </div>
      </header>

      <Hero settings={settings} />

      {admin && (
        <AdminPanel
          settings={settings}
          saved={saved}
          onChange={update}
          onSave={save}
        />
      )}
    </div>
  );
}
