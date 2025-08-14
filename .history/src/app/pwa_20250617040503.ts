export async function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      // Get the base URL from the current window location
      const baseUrl = window.location.origin;
      const swUrl = `${baseUrl}/sw.js`;
      
      // First check if the service worker file exists
      const swResponse = await fetch(swUrl);
      if (!swResponse.ok) {
        throw new Error(`Service Worker file not found: ${swResponse.status} ${swResponse.statusText}`);
      }

      // Register the service worker
      const registration = await navigator.serviceWorker.register(swUrl);
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Fetch the manifest
      const manifestUrl = `${baseUrl}/manifest.webmanifest`;
      const manifestResponse = await fetch(manifestUrl);
      if (!manifestResponse.ok) {
        throw new Error(`Manifest file not found: ${manifestResponse.status} ${manifestResponse.statusText}`);
      }
      
      const manifest = await manifestResponse.json();
      console.log('PWA Manifest loaded:', manifest);
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }
  return false;
} 