import type { Metadata } from 'next'
import { Geist, Geist_Mono, Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { StoreProvider } from '@/hooks/use-store'
import './globals.css'

const _geist = Geist({ subsets: ["latin"], variable: '--font-geist' });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' });
const _cairo = Cairo({ subsets: ["latin", "arabic"], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'IMD ERP - نظام إدارة المستودع',
  description: 'Professional Warehouse Management System - By Eng. Ibrahim Mabrouk El-Deeb',
  generator: 'v0.app',
  manifest: '/manifest.json',
icons: {
    icon: [
      {
        url: '/imd-logo.jpeg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        url: '/imd-logo.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
    apple: '/imd-logo.jpeg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1e3a5f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${_cairo.variable} ${_geist.variable} ${_geistMono.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <StoreProvider>
          {children}
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  )
}
