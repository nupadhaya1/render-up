/* PROTOTYPE: reads a STEP file off the main thread with occt-import-js (OpenCascade, WASM)
   and posts back triangle meshes for the studio viewport preview. */
importScripts("occt-import-js.js");

let occtReady = null;

self.onmessage = async (event) => {
  const { id, buffer } = event.data;
  try {
    occtReady ??= occtimportjs({
      locateFile: (name) => new URL(name, self.location.href).href,
    });
    const occt = await occtReady;
    self.postMessage({ id, type: "progress", stage: "tessellating" });
    const result = occt.ReadStepFile(new Uint8Array(buffer), {
      linearUnit: "millimeter",
      linearDeflectionType: "bounding_box_ratio",
      linearDeflection: 0.001,
      angularDeflection: 0.5,
    });
    if (!result.success) {
      self.postMessage({ id, type: "error", message: "Could not read this STEP file." });
      return;
    }
    const transfer = [];
    const meshes = result.meshes.map((mesh) => {
      const position = new Float32Array(mesh.attributes.position.array);
      const normal = mesh.attributes.normal
        ? new Float32Array(mesh.attributes.normal.array)
        : null;
      const index = new Uint32Array(mesh.index.array);
      transfer.push(position.buffer, index.buffer);
      if (normal) transfer.push(normal.buffer);
      return { name: mesh.name ?? "", color: mesh.color ?? null, position, normal, index };
    });
    self.postMessage({ id, type: "done", meshes, root: result.root }, transfer);
  } catch (error) {
    self.postMessage({ id, type: "error", message: String(error?.message ?? error) });
  }
};
