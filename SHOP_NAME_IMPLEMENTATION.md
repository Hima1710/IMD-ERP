# 🏪 Shop Name Implementation - Complete Summary

## What Was Implemented

You now have a complete system to display shop names instead of phone numbers on your Dashboard and Invoices.

---

## 📋 Files Created/Modified

### ✅ Created Files:

1. **`supabase_profiles_schema.sql`** - Database schema for profiles table
   - Creates `profiles` table with `id`, `phone`, `shop_name`
   - Includes RLS policies for security
   - Auto-update trigger for `updated_at`

2. **`lib/profile.ts`** - Utility functions for profile operations
   - `fetchUserProfile(userId)` - Get user's profile
   - `updateUserProfile(userId, phone, shopName)` - Create/update profile
   - `getShopNameByPhone(phone)` - Lookup shop by phone

3. **`SHOP_NAME_SETUP_GUIDE.md`** - Comprehensive setup documentation

### ✅ Modified Files:

1. **`hooks/use-store.tsx`** - Updated to fetch from profiles table
   - Now reads `shop_name` from profiles table
   - Falls back to defaults if profile not found
   - Includes retry logic for session handling

2. **`app/settings/page.tsx`** - Updated to save to profiles table
   - Now saves `shop_name` to profiles table
   - Maintains backward compatibility with stores table
   - Includes success/error messaging

---

## 🔄 How It Works (Data Flow)

```
User Login (email: "0501234567@paintmaster.com")
    ↓
Settings Page: User enters shop name "دهانات الأمير"
    ↓
Saves to profiles table (id, phone, shop_name)
    ↓
useStore Hook: Fetches from profiles table
    ↓
Provides shop name to all components via context
    ↓
Dashboard & Invoice: Display shop name
```

---

## 🚀 Quick Start (4 Steps)

### Step 1: Create Database Schema
```sql
-- Run this SQL in Supabase SQL Editor
-- Copy entire content from: supabase_profiles_schema.sql
```

### Step 2: Add Profile for Your User
```sql
-- Find your user UUID in Supabase Auth
-- Then insert:
INSERT INTO public.profiles (id, phone, shop_name) 
VALUES (
  'your-user-uuid-here',
  '0501234567',
  'دهانات الأمير'
)
ON CONFLICT (id) DO UPDATE SET
  shop_name = 'دهانات الأمير';
```

### Step 3: Test in Settings Page
- Go to: `http://localhost:3000/settings`
- Update "اسم المتجر"
- Click "حفظ الإعدادات"
- Should see success message

### Step 4: Verify
- Dashboard: Should show shop name in header
- Invoice Print: Should show shop name at top and footer

---

## 📊 Database Schema

```sql
profiles table:
├── id (UUID) 
│   └── References auth.users(id)
│   └── Primary key
├── phone (TEXT)
│   └── Unique constraint
│   └── Stores phone number
├── shop_name (TEXT)
│   └── The shop name to display ✨
├── created_at (TIMESTAMP)
│   └── Auto-set on creation
└── updated_at (TIMESTAMP)
    └── Auto-updated on changes
```

---

## 🔐 Security Features

✅ **Row Level Security (RLS)** enabled
- Users can only see/edit their own profile
- Policy 1: SELECT - users can view their profile
- Policy 2: UPDATE - users can update their profile  
- Policy 3: INSERT - users can create their profile

✅ **Phone Unique Constraint**
- One profile per phone number

✅ **Automatic Timestamps**
- `updated_at` auto-updates on row changes

---

## 💡 Implementation Details

### How useStore Hook Works:

```typescript
// Before (stores table):
const storeData = await supabase
  .from('stores')
  .select('*')
  .eq('user_id', user.id)

// After (profiles table):
const profileData = await supabase
  .from('profiles')
  .select('phone, shop_name')
  .eq('id', user.id)
  .single()

setStore({
  name: profileData.shop_name || '',
  // ... other fields
})
```

### How Settings Page Works:

```typescript
// Saves to profiles table:
await supabase
  .from('profiles')
  .upsert({
    id: userId,
    phone: store.phone,
    shop_name: store.name,  // ← Shop Name
  })
```

### How Invoice Shows It:

```typescript
// Invoice.tsx uses:
const { store: globalStore } = useStore()
const storeName = globalStore.name

// Displays in 3 places:
1. Header title: <h1>{storeName}</h1>
2. Watermark: <span>{storeName}</span>
3. Footer: <p>{storeName}</p>
```

---

## ✅ Testing Checklist

- [ ] **Database**: Profiles table created in Supabase
- [ ] **Profile**: Created profile for your user account
- [ ] **Settings**: Opened settings page, updated shop name
- [ ] **Save**: Clicked save, got success message
- [ ] **Dashboard**: Reloaded dashboard, see shop name displayed
- [ ] **Invoice**: Added items to cart, printed invoice
- [ ] **Invoice Content**: Verified shop name shows on invoice
- [ ] **Multiple Users**: Test with different user accounts (if applicable)

---

## 🔍 Debugging Tips

### Issue: Shop name not showing on dashboard

**Diagnosis:**
```sql
-- Check if profile exists
SELECT * FROM profiles WHERE id = 'your-user-id';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Solution:**
- Ensure profile row exists for your user ID
- Refresh page (F5)
- Check browser DevTools console for errors

### Issue: Settings page shows default values

**Diagnosis:**
```sql
-- Check if session is valid
-- Check if user_id is being captured correctly

-- In browser console:
console.log(userId) // Should show UUID, not null
```

**Solution:**
- Ensure you are logged in
- Clear browser cache
- Try incognito/private window

### Issue: Invoice shows old shop name

**Solution:**
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Close and reopen invoice

---

## 📱 Phone Number Format

Users login with format: `{phone}@paintmaster.com`

Example:
```
Phone: 0501234567
Email: 0501234567@paintmaster.com
Profile phone: 0501234567
Profile shop_name: دهانات الأمير
```

---

## 🔄 Backward Compatibility

The settings page saves to BOTH tables:
- ✅ **profiles table** (new) - for shop name
- ✅ **stores table** (old) - for other fields

This ensures:
- New app uses profiles table ✨
- Old integrations still work
- Smooth transition

---

## 📞 Support Utilities

### Get user profile for any user:
```typescript
import { fetchUserProfile } from '@/lib/profile'

const profile = await fetchUserProfile(userId)
console.log(profile.shop_name)
```

### Update profile from anywhere:
```typescript
import { updateUserProfile } from '@/lib/profile'

await updateUserProfile(userId, phone, shopName)
```

### Lookup shop by phone:
```typescript
import { getShopNameByPhone } from '@/lib/profile'

const shopName = await getShopNameByPhone('0501234567')
```

---

## 🎯 What Displays Where

| Component | Shows | Example |
|-----------|-------|---------|
| Dashboard Header | Shop Name | "دهانات الأمير" |
| Invoice Header | Shop Name | "دهانات الأمير" |
| Invoice Footer | Shop Name | "دهانات الأمير" |
| Invoice Watermark | Shop Name | "دهانات الأمير" (faded) |
| Settings Page | Shop Name Input | Text field with current name |

---

## 🚀 Next Steps (Optional)

1. **Add Logo Upload**: Enhance settings page with image upload
2. **Add Address Field**: Store and display on invoices
3. **Multi-Shop Support**: Allow users to manage multiple shops
4. **Shop Switching**: Add dropdown to switch between shops
5. **Export Profiles**: Bulk import/export profiles for multiple users

---

## 📝 Code Examples

### Example 1: Fetch and Display Shop Name

```typescript
import { fetchUserProfile } from '@/lib/profile'

async function getShopInfo(userId: string) {
  const profile = await fetchUserProfile(userId)
  if (profile) {
    console.log(`Shop: ${profile.shop_name}`)
    console.log(`Phone: ${profile.phone}`)
  }
}
```

### Example 2: Update Shop Name from Anywhere

```typescript
import { updateUserProfile } from '@/lib/profile'

async function renameShop(userId: string, newName: string) {
  const updated = await updateUserProfile(
    userId,
    '0501234567',
    newName
  )
  
  if (updated) {
    alert('✅ متجرك تم تحديثه بنجاح!')
  } else {
    alert('❌ حدث خطأ')
  }
}
```

### Example 3: Use in Component

```typescript
import { useStore } from '@/hooks/use-store'

export function Header() {
  const { store } = useStore()
  
  return <h1>{store.name || 'متجر الدهانات'}</h1>
}
```

---

## ✨ Features Included

✅ Shop name displayed on dashboard
✅ Shop name on all invoices (header, footer, watermark)
✅ Settings page to manage shop name
✅ Automatic fallback to defaults
✅ RLS security policies
✅ Phone number unique constraint
✅ Auto-updating timestamps
✅ Backward compatibility
✅ Comprehensive error handling
✅ Detailed logging for debugging

---

## 📞 Summary of Changes

| Area | Change | Impact |
|------|--------|--------|
| Database | Added `profiles` table | Stores shop data |
| useStore | Fetch from `profiles` | Gets shop name |
| Settings | Save to `profiles` | Updates shop name |
| Invoice | Uses `store.name` | Displays shop name |
| Dashboard | Uses `store.name` | Shows shop name |

---

**Status**: ✅ Ready to Deploy!

Last Updated: March 6, 2026

