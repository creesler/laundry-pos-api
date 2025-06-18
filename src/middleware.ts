import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle service worker
  if (pathname === '/sw.js') {
    const response = NextResponse.next()
    response.headers.set('Service-Worker-Allowed', '/')
    response.headers.set('Content-Type', 'application/javascript')
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  }

  // Handle manifest
  if (pathname === '/manifest.json') {
    const response = NextResponse.next()
    response.headers.set('Content-Type', 'application/manifest+json')
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  }

  return NextResponse.next()
} 