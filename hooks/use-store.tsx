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
        const s = set
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          
          if (!currentUser || !currentUser.id) {
            s({ loading: false, isLoaded: true })
            return
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('shop_id, full_name')
            .eq('id', currentUser.id)
            .single()

          if (!profile?.shop_id) {
            s({ loading: false, isLoaded: true })
            return
          }

          const { data: shopData } = await supabase
            .from('shops')
            .select('*')
            .eq('id', profile.shop_id)
            .single()

          s({
            store: {
              id: shopData?.id || '',
              shopId: shopData?.id || null,
              name: shopData?.name || '',
              phone: shopData?.phone || '',
              address: shopData?.location || '',
              logo_url: shopData?.logo_url || '',
            },
            loading: false,
            isLoaded: true
          })
        } catch (error) {
          console.error('[STORE]', error)
          s({ loading: false, isLoaded: true })
        }
      },

      initAuth: async () => {
        const s = set
        const g = get
        const state = g()
        
        if (state.hasInitializedAuth) {
          console.log('⏭️ [AUTH] Already initialized, skipping')
          return;
        }
        
        s({ hasInitializedAuth: true, isAuthLoading: true })
        console.log("🚀 [AUTH] Starting hydration - getSession()...")

        // Primary: getSession()
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📋 [AUTH] getSession result:', session ? `user ${session.user.email}` : 'no session')
        
        let user = session?.user || null
        
        // Fallback: getUser() if no session (cookies refreshed)
        if (!user) {
          console.log('🔄 [AUTH] No session, trying getUser()...')
          const { data: { user: fallbackUser } } = await supabase.auth.getUser()
          user = fallbackUser || null
          console.log('📋 [AUTH] getUser fallback:', user ? `found ${user.email}` : 'no user')
        }

        if (user) {
          console.log(`✅ [AUTH] User hydrated: ${user.email}`)
          s({ 
            user, 
            isAuthenticated: true, 
            isAuthLoading: false 
          })
          g().fetchStore()
        } else {
          console.log('🚫 [AUTH] No user found')
          s({ 
            user: null, 
            isAuthenticated: false, 
            isAuthLoading: false 
          })
        }

        supabase.auth.onAuthStateChange((event, newSession) => {
          console.log(`🔐 [AUTH EVENT] ${event}`, newSession?.user?.email || 'no user');
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const currentUser = g().user;
            if (newSession?.user?.id !== currentUser?.id) {
              console.log(`🔄 [AUTH EVENT] Updating user: ${newSession?.user?.email}`)
              s({ 
                user: newSession?.user, 
                isAuthenticated: true, 
                isAuthLoading: false 
              })
              g().fetchStore()
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 [AUTH] Signed out')
            s({ 
              user: null, 
              isAuthenticated: false, 
              isAuthLoading: false,
              store: defaultStore
            })
          }
        })
      },

      refreshStore: () => get().fetchStore(),
      
      signOut: async () => {
        await supabase.auth.signOut()
      }
    }),
    {
      name: 'pos-store'
    }
  )
)

