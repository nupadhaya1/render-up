// Where a studio tester's CAD file goes: a private Vercel Blob store (BLOB_READ_WRITE_TOKEN, added by connecting the store
// in Vercel). The browser uploads straight to the store, because a function request body is capped at 4.5 MB and CAD files
// are bigger; this route only issues the upload permission. Uploads are refused on production: the studio is a test build.

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { type NextRequest, NextResponse } from "next/server";

const UPLOAD_PREFIX = "studio-tests/";
const MAX_BYTES = 512 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (process.env.VERCEL_ENV === "production") {
          throw new Error("Uploads are only open on test deployments.");
        }
        if (!pathname.startsWith(UPLOAD_PREFIX)) {
          throw new Error("Unexpected upload path.");
        }
        return { maximumSizeInBytes: MAX_BYTES, addRandomSuffix: true };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("studio test upload", blob.pathname);
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload refused." },
      { status: 400 },
    );
  }
}
