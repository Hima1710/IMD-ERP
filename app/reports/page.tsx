'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { BottomNav } from '@/components/BottomNav'
import { MobileNav, FloatingMenuButton } from '@/components/MobileNav'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { useStore } from '@/hooks/use-store'
import Invoice from '@/components/Invoice'
import { 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  Eye,
  Loader2,
  TrendingUp,
  Calendar,
  CreditCard,
  ArrowUpDown,
  Package,
  Menu
} from 'lucide-react'

// Types
interface Sale {
  id: string
  total_amount: number
  final_amount: number
  discount_amount: number
  payment_method: 'cash' | 'card'
  amount_paid: number
  change_amount: number
  remaining_amount: number
  items: any[]
  sale_date: string
  shop_id: string
  created_at?: string
}

interface DashboardStats {
  todayRevenue: number
  monthlyRevenue: number
  monthlyOrders: number
}

interface TopProduct {
  name: string
  totalSold: number
}

export default function ReportsPage() {
  const { store, isLoaded, loading: storeLoading } = useStore()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    monthlyRevenue: 0,
    monthlyOrders: 0
  })
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Get date ranges
  const getDateRanges = () => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    return {
      todayStart: todayStart.toISOString(),
      monthStart: monthStart.toISOString()
    }
  }

// ✅ STORE-DRIVEN: No auth.getUser() needed
  const fetchData = useCallback(async () => {
    // Guard: Wait for store to be ready
    if (!store.id) {
      console.log('⏳ [REPORTS] Store not ready, skipping')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      const { todayStart, monthStart } = getDateRanges()

      console.log('📊 [REPORTS] Fetching for shop:', store.id)

      // Fetch transactions for this shop
      const { data: salesData, error: salesError } = await supabase
        .from('transactions')
        .select('*')
        .eq('shop_id', store.id)  // ✅ Direct store.id
        .order('created_at', { ascending: false })

      if (salesError) {
        console.error('Error fetching sales:', salesError)
      }

      // Fetch ALL products for this shop
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', store.id)  // ✅ Direct store.id

      if (productsError) {
        console.error('Error fetching products:', productsError)
      }

      const allSales = salesData || []
      const allProducts = productsData || []

      // Calculate Today's Revenue
      const todayRevenue = allSales
        .filter(s => new Date(s.created_at || s.sale_date) >= new Date(todayStart))
        .reduce((sum, s) => sum + (s.total_amount || 0), 0)

      // Calculate Monthly Revenue
      const monthlyRevenue = allSales
        .filter(s => new Date(s.created_at || s.sale_date) >= new Date(monthStart))
        .reduce((sum, s) => sum + (s.total_amount || 0), 0)

      // Calculate Monthly Orders
      const monthlyOrders = allSales.filter(s => 
        new Date(s.created_at || s.sale_date) >= new Date(monthStart)
      ).length

      // Filter low stock products
      const lowStock = allProducts.filter(p => 
        (p.stock || 0) <= (p.min_quantity || 0)
      )

      // Calculate Top Selling Products
      const productSales: Record<string, number> = {}
      allSales
        .filter(s => new Date(s.created_at || s.sale_date) >= new Date(monthStart))
        .forEach(sale => {
          if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach((item: any) => {
              const key = item.product_name || item.name || 'Unknown'
              productSales[key] = (productSales[key] || 0) + (item.quantity || 1)
            })
          }
        })

      const top5Products = Object.entries(productSales)
        .map(([name, totalSold]) => ({ name, totalSold }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5)

      setStats({
        monthlyRevenue,
        monthlyOrders,
        todayRevenue
      })
      setLowStockProducts(lowStock)
      setTopProducts(top5Products)
      setSales(allSales.slice(0, 20))
      setProducts(allProducts)

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('حدث خطأ في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }, [store.id])

  useEffect(() => {
    if (isLoaded && !storeLoading && store.id) {
      fetchData()
    }
  }, [fetchData, isLoaded, storeLoading, store.id])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const recentSales = sales.slice(0, 20)

  const getItemsCount = (sale: Sale): number => {
    if (sale.items && Array.isArray(sale.items)) {
      return sale.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    }
    return 0
  }

  const getInvoiceData = (sale: Sale) => {
    const items = sale.items?.map((item: any) => ({
      name: item.product_name || item.name || 'منتج',
      quantity: item.quantity || 1,
      price: item.unit_price || item.price || 0,
      total: item.total_price || item.total || 0
    })) || []

    return {
      items,
      subtotal: sale.total_amount || 0,
      discountAmount: sale.discount_amount || 0,
      total: sale.final_amount || 0,
      paymentMethod: sale.payment_method as 'cash' | 'card',
      amountPaid: sale.amount_paid || 0,
      changeAmount: sale.change_amount || 0,
      date: formatDate(sale.created_at || sale.sale_date),
      invoiceId: sale.id
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
        <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <FloatingMenuButton onClick={() => setMobileNavOpen(true)} />
        
        <div className="hidden md:block">
          <Sidebar selectedStore="reports" onStoreChange={() => {}} />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
            <button onClick={() => setMobileNavOpen(true)} className="p-2 rounded-xl bg-slate-100">
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <h1 className="text-base font-bold">التقارير</h1>
            <div className="w-9" />
          </div>
          
          <POSHeader searchTerm="" onSearchChange={() => {}} selectedStore="reports" />
          
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl shadow-sm">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-slate-500">جاري تحميل التقارير...</p>
            </div>
          </div>
        </div>
        
        <BottomNav cartCount={0} />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <FloatingMenuButton onClick={() => setMobileNavOpen(true)} />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar selectedStore="reports" onStoreChange={() => {}} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button onClick={() => setMobileNavOpen(true)} className="p-2 rounded-xl bg-slate-100">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-base font-bold">التقارير</h1>
          <div className="w-9" />
        </div>
        
        <POSHeader searchTerm="" onSearchChange={() => {}} selectedStore="reports" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">التقارير</h1>
            <p className="text-sm text-slate-500 mt-1">نظرة شاملة على أداء متجرك</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Today's Revenue */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs text-slate-500">اليوم</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.todayRevenue.toFixed(2)}</p>
              <p className="text-sm text-slate-500">ج.م</p>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs text-slate-500">هذا الشهر</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.monthlyRevenue.toFixed(2)}</p>
              <p className="text-sm text-slate-500">ج.م</p>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs text-slate-500">هذا الشهر</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.monthlyOrders}</p>
              <p className="text-sm text-slate-500">فاتورة</p>
            </div>
          </div>

          {/* Low Stock Alerts - Card on Mobile, Table on Desktop */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-slate-900">تنبيهات المخزون المنخفض</h2>
                {lowStockProducts.length > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {lowStockProducts.length}
                  </span>
                )}
              </div>
            </div>
            
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-semibold text-green-600">ممتاز! المخزون في حالة جيدة</p>
                <p className="text-sm text-slate-500 mt-1">جميع المنتجات متوفرة بكميات كافية</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-2 p-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-red-700">{product.name}</p>
                          <p className="text-xs text-red-500">{product.category || '-'}</p>
                        </div>
                        <span className="font-bold text-red-600">{product.stock || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-red-50 border-b border-red-100">
                        <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">اسم المنتج</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">الفئة</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">الكمية الحالية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-50">
                      {lowStockProducts.map((product) => (
                        <tr key={product.id} className="bg-red-50/50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-red-700">{product.name}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{product.category || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-red-600">{product.stock || 0}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">أحدث المعاملات</h2>
                </div>
              </div>

              {recentSales.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">لا توجد معاملات بعد</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-2 p-4">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="bg-slate-50 rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-900">#{sale.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-500">{formatDate(sale.created_at || sale.sale_date)}</p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-900">{(sale.final_amount || 0).toFixed(2)} ج.م</p>
                          <button onClick={() => setSelectedSale(sale)} className="text-blue-600 text-xs">عرض</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">الفاتورة</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">التاريخ</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">العدد</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">الإجمالي</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">عرض</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2">
                              <span className="text-xs font-mono text-slate-600">#{sale.id.slice(0, 8)}</span>
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-600">{formatDate(sale.created_at || sale.sale_date)}</td>
                            <td className="px-3 py-2 text-xs text-slate-600">{getItemsCount(sale)} items</td>
                            <td className="px-3 py-2">
                              <span className="text-sm font-semibold text-slate-900">{(sale.final_amount || 0).toFixed(2)} ج.م</span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button onClick={() => setSelectedSale(sale)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Top Selling Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-bold text-slate-900">الأكثر مبيعاً</h2>
                </div>
              </div>

              {topProducts.length === 0 ? (
                <div className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">لا توجد مبيعات بعد</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{product.totalSold}</span>
                        <span className="text-xs text-slate-500">وحدة</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">تفاصيل الفاتورة</h3>
              <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

<Invoice {...getInvoiceData(selectedSale)} onClose={() => setSelectedSale(null)} />

            <div className="flex gap-2 mt-4">
              <button onClick={() => window.print()} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                طباعة
              </button>
              <button onClick={() => setSelectedSale(null)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav cartCount={0} />
    </div>
  )
}

