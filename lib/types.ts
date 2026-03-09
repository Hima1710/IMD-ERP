// Simple Product type that matches Supabase schema
export interface Product {
  id: string
  name: string
  category: string
  unit: string
  price_buy: number
  price_sell: number
  stock: number
  min_quantity: number
  image_url?: string
  shop_id?: string
  created_at?: string
  updated_at?: string
}

// For UI display - add computed properties
export interface ProductUI extends Product {
  price: number
  quantity: number
  in_stock: boolean
  name_ar: string
  price_sell: number
  stock: number
  unit: string
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>

// Convert DB product to UI product
export function toProductUI(p: Product): ProductUI {
  return {
    ...p,
    price: p.price_sell,
    quantity: p.stock,
    in_stock: p.stock > 0,
    name_ar: p.name,
  }
}

export interface Customer {
  id: string
  name: string
  name_ar: string
  email?: string
  phone?: string
  address?: string
  total_purchases: number
  created_at?: string
  updated_at?: string
}

export interface Sale {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  customer_id?: string
  sale_date: string
  created_at?: string
}

