-- Supabase RPC: Atomic Supplier Stock + Debt + Ledger
-- All-or-nothing transaction for inventory sync

-- Create account_ledger table if missing (from schema)
CREATE TABLE IF NOT EXISTS public.account_ledger (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_type text CHECK (account_type IN ('customer', 'supplier')) NOT NULL,
  shop_id text NOT NULL,
  transaction_type text NOT NULL,
  amount numeric(12,2) NOT NULL,
  description text NOT NULL,
  balance_after numeric(12,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.account_ledger ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_account_ledger_account ON account_ledger(account_id, account_type);
CREATE INDEX IF NOT EXISTS idx_account_ledger_shop ON account_ledger(shop_id);

-- RPC Function: handle_supplier_stock_transaction
CREATE OR REPLACE FUNCTION handle_supplier_stock_transaction(
  p_supplier_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_unit_price numeric(10,2),
  p_transaction_type text
)
RETURNS json AS $$
DECLARE
  v_current_stock numeric;
  v_current_debt numeric;
  v_amount numeric;
  v_new_stock numeric;
  v_new_debt numeric;
  v_sign integer;
  v_description text;
  v_ledger_id uuid;
BEGIN
  -- Validate inputs
  IF p_quantity <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Quantity must be positive'
    );
  END IF;
  
  IF p_transaction_type NOT IN ('incoming', 'return') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid transaction type'
    );
  END IF;

  -- Get current values
  SELECT stock INTO v_current_stock
  FROM products WHERE id = p_product_id AND shop_id = (SELECT shop_id FROM suppliers WHERE id = p_supplier_id);
  
  SELECT total_debt INTO v_current_debt
  FROM suppliers WHERE id = p_supplier_id;
  
  IF v_current_stock IS NULL OR v_current_debt IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Supplier or Product not found'
    );
  END IF;

  -- Calculate
  v_amount := p_quantity * p_unit_price;
  v_sign := CASE p_transaction_type WHEN 'incoming' THEN 1 ELSE -1 END;
  v_new_stock := v_current_stock + (v_sign * p_quantity);
  v_new_debt := v_current_debt + (v_sign * v_amount);
  
  IF v_new_stock < 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Stock cannot go negative'
    );
  END IF;

  -- Atomic Transaction Block
  BEGIN
    -- Update Product Stock
    UPDATE products 
    SET stock = v_new_stock, updated_at = now()
    WHERE id = p_product_id;
    
    -- Update Supplier Debt
    UPDATE suppliers 
    SET total_debt = v_new_debt, updated_at = now()
    WHERE id = p_supplier_id;
    
    -- Insert Ledger Entry
    INSERT INTO account_ledger (
      account_id, account_type, shop_id, transaction_type, amount, 
      description, balance_after, created_at, updated_at
    )
    VALUES (
      p_supplier_id, 'supplier', 
      (SELECT shop_id FROM suppliers WHERE id = p_supplier_id),
      p_transaction_type, v_amount, 
      CASE p_transaction_type 
        WHEN 'incoming' THEN 'وارد بضاعة: ' || p_quantity::text || ' وحدة × ' || p_unit_price || ' ج.م'
        ELSE 'مرتجع بضاعة: ' || p_quantity::text || ' وحدة × ' || p_unit_price || ' ج.م'
      END,
      v_new_debt, now(), now()
    )
    RETURNING id INTO v_ledger_id;
    
    RETURN json_build_object(
      'success', true,
      'new_stock', v_new_stock,
      'new_debt', v_new_debt,
      'ledger_id', v_ledger_id
    );
    
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Transaction failed: ' || SQLERRM
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Call Helper
CREATE OR REPLACE FUNCTION rpc_handle_supplier_stock_transaction(
  p_supplier_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_unit_price numeric(10,2),
  p_transaction_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', '', false);
  RETURN handle_supplier_stock_transaction(p_supplier_id, p_product_id, p_quantity, p_unit_price, p_transaction_type);
END;
$$;

COMMENT ON FUNCTION rpc_handle_supplier_stock_transaction IS 'Atomic supplier stock/debt sync with ledger';

-- Run: psql -d postgres://... -f supabase-suppliers-stock.sql

