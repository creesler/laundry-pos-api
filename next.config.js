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
  // API URL is now handled dynamically in api.ts based on hostname
  // Disable server-side features
  experimental: {
    appDir: true,
    serverActions: false,
    serverComponents: false
  }
}

module.exports = nextConfig 