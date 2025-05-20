import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Aldrich } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Render-Up",
  description: "Rendering Solutions",
  // icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const aldrich = Aldrich({
  subsets: ["latin"],
  variable: "--font-aldrich",
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${aldrich.variable}`}>
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
