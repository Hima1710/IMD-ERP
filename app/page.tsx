'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { ProductCatalog } from '@/components/product-catalog'
import { ShoppingCart } from '@/components/shopping-cart'
import { DashboardStats } from '@/components/dashboard-stats'
import { supabase } from '@/lib/supabase'
import { Product, ProductFormData, toProductUI } from '@/lib/types'
import { ShoppingCart as CartIcon, Package } from 'lucide-react'

export default function POSPage() {
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number }>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedStore, setSelectedStore] = useState<string>('riyadh')
  const [taxRate, setTaxRate] = useState<number>(0.15)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from Supabase (only for current store)
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase) {
        console.log('Supabase not configured')
        setProducts([])
        setLoading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user logged in')
        setProducts([])
        setLoading(false)
        return
      }

      // Get store_id from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single()

      if (!profile?.store_id) {
        console.log('No store linked to this user')
        alert('لا يوجد متجر مرتبط بهذا المستخدم')
        setProducts([])
        setLoading(false)
        return
      }

      // Fetch products for this store only
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', profile.store_id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching products:', fetchError)
        setError(fetchError.message)
        setProducts([])
        return
      }

      // Map Supabase data to Product type using CORRECT column names
      const mappedProducts: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || '',
        category: item.category || '',
        unit: item.unit || 'قطعة',
        price_buy: parseFloat(item.price_buy) || 0,
        price_sell: parseFloat(item.price_sell) || 0,
        stock_quantity: parseInt(item.stock_quantity) || 0,
        min_stock_level: parseInt(item.min_stock_level) || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }))

      console.log('Fetched products:', mappedProducts)
      setProducts(mappedProducts)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData: ProductFormData) => {
    if (!supabase) {
      alert('⚠️ Supabase غير مُعدّة!')
      console.error('Supabase not configured - missing environment variables')
      return null
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('الرجاء تسجيل الدخول أولاً')
        return null
      }

      // Get store_id from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single()

      if (!profile?.store_id) {
        alert('لا يوجد متجر مرتبط بهذا المستخدم')
        return null
      }

      console.log('Inserting product with data:', productData)

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          category: productData.category || 'دهانات',
          unit: productData.unit || 'قطعة',
          price_buy: productData.price_buy || 0,
          price_sell: productData.price_sell || 0,
          stock_quantity: productData.stock_quantity || 0,
          min_stock_level: productData.min_stock_level || 0,
          store_id: profile.store_id, // Include store_id
        }])
        .select()

      if (error) {
        console.error('Error adding product:', JSON.stringify(error))
        alert(`❌ خطأ في إضافة المنتج: ${error.message}`)
        return null
      }

      await fetchProducts()
      alert('✅ تم إضافة المنتج بنجاح!')
      return data?.[0] || null
    } catch (err) {
      console.error('Error adding product:', err)
      alert(`❌ خطأ غير متوقع: ${err}`)
      return null
    }
  }

// Calculate real stats from Supabase data
  const stats = useMemo(() => {
    const totalProducts = products.length
    // Low Stock: products where stock_quantity <= min_stock_level
    const lowStock = products.filter(p => {
      const qty = p.stock_quantity || 0
      const min = p.min_stock_level || 0
      return qty <= min
    }).length

    return [
      {
        label: 'Total Products',
        labelAr: 'إجمالي المنتجات',
        value: totalProducts.toString(),
        icon: <Package className="w-6 h-6 text-blue-600" />,
        trend: undefined,
        color: 'bg-blue-100',
      },
      {
        label: 'Low Stock',
        labelAr: 'مخزون منخفض',
        value: lowStock.toString(),
        icon: <CartIcon className="w-6 h-6 text-orange-600" />,
        trend: undefined,
        color: 'bg-orange-100',
      },
    ]
  }, [products])

  // Convert to UI format for display
  const productsForDisplay = useMemo(() => {
    return products.map(toProductUI)
  }, [products])

  const filteredProducts = useMemo(() => {
    return productsForDisplay.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesSearch = 
        (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (product.name_ar?.toLowerCase().includes(searchTerm.toLowerCase())))
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchTerm, productsForDisplay])

  const handleAddToCart = (productId: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId)
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.productId !== productId))
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        )
      )
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Right side for RTL */}
      <Sidebar selectedStore={selectedStore} onStoreChange={setSelectedStore} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <POSHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStore={selectedStore}
        />

        {/* Dashboard Stats */}
        <div className="px-6 py-4 bg-slate-50">
          <DashboardStats stats={stats} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left side: Shopping Cart */}
          <div className="w-80 border-r border-slate-200 bg-white overflow-y-auto">
            <ShoppingCart
              cartItems={cartItems}
              allProducts={productsForDisplay}
              onUpdateQuantity={handleUpdateQuantity}
              taxRate={taxRate}
              discountPercent={discountPercent}
              onDiscountChange={setDiscountPercent}
            />
          </div>

          {/* Right side: Product Catalog */}
          <div className="flex-1 overflow-y-auto p-6">
            <ProductCatalog
              products={filteredProducts}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onAddToCart={handleAddToCart}
              onAddProduct={addProduct}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

