/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  },
  // Disable API routes in static export
  rewrites: () => [],
  // Don't attempt to statically optimize API routes
  experimental: {
    appDir: true,
    serverActions: false
  }
}

module.exports = nextConfig 