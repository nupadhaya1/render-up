// The hero's star field, drawn with three.js so every star can react.
// Stars twinkle on their own, drift with the pointer by depth (parallax), and "wake up" when the pointer passes
// near them: they swell, warm up and flicker, then settle back over about a second.
// A second, sparse layer of soft discs stands in for out-of-focus stars (the bokeh in the owner's space scene).
// Everything that shapes the look is a StarSettings value, so the admin panel can change it live.

import * as THREE from "three";

import { STAR_DEFAULTS, STAR_LIMITS, type StarSettings } from "./settings";

const MAX_STARS = STAR_LIMITS.density.max;
const MAX_BLURRED = STAR_LIMITS.blurred.max;

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aDepth;
  attribute float aEnergy;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uParallax;
  uniform float uScroll;
  uniform float uBrightness;
  uniform float uSize;
  uniform float uTwinkle;
  uniform float uHover;
  varying vec3 vColor;
  varying float vGlow;
  void main() {
    vec2 p = position.xy + uParallax * aDepth + vec2(0.0, uScroll * aDepth);
    gl_Position = vec4(p, 0.0, 1.0);
    float depth = min(0.28 * uTwinkle, 0.9);
    float twinkle = 1.0 - depth + depth * sin(uTime * aSpeed * max(uTwinkle, 0.001) + aPhase);
    float flicker = 0.75 + 0.25 * sin(uTime * 17.0 + aPhase * 3.0);
    float energy = aEnergy * uHover;
    vGlow = energy;
    float lit = twinkle + energy * 2.4 * flicker;
    // a woken star warms up towards a soft red-white
    vColor = mix(aColor, vec3(1.0, 0.74, 0.64), min(energy, 1.0) * 0.7) * lit * uBrightness;
    gl_PointSize = aSize * uSize * uPixelRatio * (1.0 + energy * 1.3);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform float uSoft;
  varying vec3 vColor;
  varying float vGlow;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0) discard;
    // sharp stars: bright core + halo. bokeh discs (uSoft = 1): an even disc with a faintly brighter rim
    float core = pow(1.0 - r, 2.4) + 0.35 * pow(1.0 - r, 8.0) * (1.0 + vGlow * 2.0);
    float disc = smoothstep(1.0, 0.86, r) * (0.86 + 0.14 * smoothstep(0.6, 0.95, r));
    float a = mix(core, disc, uSoft);
    gl_FragColor = vec4(vColor * a, 1.0);
  }
`;

type Layer = {
  points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  energy: Float32Array;
  x: Float32Array;
  y: Float32Array;
  depth: Float32Array;
  soft: boolean;
  count: number;
};

/** mulberry32: small seeded generator without the lattice patterns a plain LCG leaves in 2D point sets */
function rand(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Starfield {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private layers: Layer[] = [];
  private size = { w: 1, h: 1 };
  private settings: StarSettings = STAR_DEFAULTS;
  /** Pointer in stage pixels, or null when it is away. */
  pointer: { x: number; y: number } | null = null;
  /** Smoothed pointer offset from the centre, -1..1 on each axis. */
  parallax = { x: 0, y: 0 };
  scroll = 0;

  constructor(canvas: HTMLCanvasElement) {
    // An opaque black canvas that the page blends in with mix-blend-mode: screen (.lp-stars):
    // stars only ever add light to what is behind them.
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1);
    this.layers.push(
      this.build(MAX_STARS, false, 11),
      this.build(MAX_BLURRED, true, 29),
    );
    this.apply(STAR_DEFAULTS);
  }

  private build(count: number, soft: boolean, seed: number): Layer {
    const r = rand(seed);
    const position = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    const depth = new Float32Array(count);
    const color = new Float32Array(count * 3);
    const energy = new Float32Array(count);
    const x = new Float32Array(count);
    const y = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // a little beyond the frame so parallax never shows an edge
      x[i] = (r() * 2 - 1) * 1.2;
      y[i] = (r() * 2 - 1) * 1.45; // taller: scrolling slides the field up as well
      position[i * 3] = x[i]!;
      position[i * 3 + 1] = y[i]!;
      const d = r();
      depth[i] = soft ? 0.5 + d * 0.5 : 0.12 + d * d * 0.88;
      const big = r();
      // mostly pin-points; a few a touch larger. nothing that reads as a blob
      size[i] = soft
        ? 7 + big * big * 15
        : 0.9 + big * big * big * 2.1 + depth[i]! * 0.7;
      phase[i] = r() * 6.283;
      speed[i] = 0.6 + r() * 2.4;
      const tint = r();
      const dim = soft ? 0.035 + r() * 0.05 : 0.4 + r() * 0.6;
      // mostly white, a good share warm, only a few cool
      const c =
        tint < 0.64
          ? [1, 1, 1]
          : tint < 0.93
            ? [1, 0.88, 0.76]
            : [0.84, 0.9, 1];
      color[i * 3] = c[0]! * dim;
      color[i * 3 + 1] = c[1]! * dim;
      color[i * 3 + 2] = c[2]! * dim;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    geometry.setAttribute("aDepth", new THREE.BufferAttribute(depth, 1));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    const energyAttr = new THREE.BufferAttribute(energy, 1);
    energyAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aEnergy", energyAttr);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uParallax: { value: new THREE.Vector2() },
        uScroll: { value: 0 },
        uSoft: { value: soft ? 1 : 0 },
        uBrightness: { value: 1 },
        uSize: { value: 1 },
        uTwinkle: { value: 1 },
        uHover: { value: 1 },
      },
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    this.scene.add(points);
    return { points, energy, x, y, depth, soft, count };
  }

  /** Take new settings. Cheap: uniforms and a draw range, no rebuild. */
  apply(settings: StarSettings) {
    this.settings = settings;
    for (const layer of this.layers) {
      layer.count = Math.round(
        Math.min(
          layer.soft ? settings.blurred : settings.density,
          layer.energy.length,
        ),
      );
      layer.points.geometry.setDrawRange(0, layer.count);
      const u = layer.points.material.uniforms;
      u.uBrightness!.value = settings.brightness;
      u.uSize!.value = settings.size;
      u.uTwinkle!.value = settings.twinkle;
      u.uHover!.value = settings.hover;
    }
  }

  resize(w: number, h: number) {
    this.size = { w, h };
    this.renderer.setSize(w, h, false);
  }

  /** time in seconds */
  render(time: number) {
    const { w, h } = this.size;
    const drift = 0.035 * this.settings.movement;
    const px = this.parallax.x * -drift;
    const py = this.parallax.y * drift;
    const scroll = this.scroll * 0.22;
    const pointer = this.settings.hover > 0 ? this.pointer : null;
    for (const layer of this.layers) {
      const { energy, x, y, depth, count } = layer;
      const reach = this.settings.reach * (layer.soft ? 1.5 : 1);
      for (let i = 0; i < count; i++) {
        let e = energy[i]! * 0.955; // settle back
        if (pointer) {
          const sx = (x[i]! + px * depth[i]! + 1) * 0.5 * w;
          const sy = (1 - (y[i]! + (py + scroll) * depth[i]! + 1) * 0.5) * h;
          const dist = Math.hypot(sx - pointer.x, sy - pointer.y);
          if (dist < reach) {
            const near = 1 - dist / reach;
            e = Math.max(e, near * near);
          }
        }
        energy[i] = e < 0.002 ? 0 : e;
      }
      const attr = layer.points.geometry.getAttribute(
        "aEnergy",
      ) as THREE.BufferAttribute;
      attr.needsUpdate = true;
      const u = layer.points.material.uniforms;
      u.uTime!.value = time;
      (u.uParallax!.value as THREE.Vector2).set(px, py);
      u.uScroll!.value = scroll;
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    for (const layer of this.layers) {
      layer.points.geometry.dispose();
      layer.points.material.dispose();
    }
    this.renderer.dispose();
  }
}
