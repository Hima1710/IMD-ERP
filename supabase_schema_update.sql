-- ============================================================
-- Update profiles table to add missing columns
-- ============================================================

-- Add role column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'cashier';

-- Add full_name column  
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add shop_id column (FK to shops table)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);

-- ============================================================
-- Create shops table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shops
CREATE POLICY "Anyone can view shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Anyone can insert shops" ON public.shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update shops" ON public.shops FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete shops" ON public.shops FOR DELETE USING (true);

-- ============================================================
-- Update products table column names
-- ============================================================
-- Rename stock_quantity to stock if needed
ALTER TABLE public.products RENAME COLUMN stock_quantity TO stock;

-- Rename min_stock_level to min_quantity if needed
ALTER TABLE public.products RENAME COLUMN min_stock_level TO min_quantity;

-- ============================================================
-- Create sales table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id),
  cashier_id UUID REFERENCES public.profiles(id),
  customer_id UUID,
  total_amount NUMERIC DEFAULT 0,
  final_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  amount_paid NUMERIC DEFAULT 0,
  change_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC DEFAULT 0,
  items JSONB DEFAULT '[]',
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales
CREATE POLICY "Users can view their shop sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Users can insert sales" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sales" ON public.sales FOR UPDATE USING (true);
CREATE POLICY "Users can delete sales" ON public.sales FOR DELETE USING (true);

-- ============================================================
-- Create customers table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  total_purchases NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers
CREATE POLICY "Users can view their shop customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Users can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Users can delete customers" ON public.customers FOR DELETE USING (true);

