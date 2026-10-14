// A made-up 3 lb combat robot built in code, so a tester with no CAD file can still try the studio.
// Parts carry the same kind of names real CAD does, so they land in the material groups the render pipeline uses.
// Metres, Y-up (the same as a GLB).

import * as THREE from "three";

export const MOCK_BOT_NAME = "Mock bot.glb";

export function buildMockBot(): THREE.Group {
  const bot = new THREE.Group();
  const tint = (hex: string) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness: 0.6 });

  const add = (
    name: string,
    geometry: THREE.BufferGeometry,
    colour: string,
    at: [number, number, number],
    rotate?: [number, number, number],
  ) => {
    const mesh = new THREE.Mesh(geometry, tint(colour));
    mesh.name = name;
    mesh.position.set(...at);
    if (rotate) mesh.rotation.set(...rotate);
    bot.add(mesh);
    return mesh;
  };
  const box = (x: number, y: number, z: number) =>
    new THREE.BoxGeometry(x, y, z);
  const cylinder = (r: number, h: number) =>
    new THREE.CylinderGeometry(r, r, h, 32);

  add("Chassis TPU", box(0.26, 0.05, 0.18), "#c8202c", [0, 0.04, 0]);
  add("Front skirt", box(0.04, 0.03, 0.2), "#9b1822", [0.15, 0.025, 0]);
  add("Top plate CF", box(0.22, 0.004, 0.16), "#202226", [0, 0.068, 0]);
  add("Battery lipo", box(0.1, 0.03, 0.05), "#3a6ea5", [-0.04, 0.095, 0.03]);
  add("Weapon motor", cylinder(0.022, 0.06), "#8a8d93", [0.03, 0.1, -0.03]);
  add("ESC", box(0.05, 0.012, 0.03), "#2e7d4f", [-0.07, 0.09, -0.05]);
  add("Blade", box(0.28, 0.008, 0.035), "#d8dade", [0.03, 0.135, -0.03]);

  for (const side of [-1, 1]) {
    add(
      `Wheel ${side < 0 ? "left" : "right"}`,
      cylinder(0.03, 0.025),
      "#1b1c1f",
      [-0.06, 0.03, side * 0.105],
      [Math.PI / 2, 0, 0],
    );
  }
  [
    [0.1, 0.075, 0.07],
    [0.1, 0.075, -0.07],
    [-0.1, 0.075, 0.07],
    [-0.1, 0.075, -0.07],
  ].forEach(([x, y, z], i) =>
    add(`Screw M3 ${i + 1}`, cylinder(0.004, 0.008), "#b9bcc2", [x!, y!, z!]),
  );

  return bot;
}
