export async function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      // Unregister any existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      
      // Get the base URL from the current window location
      const baseUrl = window.location.origin;
      
      // In development, use the local service worker
      const swUrl = process.env.NODE_ENV === 'development' 
        ? '/sw.js'
        : `${baseUrl}/_next/static/sw.js`;
      
      console.log('[PWA] Registering service worker from:', swUrl);
      
      // First check if the service worker file exists
      const swResponse = await fetch(swUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/javascript'
        }
      });
      
      if (!swResponse.ok) {
        throw new Error(`Service Worker file not found: ${swResponse.status} ${swResponse.statusText}`);
      }

      // Register the service worker with the correct scope
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
        type: 'classic',
        updateViaCache: 'none'
      });
      
      console.log('[PWA] Service Worker registered with scope:', registration.scope);
      
      // Add event listeners for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('[PWA] Service Worker state changed:', newWorker.state);
          });
        }
      });
      
      // Fetch the manifest
      const manifestUrl = `${baseUrl}/manifest.webmanifest`;
      const manifestResponse = await fetch(manifestUrl, {
        method: 'GET'
      });
      
      if (!manifestResponse.ok) {
        throw new Error(`Manifest file not found: ${manifestResponse.status} ${manifestResponse.statusText}`);
      }
      
      const manifest = await manifestResponse.json();
      console.log('[PWA] Manifest loaded:', manifest);
      
      return true;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('[PWA] Error name:', error.name);
        console.error('[PWA] Error message:', error.message);
        console.error('[PWA] Error stack:', error.stack);
      }
      return false;
    }
  }
  return false;
} 