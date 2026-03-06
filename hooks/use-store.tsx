'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface StoreData {
  id?: string
  name: string
  phone: string
  address: string
  logo_url: string
}

interface StoreContextType {
  store: StoreData
  loading: boolean
  refreshStore: () => Promise<void>
}

const defaultStore: StoreData = {
  name: '',
  phone: '',
  address: '',
  logo_url: '',
}

const StoreContext = createContext<StoreContextType>({
  store: defaultStore,
  loading: true,
  refreshStore: async () => {},
})

export function useStore() {
  return useContext(StoreContext)
}

interface StoreProviderProps {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [store, setStore] = useState<StoreData>(defaultStore)
  const [loading, setLoading] = useState(true)

  const fetchStore = async () => {
    try {
      if (!supabase) {
        setLoading(false)
        return
      }

      // Try to get user with retries
      let user = null
      let retries = 0
      const maxRetries = 5

      while (!user && retries < maxRetries) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          user = session.user
          break
        }
        retries++
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      if (!user) {
        console.log('useStore: No user session found')
        setLoading(false)
        return
      }

      console.log('📥 [STORE] Fetching profile for user:', user.id)

      // Fetch from profiles table to get shop_name
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('phone, shop_name')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('⚠️ [STORE] Profile not found, using defaults:', profileError.message)
        // Still set loading to false, will use defaults
        setLoading(false)
        return
      }

      if (profileData) {
        console.log('✅ [STORE] Profile fetched:', profileData)
        setStore({
          name: profileData.shop_name || '',
          phone: profileData.phone || '',
          address: '',
          logo_url: '',
        })
      }
    } catch (error) {
      console.error('❌ [STORE] Error fetching store:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStore()
  }, [])

  const refreshStore = async () => {
    setLoading(true)
    await fetchStore()
  }

  return (
    <StoreContext.Provider value={{ store, loading, refreshStore }}>
      {children}
    </StoreContext.Provider>
  )
}

