# SYSTEM CLEANUP - Unified Layout (New Task)

## 📋 Plan (from feedback)
1. [x] Clean `app/layout.tsx` (minimal: fonts/metadata/PWA only)
2. [ ] Unify pages w/ `app/customers/page.tsx` template:
   - [ ] app/dashboard/page.tsx
   - [ ] app/products/page.tsx 
   - [x] app/reports/page.tsx (recently done)
   - [ ] app/settings/page.tsx
3. [ ] Remove shared layouts/components imports
4. [ ] Verify sidebar links correct

## Progress
1. [x] Clean app/layout.tsx
2. [x] Fix redirects: app/page.tsx (auth→/dashboard, unauth→/login)
3. [x] login/page.tsx router.push("/dashboard")

