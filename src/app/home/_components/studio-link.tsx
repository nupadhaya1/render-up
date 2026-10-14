// The way into the studio test page. It shows on test (preview) deployments and the dev server, never on production.
// NEXT_PUBLIC_VERCEL_ENV is Vercel's system variable; if it is not exposed to the browser the button simply stays hidden.

const SHOW =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

export function StudioLink() {
  if (!SHOW) return null;
  return (
    <a className="lp-studio-link lp-glass" href="/home/prototype/studio">
      Try the studio
    </a>
  );
}
