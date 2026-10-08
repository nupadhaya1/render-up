"use client";

// The coming-soon page. One screen: a glass nav bar, a real render of the sample robot floating in space over
// live stars, and a line of copy. No sign-up.
// Black and red, very little blue, no orange in the UI. Glassmorphism (frosted blur), not neumorphism.
// On the dev server, add ?admin to the address to get the Admin button (bottom right) that tunes the stars.

import { AdminPanel } from "./admin-panel";
import { Hero } from "./hero";
import { useHeroSettings } from "./use-hero-settings";

export function Landing() {
  const { settings, saved, tuning, change, saveForEveryone } =
    useHeroSettings();

  return (
    <div className="lp-root">
      <header className="lp-nav-wrap">
        <div className="lp-nav lp-glass">
          <span className="lp-brand">RENDER UP</span>
        </div>
      </header>

      <Hero settings={settings} />

      {tuning && (
        <AdminPanel
          settings={settings}
          saved={saved}
          onChange={change}
          onSave={saveForEveryone}
        />
      )}
    </div>
  );
}
