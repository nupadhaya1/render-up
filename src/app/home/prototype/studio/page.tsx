// PROTOTYPE route: /home/prototype/studio
// A mock of the "create a render" page (upload, frame in 3D, scene, look, output, review).
// Lives under /home so it opens without signing in. Throwaway: fold the decisions into /user/upload
// and /user/options, then delete this folder and public/home/prototype-assets.

import type { Metadata } from "next";

import "./studio.css";
import { Studio } from "./_components/studio";

export const metadata: Metadata = {
  title: "New render · Render-Up (prototype)",
};

export default function StudioPrototypePage() {
  return <Studio />;
}
