// UploadThing's endpoint for the studio test uploads (see _lib/file-router.ts).

import { createRouteHandler } from "uploadthing/next";

import { studioRouter } from "../_lib/file-router";

export const { GET, POST } = createRouteHandler({ router: studioRouter });
