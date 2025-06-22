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
      <header className="bg-themeBG flex h-16 items-center justify-between px-3 py-4">
        <div className="flex flex-1 justify-center">
          <h1 className="text-accent-500 text-2xl font-bold">Render-Up</h1>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </header>
      {children}
    </ClerkProvider>
  );
}
