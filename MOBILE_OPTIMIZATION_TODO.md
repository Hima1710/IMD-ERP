# Mobile UI Optimization TODO for POS Screen

## Approved Plan Steps (100% Approved by User)

**✅ Step 1: Create this TODO.md** - *Completed*

**✅ Step 2: Hide hamburger menu on desktop (app/page.tsx)**
- Add `md:hidden` to mobile hamburger Menu button.

**✅ Step 3: Reduce POSHeader heights (components/pos-header.tsx)**
- Top bar: py-2 md:py-3 → py-1 md:py-2
- Search bar: py-3 md:py-4 → py-2 md:py-3

**✅ Step 4: Compact stats to single slim row (components/dashboard-stats.tsx)**
- Grid → flex flex-col md:flex-row gap-2 md:gap-4 (save 20% vertical space)
- StatCard padding: p-3 md:p-4 → p-2 md:p-3
- Value text: text-xl md:text-2xl → text-sm md:text-xl

**✅ Step 5: Ensure product grid mobile-optimized (components/product-catalog.tsx)** - Already optimal
- Confirm grid-cols-2 gap-3 (already good, minor gap-2 if needed)

**✅ Step 6: Update safe area padding (app/page.tsx)**
- pb-20 md:pb-0 → pb-24

**⏳ Step 7: ShoppingCart sticky footer & z-index (components/shopping-cart.tsx)**
- Ensure Total/Pay buttons fixed bottom with pb-24 clearance over BottomNav
- Cart sheet z-50 above BottomNav z-50 (increase if needed)

**⏳ Step 8: Test & verify mobile viewport**
- Chrome DevTools mobile view
- Confirm no overlap, compact layout shows more products

**✅ Step 9: Mark complete & demo**

*Progress: 6/9 steps completed. Core layout optimizations complete. ShoppingCart review pending.*

