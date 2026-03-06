# 🏗️ Shop Name Feature - Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐           ┌──────────────────────┐   │
│  │  auth.users          │           │  profiles            │   │
│  ├──────────────────────┤           ├──────────────────────┤   │
│  │ id (UUID)      ┐     │           │ id (UUID) ──────────┼───┤── Matches
│  │ email          │     │           │ phone (TEXT)  ┐     │   │
│  │ password       │     │           │ shop_name ✨  │ NEW │   │
│  │ ...            │     │           │ created_at    │     │   │
│  └──────────────────────┘           │ updated_at    │     │   │
│           ▲                          └──────────────────────┘   │
│           │                                                      │
│           └───────────────────────────────────────────────────────┤
│                       (1 User = 1 Profile)                      │
│                                                                   │
│  RLS POLICIES:                                                  │
│  • Users can SELECT their own profile                           │
│  • Users can UPDATE their own profile                           │
│  • Users can INSERT their own profile                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow - From Login to Invoice

```
Step 1: USER LOGS IN
┌──────────────────┐
│ Phone+Password   │  Example: 0501234567 / password123
│ Convert to Email │  → 0501234567@paintmaster.com
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ auth.users table                         │
│ ✅ Email/Password verified               │
│ → Session created & stored in cookies    │
└────────┬─────────────────────────────────┘
         │
         ▼
Step 2: APP LOADS DASHBOARD (app/page.tsx)
┌──────────────────────────────────────────┐
│ useStore hook runs                       │
│ 1. Gets session (user.id from cookies)   │
│ 2. Queries profiles table                │
│ 3. Gets: phone, shop_name                │
│ 4. Sets context: store.name = shop_name  │
└────────┬─────────────────────────────────┘
         │
         ▼
Step 3: COMPONENTS USE STORE DATA
┌┬────────────────────────────────────────┐
│├─ Dashboard Header                      │
││  Shows: {store.name}                   │
││         "دهانات الأمير"                 │
│├─ Invoice Component                     │
││  Shows: {storeName} in 3 places        │
││  ✓ Header Title                        │
││  ✓ Footer Text                         │
││  ✓ Watermark                           │
│└────────────────────────────────────────┘
```

---

## Settings Page Flow

```
USER GOES TO SETTINGS
         │
         ▼
┌──────────────────────────────────────────┐
│ GET: Current profile from profiles table │
│ Display current shop_name in input       │
└────────┬─────────────────────────────────┘
         │
         ▼
USER EDITS SHOP NAME
         │
         ▼
┌──────────────────────────────────────────┐
│ handleSave() function                    │
│                                          │
│ UPSERT profiles table:                   │
│ {                                        │
│   id: userId,                            │
│   phone: userPhone,                      │
│   shop_name: newName     ← UPDATED       │
│ }                                        │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Also UPDATE stores table (backward compat)
│ (for any legacy integrations)            │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Call refreshStore()                      │
│ (updates all components with new data)   │
└────────┬─────────────────────────────────┘
         │
         ▼
USER SEES SUCCESS MESSAGE
Dashboard auto-refreshes with new shop name
```

---

## Component Dependency Graph

```
app/layout.tsx
    │
    ├─ StoreProvider (hooks/use-store.tsx)
    │   │
    │   └─ Queries profiles table
    │       Returns: { store.name, store.phone, ... }
    │
    └─ {children}
        │
        ├─ app/page.tsx (Dashboard)
        │   │
        │   ├─ useStore() → gets store.name
        │   │
        │   ├─ POSHeader
        │   │   └─ Displays: {store.name}
        │   │
        │   └─ ShoppingCart
        │       │
        │       └─ Invoice Component
        │           │
        │           └─ useStore() → gets store.name
        │               Displays in 3 places
        │
        ├─ app/settings/page.tsx
        │   │
        │   └─ useStore() + updateUserProfile()
        │       Saves shop_name to profiles table
        │
        └─ components/Invoice.tsx
            │
            └─ useStore() → gets store.name
                Displays: Header, Footer, Watermark
```

---

## Invoice Display Locations

```
┌─────────────────────────────────────────┐
│         INVOICE LAYOUT                  │
├─────────────────────────────────────────┤
│  ▲                                       │
│  │  Watermark (faded background)         │
│  │  "دهانات الأمير"  [store.name]        │
│  │                                       │
│  ├─────────────────────────────────────┤
│  │  [Logo here]                         │
│  │  اسم المتجر:                          │
│  │  دهانات الأمير    [store.name]  ✨1   │
│  │  الهاتف: 0501234567                  │
│  ├─────────────────────────────────────┤
│  │  فاتورة رقم: ABC12345                │
│  ├─────────────────────────────────────┤
│  │  المنتج  │ الكمية │ السعر │ الإجمالي  │
│  ├─────────────────────────────────────┤
│  │  دهان أحمر │   2  │  50  │   100     │
│  ├─────────────────────────────────────┤
│  │  المجموع: 100 ج.م                   │
│  │  الإجمالي: 100 ج.م                  │
│  ├─────────────────────────────────────┤
│  │  طريقة الدفع: نقدي                   │
│  │  المدفوع: 100 ج.م                   │
│  ├─────────────────────────────────────┤
│  │  شكراً لتعاملكم معنا                  │
│  │  دهانات الأمير  [store.name]  ✨2    │
│  │                                      │
│  │ ════════════════════════════════════  │
│  │ [BARCODE HERE]                       │
│  │ ════════════════════════════════════  │
│  ▼                                       │
└─────────────────────────────────────────┘

✨1 = Header location (store.name)
✨2 = Footer location (store.name)
+ Watermark with store.name (background)
```

---

## Database Query Flow

```
REQUEST: Load Dashboard
    │
    ▼
app/page.tsx useEffect
    │
    ▼
Get session: supabase.auth.getSession()
    │ Returns: { user: { id: "uuid123" } }
    │
    ▼
StoreProvider (useStore hook runs)
    │
    ├─1 Get session again
    │
    ├─2 Query: SELECT phone, shop_name 
    │         FROM profiles 
    │         WHERE id = "uuid123"
    │
    ├─3 Get result:
    │   {
    │     phone: "0501234567",
    │     shop_name: "دهانات الأمير"
    │   }
    │
    ├─4 Set context:
    │   store.name = "دهانات الأمير"
    │   store.phone = "0501234567"
    │
    └─5 Broadcast to all children
        │
        ├─ Dashboard gets store.name
        ├─ Invoice gets store.name
        └─ Components re-render with new data

RESULT: All components display "دهانات الأمير"
```

---

## Settings Save Flow

```
USER CLICKS "حفظ الإعدادات"
    │
    ▼
handleSave() function
    │
    ├─ Validate inputs
    │   ✓ Must be logged in
    │   ✓ Must have shop name
    │
    ├─ Get userId from session
    │
    ├─ PRIMARY: UPSERT profiles table
    │   INSERT/UPDATE profiles SET
    │   - id = userId
    │   - phone = userPhone
    │   - shop_name = newValue  ← WRITTEN
    │
    ├─ SECONDARY: UPDATE stores table
    │   (backward compatibility)
    │
    ├─ Call refreshStore()
    │   ├─ Clears old cache
    │   │
    │   └─ Re-runs useStore hook
    │       └─ Queries profiles again
    │           ✓ Gets NEW shop_name
    │           
    └─ All components update instantly
        │
        ├─ Dashboard title changes
        ├─ Invoice text changes
        └─ No page reload needed
```

---

## State Management

```
GLOBAL STATE (via Context)
    │
    ├─ Created in: hooks/use-store.tsx
    │
    ├─ Provider in: app/layout.tsx (StoreProvider)
    │
    ├─ Accessed via: useStore() hook
    │
    └─ Returns:
       {
         store: {
           name: "دهانات الأمير"         ← shop_name
           phone: "0501234567"          ← phone
           address: ""                  ← other
           logo_url: ""                 ← other
         },
         loading: false,
         refreshStore: async () => {}
       }

Any component using useStore():
├─ Automatically gets updates
├─ No prop drilling needed
└─ Components re-render when store changes
```

---

## Deployment Flow

```
LOCAL DEV
    │
    ├─ Run: pnpm dev
    ├─ Test with local Supabase
    └─ Verify all features work
        │
        ▼
PUSH TO GIT
    │
    ├─ git add . 
    ├─ git commit
    └─ git push
        │
        ▼
VERCEL AUTO-DEPLOY
    │
    ├─ Builds Next.js app
    ├─ Connects to Supabase (via env vars)
    ├─ Deploys to edge network
    └─ App ready!
        │
        ▼
TEST ON VERCEL
    │
    ├─ Login with credentials
    ├─ Check dashboard (show shop name)
    ├─ Check invoice (show shop name)
    └─ All works! ✅
```

---

## Security Model

```
AUTHENTICATION
└─ Email + Password in auth.users table
   └─ Generates Session JWT in cookies

RLS POLICIES (Row Level Security)
└─ profiles table
   ├─ SELECT: auth.uid() = id
   │  └─ User can only see their row
   ├─ UPDATE: auth.uid() = id
   │  └─ User can only update their row
   └─ INSERT: auth.uid() = id
      └─ User can only insert their row

RESULT
└─ Each user only sees/edits their own profile
└─ No SQL injection possible
└─ No cross-user data leaks
```

---

## Error Handling Flow

```
TRY TO FETCH PROFILE
    │
    ├─ Success ✅
    │   └─ Use shop_name from profile
    │       └─ Display on dashboard
    │
    └─ Error/Not found ⚠️
        └─ Fallback to defaults
            ├─ store.name = ""
            ├─ store.phone = ""
            └─ Display "متجر الدهانات"
                └─ App doesn't crash!

SAVE PROFILE
    │
    ├─ Success ✅
    │   └─ Show: "تم حفظ الإعدادات بنجاح"
    │   └─ Refresh all components
    │
    └─ Error ⚠️
        └─ Show: "خطأ في حفظ الإعدادات"
        └─ Display error message
        └─ Allow user to retry
```

---

## Quick Reference: Key Files

```
supabase_profiles_schema.sql
└─ SQL to create profiles table

lib/profile.ts
├─ fetchUserProfile(userId)
├─ updateUserProfile(userId, phone, shopName)
└─ getShopNameByPhone(phone)

hooks/use-store.tsx
└─ Queries profiles table
   └─ Returns store context

app/settings/page.tsx
└─ Saves shop_name to profiles
   └─ Calls refreshStore()

components/Invoice.tsx
└─ Already set up
   └─ Uses {store.name} from context
```

---

## Performance Notes

✅ **Efficient**: Only fetches profile once on app load
✅ **Cached**: useStore context caches data
✅ **Fast**: Single database query
✅ **Optimized**: No N+1 queries
✅ **Real-time**: Uses context for instant updates

---

**This architecture is production-ready and secure!** ✨

