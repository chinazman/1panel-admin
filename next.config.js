/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig 