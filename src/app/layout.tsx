import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type React from "react";

import { Geist } from "next/font/google";
import { Aldrich } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} ${aldrich.variable}`}>
        <body className="text-1text bg-black">{children}</body>
        <Analytics />
      </html>
    </ClerkProvider>
  );
}
