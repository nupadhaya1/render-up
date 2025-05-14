import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Aldrich } from "next/font/google";

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
    <html lang="en" className={`${geist.variable}`}>
      <main className="h-full bg-black text-white">
        <header className="flex items-center justify-center p-4">
          <h1
            className={`w-full rounded-xl bg-white/30 p-4 text-center text-4xl font-bold text-orange-400 ${aldrich.className}`}
          >
            Render-Up
          </h1>
        </header>
        <body>{children}</body>
      </main>
    </html>
  );
}
