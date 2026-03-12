import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { StoreProvider } from '@/hooks/use-store'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import './globals.css'

const _geist = Geist({ subsets: ["latin"], variable: '--font-geist' });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' });
const _cairo = Cairo({ subsets: ["latin", "arabic"], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'IMD ERP - نظام إدارة المستودع',
  description: 'Professional Warehouse Management System - نظام إدارة المستودع والمبيعات - By Eng. Ibrahim Mabrouk El-Deeb',
  generator: 'v0.app',

  applicationName: 'IMD ERP',
  keywords: ['ERP', 'POS', 'Warehouse', 'Inventory', 'Sales', 'مستودع', 'مبيعات', 'نقاط البيع'],
  authors: [{ name: 'Eng. Ibrahim Mabrouk El-Deeb' }],
  creator: 'Eng. Ibrahim Mabrouk El-Deeb',
  publisher: 'IMD',
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
    apple: [
      {
        url: '/imd-logo.jpeg',
        sizes: '180x180',
        type: 'image/jpeg',
      },
    ],
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
  return (
    <html lang="ar" dir="rtl" className={`${_cairo.variable} ${_geist.variable} ${_geistMono.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <StoreProvider>
          <OfflineIndicator />
          {children}
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  )
}
