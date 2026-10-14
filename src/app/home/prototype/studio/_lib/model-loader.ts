// PROTOTYPE: turns an uploaded file (STEP, GLB/GLTF, STL, OBJ) into a three.js object for the viewport
// preview, and sorts its parts into material groups the same way the render pipeline does
// (.scratch/materials-research/theme_render/build_theme.py: classify / theme_of).

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import { ASSETS } from "./options";

export type Category =
  | "printed"
  | "carbon"
  | "metal"
  | "weapon"
  | "wheel"
  | "component";

export const CATEGORY_LABEL: Record<Category, string> = {
  printed: "3D printed",
  carbon: "Carbon fibre",
  metal: "Fasteners",
  weapon: "Weapon steel",
  wheel: "Wheels and belts",
  component: "Electronics",
};

export type LoadedModel = {
  name: string;
  format: string;
  bytes: number;
  object: THREE.Object3D;
  /** Size of one model unit in millimetres (GLB is metres, CAD exports are millimetres). */
  unitMm: number;
  /** CAD formats are Z-up; GLB is Y-up. */
  nativeUp: "y" | "z";
  parts: number;
  triangles: number;
  size: THREE.Vector3;
  groups: Record<Category, number>;
};

export const ACCEPT = ".step,.stp,.glb,.gltf,.stl,.obj";

const METAL = [
  "screw",
  "standoff",
  "nut",
  "washer",
  "bearing",
  "bolt",
  "scr",
  "head",
  "hex drive",
];
const WEAPON = ["blade"];
const WHEEL = ["wheel", "flexwheel", "tire", "30a", "belt"];
const PRINTED = ["nylon", "tpu", "petg", "pla"];
const COMPONENT = [
  "motor",
  "esc",
  "lipo",
  "battery",
  "magnet",
  "n52",
  "switch",
  "pulley",
  "repeat",
];

export function classify(rawName: string): Category {
  const n = rawName.toLowerCase().replace(/_/g, " ");
  const has = (keys: string[]) => keys.some((k) => n.includes(k));
  if (has(WEAPON)) return "weapon";
  if (has(METAL)) return "metal";
  if (n.includes("skirt")) return "printed";
  if (has(WHEEL)) return "wheel";
  if (has(PRINTED)) return "printed";
  if (/\bcf\b/.test(n)) return "carbon";
  if (has(COMPONENT)) return "component";
  return "printed";
}

/** Alternates printed parts between the two theme colours, stable per part name. */
export function themeOf(rawName: string): "primary" | "secondary" {
  const base = rawName.replace(/:\d+$/, "");
  let sum = 0;
  for (let i = 0; i < base.length; i++) sum += base.charCodeAt(i);
  return sum % 2 === 0 ? "primary" : "secondary";
}

function partName(mesh: THREE.Object3D): string {
  let o: THREE.Object3D | null = mesh;
  while (o) {
    const name = (o.userData.name as string | undefined) ?? o.name;
    if (name && !/^(mesh|scene|root|group)?[_ ]?\d*$/i.test(name)) return name;
    o = o.parent;
  }
  return "";
}

function summarise(object: THREE.Object3D) {
  const groups: Record<Category, number> = {
    printed: 0,
    carbon: 0,
    metal: 0,
    weapon: 0,
    wheel: 0,
    component: 0,
  };
  const seen = new Set<string>();
  let triangles = 0;
  object.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const g = mesh.geometry;
    triangles +=
      (g.index ? g.index.count : (g.getAttribute("position")?.count ?? 0)) / 3;
    const name = partName(mesh);
    const category = classify(name);
    mesh.userData.rsCategory = category;
    mesh.userData.rsTheme = themeOf(name);
    mesh.userData.rsOriginal = mesh.material;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // one "part" per named node, however many primitives it carries
    const key = `${mesh.parent?.uuid ?? ""}:${name}`;
    if (!seen.has(key)) {
      seen.add(key);
      groups[category] += 1;
    }
  });
  object.updateMatrixWorld(true);
  const size = new THREE.Box3()
    .setFromObject(object)
    .getSize(new THREE.Vector3());
  return { groups, triangles: Math.round(triangles), parts: seen.size, size };
}

let gltfLoader: GLTFLoader | null = null;
function gltf(): GLTFLoader {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    const draco = new DRACOLoader();
    draco.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    );
    gltfLoader.setDRACOLoader(draco);
  }
  return gltfLoader;
}

type StepMesh = {
  name: string;
  color: [number, number, number] | null;
  position: Float32Array;
  normal: Float32Array | null;
  index: Uint32Array;
};

function readStep(
  buffer: ArrayBuffer,
  onStage?: (stage: string) => void,
): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    // a plain script in /public: constructed indirectly so the bundler does not try to resolve it
    const WorkerCtor = globalThis.Worker;
    const worker = new WorkerCtor(`${ASSETS}/occt/step-worker.js`);
    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as
        | { type: "progress"; stage: string }
        | { type: "error"; message: string }
        | { type: "done"; meshes: StepMesh[] };
      if (data.type === "progress") {
        onStage?.(data.stage);
        return;
      }
      worker.terminate();
      if (data.type === "error") {
        reject(new Error(data.message));
        return;
      }
      const group = new THREE.Group();
      for (const m of data.meshes) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(m.position, 3),
        );
        if (m.normal)
          geometry.setAttribute(
            "normal",
            new THREE.BufferAttribute(m.normal, 3),
          );
        geometry.setIndex(new THREE.BufferAttribute(m.index, 1));
        if (!m.normal) geometry.computeVertexNormals();
        const colour = m.color
          ? new THREE.Color(m.color[0], m.color[1], m.color[2])
          : new THREE.Color("#b9bcc2");
        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({ color: colour, roughness: 0.6 }),
        );
        mesh.name = m.name;
        group.add(mesh);
      }
      resolve(group);
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(e.message || "The STEP reader failed to start."));
    };
    worker.postMessage({ id: 1, buffer }, [buffer]);
  });
}

export async function loadModel(
  source: File | { url: string; name: string },
  onStage?: (stage: string) => void,
): Promise<LoadedModel> {
  const name = source instanceof File ? source.name : source.name;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  onStage?.("reading");
  let buffer: ArrayBuffer;
  if (source instanceof File) {
    buffer = await source.arrayBuffer();
  } else {
    const response = await fetch(source.url);
    if (!response.ok)
      throw new Error(
        "The sample model could not be downloaded. Try again in a moment.",
      );
    buffer = await response.arrayBuffer();
  }
  const bytes = buffer.byteLength;

  let object: THREE.Object3D;
  let unitMm = 1;
  let nativeUp: "y" | "z" = "z";
  if (ext === "glb" || ext === "gltf") {
    const result = await gltf().parseAsync(buffer, "");
    object = result.scene;
    unitMm = 1000;
    nativeUp = "y";
  } else if (ext === "stl") {
    const geometry = new STLLoader().parse(buffer);
    geometry.computeVertexNormals();
    object = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: "#b9bcc2", roughness: 0.6 }),
    );
    object.name = name.replace(/\.[^.]+$/, "");
  } else if (ext === "obj") {
    object = new OBJLoader().parse(new TextDecoder().decode(buffer));
  } else if (ext === "step" || ext === "stp") {
    onStage?.("converting");
    object = await readStep(buffer, onStage);
  } else {
    throw new Error(
      `.${ext} files are not supported yet. Upload a STEP, GLB, STL or OBJ file.`,
    );
  }

  const summary = summarise(object);
  if (summary.triangles === 0)
    throw new Error("This file has no solid geometry to render.");
  return {
    name,
    format: ext === "stp" ? "STEP" : ext.toUpperCase(),
    bytes,
    object,
    unitMm,
    nativeUp,
    ...summary,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}
