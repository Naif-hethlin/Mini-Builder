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
};

export default nextConfig;
