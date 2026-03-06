import { supabase } from './supabase'

/**
 * Fetch shop name and profile data for the current user
 * @param userId - The user ID from auth.users table
 * @returns Promise with shop_name and other profile data
 */
export async function fetchUserProfile(userId: string) {
  try {
    if (!supabase) {
      console.error('❌ Supabase not configured')
      return null
    }

    console.log('📥 [PROFILE] Fetching profile for user:', userId)

    const { data, error } = await supabase
      .from('profiles')
      .select('id, phone, shop_name')
      .eq('id', userId)
      .single()

    if (error) {
      console.warn('⚠️ [PROFILE] Error fetching profile:', error.message)
      return null
    }

    console.log('✅ [PROFILE] Profile fetched:', data)
    return data
  } catch (err) {
    console.error('❌ [PROFILE] Exception:', err)
    return null
  }
}

/**
 * Create or update user profile
 * @param userId - The user ID
 * @param phone - Phone number
 * @param shopName - Shop name
 */
export async function updateUserProfile(
  userId: string,
  phone: string,
  shopName: string
) {
  try {
    if (!supabase) {
      console.error('❌ Supabase not configured')
      return null
    }

    console.log('📝 [PROFILE] Updating profile for user:', userId)

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          phone,
          shop_name: shopName,
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (error) {
      console.error('❌ [PROFILE] Error updating profile:', error.message)
      return null
    }

    console.log('✅ [PROFILE] Profile updated:', data)
    return data
  } catch (err) {
    console.error('❌ [PROFILE] Exception:', err)
    return null
  }
}

/**
 * Get shop name by phone number (useful for POS lookups)
 * @param phone - Phone number to lookup
 */
export async function getShopNameByPhone(phone: string) {
  try {
    if (!supabase) {
      console.error('❌ Supabase not configured')
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('shop_name')
      .eq('phone', phone)
      .single()

    if (error) {
      console.warn('⚠️ [PROFILE] Shop not found for phone:', phone)
      return null
    }

    return data?.shop_name || null
  } catch (err) {
    console.error('❌ [PROFILE] Exception:', err)
    return null
  }
}
