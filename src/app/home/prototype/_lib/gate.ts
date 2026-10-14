// The studio test gate. The studio pages open only for someone who has the test link: /home/prototype/studio?testpswd=<key>.
// The key is PROTOTYPE_KEY, set per environment in Vercel (never committed). Without it set, the studio is closed to everyone.
// A correct link sets a cookie, so the tester can refresh and move around without the key staying in the address.

export const GATE_PARAM = "testpswd";
export const GATE_COOKIE = "rp_studio_test";
export const GATE_PREFIX = "/home/prototype";
/** The upload route checks the cookie itself, because Vercel Blob's servers call it back without one. */
export const GATE_EXEMPT = "/home/prototype/upload";

/** Compares without bailing at the first mismatch, so response time does not leak how much of a guess was right. */
export function matchesKey(candidate: string | null | undefined): boolean {
  const key = process.env.PROTOTYPE_KEY;
  if (!key || !candidate) return false;
  let diff = key.length ^ candidate.length;
  for (let i = 0; i < key.length; i++) {
    diff |= key.charCodeAt(i) ^ (candidate.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function isGated(pathname: string): boolean {
  const inside =
    pathname === GATE_PREFIX || pathname.startsWith(`${GATE_PREFIX}/`);
  const exempt =
    pathname === GATE_EXEMPT || pathname.startsWith(`${GATE_EXEMPT}/`);
  return inside && !exempt;
}
