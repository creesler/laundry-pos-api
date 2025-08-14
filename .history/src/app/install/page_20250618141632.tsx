'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Android } from '@mui/icons-material';

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setMessage('App is already installed!');
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setMessage('To install on iOS: tap the share button and select "Add to Home Screen"');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setMessage('Installation successful!');
        setIsInstallable(false);
      } else {
        setMessage('Installation cancelled');
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
      setMessage('Installation failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="h4" component="h1">
        Laundry King POS
      </Typography>

      <Typography variant="body1">
        Install our app for the best experience!
      </Typography>

      {isInstallable && (
        <Button
          variant="contained"
          size="large"
          startIcon={<Android />}
          onClick={handleInstall}
          sx={{ mt: 2 }}
        >
          Install App
        </Button>
      )}

      {message && (
        <Typography 
          color={message.includes('successful') ? 'success.main' : 'info.main'}
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
} 