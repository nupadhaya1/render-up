import "~/styles/globals.css";

import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Render-Up",
  description: "Rendering Solutions",
  // icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// The header (sign in, sign up, cart) is parked in ./_previous/site-header.tsx while /home is the coming-soon page.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
