import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {}
  },
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'turbopack']
    return config
  }
};

export default nextConfig;
