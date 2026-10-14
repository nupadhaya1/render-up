/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: false, // false = 302; set to true if you want a 301
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ufs.sh", // allow any subdomain like t7w2berwuw.ufs.sh
        pathname: "/f/**", // optional: restrict to /f/... paths
      },
    ],
  },
};

export default config;
