'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Get the base URL from the current page
          const baseUrl = window.location.origin;
          const registration = await navigator.serviceWorker.register(
            `${baseUrl}/sw.js`,
            { scope: '/' }
          );
          console.log('Service Worker registered with scope:', registration.scope);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
          // Don't throw the error - we want the app to work even if SW fails
        }
      }
    };

    registerServiceWorker();
  }, []);

  return null;
} 