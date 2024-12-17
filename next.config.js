/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'turbopack']
    return config
  }
}

module.exports = nextConfig 