import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Aldrich } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { Button } from "~/components/ui/button";
import { UserCircle2 } from "lucide-react";

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
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className={`${geist.variable} ${aldrich.variable}`}>
        <body className="bg-black text-white">
          <header className="flex h-16 items-center justify-end gap-3 bg-gradient-to-b from-orange-500/20 to-orange-500/15 px-3 py-4">
            <SignedOut>
              <SignInButton>
                <Button className="flex items-center gap-2 bg-white py-2 text-black transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95">
                  <UserCircle2 className="h-4 w-4" />
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton forceRedirectUrl={"sign-up"}>
                <Button className="flex items-center gap-2 bg-orange-500 py-2 transition-all duration-200 hover:scale-105 hover:bg-orange-500 active:scale-95">
                  <UserCircle2 className="h-4 w-4" />
                  Sign up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div>
                <UserButton />
              </div>
            </SignedIn>
          </header>
          {children}
        </body>
        <Analytics />
      </html>
    </ClerkProvider>
  );
}
