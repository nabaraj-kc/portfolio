import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/data/**", "**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
