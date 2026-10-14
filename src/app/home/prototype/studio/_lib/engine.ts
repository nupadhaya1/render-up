// PROTOTYPE: the three.js side of the studio viewport. Plain three, no React: the Viewport
// component owns one StudioEngine and pushes props into it.

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import type { Category, LoadedModel } from "./model-loader";
import {
  type FloorId,
  type MaterialMode,
  type Pose,
  type SceneDef,
  VIEW_PRESETS,
  type ViewPreset,
} from "./options";

export type CameraInfo = {
  az: number;
  el: number;
  /** Camera distance in metres of the real model. */
  distance: number;
  /** Model axes as seen by the camera (x right, y up), for the corner gizmo. */
  axes: [number, number][];
};

const MODEL_SPAN = 2; // the model is scaled so its longest side is this many scene units

function fadeTexture(inner: number, outer: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(
    128,
    128,
    128 * inner,
    128,
    128,
    128 * outer,
  );
  grad.addColorStop(0, "#fff");
  grad.addColorStop(1, "#000");
  g.fillStyle = "#000";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = grad;
  g.beginPath();
  g.arc(128, 128, 128, 0, Math.PI * 2);
  g.fill();
  return new THREE.CanvasTexture(c);
}

function beamTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256); // canvas top = v 1 = the lamp end
  grad.addColorStop(0, "#fff");
  grad.addColorStop(0.55, "#777");
  grad.addColorStop(1, "#222");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  return new THREE.CanvasTexture(c);
}

export class StudioEngine {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.02, 200);
  private controls: OrbitControls;

  private dropGroup = new THREE.Group();
  private yawGroup = new THREE.Group();
  private orientGroup = new THREE.Group();
  private fitGroup = new THREE.Group();

  private floor: THREE.Mesh<THREE.CircleGeometry, THREE.MeshStandardMaterial>;
  private shadowCatcher: THREE.Mesh<THREE.CircleGeometry, THREE.ShadowMaterial>;
  private grid: THREE.GridHelper;
  private key: THREE.DirectionalLight;
  private rim: THREE.DirectionalLight;
  private beams = new THREE.Group();
  private beamMaterials: THREE.MeshBasicMaterial[] = [];

  private model: LoadedModel | null = null;
  private baseQuat = new THREE.Quaternion();
  private userQuat = new THREE.Quaternion();
  private height = 1;
  private scale = 1;
  private materials = new Map<string, THREE.Material>();

  private frame = { cw: 1, ch: 1, fw: 1, fh: 1 };
  private lens = 50;
  private dirty = true;
  private raf = 0;
  private tween: { t0: number; ms: number; from: Pose; to: Pose } | null = null;
  private lastInfo = "";

  onCamera?: (info: CameraInfo) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(
      new RoomEnvironment(),
      0.04,
    ).texture;
    pmrem.dispose();

    this.key = new THREE.DirectionalLight(0xffffff, 2.2);
    this.key.position.set(-3.2, 5.5, 3.6);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.bias = -0.0002;
    this.key.shadow.normalBias = 0.02;
    this.key.shadow.radius = 5;
    const sc = this.key.shadow.camera;
    sc.left = sc.bottom = -3;
    sc.right = sc.top = 3;
    sc.near = 0.5;
    sc.far = 16;
    this.rim = new THREE.DirectionalLight(0xbfd4ff, 1.4);
    this.rim.position.set(3.5, 2.2, -4);
    this.scene.add(this.key, this.rim);

    const disc = new THREE.CircleGeometry(14, 96);
    this.floor = new THREE.Mesh(
      disc,
      new THREE.MeshStandardMaterial({
        color: "#101114",
        roughness: 0.3,
        metalness: 0,
        envMapIntensity: 0.35,
        transparent: true,
        alphaMap: fadeTexture(0.25, 1),
      }),
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.shadowCatcher = new THREE.Mesh(
      disc,
      new THREE.ShadowMaterial({ opacity: 0.32 }),
    );
    this.shadowCatcher.rotation.x = -Math.PI / 2;
    this.shadowCatcher.receiveShadow = true;
    this.shadowCatcher.visible = false;
    this.grid = new THREE.GridHelper(8, 32, 0x8a8c92, 0x8a8c92);
    (this.grid.material as THREE.Material).transparent = true;
    (this.grid.material as THREE.Material).opacity = 0.16;
    this.grid.position.y = 0.002;
    this.scene.add(this.floor, this.shadowCatcher, this.grid);
    this.buildBeams();

    this.fitGroup.matrixAutoUpdate = true;
    this.orientGroup.add(this.fitGroup);
    this.yawGroup.add(this.orientGroup);
    this.dropGroup.add(this.yawGroup);
    this.scene.add(this.dropGroup);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.minDistance = 0.4;
    this.controls.maxDistance = 30;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.012;
    this.controls.addEventListener("change", () => (this.dirty = true));

    this.applyPose(this.poseFor("hero"));
    const loop = (t: number) => {
      this.raf = requestAnimationFrame(loop);
      this.step(t);
    };
    this.raf = requestAnimationFrame(loop);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.controls.dispose();
    this.disposeModel();
    this.renderer.dispose();
  }

  // ------------------------------------------------------------ frame / camera
  /** cw x ch: canvas CSS size. fw x fh: the picture frame drawn over it (centred). */
  resize(cw: number, ch: number, fw: number, fh: number) {
    this.frame = { cw, ch, fw, fh };
    this.renderer.setSize(cw, ch, false);
    this.camera.aspect = cw / ch;
    this.updateFov();
  }

  setLens(mm: number) {
    this.lens = mm;
    this.updateFov();
  }

  private updateFov() {
    // the frame's horizontal field of view is that of a 36 mm sensor behind `lens`
    const { ch, fw } = this.frame;
    const half = Math.atan((ch / fw) * (18 / this.lens));
    this.camera.fov = THREE.MathUtils.radToDeg(half * 2);
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  private get target(): THREE.Vector3 {
    return new THREE.Vector3(0, this.height / 2, 0);
  }

  private fitDistance(): number {
    const { fw, fh } = this.frame;
    const halfH = Math.atan(18 / this.lens);
    const halfV = Math.atan((18 / this.lens) * (fh / fw));
    const radius = Math.hypot(MODEL_SPAN, this.height) / 2;
    return (radius / Math.sin(Math.min(halfH, halfV))) * 0.74;
  }

  private poseFor(preset: ViewPreset): Pose {
    const v = VIEW_PRESETS.find((p) => p.id === preset) ?? VIEW_PRESETS[0]!;
    const az = THREE.MathUtils.degToRad(v.az);
    const el = THREE.MathUtils.degToRad(v.el);
    const d = this.fitDistance();
    const t = this.target;
    return {
      position: [
        t.x + d * Math.sin(az) * Math.cos(el),
        t.y + d * Math.sin(el),
        t.z + d * Math.cos(az) * Math.cos(el),
      ],
      target: [t.x, t.y, t.z],
      lens: this.lens,
    };
  }

  setView(preset: ViewPreset, animate = true) {
    this.applyPose(this.poseFor(preset), animate);
  }

  fit() {
    const dir = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize();
    const t = this.target;
    const p = t.clone().add(dir.multiplyScalar(this.fitDistance()));
    this.applyPose(
      { position: [p.x, p.y, p.z], target: [t.x, t.y, t.z], lens: this.lens },
      true,
    );
  }

  zoom(factor: number) {
    const t = this.controls.target;
    const p = t
      .clone()
      .add(this.camera.position.clone().sub(t).multiplyScalar(factor));
    this.applyPose(
      { position: [p.x, p.y, p.z], target: [t.x, t.y, t.z], lens: this.lens },
      true,
      220,
    );
  }

  getPose(): Pose {
    const p = this.camera.position;
    const t = this.controls.target;
    return {
      position: [p.x, p.y, p.z],
      target: [t.x, t.y, t.z],
      lens: this.lens,
    };
  }

  applyPose(pose: Pose, animate = false, ms = 520) {
    if (animate) {
      this.tween = {
        t0: performance.now(),
        ms,
        from: this.getPose(),
        to: pose,
      };
      return;
    }
    this.tween = null;
    this.camera.position.set(...pose.position);
    this.controls.target.set(...pose.target);
    this.controls.update();
    this.dirty = true;
  }

  setTool(tool: "orbit" | "pan") {
    this.controls.mouseButtons = {
      LEFT: tool === "orbit" ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: tool === "orbit" ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
    };
    this.controls.touches = {
      ONE: tool === "orbit" ? THREE.TOUCH.ROTATE : THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
  }

  // ------------------------------------------------------------ model
  private disposeModel() {
    this.fitGroup.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.geometry.dispose();
    });
    this.fitGroup.clear();
  }

  setModel(model: LoadedModel | null, upAxis: "y" | "z") {
    this.disposeModel();
    this.model = model;
    this.userQuat.identity();
    this.yawGroup.rotation.y = 0;
    if (!model) {
      this.dirty = true;
      return;
    }
    const box = new THREE.Box3().setFromObject(model.object);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    this.scale = MODEL_SPAN / Math.max(size.x, size.y, size.z, 1e-6);
    this.fitGroup.scale.setScalar(this.scale);
    this.fitGroup.position.copy(centre).multiplyScalar(-this.scale);
    this.fitGroup.add(model.object);
    this.setUpAxis(upAxis, false);
    this.applyPose(this.poseFor("hero"));
  }

  setUpAxis(upAxis: "y" | "z", keepView = true) {
    this.baseQuat.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      upAxis === "z" ? -Math.PI / 2 : 0,
    );
    this.reorient(keepView);
  }

  /** Quarter turns of the model about the world axes (after the up-axis fix). */
  rotate(axis: "x" | "y" | "z", degrees: number) {
    const v = new THREE.Vector3(
      axis === "x" ? 1 : 0,
      axis === "y" ? 1 : 0,
      axis === "z" ? 1 : 0,
    );
    this.userQuat.premultiply(
      new THREE.Quaternion().setFromAxisAngle(
        v,
        THREE.MathUtils.degToRad(degrees),
      ),
    );
    this.reorient(true);
  }

  resetOrientation() {
    this.userQuat.identity();
    this.reorient(true);
  }

  setYaw(degrees: number) {
    this.yawGroup.rotation.y = THREE.MathUtils.degToRad(degrees);
    this.dirty = true;
  }

  private reorient(keepView: boolean) {
    this.orientGroup.quaternion.copy(this.userQuat).multiply(this.baseQuat);
    this.dropGroup.position.y = 0;
    this.dropGroup.updateMatrixWorld(true);
    const yaw = this.yawGroup.rotation.y;
    this.yawGroup.rotation.y = 0;
    this.yawGroup.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.orientGroup);
    this.yawGroup.rotation.y = yaw;
    if (!box.isEmpty()) {
      this.dropGroup.position.y = -box.min.y; // sit the model on the floor
      this.height = box.max.y - box.min.y;
    }
    if (keepView) {
      const t = this.target;
      const offset = this.camera.position.clone().sub(this.controls.target);
      const p = t.clone().add(offset);
      this.applyPose(
        { position: [p.x, p.y, p.z], target: [t.x, t.y, t.z], lens: this.lens },
        true,
        260,
      );
    }
    this.dirty = true;
  }

  /** Width, depth, height of the model as oriented, in millimetres. */
  dimensionsMm(): [number, number, number] | null {
    if (!this.model) return null;
    const yaw = this.yawGroup.rotation.y;
    this.yawGroup.rotation.y = 0;
    this.dropGroup.updateMatrixWorld(true);
    const size = new THREE.Box3()
      .setFromObject(this.orientGroup)
      .getSize(new THREE.Vector3());
    this.yawGroup.rotation.y = yaw;
    const k = this.model.unitMm / this.scale;
    return [size.x * k, size.z * k, size.y * k];
  }

  // ------------------------------------------------------------ materials
  private material(key: string, make: () => THREE.Material): THREE.Material {
    let m = this.materials.get(key);
    if (!m) {
      m = make();
      this.materials.set(key, m);
    }
    return m;
  }

  applyPalette(mode: MaterialMode, primary: string, secondary: string) {
    if (!this.model) return;
    const std = (color: string, roughness: number, metalness = 0) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });
    const fixed: Record<Exclude<Category, "printed">, () => THREE.Material> = {
      carbon: () =>
        new THREE.MeshPhysicalMaterial({
          color: "#131417",
          roughness: 0.42,
          metalness: 0.1,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
        }),
      metal: () => std("#d5d8de", 0.3, 1),
      weapon: () => std("#9a9ea6", 0.38, 1),
      wheel: () => std("#17171a", 0.92),
      component: () => std("#2b2e35", 0.55, 0.35),
    };
    const print = (color: string) =>
      this.material(`print:${color}`, () => std(color, 0.52));
    this.model.object.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const category = mesh.userData.rsCategory as Category;
      if (mode === "original") {
        mesh.material = mesh.userData.rsOriginal as THREE.Material;
      } else if (mode === "clay") {
        mesh.material = this.material("clay", () => std("#b4b6bb", 0.72));
      } else if (category === "printed") {
        mesh.material = print(
          mesh.userData.rsTheme === "primary" ? primary : secondary,
        );
      } else {
        mesh.material = this.material(category, fixed[category]);
      }
    });
    this.dirty = true;
  }

  // ------------------------------------------------------------ scene preview
  private buildBeams() {
    const alpha = beamTexture();
    const pool = fadeTexture(0.0, 1);
    const specs: {
      from: [number, number, number];
      to: [number, number, number];
      colour: string;
    }[] = [
      { from: [-3.4, 7.5, -5.2], to: [-1.9, 0, -1.9], colour: "#9db8ff" },
      { from: [1.2, 7.2, -6.4], to: [0.9, 0, -2.6], colour: "#ffb169" },
      { from: [-6.6, 8.2, -3.4], to: [-3.4, 0, -0.6], colour: "#ffffff" },
    ];
    for (const s of specs) {
      const from = new THREE.Vector3(...s.from);
      const to = new THREE.Vector3(...s.to);
      const length = from.distanceTo(to);
      const geometry = new THREE.ConeGeometry(0.62, length, 40, 1, true);
      geometry.translate(0, -length / 2, 0); // apex at the lamp
      const material = new THREE.MeshBasicMaterial({
        color: s.colour,
        transparent: true,
        opacity: 0.1,
        alphaMap: alpha,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const cone = new THREE.Mesh(geometry, material);
      cone.position.copy(from);
      cone.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, -1, 0),
        to.clone().sub(from).normalize(),
      );
      const poolMaterial = new THREE.MeshBasicMaterial({
        color: s.colour,
        transparent: true,
        opacity: 0.2,
        alphaMap: pool,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(0.85, 40),
        poolMaterial,
      );
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(to.x, 0.004, to.z);
      this.beamMaterials.push(material, poolMaterial);
      this.beams.add(cone, disc);
    }
    this.scene.add(this.beams);
  }

  applyScene(def: SceneDef, floor: FloorId, haze: number, backdrop: string) {
    const isColour = def.id === "colour";
    const transparent = def.id === "transparent";
    const showFloor = !transparent && floor !== "none";
    this.floor.visible = showFloor;
    this.shadowCatcher.visible = !showFloor;
    const colour = new THREE.Color(isColour ? backdrop : def.floor);
    if (isColour) colour.multiplyScalar(0.92);
    this.floor.material.color.copy(colour);
    this.floor.material.roughness =
      floor === "matte"
        ? Math.max(def.floorRoughness, 0.85)
        : def.floorRoughness;
    const lum = isColour
      ? new THREE.Color(backdrop).getHSL({ h: 0, s: 0, l: 0 }).l
      : def.dark
        ? 0
        : 1;
    const dark = lum < 0.45;
    this.scene.environmentIntensity = def.envIntensity;
    this.renderer.toneMappingExposure = def.exposure;
    this.key.intensity = def.id === "arena" ? 2.8 : dark ? 2.2 : 1.5;
    this.rim.intensity = def.id === "arena" ? 3.2 : dark ? 2.0 : 0.5;
    this.shadowCatcher.material.opacity = dark ? 0.5 : 0.28;
    this.grid.material.color.set(dark ? 0x9a9ca3 : 0x55575c);
    this.beams.visible = def.id === "arena";
    // even entries are the shafts, odd entries their pools on the floor
    this.beamMaterials.forEach(
      (m, i) =>
        (m.opacity =
          i % 2 === 0 ? 0.05 + (haze / 100) * 0.32 : 0.22 + (haze / 100) * 0.2),
    );
    this.dirty = true;
  }

  setGrid(on: boolean) {
    this.grid.visible = on;
    this.dirty = true;
  }

  // ------------------------------------------------------------ capture
  /** JPEG of what sits inside the picture frame, over the scene's backdrop gradient. */
  capture(bgTop: string, bgBottom: string, width = 480): string {
    const { cw, ch, fw, fh } = this.frame;
    const grid = this.grid.visible;
    this.grid.visible = false;
    this.renderer.render(this.scene, this.camera);
    const src = this.renderer.domElement;
    const k = src.width / cw;
    const out = document.createElement("canvas");
    out.width = width;
    out.height = Math.round((width * fh) / fw);
    const g = out.getContext("2d")!;
    if (bgTop === "transparent") {
      g.fillStyle = "#d9d9de";
      g.fillRect(0, 0, out.width, out.height);
    } else {
      const grad = g.createLinearGradient(0, 0, 0, out.height);
      grad.addColorStop(0, bgTop);
      grad.addColorStop(1, bgBottom);
      g.fillStyle = grad;
      g.fillRect(0, 0, out.width, out.height);
    }
    g.drawImage(
      src,
      ((cw - fw) / 2) * k,
      ((ch - fh) / 2) * k,
      fw * k,
      fh * k,
      0,
      0,
      out.width,
      out.height,
    );
    this.grid.visible = grid;
    this.dirty = true;
    return out.toDataURL("image/jpeg", 0.82);
  }

  // ------------------------------------------------------------ loop
  private step(now: number) {
    if (this.tween) {
      const { t0, ms, from, to } = this.tween;
      const t = Math.min((now - t0) / ms, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const mix = (a: number[], b: number[]) =>
        a.map((v, i) => v + ((b[i] ?? v) - v) * e) as [number, number, number];
      // interpolate on the sphere around the moving target so the camera swings instead of cutting through
      const tgt = new THREE.Vector3(...mix(from.target, to.target));
      const a = new THREE.Spherical().setFromVector3(
        new THREE.Vector3(...from.position).sub(
          new THREE.Vector3(...from.target),
        ),
      );
      const b = new THREE.Spherical().setFromVector3(
        new THREE.Vector3(...to.position).sub(new THREE.Vector3(...to.target)),
      );
      let dTheta = b.theta - a.theta;
      if (dTheta > Math.PI) dTheta -= Math.PI * 2;
      if (dTheta < -Math.PI) dTheta += Math.PI * 2;
      const s = new THREE.Spherical(
        a.radius + (b.radius - a.radius) * e,
        a.phi + (b.phi - a.phi) * e,
        a.theta + dTheta * e,
      );
      this.camera.position.copy(
        new THREE.Vector3().setFromSpherical(s).add(tgt),
      );
      this.controls.target.copy(tgt);
      if (t >= 1) this.tween = null;
      this.dirty = true;
    }
    this.controls.update();
    if (!this.dirty) return;
    this.dirty = false;
    this.renderer.render(this.scene, this.camera);
    this.emitCamera();
  }

  private emitCamera() {
    if (!this.onCamera) return;
    const off = this.camera.position.clone().sub(this.controls.target);
    const d = off.length();
    const az = THREE.MathUtils.radToDeg(Math.atan2(off.x, off.z));
    const el = THREE.MathUtils.radToDeg(
      Math.asin(THREE.MathUtils.clamp(off.y / d, -1, 1)),
    );
    const inv = this.camera.quaternion.clone().invert();
    const axes = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ].map((v) => {
      v.applyQuaternion(inv);
      return [v.x, v.y] as [number, number];
    });
    const metres = this.model
      ? ((d / this.scale) * this.model.unitMm) / 1000
      : d;
    const info: CameraInfo = {
      az: (az + 360) % 360,
      el,
      distance: metres,
      axes,
    };
    const key = `${info.az.toFixed(1)}|${el.toFixed(1)}|${metres.toFixed(3)}`;
    if (key === this.lastInfo) return;
    this.lastInfo = key;
    this.onCamera(info);
  }
}
