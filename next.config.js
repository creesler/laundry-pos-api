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
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://laundry-pos-api.vercel.app'
  },
  // Disable server-side features
  experimental: {
    appDir: true,
    serverActions: false,
    serverComponents: false
  }
}

module.exports = nextConfig 