'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { ProductCatalog } from '@/components/product-catalog'
import { ShoppingCart } from '@/components/shopping-cart'
import { DashboardStats } from '@/components/dashboard-stats'
import AdminDashboard from '@/components/AdminDashboard'
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
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('cashier')

  // Extract phone number from user email (e.g., 01558905021@paintmaster.com -> 01558905021)
  const cashierPhone = user?.email ? user.email.split('@')[0] : ''

  // Wait for session to be available, then fetch products
  useEffect(() => {
    const initializeSession = async () => {
      try {
        if (!supabase) {
          console.log('❌ Supabase not configured')
          setLoading(false)
          return
        }

        console.log('🔄 Checking session...')
        
        // Try to get session with longer retries and delays
        let user = null
        let retries = 0
        const maxRetries = 10

        while (!user && retries < maxRetries) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            user = session.user
            setUser(user)
            console.log('✅ Session found:', user.email)
            
            // Fetch user role from profiles
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
              
              if (profile?.role) {
                setUserRole(profile.role)
                console.log('User role:', profile.role)
              }
            } catch (roleErr) {
              console.log('Could not fetch role:', roleErr)
            }
            
            break
          }
          retries++
          if (retries < maxRetries) {
            console.log(`⏳ Session not ready yet... retry ${retries}/${maxRetries}`)
            // Increase delay for later retries
            const delay = Math.min(retries * 200, 1000)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }

        if (!user) {
          console.log('❌ No user session after retries - redirecting to login')
          setLoading(false)
          setIsReady(false)
          // Session not found after all retries - redirect to login
          window.location.href = '/login'
          return
        }

        setIsReady(true)
        await fetchProducts()
      } catch (err) {
        console.error('❌ Session initialization error:', err)
        setLoading(false)
        setError('Failed to initialize session')
      }
    }

    initializeSession()
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

      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.log('No user logged in')
        setProducts([])
        setLoading(false)
        return
      }

      const user = session.user

      console.log('📥 Fetching products for user:', user.email)

      // Get shop_id from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single()

      if (!profile?.shop_id) {
        console.log('No shop linked to this user')
        setProducts([])
        setLoading(false)
        return
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

      // Map Supabase data to Product type
      // Note: The database uses 'price' field, not 'price_buy' or 'price_sell'
      const mappedProducts: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || '',
        category: item.category || '',
        unit: item.unit || 'قطعة',
        // Use 'price' from database and map to both price_buy and price_sell
        price_buy: parseFloat(item.price) || parseFloat(item.price_buy) || 0,
        price_sell: parseFloat(item.price) || parseFloat(item.price_sell) || 0,
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

      // Get shop_id from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single()

      if (!profile?.shop_id) {
        alert('لا يوجد متجر مرتبط بهذا المستخدم')
        return null
      }

      console.log('Inserting product with data:', productData)

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: productData.name,
            category: productData.category,
            unit: productData.unit,
            // التعديل هنا: نربط السعر بأسماء الأعمدة الحقيقية في جدولك
            price: productData.price_sell,     // السعر اللي العميل بيشتري بيه
            cost_price: productData.price_buy, // سعر التكلفة عليك
            stock: productData.stock,
            min_quantity: productData.min_quantity,
            shop_id: profile.shop_id
          }
        ])
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
    // Low Stock: products where stock <= min_quantity
    const lowStock = products.filter(p => {
      const qty = p.stock || 0
      const min = p.min_quantity || 0
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

  // Show AdminDashboard for super_admin users
  if (userRole === 'super_admin' && isReady) {
    return <AdminDashboard />
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {!isReady ? (
        // Loading screen while session initializes
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-blue-600"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">جاري تحميل النظام</h2>
            <p className="text-blue-300">يرجى الانتظار...</p>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}

