// /home: the coming-soon page. A glass nav, a real render of the sample robot floating in space, one line of copy.
// The page and header it replaced are kept, unrouted, in ./_previous.

import type { Metadata } from "next";

import "./landing.css";
import { Landing } from "./_components/landing";

export const metadata: Metadata = {
  title: "Render-Up · coming soon",
  description:
    "Photoreal renders for combat robotics, straight from your CAD. Opening soon.",
};

export default function Home() {
  return <Landing />;
}
