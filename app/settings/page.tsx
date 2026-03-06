'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/hooks/use-store'
import { Store, Camera, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

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
  const [store, setStore] = useState<StoreSettings>({
    name: '',
    phone: '',
    address: '',
    logo_url: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch current user and store data
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

  // Also get userId from supabase
  useEffect(() => {
    fetchUserId()
  }, [])

  const fetchUserId = async () => {
    if (!supabase) return
    const userResponse = await supabase.auth.getUser()
    const userData = userResponse?.data
    if (userData?.user) {
      setUserId(userData.user.id)
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

    if (!store.name.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم المتجر' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      console.log('💾 [SETTINGS] Saving profile with shop_name:', store.name)

      // Save to profiles table (this is what the app reads from)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            phone: store.phone,
            shop_name: store.name,
          },
          { onConflict: 'id' }
        )

      if (profileError) {
        throw profileError
      }

      console.log('✅ [SETTINGS] Profile saved successfully')

      // Also save to stores table for backward compatibility (if it exists)
      if (store.id) {
        const { error: storeError } = await supabase
          .from('stores')
          .update({
            name: store.name,
            phone: store.phone,
            address: store.address,
            logo_url: store.logo_url,
          })
          .eq('id', store.id)

        if (storeError) {
          console.warn('⚠️ [SETTINGS] Warning updating stores table:', storeError.message)
        }
      } else {
        const { data: newStore, error: storeError } = await supabase
          .from('stores')
          .insert({
            user_id: userId,
            name: store.name,
            phone: store.phone,
            address: store.address,
            logo_url: store.logo_url,
          })
          .select()
          .single()

        if (storeError) {
          console.warn('⚠️ [SETTINGS] Warning creating stores table:', storeError.message)
        }

        if (newStore) {
          setStore({ ...store, id: newStore.id })
        }
      }

      setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' })
      
      // Refresh global store data
      await refreshStore()
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('❌ [SETTINGS] Error saving:', error)
      setMessage({ type: 'error', text: error.message || 'خطأ في حفظ الإعدادات' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof StoreSettings, value: string) => {
    setStore(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar selectedStore="settings" onStoreChange={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <POSHeader searchTerm="" onSearchChange={() => {}} selectedStore="settings" />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">إعدادات المتجر</h1>
              <p className="text-slate-500 mt-1">قم بتعديل بيانات متجرك يظهر في جميع المناطق</p>
            </div>

            {loading ? (
              // Loading State
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-500">جاري تحميل البيانات...</p>
              </div>
            ) : (
              // Settings Form
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Logo Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mx-auto">
                      {store.logo_url ? (
                        <img 
                          src={store.logo_url} 
                          alt="Logo" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                          <Store className="w-10 h-10 text-slate-400" />
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
                <div className="p-6 space-y-6">
                  {/* Message */}
                  {message && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${
                      message.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <span>{message.text}</span>
                    </div>
                  )}

                  {/* Store Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      اسم المتجر <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={store.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="متجر الدهانات الذهبية"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">يظهر في رأس الإيصالات</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={store.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="01012345678"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      العنوان
                    </label>
                    <textarea
                      value={store.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="الرياض - حي النرجس - شارع الملك فهد"
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      رابط الشعار
                    </label>
                    <input
                      type="url"
                      value={store.logo_url}
                      onChange={(e) => handleChange('logo_url', e.target.value)}
                      placeholder="https://example.com/logo.jpg"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      أدخل رابط صورة الشعار (jpg, png) أو اتركه فارغاً
                    </p>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
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
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">معاينة الإيصال</h2>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
                <div className="text-center border-b border-slate-200 pb-4 mb-4">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="Logo" className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <Store className="w-8 h-8 text-slate-400" />
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
          </div>
        </div>
      </div>
    </div>
  )
}

