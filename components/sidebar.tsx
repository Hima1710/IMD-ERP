'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/hooks/use-store'
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react'

interface SidebarProps {
  selectedStore?: string
  onStoreChange?: (store: string) => void
}

export function Sidebar({ selectedStore = 'settings', onStoreChange }: SidebarProps) {
const router = useRouter()
  const { store: globalStore, user, signOut } = useStore()
  const [loggingOut, setLoggingOut] = useState(false)
  const [userLabel, setUserLabel] = useState('')

  useEffect(() => {
    const currentUser = user 
    if (currentUser) {
      const raw = currentUser.email || currentUser.phone || ''
      const label = raw.includes('@') ? raw.split('@')[0] : raw
      setUserLabel(label)
    }
  }, [user])

  const handleLogout = () => {
    signOut()
  }

  return (
<div className="w-72 h-screen sticky top-0 z-40 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-lg justify-between">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
            {globalStore.logo_url ? (
              <img src={globalStore.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <img src="/imd-logo.jpeg" alt="IMD Logo" className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">IMD ERP</h1>
            <p className="text-xs text-slate-400">نظام اداره محلاتك</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
        <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right bg-blue-600 text-white">
          <span><LayoutDashboard className="w-5 h-5" /></span>
          <span className="flex-1 text-sm font-medium">لوحة التحكم</span>
        </Link>
        <Link href="/products" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right text-slate-300 hover:bg-slate-700">
          <span><Package className="w-5 h-5" /></span>
          <span className="flex-1 text-sm font-medium">المنتجات</span>
        </Link>
        <Link href="/reports" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right text-slate-300 hover:bg-slate-700">
          <span><BarChart3 className="w-5 h-5" /></span>
          <span className="flex-1 text-sm font-medium">التقارير</span>
        </Link>
        <Link href="/customers" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right text-slate-300 hover:bg-slate-700">
          <span><Users className="w-5 h-5" /></span>
          <span className="flex-1 text-sm font-medium">العملاء</span>
        </Link>
        <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right text-slate-300 hover:bg-slate-700">
          <span><Settings className="w-5 h-5" /></span>
          <span className="flex-1 text-sm font-medium">الإعدادات</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <div className="text-xs text-slate-400 px-2">
          <p className="font-semibold text-slate-300">المستخدم</p>
          <p>{userLabel || 'تحميل...'}</p>
        </div>
        {globalStore.name && (
          <div className="text-xs text-slate-400 px-2">
            <p className="font-semibold text-slate-300">المتجر</p>
            <p>{globalStore.name}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 text-white py-2 rounded-lg transition-colors text-sm cursor-pointer"
        >
          {loggingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري تسجيل الخروج...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </>
          )}
        </button>
      </div>
    </div>
  )
}
