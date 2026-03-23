# REACT HOOKS FIX - useStore() TOP-LEVEL REFACTOR
Status: 🔄 In Progress | Target: Fix "Rendered more hooks" error by moving ALL useStore() to component TOP

## 📋 CHECKLIST (6 Files)

### Phase 1: Core Pages + Components ✅ COMPLETE
- [x] TODO-REACT-HOOKS-FIX.md created ✅
- [x] app/dashboard/page.tsx - Extract signOut to top ✅
- [x] components/sidebar.tsx - Top-level useStore() + signOut ✅
- [x] components/MobileNav.tsx - Top-level useStore() + signOut ✅

### Phase 2: POS + Reports ✅ COMPLETE
- [x] app/products/page.tsx - Replace inline useStore().signOut() ✅
- [x] app/reports/page.tsx - Replace inline useStore().signOut() ✅

### Phase 3: Settings ✅ COMPLETE
- [x] app/settings/page.tsx - Consolidate useStore() ✅

### Final Verification ✅ READY
- [ ] 🧪 Test: `npm run dev` → No hook errors
- [ ] 🧪 Verify logout works in all navs
- [x] 📦 All 6 files fixed ✅

**ALL EDITS COMPLETE! Ready for testing and attempt_completion.**

### Phase 2: POS + Reports
- [ ] app/products/page.tsx - Replace inline useStore().signOut()
- [ ] app/reports/page.tsx - Replace inline useStore().signOut()

### Phase 3: Settings + Verification
- [ ] app/settings/page.tsx - Consolidate useStore()
- [ ] 🧪 Test: `npm run dev` → No hook errors
- [ ] 🧪 Verify logout works in all navs
- [ ] 📦 Update this TODO with completion date

## RULES APPLIED
✅ useStore() = **FIRST LINE** in component (before useState/early returns)  
✅ Destructure `{ ..., signOut }` at top  
✅ `logout = () => signOut()` consistency  
✅ Remove unused supabase imports  
✅ Preserve ALL other logic/imports/UI

## PROGRESS TRACKER
Updated after each file: Current phase complete → Next phase

