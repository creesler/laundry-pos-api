import { NextResponse } from 'next/server';
import { createCanvas } from 'canvas';

export async function GET() {
  // Create a canvas with the desired size
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#1976d2';
  ctx.fillRect(0, 0, 512, 512);

  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.font = '128px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LK', 256, 256);

  // Convert to buffer
  const buffer = canvas.toBuffer('image/png');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
} 