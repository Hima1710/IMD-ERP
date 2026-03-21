'use client'

import { useEffect } from 'react'
import { useStore } from '@/hooks/use-store'

export function AuthInitializer() {
  const { initAuth, isAuthLoading } = useStore()
  
  useEffect(() => {
    console.log('🚀 [AUTH INIT] Starting auth hydration...')
    initAuth()
  }, []) // Always run once on mount

  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 z-[9999]">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">جاري التحميل...</h2>
          <p className="text-slate-600">التحقق من تسجيل الدخول</p>
        </div>
      </div>
    )
  }

  return null
}

