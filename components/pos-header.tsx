'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Barcode, Bell, User, Clock, Settings, LogOut, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { useOfflineSync } from '@/hooks/use-offline-sync'

interface POSHeaderProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedStore: string
}

interface LowStockProduct {
  id: string
  name: string
  stock: number
  min_quantity: number
}

export function POSHeader({ searchTerm, onSearchChange, selectedStore }: POSHeaderProps) {
  const router = useRouter()
  
  // State for notifications
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  
  // State for dropdowns
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  
  // Get offline sync status
  const { isOnline: isConnected, pendingCount, isSyncing, syncNow } = useOfflineSync()
  
  // Refs for click outside
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // Fetch low stock products on mount
  useEffect(() => {
    fetchLowStockProducts()
  }, [])

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchLowStockProducts = async () => {
    if (!supabase) return
    
    try {
      setLoadingNotifications(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get shop_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single()

      if (!profile?.shop_id) return

      // Fetch all products for this shop
      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock, min_quantity')
        .eq('shop_id', profile.shop_id)

      if (!products) return

      // Filter low stock products (stock <= min_quantity)
      const lowStock = products.filter(p => 
        (p.stock || 0) <= (p.min_quantity || 0)
      )

      setLowStockProducts(lowStock)
    } catch (error) {
      console.error('Error fetching low stock products:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const handleLogout = async () => {
    if (!supabase) {
      router.push('/login')
      return
    }
    
    try {
      setLoggingOut(true)
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const currentTime = new Date().toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      {/* Top Bar */}
      <div className="px-3 md:px-6 py-2 md:py-3 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{currentTime}</span>
          </div>
          
          {/* Online/Offline Status Indicator */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-600">متصل</span>
                {pendingCount > 0 && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {pendingCount} معاملة معلقة
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-red-600">غير متصل</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="relative p-1.5 md:p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-4 md:w-5 h-4 md:h-5 text-slate-600" />
              {lowStockProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 md:w-5 h-4 md:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {lowStockProducts.length > 9 ? '9+' : lowStockProducts.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-72 md:w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-900">التنبيهات</h3>
                  {lowStockProducts.length > 0 && (
                    <p className="text-xs text-slate-500">{lowStockProducts.length} منتج منخفض المخزون</p>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-4 text-center text-slate-500">جاري التحميل...</div>
                  ) : lowStockProducts.length === 0 ? (
                    <div className="p-4 text-center">
                      <Bell className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-slate-600">لا توجد تنبيهات جديدة</p>
                    </div>
                  ) : (
                    lowStockProducts.map(product => (
                      <div 
                        key={product.id}
                        className="p-3 border-b border-slate-100 hover:bg-slate-50 flex items-start gap-3"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{product.name}</p>
                          <p className="text-xs text-red-600">
                            المخزون: {product.stock || 0} / الحد الأدنى: {product.min_quantity || 0}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {lowStockProducts.length > 0 && (
                  <div className="p-2 border-t border-slate-200 bg-slate-50">
                    <button 
                      onClick={() => {
                        setShowNotifications(false)
                        router.push('/reports')
                      }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      عرض كل التنبيهات
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userRef}>
            <button 
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              className="p-1.5 md:p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <div className="w-7 md:w-8 h-7 md:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-3 md:w-4 h-3 md:h-4 text-blue-600" />
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-44 md:w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-200">
                  <p className="font-medium text-slate-900">القائمة</p>
                </div>
                
                <div className="py-1">
                  <Link 
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 md:px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span>إعدادات المتجر</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-3 md:px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                  >
                    {loggingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <span>جاري الخروج...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-4">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 md:px-4 py-2 hover:border-slate-300 focus-within:border-blue-500 focus-within:bg-white transition-colors">
          <Search className="w-4 md:w-5 h-4 md:h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-500 text-sm"
          />
        </div>

        <button className="flex items-center gap-1 md:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg transition-colors font-medium text-sm">
          <Barcode className="w-4 md:w-5 h-4 md:h-5" />
          <span className="hidden sm:inline">ماسح باركود</span>
        </button>
      </div>
    </div>
  )
}

