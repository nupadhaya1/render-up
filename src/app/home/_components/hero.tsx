"use client";

// The coming-soon hero. One screen, three layers:
//   1. a live three.js star field (parallax with momentum, twinkle, stars light up under the pointer),
//   2. the robot: one static Cycles render on a transparent film (hero.webp, hero-4k.webp). It does not move.
//      The film look (glow, halation) is baked into that render and is nowhere else on the page.
//   3. the copy.
// The render comes from .scratch/materials-research/lookdev (render_sequence.py, then sync_landing_frames.py).

import { useEffect, useRef } from "react";

import { trackPointer } from "./pointer";
import type { StarSettings } from "./settings";
import { Spring, type Vec2 } from "./spring";
import { Starfield } from "./starfield";

export const ASSETS = "/home/landing";

/** Seconds the field trails behind the pointer, which is also roughly how long it coasts once the pointer stops. */
const glideSeconds = (momentum: number) => 0.14 + 0.2 * momentum;
/** A hidden tab hands back one huge frame time; cap it so nothing jumps when the tab returns. */
const MAX_FRAME_SECONDS = 0.05;

export function Hero({ settings }: { settings: StarSettings }) {
  const stage = useRef<HTMLDivElement>(null);
  const starsCanvas = useRef<HTMLCanvasElement>(null);
  const live = useRef(settings);
  live.current = settings;

  useEffect(() => {
    const stageEl = stage.current;
    if (!stageEl || !starsCanvas.current) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars = new Starfield(starsCanvas.current);

    const observer = new ResizeObserver(() =>
      stars.resize(stageEl.clientWidth, stageEl.clientHeight),
    );
    observer.observe(stageEl);
    stars.resize(stageEl.clientWidth, stageEl.clientHeight);

    const [pointer, stopPointer] = trackPointer(stageEl);
    const spring = new Spring();
    const rest: Vec2 = { x: 0, y: 0 };
    let applied: StarSettings | null = null;
    let last = performance.now();
    // requestAnimationFrame fires once per display refresh, so a 120 Hz screen gets 120 frames a second
    let frame = requestAnimationFrame(function tick(ms) {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(Math.max(ms - last, 0) / 1000, MAX_FRAME_SECONDS);
      last = ms;
      const now = live.current;
      if (applied !== now) {
        applied = now;
        stars.apply(now);
      }
      spring.step(
        still ? rest : pointer.centred,
        glideSeconds(now.momentum),
        dt,
      );
      stars.parallax = spring.position;
      stars.pointer = pointer.px;
      stars.render(ms / 1000, dt);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      stopPointer();
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
