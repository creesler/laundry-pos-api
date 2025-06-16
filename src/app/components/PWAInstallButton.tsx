'use client';

import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    console.log('PWAInstallButton mounted');
    console.log('Current environment:', process.env.NODE_ENV);
    console.log('Initial isInstallable state:', isInstallable);

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install button
      setIsInstallable(true);
      console.log('Setting isInstallable to true due to beforeinstallprompt event');
    };

    // Force show button in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode detected - forcing button visibility');
      setIsInstallable(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    console.log('Is app in standalone mode?', isStandalone);
    
    if (isStandalone) {
      console.log('App is already installed - hiding button');
      setIsInstallable(false);
    }

    // Log PWA support status
    const hasServiceWorker = 'serviceWorker' in navigator;
    console.log('PWA Support Status:', {
      serviceWorkerSupported: hasServiceWorker,
      displayMode: isStandalone ? 'standalone' : 'browser',
      isInstallable: isInstallable,
      environment: process.env.NODE_ENV
    });

    // Check if manifest is loaded
    const manifestLink = document.querySelector('link[rel="manifest"]');
    console.log('Manifest link found:', manifestLink ? 'yes' : 'no');
    if (manifestLink) {
      console.log('Manifest href:', manifestLink.getAttribute('href'));
    }

    return () => {
      console.log('PWAInstallButton unmounting');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('Install button clicked');
    console.log('Current deferredPrompt state:', deferredPrompt ? 'available' : 'not available');
    
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode - simulating install');
        alert('In development mode. In production, this would trigger the install prompt.');
        return;
      }
      return;
    }

    try {
      console.log('Attempting to show install prompt');
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;

      console.log('User choice result:', choiceResult.outcome);
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstallable(false);
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferredPrompt for the next time
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  // Log visibility decision
  const shouldShow = isInstallable || process.env.NODE_ENV === 'development';
  console.log('Button visibility decision:', {
    isInstallable,
    environment: process.env.NODE_ENV,
    shouldShow
  });

  if (!shouldShow) {
    console.log('Install button hidden - conditions not met');
    return null;
  }

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleInstallClick}
      startIcon={<DownloadIcon />}
      sx={{
        position: 'fixed',
        bottom: '2vh',
        right: '2vh',
        borderRadius: '24px',
        padding: '1vh 2vh',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 9999,
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }
      }}
    >
      Install App
    </Button>
  );
} 