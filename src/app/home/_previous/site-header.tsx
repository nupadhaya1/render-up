// The /home header as it was before the coming-soon page (2026-10-06): sign in, sign up, title, cart.
// Not rendered anywhere. To bring it back, render <SiteHeader /> above {children} in ../layout.tsx.

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { Button } from "~/components/ui/button";
import { UserCircle2, ShoppingCart } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="bg-background-900 relative m-2 flex h-16 items-center justify-between rounded-md px-4 py-2">
      {/* Left: Auth Buttons */}
      <div className="z-10 flex gap-2">
        <SignedOut>
          <SignInButton>
            <Button className="flex items-center gap-2 bg-white py-2 text-black transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95">
              <UserCircle2 className="h-4 w-4" />
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton forceRedirectUrl={"sign-up"}>
            <Button className="bg-accent-500 flex items-center gap-2 py-2 transition-all duration-200 hover:scale-105 hover:bg-orange-500 active:scale-95">
              <UserCircle2 className="h-4 w-4" />
              Sign up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-12 h-12", // Make the avatar bigger
                userButtonPopoverCard: "text-base", // Optionally increase popover text size
              },
            }}
          />
        </SignedIn>
      </div>

      {/* Center: Title - Absolutely positioned */}
      <h1 className="font-notable text-primary-500 absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-6xl tracking-wider">
        RENDER UP
      </h1>

      {/* Right: Cart */}
      <Button className="z-10 flex items-center transition-all duration-200 hover:scale-105 active:scale-95">
        <ShoppingCart className="h-8 w-8" />
      </Button>
    </header>
  );
}
