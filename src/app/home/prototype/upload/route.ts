// Where a studio tester's CAD file goes: a private Vercel Blob store (BLOB_READ_WRITE_TOKEN, added by creating the store
// in Vercel). The browser uploads straight to the store, because a function request body is capped at 4.5 MB and CAD files
// are bigger; this route only decides who may. The gate cookie is checked here (the completion callback comes from
// Vercel's servers without one, and carries a signature that handleUpload verifies instead).

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { type NextRequest, NextResponse } from "next/server";

import { GATE_COOKIE, matchesKey } from "../_lib/gate";

const UPLOAD_PREFIX = "studio-tests/";
const MAX_BYTES = 512 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!matchesKey(request.cookies.get(GATE_COOKIE)?.value)) {
          throw new Error("Open the test link again to upload.");
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
