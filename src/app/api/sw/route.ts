import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Log the current directory and attempt to read the file
    const currentDir = process.cwd();
    console.log('Current directory:', currentDir);
    
    // Try to read from multiple possible locations
    const possiblePaths = [
      path.join(currentDir, 'public', 'sw.js'),
      path.join(currentDir, '.next', 'static', 'sw.js'),
      path.join(currentDir, 'sw.js')
    ];
    
    let serviceWorkerContent = null;
    let foundPath = null;
    
    for (const filePath of possiblePaths) {
      try {
        console.log('Trying to read from:', filePath);
        serviceWorkerContent = await fs.readFile(filePath, 'utf-8');
        foundPath = filePath;
        break;
      } catch (error) {
        console.log('Failed to read from:', filePath);
      }
    }
    
    if (!serviceWorkerContent) {
      console.error('Service worker file not found in any location');
      return new NextResponse('Service worker not found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
          'X-Debug-Info': 'SW not found in any location'
        }
      });
    }
    
    console.log('Successfully read service worker from:', foundPath);
    
    return new NextResponse(serviceWorkerContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Debug-Path': foundPath || 'unknown'
      }
    });
  } catch (error) {
    console.error('Error serving service worker:', error);
    return new NextResponse('Error serving service worker', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'X-Debug-Info': error.message
      }
    });
  }
} 