import './globals.css';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { registerServiceWorker } from './pwa';

const inter = Inter({ subsets: ['latin'] });

// Dynamically import PWAInstallButton with no SSR
const PWAInstallButton = dynamic(
  () => import('./components/PWAInstallButton'),
  { ssr: false }
);

export const metadata = {
  title: 'Laundry POS',
  description: 'Laundry Point of Sale System',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192x192.png',
  },
  themeColor: '#1976d2'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#1976d2" />
      </head>
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
            <PWAInstallButton />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
} 