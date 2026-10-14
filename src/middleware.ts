// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  GATE_COOKIE,
  GATE_PARAM,
  isGated,
  matchesKey,
} from "./app/home/prototype/_lib/gate";

// Matches exactly /home or any sub-path under /home (if you ever add,
// e.g. /home/info or /home/preview)
const isHomeRoute = createRouteMatcher(["/home", "/home(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // The studio test pages open only with the test link; everyone else gets a plain 404.
  if (isGated(req.nextUrl.pathname)) {
    const given = req.nextUrl.searchParams.get(GATE_PARAM);
    if (matchesKey(given)) {
      const response = NextResponse.next();
      response.cookies.set(GATE_COOKIE, given!, {
        httpOnly: true,
        secure: req.nextUrl.protocol === "https:",
        sameSite: "lax",
        path: "/home/prototype",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
    if (!matchesKey(req.cookies.get(GATE_COOKIE)?.value)) {
      return NextResponse.rewrite(new URL("/_not-found", req.url), {
        status: 404,
      });
    }
  }

  // If it’s _not_ /home, force auth
  if (!isHomeRoute(req)) {
    await auth.protect();
  }
  // otherwise let it through anonymously
});

export const config = {
  matcher: [
    // run on everything except Next internals & static files
    "/((?!_next|static|favicon\\.ico|robots\\.txt).*)",
    // and on your API routes
    "/api/:path*",
  ],
};
