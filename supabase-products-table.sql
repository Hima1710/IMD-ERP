-- Create products table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL CHECK (category IN ('paint', 'tools', 'decor')),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  in_stock BOOLEAN GENERATED ALWAYS AS (quantity > 0) STORED,
  discount DECIMAL(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews INTEGER DEFAULT 0 CHECK (reviews >= 0),
  emoji TEXT DEFAULT '🎨',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- You can modify this based on your authentication requirements
CREATE POLICY "Allow all operations for authenticated users" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Insert some sample data (you can remove this after testing)
INSERT INTO products (name, name_ar, description, description_ar, price, category, quantity, discount, emoji) VALUES
('Premium Interior Paint', 'دهان داخلي فاخر', 'High-quality interior paint 5L', 'دهان داخلي عالي الجودة 5 لتر', 85.50, 'paint', 45, 0, '🎨'),
('Exterior Paint', 'دهان خارجي', 'Weather-resistant exterior paint 5L', 'دهان خارجي مقاوم للطقس 5 لتر', 95.00, 'paint', 32, 10, '🌞'),
('Paint Roller Set', 'مجموعة أسطوانات الدهان', 'Professional paint roller set 5pc', 'مجموعة أسطوانات احترافية 5 قطع', 28.50, 'tools', 67, 0, '🎪'),
('Wall Stickers', 'ملصقات الجدران', 'Decorative wall stickers set', 'مجموعة ملصقات ديكور الجدران', 15.99, 'decor', 73, 20, '🎗️');