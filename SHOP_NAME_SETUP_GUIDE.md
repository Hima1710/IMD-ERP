# 🏪 Shop Name Implementation Guide

## Overview
This guide walks you through implementing the shop name feature using a `profiles` table in Supabase.

---

## Step 1: Create the Database Schema

### Execute this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  shop_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_update_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();
```

✅ **File**: `supabase_profiles_schema.sql` (already created)

---

## Step 2: Add Profile Helper Functions

### New file: `lib/profile.ts`

This file contains utility functions:
- `fetchUserProfile(userId)` - Get user's shop details
- `updateUserProfile(userId, phone, shopName)` - Create/update profile
- `getShopNameByPhone(phone)` - Lookup shop by phone

✅ **File**: `lib/profile.ts` (already created)

---

## Step 3: Update the useStore Hook

### Modified file: `hooks/use-store.tsx`

**What changed:**
- Now fetches from `profiles` table instead of `stores` table
- Gets `shop_name` directly for the logged-in user
- Falls back to defaults if profile not found

**Key code:**
```typescript
// Fetch from profiles table to get shop_name
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('phone, shop_name')
  .eq('id', user.id)
  .single()

if (profileData) {
  setStore({
    name: profileData.shop_name || '',
    phone: profileData.phone || '',
    address: '',
    logo_url: '',
  })
}
```

✅ **File**: `hooks/use-store.tsx` (already updated)

---

## Step 4: Invoice Component (Already Working!)

### File: `components/Invoice.tsx`

**Good news:** The Invoice component is already set up correctly!

It uses:
```typescript
const { store: globalStore } = useStore()
const storeName = globalStore.name || 'متجر الدهانات'
```

The component shows `storeName` at:
- ✅ Header/Title
- ✅ Watermark (anti-fraud)
- ✅ Footer

---

## Step 5: How to Create/Update User Profiles

### Option A: From Your Dashboard (Recommended)

Create a settings page to let users set their shop name:

```typescript
// app/settings/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { updateUserProfile } from '@/lib/profile'

export default function SettingsPage() {
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        alert('يرجى تسجيل الدخول أولاً')
        return
      }

      const phone = session.user.email?.split('@')[0] || ''
      const result = await updateUserProfile(
        session.user.id,
        phone,
        shopName
      )

      if (result) {
        alert('✅ تم حفظ بيانات المتجر بنجاح!')
      } else {
        alert('❌ حدث خطأ حاول مجدداً')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">إعدادات المتجر</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">اسم المتجر</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="مثال: دهانات الأمير"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
        </button>
      </div>
    </div>
  )
}
```

### Option B: Directly in Supabase (For Admin)

1. Go to Supabase Dashboard
2. Open "SQL Editor"
3. Run:

```sql
INSERT INTO public.profiles (id, phone, shop_name)
VALUES (
  'user-uuid-from-auth-users',
  '0501234567',
  'دهانات الأمير'
)
ON CONFLICT (id) DO UPDATE SET
  shop_name = 'دهانات الأمير';
```

To find the user UUID:
1. Go to **Authentication** tab
2. Click on a user
3. Copy the `User UID`

---

## Step 6: Testing Checklist

✅ **Test 1: Create Profile**
```bash
1. Login with your account
2. Go to Settings page (if you created it)
3. Enter your shop name: "دهانات الأمير"
4. Click "حفظ البيانات"
```

✅ **Test 2: Dashboard Display**
```bash
1. Go to home page
2. Check header - should show "دهانات الأمير" instead of phone
```

✅ **Test 3: Invoice Print**
```bash
1. Add items to cart
2. Print invoice
3. Should show "دهانات الأمير" at top and footer
```

✅ **Test 4: Fallback**
```bash
1. Login with a user that has NO profile
2. Should see default store name "متجر الدهانات"
3. Should NOT break the app
```

---

## Step 7: Phone Number to Shop Name Mapping

If you want to display shop name based on phone number (useful for multi-shop):

```typescript
import { getShopNameByPhone } from '@/lib/profile'

// Example usage:
const shopName = await getShopNameByPhone('0501234567')
console.log(shopName) // Output: "دهانات الأمير"
```

---

## 📊 Database Schema Reference

```
profiles table:
├── id (UUID) - User ID from auth.users
├── phone (TEXT) - Phone number (unique)
├── shop_name (TEXT) - Shop name to display
├── created_at (TIMESTAMP) - Created date
└── updated_at (TIMESTAMP) - Updated date
```

---

## 🔍 Debug Tips

### Check if profile exists:
```sql
SELECT * FROM public.profiles WHERE id = 'user-uuid';
```

### Check RLS policies:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

### See all users:
```sql
SELECT id, email FROM auth.users;
```

---

## ✅ What's Already Done

| Component | Status | File |
|-----------|--------|------|
| SQL Schema | ✅ Created | `supabase_profiles_schema.sql` |
| Profile Utils | ✅ Created | `lib/profile.ts` |
| useStore Hook | ✅ Updated | `hooks/use-store.tsx` |
| Invoice Component | ✅ Working | `components/Invoice.tsx` |

---

## 🚀 Next Steps

1. **Run SQL schema** in Supabase SQL Editor
2. **Create profiles** for your users (Option B in Step 5)
3. **Test** the implementation (Step 6)
4. **(Optional) Create Settings page** to let users manage their shop name

---

**Status**: Ready to deploy! ✅

