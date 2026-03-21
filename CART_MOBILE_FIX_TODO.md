# Mobile Cart Pay Button Fix
Status: 🔄 In Progress

## Issues:
- Pay button hidden behind BottomNav on mobile
- Cramped layout, needs fixed footer

## Plan:
1. **app/page.tsx**: Mobile sheet `h-[90vh] flex flex-col z-50 pt-safe pb-20`
2. **shopping-cart.tsx**: Already `flex-1 overflow-y-auto` + sticky totals (perfect)

3. Test scroll + button visibility

**Reqs:**
- Pay button full-width green/blue
- List scrolls independently
- Higher z-index sheet
