export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Fetch the manifest
      const manifestResponse = await fetch('/manifest.webmanifest');
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