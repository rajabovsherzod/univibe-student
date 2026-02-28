import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "minio.univibe.uz" },
    ],
  },
};

export default nextConfig;
