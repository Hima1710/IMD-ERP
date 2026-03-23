-- ERP Accounts Center - Customers Schema Upgrade
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Add new columns to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC DEFAULT 0 CHECK (credit_limit >= 0),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'over_limit')),
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'regular' CHECK (category IN ('vip', 'regular', 'wholesale')),
ADD COLUMN IF NOT EXISTS account_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_debt NUMERIC DEFAULT 0 CHECK (total_debt >= 0),
ADD COLUMN IF NOT EXISTS oldest_invoice_date TIMESTAMP WITH TIME ZONE;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON public.customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_account_number ON public.customers(account_number);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_total_debt ON public.customers(total_debt) WHERE total_debt > 0;

-- 3. Create trigger for auto-updating status based on credit limit
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

CREATE TRIGGER trigger_update_customer_status
  BEFORE UPDATE OR INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_customer_status();

-- 4. Backfill account numbers for existing customers (format: CUST-000001)
UPDATE public.customers 
SET account_number = 'CUST-' || LPAD(id::text, 6, '0')
WHERE account_number IS NULL;

-- 5. Create view for debt aging calculation
CREATE OR REPLACE VIEW customer_debt_aging AS
SELECT 
  c.*,
  COALESCE(
    EXTRACT(DAY FROM (CURRENT_DATE - c.oldest_invoice_date)),
    0
  ) as debt_days
FROM public.customers c
WHERE c.total_debt > 0;

COMMIT;
