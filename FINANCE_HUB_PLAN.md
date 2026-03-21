# Finance Hub Implementation Plan

## Information Gathered

### Current Structure:
1. **Customers Page** (`app/customers/page.tsx`): 450+ lines with customer management and credit tracking
2. **Database Schema**:
   - `transactions` table: customer_id, remaining_amount, items (JSON), sale_date, total_amount
   - `products` table: has price (selling), price_buy (cost), stock
   - `customers` table: exists with shop_id
   - `suppliers` table: id, shop_id, name, phone, address, total_debt
   - `supplier_transactions` table: id, shop_id, supplier_id, type, amount, notes, product_id, quantity
   - `expenses` table: id, shop_id, category, amount, notes, expense_date

3. **Offline Sync**: Already has offline-db.ts and useOfflineSync hook

### Task Requirements:
- Convert Customers page to "Finance Hub" with 3 tabs: العملاء, الموردين, المصروفات
- Add Suppliers Management with supply recording and payment
- Add Expenses Management with simple form
- Add Daily Profit Report: Daily Profit = (Daily Sales Revenue - COGS) - Daily Expenses
- Financial Summary Cards at top: Total Customers Debt, Total Suppliers Debt, Net Profit

## Plan

### Step 1: Update app/customers/page.tsx
- Add Tabs component with 3 sections
- Add Financial Summary Cards at top
- Implement Suppliers tab content
- Implement Expenses tab content
- Add Profit Report logic

### Step 2: Add Types for Suppliers and Expenses
- Add Supplier and Expense interfaces to the page

### Step 3: Add Offline Support for New Tables
- Update lib/offline-db.ts to include suppliers and expenses tables
- Update hooks/use-offline-sync.ts to sync new tables

### Dependent Files to Edit:
1. `app/customers/page.tsx` - Main implementation
2. `lib/offline-db.ts` - Add offline support for suppliers and expenses

### Follow-up Steps:
1. Run the app to test the Finance Hub
2. Verify database has the required tables (run SQL if needed)

---

## Implementation Details

### Profit Calculation Logic:
```
Daily Sales Revenue = SUM(total_amount) from transactions where sale_date = today
COGS = SUM(item.quantity * product.price_buy) from transaction items
Daily Expenses = SUM(amount) from expenses where expense_date = today
Daily Profit = Daily Sales Revenue - COGS - Daily Expenses
```

### Financial Summary:
- **Total Customers Debt**: SUM(remaining_amount > 0) from transactions
- **Total Suppliers Debt**: SUM(total_debt) from suppliers table
- **Net Profit (Today)**: Daily Sales Revenue - COGS - Daily Expenses

