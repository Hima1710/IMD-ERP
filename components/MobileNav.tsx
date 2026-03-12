'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/hooks/use-store'
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
} from 'lucide-react'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { store: globalStore, user, checkUser } = useStore()
  const [loggingOut, setLoggingOut] = useState(false)
  const [userLabel, setUserLabel] = useState<string>('')

  // Load user label from centralized user
  useEffect(() => {
    async function loadUserLabel() {
      // Use centralized user from useStore if available
      if (user) {
        const raw = user.email || user.phone || ''
        const label = raw.includes('@') ? raw.split('@')[0] : raw
        setUserLabel(label)
        return
      }
      
      // Otherwise use checkUser
      const currentUser = await checkUser()
      if (currentUser) {
        const raw = currentUser.email || currentUser.phone || ''
        const label = raw.includes('@') ? raw.split('@')[0] : raw
        setUserLabel(label)
      }
    }
    loadUserLabel()
  }, [user, checkUser])

  const handleLogout = async () => {
    if (!supabase) return
    setLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const handleLinkClick = () => {
    onClose()
  }

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { href: '/products', icon: Package, label: 'المنتجات' },
    { href: '/customers', icon: Users, label: 'العملاء' },
    { href: '/reports', icon: BarChart3, label: 'التقارير' },
    { href: '/settings', icon: Settings, label: 'الإعدادات' },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white z-50 md:hidden animate-slide-in-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              {globalStore.logo_url ? (
                <img src={globalStore.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <img src="/imd-logo.jpeg" alt="IMD Logo" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold">{globalStore.name || 'IMD ERP'}</h1>
              <p className="text-xs text-slate-400">نظام إدارة المستودع</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
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
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 text-white py-2.5 rounded-lg transition-colors text-sm"
          >
            {loggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري...
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

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

// Floating Menu Button Component
export function FloatingMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-30 hidden bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}

