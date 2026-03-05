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
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
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
