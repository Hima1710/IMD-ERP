# Compact Invoice Modal (Thermal Receipt)
Status: ✅ COMPLETE

## Target: components/Invoice.tsx

**Requirements:**
1. Modal: `max-w-[95vw] max-h-[95vh] p-4`
2. Fonts: `text-xs` items, `text-sm` headers
3. Table: Name | Qty×Price | Total
4. Total: Dashed line `border-t-2 border-dashed`, slim row
5. Logo/Header: Smaller
6. Close X: Top-right corner

**Plan:**
- Restructure table to 3 columns
- Slim total section
- Mobile-first Tailwind

Test: Mobile invoice fits screen, no scroll for total
