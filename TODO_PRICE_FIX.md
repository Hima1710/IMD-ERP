# Price Mapping Fix - Dashboard Tab
Status: ✅ COMPLETE

## Changes:
✅ Fixed Dashboard (`app/page.tsx`) product mapping: `price_sell` → `price`, `price_buy`
✅ Removed manifest link from `app/layout.tsx` 
✅ Used `Number(field || 0)` everywhere

Run `run-dev.bat` to test Dashboard prices now match Products tab!

DB Fields Confirmed:
- Selling: `price`
- Cost: `price_buy`
- Always: `Number(field || 0)`

