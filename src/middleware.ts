// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Matches exactly /home or any sub-path under /home (if you ever add,
// e.g. /home/info or /home/preview)
const isHomeRoute = createRouteMatcher(["/home", "/home(.*)"]);

export default clerkMiddleware(async (auth, req) => {
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
