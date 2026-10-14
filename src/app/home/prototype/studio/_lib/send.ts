// The test build sends a tester's file to us (UploadThing, via /home/prototype/upload) so we can see what real CAD does.

import { genUploader } from "uploadthing/client";

import type { StudioRouter } from "../../_lib/file-router";

const { uploadFiles } = genUploader<StudioRouter>({
  package: "uploadthing/next",
  url: "/home/prototype/upload",
});

/** Resolves when the file has arrived; throws with a readable message if it could not. */
export async function sendToUs(
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  await uploadFiles("cad", {
    files: [file],
    onUploadProgress: ({ progress }) => onProgress(progress),
  });
}
