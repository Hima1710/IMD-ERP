'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/hooks/use-store'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { ProductCatalog } from '@/components/product-catalog'
import { ShoppingCart } from '@/components/shopping-cart'
import { DashboardStats } from '@/components/dashboard-stats'
import { BottomNav } from '@/components/BottomNav'
import { MobileNav, FloatingMenuButton } from '@/components/MobileNav'
import AdminDashboard from '@/components/AdminDashboard'
import { supabase } from '@/lib/supabase'
import { Product, ProductFormData, toProductUI } from '@/lib/types'
import { ShoppingCart as CartIcon, Package, Menu, X, ShoppingBag } from 'lucide-react'

export default function POSPage() {
  const { store, user: storeUser, loading: storeLoading, isAuthLoading, isLoaded } = useStore()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number }>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedStore, setSelectedStore] = useState<string>('riyadh')
  const [taxRate, setTaxRate] = useState<number>(0.15)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [userRole, setUserRole] = useState<string>('cashier')
  
  // Responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Use store user - NO local auth calls
  const user = storeUser

  // Extract phone number from user email
  const cashierPhone = user?.email ? user.email.split('@')[0] : ''

  // FIXED: Load products when store ready (uses store user)
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || !user) {
        console.log('No user or supabase')
        setProducts([])
        setLoading(false)
        return
      }

      console.log('📥 Fetching products for user:', user.email)

      // Get shop_id from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single()

      if (!profile?.shop_id) {
        console.log('No shop linked to this user - loading empty catalog')  // ✅ NO REDIRECT
        setProducts([])
        setLoading(false)
        return  // Load empty state, no redirect!
      }

      // Fetch products for this shop only
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', profile.shop_id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching products:', fetchError)
        setError(fetchError.message)
        setProducts([])
        return
      }

      const mappedProducts: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || '',
        category: item.category || '',
        unit: item.unit || 'قطعة',
        price: Number(item.price) || 0,
        price_buy: Number(item.price_buy) || 0,
        stock: parseInt(item.stock || item.quantity) || 0,
        min_quantity: parseInt(item.min_quantity) || 0,
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

  // FIXED: Initialize when store ready (even no user, for isReady)
  useEffect(() => {
    if (isLoaded && !storeLoading && !isAuthLoading) {
      console.log('✅ Store ready', user ? `with user ${user.email}, fetching products` : 'no user - empty state')
      setIsReady(true)
      if (user) {
        fetchProducts()
      }
    }
  }, [isLoaded, storeLoading, isAuthLoading, user])

  const addProduct = async (productData: ProductFormData) => {
    if (!supabase || !user) {
      alert('الرجاء تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single()

      if (!profile?.shop_id) {
        alert('لا يوجد متجر مرتبط بهذا المستخدم')
        return null
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          category: productData.category,
          unit: productData.unit,
          price: productData.price,
          price_buy: productData.price_buy,
          stock: productData.stock,
          min_quantity: productData.min_quantity,
          shop_id: profile.shop_id
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

  // Stats from products
  const stats = useMemo(() => {
    const totalProducts = products.length
    const lowStock = products.filter(p => (p.stock || 0) <= (p.min_quantity || 0)).length

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

  const productsForDisplay = useMemo(() => products.map(toProductUI), [products])

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

  // Admin dashboard
  if (userRole === 'super_admin' && isReady) {
    return <AdminDashboard />
  }

  // ✅ FIXED Auth guard - wait for store hydration
  if (isClient && !isLoaded && !user) {
    const router = useRouter()
    const returnTo = encodeURIComponent(window.location.pathname)
    router.push(`/login?return_to=${returnTo}`)
    return null
  }

  // Loading states
  if (storeLoading || isAuthLoading || !isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-blue-600 mb-8"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">جاري التحضير...</h2>
          <p className="text-blue-300 text-sm">التحقق من الحساب والمتجر...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <FloatingMenuButton onClick={() => setMobileNavOpen(true)} />
      <div className="hidden md:block">
        <Sidebar selectedStore={selectedStore} onStoreChange={setSelectedStore} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button onClick={() => setMobileNavOpen(true)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 md:hidden">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-base font-bold text-slate-900">نقاط البيع</h1>
          <button onClick={() => setMobileCartOpen(true)} className="relative p-2 rounded-xl bg-blue-600 hover:bg-blue-700">
            <ShoppingBag className="w-5 h-5 text-white" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>

        <POSHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStore={selectedStore}
        />

        <div className="px-4 md:px-8 py-4 bg-slate-50">
          <DashboardStats stats={stats} />
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-24">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 order-2 md:order-1">
            <ProductCatalog
              products={filteredProducts}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onAddToCart={handleAddToCart}
              onAddProduct={addProduct}
              loading={loading}
            />
            {error && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}
          </div>

          <div className="hidden md:block w-80 border-r border-slate-200 bg-white overflow-y-auto order-2 shadow-sm">
            <ShoppingCart
              cartItems={cartItems}
              allProducts={productsForDisplay}
              onUpdateQuantity={handleUpdateQuantity}
              taxRate={taxRate}
              discountPercent={discountPercent}
              onDiscountChange={setDiscountPercent}
            />
          </div>
        </div>
      </div>

      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileCartOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl h-[90vh] flex flex-col shadow-2xl z-50 pb-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-900">سلة المشتريات</h2>
              <button onClick={() => setMobileCartOpen(false)} className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300">
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ShoppingCart
                cartItems={cartItems}
                allProducts={productsForDisplay}
                onUpdateQuantity={handleUpdateQuantity}
                taxRate={taxRate}
                discountPercent={discountPercent}
                onDiscountChange={setDiscountPercent}
              />
            </div>
          </div>
        </div>
      )}

      <BottomNav cartCount={cartItems.length} />
    </div>
  )
}

