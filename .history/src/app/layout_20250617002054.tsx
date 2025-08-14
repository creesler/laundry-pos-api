import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import PWARoot from './components/PWARoot';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Laundry POS',
  description: 'Laundry Point of Sale System',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192x192.png',
  },
  themeColor: '#1976d2'
};

// This implementation might break in development mode, as React.cache is not available there.
const createEmotionCache = () => {
  return createCache({ key: 'css', prepend: true });
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#1976d2" />
      </head>
      <body className={inter.className}>
        <CacheProvider value={createEmotionCache()}>
          <PWARoot>
            {children}
          </PWARoot>
        </CacheProvider>
      </body>
    </html>
  );
} 