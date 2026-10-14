// Where a tester's CAD file goes: UploadThing (UPLOADTHING_TOKEN is already set in Vercel). Only someone holding the
// studio test cookie can upload. Files show up in the UploadThing dashboard.

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { GATE_COOKIE, matchesKey } from "./gate";

const f = createUploadthing();

export const studioRouter = {
  cad: f({ blob: { maxFileSize: "512MB", maxFileCount: 1 } })
    .middleware(({ req }) => {
      if (!matchesKey(req.cookies.get(GATE_COOKIE)?.value)) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- UploadThing's own error type
        throw new UploadThingError("Open the test link again to upload.");
      }
      return {};
    })
    .onUploadComplete(({ file }) => {
      console.log("studio test upload", file.name, file.size);
    }),
} satisfies FileRouter;

export type StudioRouter = typeof studioRouter;
