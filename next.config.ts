import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained build at .next/standalone for Docker.
  // The Dockerfile copies that folder and runs `node server.js`.
  output: "standalone",

  // Allow remote images from Unsplash (curated library + user-pasted URLs).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },

  // Next 16 blocks HMR / dev-asset fetches from any host other than the
  // exact value of NEXT_PUBLIC_VERCEL_URL by default. When running tests
  // (or curl/Playwright) against 127.0.0.1 instead of localhost, the
  // browser is told the page came from one origin and HMR from another,
  // hydration silently dies, and React event handlers never wire up.
  // Whitelist the loopback host pair so both forms work in dev.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
