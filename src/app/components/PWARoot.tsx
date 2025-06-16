'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../pwa';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';

// Dynamically import PWAInstallButton with no SSR
const PWAInstallButton = dynamic(
  () => import('./PWAInstallButton'),
  { ssr: false }
);

export default function PWARoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <PWAInstallButton />
    </ThemeProvider>
  );
} 