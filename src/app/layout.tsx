import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import PWARoot from './components/PWARoot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Laundry POS',
  description: 'Laundry Point of Sale System',
  manifest: '/manifest.json',
  themeColor: '#1976d2',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Laundry POS'
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png'
  }
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
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Laundry POS" />
      </head>
      <body className={inter.className}>
        <PWARoot>
          {children}
        </PWARoot>
      </body>
    </html>
  );
} 