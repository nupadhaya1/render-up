import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
