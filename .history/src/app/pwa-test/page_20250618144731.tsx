'use client';

import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Android } from '@mui/icons-material';
import { useEffect, useState } from 'react';

export default function PWATestPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => console.log('Service Worker registered:', registration))
        .catch((error) => console.error('Service Worker registration failed:', error));
    }

    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <Box 
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <Typography variant="h4" gutterBottom>
        PWA Test Page
      </Typography>
      <Typography variant="body1">
        This is a simple test page to verify PWA functionality.
      </Typography>
      {isInstallable && (
        <Tooltip title="Install App">
          <IconButton 
            onClick={handleInstall}
            sx={{
              mt: 2,
              backgroundColor: '#e8f5e9',
              borderRadius: '50%',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: '#c8e6c9'
              }
            }}
          >
            <Android color="primary" />
          </IconButton>
        </Tooltip>
      )}
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Version 1.0
      </Typography>
    </Box>
  );
} 