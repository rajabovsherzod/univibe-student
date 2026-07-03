import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // Tree-shake big barrel packages (icons/animation) so only the icons actually
  // used ship — smaller client bundles AND faster dev compilation.
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "lucide-react",
      "@untitledui/icons",
      "motion",
    ],
  },
};

export default nextConfig;
