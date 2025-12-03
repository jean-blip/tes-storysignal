import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  experimental: {
    middlewarePrefetch: "strict",
  },
};

export default nextConfig;
