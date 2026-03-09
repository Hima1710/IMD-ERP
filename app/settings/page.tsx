'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { BottomNav } from '@/components/BottomNav'
import { MobileNav, FloatingMenuButton } from '@/components/MobileNav'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/hooks/use-store'
import { Store, Camera, Save, Loader2, AlertCircle, CheckCircle, Menu } from 'lucide-react'

interface StoreSettings {
  id?: string
  name: string
  phone: string
  address: string
  logo_url: string
}

export default function SettingsPage() {
  const { store: globalStore, loading: globalLoading, refreshStore } = useStore()
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
    if (!globalLoading) {
      setStore({
        name: globalStore.name,
        phone: globalStore.phone,
        address: globalStore.address,
        logo_url: globalStore.logo_url,
      })
      setLoading(false)
    }
  }, [globalLoading, globalStore])

  useEffect(() => {
    fetchUserAndShopData()
  }, [])

  const fetchUserAndShopData = async () => {
    if (!supabase) return
    
    const userResponse = await supabase.auth.getUser()
    const userData = userResponse?.data
    
    if (userData?.user) {
      setUserId(userData.user.id)
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', userData.user.id)
        .single()
      
      if (profile?.shop_id) {
        setShopId(profile.shop_id)
        
        const { data: shop } = await supabase
          .from('shops')
          .select('*')
          .eq('id', profile.shop_id)
          .single()
        
        if (shop) {
          setStore({
            name: shop.name || '',
            phone: shop.phone || '',
            address: shop.location || '',
            logo_url: shop.logo_url || '',
          })
        }
      }
    }
  }

  const handleSave = async () => {
    if (!supabase) {
      setMessage({ type: 'error', text: 'خطأ في الاتصال بقاعدة البيانات' })
      return
    }

    if (!userId) {
      setMessage({ type: 'error', text: 'يجب تسجيل الدخول أولاً' })
      return
    }

    if (!shopId) {
      setMessage({ type: 'error', text: 'لا يوجد متجر مرتبط بهذا المستخدم' })
      return
    }

    if (!store.name.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم المتجر' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

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
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'خطأ في حفظ الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof StoreSettings, value: string) => {
    setStore(prev => ({ ...prev, [field]: value }))
  }

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
                    <input
                      type="tel"
                      value={store.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="01012345678"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">العنوان</label>
                    <textarea
                      value={store.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="الرياض - حي النرجس"
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">رابط الشعار</label>
                    <input
                      type="url"
                      value={store.logo_url}
                      onChange={(e) => handleChange('logo_url', e.target.value)}
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
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        حفظ الإعدادات
                      </>
                    )}
                  </button>
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

