/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  },
  // Disable server components and API routes
  experimental: {
    appDir: true,
    serverActions: false
  }
}

module.exports = nextConfig 