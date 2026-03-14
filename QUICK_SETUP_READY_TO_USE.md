# 🚀 QUICK SETUP - Copy & Paste Ready

## Step 1: SQL Setup (Copy & Paste This)

Go to Supabase Dashboard → SQL Editor → New Query

Paste the entire content from this file:

```sql
-- ============================================================
-- Step 1: Create profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  shop_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: View own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- RLS Policy 2: Update own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS Policy 3: Insert own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Auto-update timestamp
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

✅ **Click "Run"**

---

## Step 2: Create Profile for Your User

In the same SQL Editor:

1. First, find your User UUID:
   - Go to **Authentication** tab
   - Click on your user email
   - Copy the **User UID** (looks like: `uuid-string-here`)

2. Paste this, replacing the UUID:

```sql
INSERT INTO public.profiles (id, phone, shop_name) 
VALUES (
  'PASTE_YOUR_USER_UUID_HERE',
  '0501234567',
  'دهانات الأمير'
)
ON CONFLICT (id) DO UPDATE SET
  shop_name = 'دهانات الأمير';
```

✅ **Click "Run"**

**Result**: You should see "Rows affected: 1"

---

## Step 3: Verify Setup

Run this to check:

```sql
SELECT id, phone, shop_name FROM public.profiles LIMIT 1;
```

Should show:
```
id                                    phone       shop_name
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  0501234567  دهانات الأمير
```

---

## Step 4: Test in App

### Local Testing

```bash
pnpm dev
```

Then:
1. Open `http://localhost:3000`
2. Login with your credentials
3. Go to `http://localhost:3000/settings`
4. Should see your shop name in the input field
5. Change it to something else (e.g., "الصيدا للدهانات")
6. Click "حفظ الإعدادات"
7. Should see success message
8. Go back to home page - should show new shop name in header
9. Try to print an invoice - should show new shop name

---

## Step 5: Deploy to Vercel

```bash
git add .
git commit -m "Add shop name feature with profiles table"
git push
```

Then in Vercel Dashboard:
1. Deployments page
2. Latest deployment should auto-deploy
3. Wait for "Ready" status
4. Open your Vercel app link
5. Test the flow again

---

## 📋 What Should Happen

| Action | Result |
|--------|--------|
| Login | Redirected to dashboard |
| Go to settings | See your shop name |
| Change shop name | Can edit and save |
| Go to dashboard | See new shop name |
| Add items to cart | Can add products |
| View invoice | Invoice shows shop name at top |
| Print invoice | Printed invoice shows shop name |

---

## 🔧 File Reference

| File | Purpose | Created |
|------|---------|---------|
| `supabase_profiles_schema.sql` | Full SQL schema (backup) | ✅ Yes |
| `lib/profile.ts` | Helper functions | ✅ Yes |
| `hooks/use-store.tsx` | Fetch shop name | ✅ Updated |
| `app/settings/page.tsx` | Save shop name | ✅ Updated |
| `components/Invoice.tsx` | Display on invoice | ✅ Already works |

---

## ⚠️ Troubleshooting

### Problem: "No table profiles"
**Solution**: Run Step 1 SQL again

### Problem: "User not found error"
**Solution**: Make sure you used the correct user UUID from Authentication tab

### Problem: Shop name doesn't show on dashboard
**Solution**: 
1. Hard refresh (Ctrl+Shift+R)
2. Check Supabase - profile should exist: `SELECT * FROM profiles`

### Problem: Can't edit shop name in settings
**Solution**:
1. Verify you're logged in
2. Check browser console for errors
3. Verify profile row exists in Supabase

---

## 💡 Phone ↔ Email Mapping

Your users login like this:

```
Phone: 0501234567
↓
Email: 0501234567@paintmaster.com
↓
Profile phone field: 0501234567
```

---

## 🎯 Expected After Setup

✅ Dashboard shows "دهانات الأمير" instead of phone
✅ Invoice shows "دهانات الأمير" at top
✅ Invoice shows "دهانات الأمير" at footer
✅ Invoice shows "دهانات الأمير" in watermark
✅ Settings page shows shop name editable

---

## 📞 Code Integration

### Use in any component:

```typescript
import { useStore } from '@/hooks/use-store'

export function MyComponent() {
  const { store } = useStore()
  return <h1>{store.name}</h1>
}
```

### Use utility functions:

```typescript
import { fetchUserProfile, updateUserProfile } from '@/lib/profile'

// Fetch profile
const profile = await fetchUserProfile(userId)

// Update profile
await updateUserProfile(userId, phone, shopName)
```

---

## ✅ Checklist

- [ ] Ran SQL from Step 1 in Supabase
- [ ] Found my User UUID from Auth tab
- [ ] Ran SQL from Step 2 with my UUID
- [ ] Verified profile created (Step 3)
- [ ] Tested locally (Step 4)
- [ ] Deployed to Vercel (Step 5)
- [ ] Verified on Vercel app

---

**You're all set!** 🎉

All code is ready. Just run the SQL and test!

