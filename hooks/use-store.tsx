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

      const userResponse = await supabase.auth.getUser()
      const userData = userResponse?.data
      
      if (!userData?.user) {
        setLoading(false)
        return
      }

      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle()

      if (storeData) {
        setStore({
          id: storeData.id,
          name: storeData.name || '',
          phone: storeData.phone || '',
          address: storeData.address || '',
          logo_url: storeData.logo_url || '',
        })
      }
    } catch (error) {
      console.error('Error fetching store:', error)
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

