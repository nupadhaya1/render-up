"use client";

import { useEffect, useState } from "react";

import {
  CAN_TUNE,
  loadDraft,
  sanitize,
  SAVE_URL,
  SAVED_URL,
  STAR_DEFAULTS,
  storeDraft,
  type StarSettings,
} from "./settings";

/**
 * The hero's star settings: built-in defaults, then what has been saved for everyone, then (when tuning) this
 * browser's unsaved draft. `tuning` is true on the dev server with ?admin in the address.
 */
export function useHeroSettings() {
  const [settings, setSettings] = useState<StarSettings>(STAR_DEFAULTS);
  const [saved, setSaved] = useState<StarSettings>(STAR_DEFAULTS);
  const [tuning, setTuning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTuning(
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

  /** Apply new settings to the page now and keep them as this browser's draft. */
  const change = (next: StarSettings) => {
    setSettings(next);
    storeDraft(next);
  };

  /** Write the current settings for everyone. Resolves to whether it worked. */
  const saveForEveryone = async () => {
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

  return { settings, saved, tuning, change, saveForEveryone };
}
