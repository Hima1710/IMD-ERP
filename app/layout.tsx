import type { Metadata, Viewport } from 'next'
import { Inter, Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { AuthInitializer } from '@/components/AuthInitializer'

import './globals.css'

  const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
  const cairo = Cairo({ subsets: ["arabic", "latin"], variable: '--font-cairo', weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'IMD ERP - نظام إدارة المستودع',
  description: 'Professional Warehouse Management System - نظام إدارة المستودع والمبيعات - By Eng. Ibrahim Mabrouk El-Deeb',
  generator: 'Next.js',
  applicationName: 'IMD ERP',
  keywords: ['ERP', 'POS', 'Warehouse', 'Inventory', 'Sales', 'مستودع', 'مبيعات', 'نقاط البيع'],
  authors: [{ name: 'Eng. Ibrahim Mabrouk El-Deeb' }],
  creator: 'Eng. Ibrahim Mabrouk El-Deeb',
  publisher: 'IMD',
  icons: {
    icon: [
      {
        url: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'IMD ERP - نظام إدارة المستودع',
    description: 'Professional Warehouse Management System',
    type: 'website',
    locale: 'ar_AR',
  },
}

export const viewport: Viewport = {
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
  // TEMP SERVER ENV VERIFICATION - Remove after testing
  console.log('🖥️ SERVER ENV:', {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'LOADED' : 'MISSING',
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'LOADED' : 'MISSING'
  })

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${inter.variable}`}>
      <head>
        {/* <link rel="manifest" href="/manifest.json" /> */}
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen">
        <AuthInitializer />
        <OfflineIndicator />
          {children}
        <Analytics />
      </body>
    </html>
  )
}

