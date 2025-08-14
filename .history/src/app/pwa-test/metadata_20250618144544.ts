import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PWA Test Page',
  description: 'Testing PWA functionality',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PWA Test'
  },
}; 