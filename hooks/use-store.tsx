import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface StoreData {
  id?: string
  name: string
  phone: string
  address: string
  logo_url: string
  shopId?: string | null
}

const defaultStore: StoreData = {
  name: '',
  phone: '',
  address: '',
  logo_url: '',
  shopId: null,
}

interface StoreState {
  store: StoreData
  user: any | null
  isAuthenticated: boolean
  loading: boolean
  isLoaded: boolean
  isAuthLoading: boolean
  hasInitializedAuth: boolean
  initAuth: () => Promise<void>
  fetchStore: () => Promise<void>
  refreshStore: () => Promise<void>
  signOut: () => Promise<void>
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      store: defaultStore,
      user: null,
      isAuthenticated: false,
      loading: true,
      isLoaded: false,
      isAuthLoading: true,
      hasInitializedAuth: false,

      fetchStore: async () => {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser()

          if (!currentUser?.id) {
            set({ loading: false, isLoaded: true, store: defaultStore })
            return
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('shop_id, full_name')
            .eq('id', currentUser.id)
            .single()

          if (profileError || !profile?.shop_id) {
            console.warn('[STORE] No profile/shop for:', currentUser.email)
            set({ loading: false, isLoaded: true, store: defaultStore })
            return
          }

          const { data: shopData, error: shopError } = await supabase
            .from('shops')
            .select('*')
            .eq('id', profile.shop_id)
            .single()

          if (shopError || !shopData) {
            console.warn('[STORE] Shop not found:', profile.shop_id)
            set({ loading: false, isLoaded: true, store: defaultStore })
            return
          }

          console.log(`✅ [STORE] ${shopData.name} → ${currentUser.email}`)

          set({
            store: {
              id: shopData.id,
              shopId: shopData.id,
              name: shopData.name || '',
              phone: shopData.phone || '',
              address: shopData.location || '',
              logo_url: shopData.logo_url || '',
            },
            loading: false,
            isLoaded: true,
          })
        } catch (error) {
          console.error('[STORE]', error)
          set({ loading: false, isLoaded: true, store: defaultStore })
        }
      },

      initAuth: async () => {
        const state = get()

        if (state.hasInitializedAuth) {
          console.log('⏭️ [AUTH] Already initialized, skipping')
          return
        }

        set({ hasInitializedAuth: true, isAuthLoading: true })
        console.log('🚀 [AUTH INIT] Starting auth hydration...')

        const { data: { session } } = await supabase.auth.getSession()
        let user = session?.user || null

        if (!user) {
          const { data: { user: fallbackUser } } = await supabase.auth.getUser()
          user = fallbackUser || null
        }

        if (user) {
          console.log(`✅ [AUTH] ${user.email}`)
          set({ user, isAuthenticated: true, isAuthLoading: false })
          get().fetchStore()
        } else {
          set({ user: null, isAuthenticated: false, isAuthLoading: false, loading: false, isLoaded: true, store: defaultStore })
        }

        supabase.auth.onAuthStateChange((event, newSession) => {
          console.log(`🔐 [AUTH EVENT] ${event}`, newSession?.user?.email || '')

          if (event === 'SIGNED_IN') {
            const currentUser = get().user
            if (newSession?.user?.id !== currentUser?.id) {
              console.log(`🔄 [AUTH] Switch → ${newSession?.user?.email}`)
              set({
                user: newSession?.user,
                isAuthenticated: true,
                isAuthLoading: false,
                store: defaultStore,
                isLoaded: false,
              })
              get().fetchStore()
            }
          } else if (event === 'TOKEN_REFRESHED') {
            set({ user: newSession?.user, isAuthenticated: true, isAuthLoading: false })
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 [AUTH] Signed out')
            set({
              user: null,
              isAuthenticated: false,
              isAuthLoading: false,
              loading: false,
              isLoaded: true,
              store: defaultStore,
              hasInitializedAuth: false,
            })
          }
        })
      },

      refreshStore: () => get().fetchStore(),

      signOut: async () => {
        try {
          // 1. امسح localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pos-store')
          }
          // 2. reset الـ state
          set({
            user: null,
            isAuthenticated: false,
            store: defaultStore,
            isLoaded: false,
            hasInitializedAuth: false,
          })
          // 3. signOut من Supabase
          await supabase.auth.signOut()
          // 4. full reload لصفحة login
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        } catch (error) {
          console.error('[AUTH] signOut error:', error)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pos-store')
            window.location.href = '/login'
          }
        }
      },
    }),
    {
      name: 'pos-store',
      // ✅ مش بنحفظ hasInitializedAuth في localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        store: state.store,
      }),
    }
  )
)