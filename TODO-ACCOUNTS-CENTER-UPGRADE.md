# Accounts Center ERP Upgrade - TODO Checklist

## ✅ Phase 1: Database Setup (Blocking)
- [x] **Execute SQL**: `supabase-accounts-center.sql` created ✓ **USER: Copy-paste entire content into Supabase → Run → Verify tables/columns/RPCs.**
- [ ] **Verify Schema**: Query `customers LIMIT 1` → see new columns; `SELECT * FROM account_ledger LIMIT 5;`.
- [ ] **Test Trigger**: Create customer credit_limit=1000, insert debit>1000 → status='over_limit'.

**Next: User run SQL, reply "DB done", then Phase 2**

## ✅ Phase 2: Type Updates
- [x] **Update lib/types.ts**: Extended Customer + AccountLedgerEntry, CustomerStats types ✓

## ✅ Phase 3: UI Implementation
- [x] **app/customers/page.tsx**: Enhanced table + full ERP modal (ledger, stats, pay, print) ✓
- [x] **Update shopping-cart.tsx**: ERP ledger integration on sales ✓

**Next: shopping-cart update + User run DB SQL (`supabase-accounts-center.sql`)**

## 🧪 Phase 4: Testing
- [ ] **Credit Check**: Progress bar shows debt vs limit, auto-status.
- [ ] **Ledger**: Click customer → shows invoices(debit)/payments(credit), running balance.
- [ ] **Stats**: Total purchases, open invoices count, avg days.
- [ ] **Print**: Clean Arabic statement prints.
- [ ] **Mobile**: Responsive drawer works.

## 🚀 Phase 5: Production
- [ ] Build: `npm run build`
- [ ] Deploy/Refresh.

**Current Progress: Starting Phase 1**

