// Product type - Schema synced (min_stock)
export type Product = {
  id: string
  name: string
  category?: string
  unit: string
  price: number
  price_buy: number
  stock: number
  min_stock: number
  image_url?: string
  shop_id?: string
  created_at?: string
  updated_at?: string
}

// UI Product with computed props
export type ProductUI = Omit<Product, 'stock'> & {
  quantity: number
  in_stock: boolean
  name_ar: string
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>

export function toProductUI(p: Product): ProductUI {
  return {
    ...p,
    price: Number(p.price) || 0,
    quantity: Number(p.stock),
    in_stock: p.stock > 0,
    name_ar: p.name,
  }
}

// ERP Entity (Customer or Supplier)
export type AccountEntity = {
  id: string
  shop_id: string
  name: string
  phone?: string
  address?: string
  credit_limit: number
  status: 'active' | 'suspended' | 'over_limit'
  category: 'vip' | 'regular' | 'wholesale'
  account_number: string
  total_debt: number
  type: 'customer' | 'supplier'
  created_at?: string
}

// Account Ledger Item (Enhanced)
export type AccountLedgerItem = {
  id: string
  account_id: string
  account_type: 'customer' | 'supplier'
  shop_id: string
  transaction_type: 'debit' | 'credit' | 'payment' | 'incoming' | 'return'
  amount: number
  description: string
  balance_after: number
  created_at: string
  updated_at: string
}

// Supplier Stock Transaction RPC Args
export type SupplierStockTransaction = {
  supplier_id: string
  product_id: string
  quantity: number
  unit_price: number
  transaction_type: 'incoming' | 'return'
}

// RPC Response
export type StockTransactionResult = {
  success: boolean
  error?: string
  new_stock: number
  new_debt: number
  ledger_id?: string
}


// ERP Customer - Extended for Accounts Center (legacy)
export type Customer = AccountEntity & { type: 'customer'; total_purchases?: number }

// Sale (legacy - use account_ledger for new accounting)
export type Sale = {
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

// Account Ledger Entry
export type AccountLedgerEntry = {
  id: string
  type: 'debit' | 'credit'
  amount: number
  description: string
  entry_date: string
  balance: number
}

// Customer Stats
export type CustomerStats = {
  total_purchases: number
  open_invoices: number
  avg_payment_days: number
}
