// The test build sends a tester's file to us (a private Vercel Blob store, via /home/prototype/upload) so we can see
// what real CAD does.

import { upload } from "@vercel/blob/client";

/** Resolves when the file has arrived; throws with a readable message if it could not. */
export async function sendToUs(
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  await upload(`studio-tests/${file.name}`, file, {
    access: "private",
    handleUploadUrl: "/home/prototype/upload",
    multipart: true,
    onUploadProgress: ({ percentage }) => onProgress(percentage),
  });
}
