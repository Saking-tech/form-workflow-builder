import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Enable ESLint during builds to catch errors
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript errors during builds
    ignoreBuildErrors: false,
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Add proper build settings
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;
