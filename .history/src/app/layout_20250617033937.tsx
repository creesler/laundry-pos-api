import './globals.css';
import { Inter } from 'next/font/google';
import PWARoot from './components/PWARoot';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Laundry POS',
  description: 'Laundry Point of Sale System',
  themeColor: '#1976d2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Laundry POS'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
        <meta name="emotion-insertion-point" content="" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
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