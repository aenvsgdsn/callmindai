import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
