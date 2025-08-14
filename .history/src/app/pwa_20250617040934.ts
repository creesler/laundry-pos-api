export async function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      // Unregister any existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      
      // Get the base URL from the current window location
      const baseUrl = window.location.origin;
      const swUrl = `${baseUrl}/sw.js`;
      
      // First check if the service worker file exists
      const swResponse = await fetch(swUrl, {
        method: 'GET',
        mode: 'same-origin',
        credentials: 'same-origin',
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
      
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Add event listeners for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('Service Worker state changed:', newWorker.state);
          });
        }
      });
      
      // Fetch the manifest
      const manifestUrl = `${baseUrl}/manifest.webmanifest`;
      const manifestResponse = await fetch(manifestUrl, {
        method: 'GET',
        mode: 'same-origin',
        credentials: 'same-origin'
      });
      
      if (!manifestResponse.ok) {
        throw new Error(`Manifest file not found: ${manifestResponse.status} ${manifestResponse.statusText}`);
      }
      
      const manifest = await manifestResponse.json();
      console.log('PWA Manifest loaded:', manifest);
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  }
  return false;
} 