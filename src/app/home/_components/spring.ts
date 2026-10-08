// A damped spring that chases a 2D target. It is what gives the star field its weight: it eases into a move and keeps
// gliding after the target stops, then settles. Integrated in real seconds, in sub-steps no longer than one 120 Hz
// frame, so the motion is the same on any screen and gets smoother the faster the screen refreshes.

export type Vec2 = { x: number; y: number };

/** Just under critical damping: it settles softly, with no visible bounce. */
const DAMPING = 0.75;
const MAX_SUBSTEP = 1 / 120;

export class Spring {
  position: Vec2 = { x: 0, y: 0 };
  private velocity: Vec2 = { x: 0, y: 0 };

  /**
   * `glideSeconds` is how long the spring trails the target, which is also roughly how long it coasts once the
   * target stops. `dt` is the seconds since the last step.
   */
  step(target: Vec2, glideSeconds: number, dt: number) {
    const pull = (2 * DAMPING) / glideSeconds; // natural frequency, rad/s
    const steps = Math.max(1, Math.ceil(dt / MAX_SUBSTEP));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      for (const axis of ["x", "y"] as const) {
        const pullToTarget = (target[axis] - this.position[axis]) * pull;
        const drag = this.velocity[axis] * 2 * DAMPING;
        this.velocity[axis] += (pullToTarget - drag) * pull * h;
        this.position[axis] += this.velocity[axis] * h;
      }
    }
  }
}
