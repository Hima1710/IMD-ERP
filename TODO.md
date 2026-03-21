# Customers Page Enhancement - Action Buttons & Supplier Inventory Sync

Status: **IN PROGRESS** 🛠️

## Approved Plan Steps
1. **✅ Dependencies**: TODO.md, types.ts, RPC SQL created
2. **⏳ UI Logic**: Modals (Edit, Payment, Statement, Stock Management), Handlers
3. **⏳ Actions**: Wire table buttons, supplier-only stock modal
4. **⏳ Atomic RPC**: Call `handle_supplier_stock_transaction`
5. **⏳ Polish**: Loading, errors, RTL compact design
6. **🔍 Test**: All buttons + refetch summaries/table
7. **✅ Deploy**: Ready for npm run dev

## RPC Spec
`handle_supplier_stock_transaction(supplier_id, product_id, quantity, unit_price, type)`
- Incoming: stock += qty, debt += (qty*price)
- Return: stock -= qty, debt -= (qty*price)
- Logs to account_ledger
- RETURNS {success, error, new_stock, new_debt}

## Completion Criteria
- All 4 buttons functional
- Supplier stock incoming/return atomic
- Modals compact RTL mobile-friendly
- Refetch works instantly

**Progress Update**:
```
✅ Dependencies complete
🔄 Implementing page.tsx - Adding 12+ new states, 4 modals, 10 handlers, RPC integration
Next: Test delete/edit/payment/stock → Complete ✅
```
**RPC Deployed?** Run SQL in Supabase dashboard → Verify rpc_handle_supplier_stock_transaction exists.


