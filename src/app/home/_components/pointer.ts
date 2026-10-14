// Where the pointer is on the hero stage, for the star field.

import type { Vec2 } from "./spring";

export type PointerState = {
  /** In stage pixels, or null when the pointer is away from the stage. */
  px: Vec2 | null;
  /** Offset from the stage centre, -1..1 on each axis; 0 when the pointer is away. */
  centred: Vec2;
};

/** Follows the pointer over `stage` and returns its state plus a function that stops listening. */
export function trackPointer(stage: HTMLElement): [PointerState, () => void] {
  const state: PointerState = { px: null, centred: { x: 0, y: 0 } };
  const onMove = (e: PointerEvent) => {
    const box = stage.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    if (x < 0 || y < 0 || x > box.width || y > box.height) return onLeave();
    state.px = { x, y };
    state.centred = { x: (x / box.width) * 2 - 1, y: (y / box.height) * 2 - 1 };
  };
  const onLeave = () => {
    state.px = null;
    state.centred = { x: 0, y: 0 };
  };
  window.addEventListener("pointermove", onMove);
  document.documentElement.addEventListener("pointerleave", onLeave);
  return [
    state,
    () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    },
  ];
}
