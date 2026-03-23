export const dynamic = 'force-dynamic'
import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { AuthInitializer } from '@/components/AuthInitializer'
import './globals.css'

const cairo = Cairo({ 
  subsets: ["arabic", "latin"], 
  variable: '--font-cairo', 
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'IMD ERP - نظام إدارة المستودع',
  description: 'نظام إدارة المستودع والمبيعات المتكامل - IMD ERP',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
  },
  themeColor: '#1e3a5f',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} font-cairo`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthInitializer />
        <OfflineIndicator />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
