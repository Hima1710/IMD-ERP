# Compact UI Overhaul Plan

**Information Gathered:**
- shopping-cart.tsx: Current cart has header/content/footer but not fixed, CartItemRow p-2/3 (not py-1), prices use Number(item.price).
- Invoice.tsx: Bulky table/blue boxes, text-lg/[10px] mixed, wide layout. No global modal height CSS.
- globals.css: No modal height rules.

**Plan:**
1. Update components/shopping-cart.tsx: Fixed header/footer, scrollable list, CartItemRow py-1 flex row.
2. Update components/Invoice.tsx: Narrow thermal (max-w-80), text-[10px]/xs, dashed borders, no blue boxes.
3. Push changes.

**Dependent Files:** shopping-cart.tsx, Invoice.tsx

**Followup:** git commit/push, test POS/invoice.

**Status:** Complete! Files updated:
1. shopping-cart.tsx - Fixed layout, py-1 rows.
2. CompactInvoice.tsx - Thermal style max-w-[320px], text-[10px].
3. Invoice.tsx - Wrapper to CompactInvoice.
Ready to git commit/push.

