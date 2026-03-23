'use client'

import React, { useState, useEffect } from 'react'
<<<<<<< HEAD
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { BottomNav } from '@/components/BottomNav'
import { MobileNav, FloatingMenuButton } from '@/components/MobileNav'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/hooks/use-store'
import { Store, Camera, Save, Loader2, AlertCircle, CheckCircle, Menu } from 'lucide-react'

interface StoreSettings {
  id?: string
=======
import { supabase } from '@/lib/supabase'
import { useStore } from '@/hooks/use-store'
import { 
  Store, Camera, Save, Loader2, AlertCircle, CheckCircle, ChevronLeft, ChevronRight,
  LayoutDashboard, Users, Package, FileText, Settings, LogOut, Menu, X, Search, RefreshCw
} from 'lucide-react'

interface StoreSettings {
>>>>>>> blackboxai-upload-all-changes
  name: string
  phone: string
  address: string
  logo_url: string
}

<<<<<<< HEAD
export default function SettingsPage() {
  // غيرنا اسم loading لـ authLoading عشان ميتخانقش مع الـ useState اللي تحتها
  const { store: globalStore, loading: storeLoading, isLoaded, refreshStore } = useStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [shopId, setShopId] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [store, setStore] = useState<StoreSettings>({
    name: '',
    phone: '',
    address: '',
    logo_url: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (isLoaded && !storeLoading) {
      setStore({
        name: globalStore.name,
        phone: globalStore.phone,
        address: globalStore.address,
        logo_url: globalStore.logo_url,
=======
const TAJAWAL_URL = "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap"

function Modal({ open, onClose, children, maxW = "max-w-md" }: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxW?: string
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-3xl p-6 w-full ${maxW} max-h-[90vh] overflow-y-auto shadow-2xl`}
        style={{ animation: "modalIn 0.2s ease-out" }}>
        {children}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { store: globalStore, loading: storeLoading, isLoaded, refreshStore, signOut } = useStore()
  const [mounted, setMounted] = useState(false)

  // ── Sidebar ──────────────────────────────
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // ── Form state ───────────────────────────
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [store, setStore] = useState<StoreSettings>({
    name: '', phone: '', address: '', logo_url: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ── Mount & fonts ────────────────────────
  useEffect(() => {
    setMounted(true)
    const link = document.createElement("link")
    link.href = TAJAWAL_URL
    link.rel = "stylesheet"
    document.head.appendChild(link)
    const style = document.createElement("style")
    style.textContent = `
      @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(link)
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) setCollapsed(saved === "true")
  }, [])
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed))
  }, [collapsed])

  useEffect(() => {
    if (isLoaded && !storeLoading) {
      setStore({
        name: globalStore.name || '',
        phone: globalStore.phone || '',
        address: globalStore.address || '',
        logo_url: globalStore.logo_url || ''
>>>>>>> blackboxai-upload-all-changes
      })
      setLoading(false)
    }
  }, [isLoaded, storeLoading, globalStore])

<<<<<<< HEAD
// Removed fetchUserAndShopData() - using store exclusively

// ✅ fetchUserAndShopData() REMOVED - store provides all data

  const handleSave = async () => {
    if (!supabase) {
      setMessage({ type: 'error', text: 'خطأ في الاتصال بقاعدة البيانات' })
      return
    }

// ✅ Store provides userId + shopId

=======
  const handleSave = async () => {
>>>>>>> blackboxai-upload-all-changes
    if (!store.name.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم المتجر' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

<<<<<<< HEAD
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: store.name })
        .eq('id', userId)

      if (profileError) {
        console.warn('Profile update warning:', profileError.message)
      }

      const { error: shopError } = await supabase
        .from('shops')
        .update({
          name: store.name,
          phone: store.phone,
          location: store.address,
          logo_url: store.logo_url,
        })
        .eq('id', shopId)

      if (shopError) {
        throw shopError
      }

      setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' })
      await refreshStore()
      setTimeout(() => setMessage(null), 3000)
=======
      // Update shop (preserved logic)
      const { error } = await supabase.from('shops').update({
        name: store.name,
        phone: store.phone || null,
        location: store.address || null,
        logo_url: store.logo_url || null,
      }).eq('id', globalStore.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح ✅' })
      refreshStore()
      setTimeout(() => setMessage(null), 4000)
>>>>>>> blackboxai-upload-all-changes
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'خطأ في حفظ الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof StoreSettings, value: string) => {
    setStore(prev => ({ ...prev, [field]: value }))
  }

<<<<<<< HEAD
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <FloatingMenuButton onClick={() => setMobileNavOpen(true)} />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar selectedStore="settings" onStoreChange={() => {}} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button onClick={() => setMobileNavOpen(true)} className="p-2 rounded-xl bg-slate-100">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-base font-bold">الإعدادات</h1>
          <div className="w-9" />
        </div>
        
        <POSHeader searchTerm="" onSearchChange={() => {}} selectedStore="settings" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-6">
          <div className="max-w-2xl mx-auto">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">إعدادات المتجر</h1>
              <p className="text-sm text-slate-500 mt-1">قم بتعديل بيانات متجرك</p>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-500">جاري تحميل البيانات...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Logo Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1 shadow-lg mx-auto">
                      {store.logo_url ? (
                        <img 
                          src={store.logo_url} 
                          alt="Logo" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                          <Store className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow">
                      <Camera className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mt-3">شعار المتجر</p>
                </div>

                {/* Form Fields */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${
                      message.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <span className="text-sm">{message.text}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      اسم المتجر <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={store.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="متجر الدهانات الذهبية"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">يظهر في رأس الإيصالات</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
=======
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f4f6fb]">
        <Loader2 className="h-12 w-12 animate-spin text-[#6C63FF] mx-auto" />
      </div>
    )
  }

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "لوحة التحكم", href: "/dashboard" },
    { icon: <Users className="w-5 h-5" />, label: "العملاء", href: "/customers" },
    { icon: <Package className="w-5 h-5" />, label: "المنتجات", href: "/products" },
    { icon: <FileText className="w-5 h-5" />, label: "التقارير", href: "/reports" },
    { icon: <Settings className="w-5 h-5" />, label: "الإعدادات", href: "/settings", active: true },
  ]

  const sidebarW = collapsed ? "lg:w-20" : "lg:w-64"
  const mainMr = collapsed ? "lg:mr-20" : "lg:mr-64"

  const inputCls = "w-full p-3.5 border border-slate-200 rounded-2xl focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 font-medium outline-none transition text-sm bg-slate-50 focus:bg-white"

  return (
    <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }} className="min-h-screen bg-[#f4f6fb] text-slate-900">
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full z-50 bg-[#161c2d] text-white flex flex-col
        transition-all duration-300 ease-in-out shadow-2xl w-64 ${sidebarW}
        ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-black text-xs">ERP</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black text-white leading-tight">IMD ERP</h1>
                {globalStore.name && <p className="text-xs text-slate-400 truncate">{globalStore.name}</p>}
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-black text-xs">ERP</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition flex-shrink-0">
            {collapsed ? <ChevronLeft className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <a key={item.href} href={item.href} className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm
              ${item.active ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30" : "text-slate-400 hover:bg-white/8 hover:text-white"}
              ${collapsed ? "justify-center px-2" : ""}
            `} title={collapsed ? item.label : undefined}>
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="p-2.5 border-t border-white/10 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-white/5">
              <p className="text-xs text-slate-500">المستخدم الحالي</p>
              <p className="font-bold text-xs text-white mt-0.5 truncate">المدير</p>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className={`
            w-full flex items-center gap-2 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300
            rounded-xl font-semibold transition-all text-sm ${collapsed ? "justify-center" : ""}
          `}>
            <LogOut className="w-4 h-4" />
            {!collapsed && "تسجيل خروج"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMr}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-slate-900 leading-tight">إعدادات المتجر</h1>
              <p className="text-xs text-slate-400 hidden sm:block">تخصيص بيانات المتجر والشعار</p>
            </div>
            {saving && (
              <div className="flex items-center gap-1.5 text-[#6C63FF] text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={refreshStore} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-6 max-w-2xl mx-auto w-full">
          {/* Messages */}
          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-sm ${
              message.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <span className="font-semibold text-sm flex-1">{message.text}</span>
              <button onClick={() => setMessage(null)} className="p-1 hover:bg-white/50 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-[#6C63FF] mb-4" />
              <p className="font-bold text-slate-500 text-lg">جاري تحميل الإعدادات...</p>
            </div>
          ) : (
            <>
              {/* Form Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:p-8 space-y-6">
                {/* Logo Preview */}
                <div className="text-center pb-6 border-b border-slate-200">
                  <div className="relative inline-block mx-auto mb-4">
                    <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 p-2 shadow-xl mx-auto flex items-center justify-center border-4 border-white">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt="شعار المتجر" className="w-full h-full rounded-2xl object-cover shadow-lg" />
                      ) : (
                        <Store className="w-12 h-12 lg:w-14 lg:h-14 text-slate-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 lg:-bottom-3 lg:-right-3 bg-white p-2 rounded-2xl shadow-lg border border-slate-200">
                      <Camera className="w-5 h-5 text-slate-500" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600">معاينة شعار الإيصال</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1">
                      اسم المتجر <span className="text-red-500 text-sm">*</span>
                    </label>
                    <input
                      value={store.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="اسم المتجر الرئيسي"
                      className={inputCls}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2">رقم الهاتف</label>
>>>>>>> blackboxai-upload-all-changes
                    <input
                      type="tel"
                      value={store.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
<<<<<<< HEAD
                      placeholder="01012345678"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                      placeholder="01xxxxxxxxx"
                      className={`${inputCls} dir-ltr`}
                      disabled={saving}
>>>>>>> blackboxai-upload-all-changes
                    />
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-2">العنوان</label>
                    <textarea
                      value={store.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="الرياض - حي النرجس"
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
=======
                    <label className="block text-xs font-black text-slate-700 mb-2">العنوان الكامل</label>
                    <textarea
                      value={store.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="العنوان التفصيلي للمتجر"
                      rows={3}
                      className={`${inputCls} resize-none h-24`}
                      disabled={saving}
>>>>>>> blackboxai-upload-all-changes
                    />
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-2">رابط الشعار</label>
=======
                    <label className="block text-xs font-black text-slate-700 mb-2">رابط الشعار (اختياري)</label>
>>>>>>> blackboxai-upload-all-changes
                    <input
                      type="url"
                      value={store.logo_url}
                      onChange={(e) => handleChange('logo_url', e.target.value)}
<<<<<<< HEAD
                      placeholder="https://example.com/logo.jpg"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 sm:py-4 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
=======
                      placeholder="https://example.com/logo.png"
                      className={inputCls}
                      disabled={saving}
                    />
                    <p className="text-xs text-slate-500 mt-1">استخدم صورة مربعة 512x512 بكسل لأفضل نتيجة</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving || !store.name.trim()}
                    className="flex-1 bg-[#6C63FF] hover:bg-[#5A55E6] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
>>>>>>> blackboxai-upload-all-changes
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
<<<<<<< HEAD
                        <Save className="w-5 h-5" />
=======
                        <Save className="w-4 h-4" />
>>>>>>> blackboxai-upload-all-changes
                        حفظ الإعدادات
                      </>
                    )}
                  </button>
<<<<<<< HEAD
                </div>
              </div>
            )}

            {/* Preview Section */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">معاينة الإيصال</h2>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4">
                <div className="text-center border-b border-slate-200 pb-4 mb-4">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mx-auto mb-2" />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <Store className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{store.name || 'اسم المتجر'}</h3>
                  {store.phone && <p className="text-sm text-slate-500">{store.phone}</p>}
                  {store.address && <p className="text-sm text-slate-500">{store.address}</p>}
                </div>
                <div className="text-center text-sm text-slate-400">
                  <p>شكراً لتعاملكم معنا!</p>
                </div>
              </div>
            </div>

            {/* Branding - Only show on mobile at bottom */}
            <div className="md:hidden mt-6 text-center py-4">
              <p className="text-xs text-slate-400">By Eng. Ibrahim Mabrouk El-Deeb</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav cartCount={0} />
    </div>
  )
}

=======
                  <button
                    onClick={refreshStore}
                    disabled={saving}
                    className="px-6 py-4 border-2 border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-2xl font-bold text-slate-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                    إعادة تحميل
                  </button>
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:p-8">
                <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  معاينة الإيصال <FileText className="w-4 h-4 opacity-60" />
                </h2>
                <div className="bg-gradient-to-b from-slate-50 to-white p-8 rounded-3xl border-2 border-slate-200 shadow-inner text-center max-w-sm mx-auto">
                  <div className="mb-6">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt="شعار" className="w-20 h-20 rounded-2xl mx-auto mb-3 shadow-lg object-cover" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Store className="w-10 h-10 text-slate-500" />
                      </div>
                    )}
                    <h3 className="text-xl font-black text-slate-900 mb-1">{store.name || 'اسم المتجر'}</h3>
                    {store.phone && <p className="text-sm font-semibold text-slate-700 mb-1">{store.phone}</p>}
                    {store.address && <p className="text-sm text-slate-600">{store.address}</p>}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-mono text-slate-500 text-xs">رقم الفاتورة: #12345</p>
                    <p className="font-bold text-lg text-slate-900">شكراً لك على ثقتك بنا 🌟</p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
>>>>>>> blackboxai-upload-all-changes
