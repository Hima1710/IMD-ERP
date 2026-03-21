-- Finance Hub Schema: Suppliers and Expenses Tables

-- Suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  total_debt NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their shop suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Users can insert suppliers" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update suppliers" ON public.suppliers FOR UPDATE USING (true);
CREATE POLICY "Users can delete suppliers" ON public.suppliers FOR DELETE USING (true);

-- Supplier transactions
CREATE TABLE IF NOT EXISTS public.supplier_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  notes TEXT,
  product_id UUID,
  quantity NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.supplier_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view supplier transactions" ON public.supplier_transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert supplier transactions" ON public.supplier_transactions FOR INSERT WITH CHECK (true);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  notes TEXT,
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Users can insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
