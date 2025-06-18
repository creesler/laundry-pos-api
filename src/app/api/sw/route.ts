import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Redirect to the actual service worker file
    return NextResponse.redirect(new URL('/sw.js', 'http://localhost:3000'), {
      headers: {
        'Service-Worker-Allowed': '/'
      }
    });
  } catch (error) {
    console.error('Error serving service worker:', error);
    return new NextResponse('Service worker not found', { status: 404 });
  }
} 