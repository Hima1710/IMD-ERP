'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react'

interface BottomNavProps {
  onOpenCart?: () => void
  cartCount?: number
}

export function BottomNav({ onOpenCart, cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'الرئيسية' },
    { href: '/products', icon: Package, label: 'المنتجات' },
    { href: '/customers', icon: Users, label: 'العملاء' },
    { href: '/reports', icon: BarChart3, label: 'التقارير' },
    { href: '/settings', icon: Settings, label: 'الإعدادات' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg md:hidden z-50 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.href === '/' && cartCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

