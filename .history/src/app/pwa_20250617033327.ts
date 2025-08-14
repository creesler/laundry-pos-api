export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // First check if manifest exists
        const manifestResponse = await fetch('/manifest.json');
        if (!manifestResponse.ok) {
          throw new Error(`Manifest fetch failed: ${manifestResponse.status} ${manifestResponse.statusText}`);
        }
        console.log('Manifest loaded successfully');

        // Then try to register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered:', registration);

        // Check if PWA is installable
        window.addEventListener('beforeinstallprompt', (e) => {
          console.log('PWA is installable');
          // Prevent Chrome 67 and earlier from automatically showing the prompt
          e.preventDefault();
        });

      } catch (error) {
        console.error('PWA setup failed:', error);
      }
    });
  } else {
    console.log('Service workers are not supported');
  }
} 