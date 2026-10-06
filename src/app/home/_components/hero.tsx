"use client";

// The coming-soon hero. One screen, three layers:
//   1. a live three.js star field (parallax with momentum, twinkle, stars light up under the pointer),
//   2. the robot: one static Cycles render on a transparent film (hero.webp, hero-4k.webp). It does not move.
//      The film look (glow, halation) is baked into that render and is nowhere else on the page.
//   3. the copy.
// The render comes from .scratch/materials-research/lookdev (render_sequence.py, then sync_landing_frames.py).
// The exploded view on scroll is parked: its frames can still be rendered there, the page does not use them.

import { useEffect, useRef } from "react";

import type { HeroSettings, StarSettings } from "./settings";
import { Starfield } from "./starfield";

export const ASSETS = "/home/landing";

// The star field has weight. A damped spring pulls it towards the pointer, so it eases into a move and keeps
// gliding after the pointer stops. Just under critical damping: it settles softly, with no visible bounce.
const DAMPING = 0.75;
/** Seconds the field trails behind the pointer, which is also roughly how long it coasts once the pointer stops. */
const glideSeconds = (momentum: number) => 0.14 + 0.2 * momentum;

export function Hero({ settings }: { settings: HeroSettings }) {
  const stage = useRef<HTMLDivElement>(null);
  const starsCanvas = useRef<HTMLCanvasElement>(null);
  const live = useRef(settings);
  live.current = settings;

  useEffect(() => {
    const stageEl = stage.current;
    if (!stageEl || !starsCanvas.current) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars = new Starfield(starsCanvas.current);

    const resize = () =>
      stars.resize(stageEl.clientWidth, stageEl.clientHeight);
    const observer = new ResizeObserver(resize);
    observer.observe(stageEl);
    resize();

    // the pointer only moves and wakes the stars
    const pointer = { x: 0.5, y: 0.5, inside: false };
    const onMove = (e: PointerEvent) => {
      const box = stageEl.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      pointer.inside = x >= 0 && y >= 0 && x <= box.width && y <= box.height;
      pointer.x = x / box.width;
      pointer.y = y / box.height;
      stars.pointer = pointer.inside ? { x, y } : null;
    };
    const onLeave = () => {
      pointer.inside = false;
      stars.pointer = null;
    };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);

    const drift = { x: 0, y: 0 };
    const speed = { x: 0, y: 0 };
    let applied: StarSettings | null = null;
    let frame = 0;
    let last = performance.now();
    const tick = (ms: number) => {
      frame = requestAnimationFrame(tick);
      // real seconds, so the glide lasts as long on a 120 Hz screen as on a 60 Hz one (capped after a hidden tab)
      const dt = Math.min(Math.max(ms - last, 0) / 1000, 0.05);
      last = ms;
      const now = live.current.stars;
      if (applied !== now) {
        applied = now;
        stars.apply(now);
      }
      const tx = pointer.inside && !still ? pointer.x * 2 - 1 : 0;
      const ty = pointer.inside && !still ? pointer.y * 2 - 1 : 0;
      const pull = (2 * DAMPING) / glideSeconds(now.momentum); // the spring's natural frequency, rad/s
      speed.x += ((tx - drift.x) * pull - speed.x * 2 * DAMPING) * pull * dt;
      speed.y += ((ty - drift.y) * pull - speed.y * 2 * DAMPING) * pull * dt;
      drift.x += speed.x * dt;
      drift.y += speed.y * dt;
      stars.parallax.x = drift.x;
      stars.parallax.y = drift.y;
      stars.render(ms / 1000);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      stars.dispose();
    };
  }, []);

  return (
    <main ref={stage} className="lp-stage">
      <div className="lp-nebula" />
      <canvas ref={starsCanvas} className="lp-layer lp-stars" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="lp-robot"
        src={`${ASSETS}/hero.webp`}
        srcSet={`${ASSETS}/hero.webp 2560w, ${ASSETS}/hero-4k.webp 3840w`}
        sizes="(max-width: 999px) 170vw, 95vw"
        alt="A red combat robot floating in space"
        fetchPriority="high"
        draggable={false}
      />
      <div className="lp-grain" aria-hidden />

      <div className="lp-intro">
        <p className="lp-eyebrow">
          <i aria-hidden /> Coming soon
        </p>
        <h1 className="lp-title">
          Clean, professional renders.
          <span>Every time.</span>
        </h1>
        <p className="lp-lede">
          Render-Up turns the CAD of your combat robot into renders that look
          real, down to the layer lines. We are opening soon.
        </p>
      </div>

      <p className="lp-foot">© {new Date().getFullYear()} Render-Up</p>
    </main>
  );
}
