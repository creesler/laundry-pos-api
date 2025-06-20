import { NextResponse } from 'next/server';

const MANIFEST = {
  name: 'Laundry POS',
  short_name: 'LaundryPOS',
  description: 'Laundry POS System',
  start_url: '/?source=pwa',
  id: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#ffffff',
  theme_color: '#1976d2',
  scope: '/',
  prefer_related_applications: false,
  categories: ['business', 'productivity'],
  icons: [
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    }
  ]
};

export async function GET() {
  return NextResponse.json(MANIFEST, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
} 