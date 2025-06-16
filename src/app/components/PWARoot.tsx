'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
import theme from '../theme';
import PWAInstallButton from './PWAInstallButton';

const clientSideEmotionCache = createEmotionCache();

export default function PWARoot({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PWAInstallButton />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
} 