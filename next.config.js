/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Ensure static export
  trailingSlash: true,
  distDir: 'out',
  // Disable all server features
  experimental: {
    appDir: true,
    serverActions: false,
    serverComponents: false
  }
}

module.exports = nextConfig 