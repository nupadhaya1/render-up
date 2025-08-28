import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type React from "react";

import { Montserrat, Notable } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const notable = Notable({
  subsets: ["latin"],
  variable: "--font-notable",
  display: "swap",
  weight: ["400"],
});

import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={montserrat.className}>
        <body className={`bg-[#828282] ${notable.variable} text-black`}>
          {children}
        </body>
        <Analytics />
      </html>
    </ClerkProvider>
  );
}
