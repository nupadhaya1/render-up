"use client";

// A small admin panel (dev server only, ?admin) for tuning the hero live (star brightness, density, size, movement, ...).
//   sliders             change the page straight away and are remembered in this browser as a draft
//   Save new settings   writes them to hero-settings.json (dev server), which every visitor's page then loads
//   Reset to default    always goes back to the built-in defaults in settings.ts (save again to keep them)

import { useState } from "react";
import { Check, RotateCcw, Save, Settings2, X } from "lucide-react";

import {
  formatSetting,
  sameSettings,
  STAR_DEFAULTS,
  STAR_FIELDS,
  STAR_KEYS,
  type StarKey,
  type StarSettings,
} from "./settings";

export function AdminPanel({
  settings,
  saved,
  onChange,
  onSave,
}: {
  settings: StarSettings;
  /** what is currently saved for everyone (the built-in defaults until something has been saved) */
  saved: StarSettings;
  onChange: (settings: StarSettings) => void;
  onSave: () => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">(
    "idle",
  );
  const [copied, setCopied] = useState(false);
  const setStar = (key: StarKey, value: number) => {
    setState("idle");
    onChange({ ...settings, [key]: value });
  };
  const unsaved = !sameSettings(settings, saved);
  const atDefault = sameSettings(settings, STAR_DEFAULTS);

  return (
    <div className="lp-admin">
      {open && (
        <div
          className="lp-admin-panel"
          role="dialog"
          aria-label="Hero controls"
        >
          <div className="lp-admin-head">
            <div>
              <p className="lp-admin-title">Hero controls</p>
              <p className="lp-admin-note" aria-live="polite">
                {state === "failed"
                  ? "Could not save. Is the dev server running?"
                  : unsaved
                    ? "Unsaved changes"
                    : "Saved"}
              </p>
            </div>
            <button
              type="button"
              className="lp-admin-icon"
              aria-label="Close hero controls"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="lp-admin-group">Stars</p>
          {STAR_KEYS.map((key) => {
            const limit = STAR_FIELDS[key];
            const value = settings[key];
            return (
              <label key={key} className="lp-admin-row">
                <span>{limit.label}</span>
                <output>{formatSetting(key, value)}</output>
                <input
                  type="range"
                  min={limit.min}
                  max={limit.max}
                  step={limit.step}
                  value={value}
                  onChange={(e) => setStar(key, Number(e.target.value))}
                />
              </label>
            );
          })}

          <button
            type="button"
            className="lp-admin-save"
            disabled={!unsaved || state === "saving"}
            onClick={() => {
              setState("saving");
              void onSave().then((ok) => setState(ok ? "saved" : "failed"));
            }}
          >
            {state === "saved" && !unsaved ? (
              <>
                <Check className="size-4" /> Saved
              </>
            ) : (
              <>
                <Save className="size-4" /> Save new settings
              </>
            )}
          </button>
          <div className="lp-admin-actions">
            <button
              type="button"
              disabled={atDefault}
              onClick={() => {
                setState("idle");
                onChange(STAR_DEFAULTS);
              }}
            >
              <RotateCcw className="size-3.5" /> Reset to default
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard
                  .writeText(JSON.stringify(settings, null, 2))
                  .then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  });
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        className="lp-admin-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Settings2 className="size-4" /> Admin
      </button>
    </div>
  );
}
