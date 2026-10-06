// "Save new settings" in the hero admin panel posts here.
// It writes hero-settings.json next to the landing assets, which the page loads on every visit.
// A file write only works on a dev machine (there is no database behind this yet), so it is refused in production.

import { promises as fs } from "fs";
import path from "path";

import { sanitize } from "../_components/settings";

const FILE = path.join(
  process.cwd(),
  "public",
  "home",
  "landing",
  "hero-settings.json",
);

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Saving is only available on the dev server." },
      { status: 403 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected JSON." }, { status: 400 });
  }
  const settings = sanitize(body);
  await fs.writeFile(FILE, JSON.stringify(settings, null, 2) + "\n", "utf8");
  return Response.json(settings);
}
