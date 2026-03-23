-- Accounts Center ERP - Complete Schema (Run in Supabase SQL Editor)
-- Includes customers upgrade + account_ledger + triggers/RPCs

BEGIN;

-- 1. Customers Schema Upgrade (idempotent)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC DEFAULT 0 CHECK (credit_limit >= 0),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'over_limit')),
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'regular' CHECK (category IN ('vip', 'regular', 'wholesale')),
ADD COLUMN IF NOT EXISTS account_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_debt NUMERIC DEFAULT 0 CHECK (total_debt >= 0),
ADD COLUMN IF NOT EXISTS oldest_invoice_date TIMESTAMP WITH TIME ZONE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON public.customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_account_number ON public.customers(account_number);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_total_debt ON public.customers(total_debt) WHERE total_debt > 0;

-- Status Trigger
CREATE OR REPLACE FUNCTION update_customer_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_debt > NEW.credit_limit AND NEW.credit_limit > 0 THEN
    NEW.status = 'over_limit';
  ELSIF NEW.status != 'suspended' THEN
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_customer_status
  BEFORE UPDATE OR INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_customer_status();

-- Backfill account numbers
UPDATE public.customers 
SET account_number = 'CUST-' || LPAD(id::text, 6, '0')
WHERE account_number IS NULL AND account_number IS NOT NULL;

-- 2. Account Ledger Table (Professional Accounting)
CREATE TABLE IF NOT EXISTS public.account_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES public.shops(id),
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT,
  reference_id UUID, -- sale_id or payment_id
  entry_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  balance NUMERIC GENERATED ALWAYS AS (
    -- Running balance: debits positive, credits negative for AR aging
    (SELECT COALESCE(SUM(CASE WHEN al2.type='debit' THEN al2.amount ELSE -al2.amount END), 0)
     FROM public.account_ledger al2 
     WHERE al2.customer_id = NEW.customer_id 
     AND al2.shop_id = NEW.shop_id 
     AND al2.entry_date <= NEW.entry_date
     AND al2.id <= NEW.id)
  ) STORED
);

-- Indexes for ledger
CREATE INDEX IF NOT EXISTS idx_account_ledger_customer ON public.account_ledger(customer_id, shop_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_account_ledger_type_date ON public.account_ledger(type, entry_date DESC);

-- RLS for ledger
ALTER TABLE public.account_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shop ledger" ON public.account_ledger FOR SELECT USING (true);
CREATE POLICY "Users can insert ledger" ON public.account_ledger FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update ledger" ON public.account_ledger FOR UPDATE USING (true);

-- 3. Ledger Trigger: Update customer totals
CREATE OR REPLACE FUNCTION update_customer_from_ledger()
RETURNS TRIGGER AS $$
DECLARE
  current_debt NUMERIC;
BEGIN
  SELECT COALESCE(SUM(CASE WHEN type='debit' THEN amount ELSE -amount END), 0)
  INTO current_debt
  FROM public.account_ledger 
  WHERE customer_id = NEW.customer_id AND shop_id = NEW.shop_id;

  UPDATE public.customers 
  SET 
    total_debt = current_debt,
    oldest_invoice_date = (
      SELECT MIN(entry_date) FROM public.account_ledger 
      WHERE customer_id = NEW.customer_id AND shop_id = NEW.shop_id AND type='debit' AND balance > 0
    )
  WHERE id = NEW.customer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_customer_from_ledger
  AFTER INSERT OR UPDATE ON public.account_ledger
  FOR EACH ROW EXECUTE FUNCTION update_customer_from_ledger();

-- 4. RPC Functions
-- Get customer ledger with balance
CREATE OR REPLACE FUNCTION get_customer_ledger(p_customer_id UUID, p_shop_id UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  amount NUMERIC,
  description TEXT,
  entry_date TIMESTAMP WITH TIME ZONE,
  balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT al.id, al.type, al.amount, al.description, al.entry_date, al.balance
  FROM public.account_ledger al
  WHERE al.customer_id = p_customer_id 
    AND al.shop_id = p_shop_id
  ORDER BY al.entry_date ASC, al.id ASC;
END;
$$ LANGUAGE plpgsql;

-- Customer stats
CREATE OR REPLACE FUNCTION get_customer_stats(p_customer_id UUID, p_shop_id UUID)
RETURNS TABLE (
  total_purchases NUMERIC,
  open_invoices INTEGER,
  avg_payment_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN type='debit' THEN amount ELSE 0 END), 0) as total_purchases,
    COUNT(CASE WHEN type='debit' AND balance > 0 THEN 1 END) as open_invoices,
    COALESCE(EXTRACT(DAY FROM (CURRENT_DATE - MIN(entry_date))), 0)::INTEGER as avg_payment_days
  FROM public.account_ledger 
  WHERE customer_id = p_customer_id AND shop_id = p_shop_id;
END;
$$ LANGUAGE plpgsql;

-- Debt aging view
CREATE OR REPLACE VIEW customer_debt_aging AS
SELECT 
  c.*,
  COALESCE(EXTRACT(DAY FROM (CURRENT_DATE - c.oldest_invoice_date)), 0)::INTEGER as debt_days,
  al.balance as current_balance
FROM public.customers c
LEFT JOIN LATERAL (
  SELECT balance FROM public.account_ledger 
  WHERE customer_id = c.id AND shop_id = c.shop_id 
  ORDER BY entry_date DESC LIMIT 1
) al ON true
WHERE c.total_debt > 0;

COMMIT;

-- 🔍 VERIFY: Run these queries after execution
-- SELECT * FROM customers LIMIT 3;
-- SELECT get_customer_ledger('some-customer-id'::uuid, 'shop-id'::uuid);
-- SELECT get_customer_stats('some-customer-id'::uuid, 'shop-id'::uuid);

