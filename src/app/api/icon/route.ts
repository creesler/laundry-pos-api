import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = searchParams.get('size') || '512';

  // Create a simple SVG icon
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1976d2"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${parseInt(size)/4}px" 
            fill="white" text-anchor="middle" dy=".3em">LK</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
} 