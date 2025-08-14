'use client'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme'
import { EmployeeProvider } from './contexts/EmployeeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Laundry King POS',
  description: 'Laundry Shop POS Daily Entry System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <EmployeeProvider>
            <div className="min-h-screen bg-gray-100">
              {children}
            </div>
          </EmployeeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 