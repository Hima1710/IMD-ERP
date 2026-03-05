'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Package, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [storeId, setStoreId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch store_id from profiles and then fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData?.user) {
        setError('لم يتم العثور على المستخدم')
        setLoading(false)
        return
      }

      // Get store_id from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', userData.user.id)
        .single()

      if (profileError || !profileData?.store_id) {
        setError('لم يتم العثور على متجر للمستخدم')
        setLoading(false)
        return
      }

      setStoreId(profileData.store_id)

      // Fetch products for this store
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', profileData.store_id)
        .order('name', { ascending: true })

      if (productsError) {
        setError('خطأ في جلب المنتجات: ' + productsError.message)
        setLoading(false)
        return
      }

      setProducts(productsData || [])
      setFilteredProducts(productsData || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  // Delete product handler
  const handleDelete = async (productId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      return
    }

    try {
      setDeletingId(productId)

      if (!supabase) {
        alert('Supabase not configured')
        return
      }

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (deleteError) {
        alert('خطأ في حذف المنتج: ' + deleteError.message)
        return
      }

      // Remove from local state
      const updatedProducts = products.filter(p => p.id !== productId)
      setProducts(updatedProducts)
      setFilteredProducts(updatedProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
      
      alert('تم حذف المنتج بنجاح')
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('حدث خطأ في حذف المنتج')
    } finally {
      setDeletingId(null)
    }
  }

  // Check if stock is low
  const isLowStock = (product: Product): boolean => {
    return product.stock_quantity <= (product.min_stock_level || 0)
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar selectedStore="products" onStoreChange={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <POSHeader 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          selectedStore="products"
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">إدارة المنتجات</h1>
              <p className="text-sm text-slate-500 mt-1">
                {filteredProducts.length} منتج
                {searchTerm && ` (نتائج البحث: "${searchTerm}")`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                <Plus className="w-5 h-5" />
                إضافة منتج
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-slate-500">جاري تحميل المنتجات...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12">
              <div className="flex flex-col items-center justify-center">
                <Package className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  {searchTerm ? 'لا توجد نتائج بحث' : 'لا توجد منتجات'}
                </h3>
                <p className="text-slate-500 text-center">
                  {searchTerm 
                    ? 'جرب البحث بكلمات مختلفة' 
                    : 'أضف منتجك الأول للبدء'}
                </p>
              </div>
            </div>
          )}

          {/* Products Table */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">اسم المنتج</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">الفئة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">الوحدة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">سعر البيع</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">الكمية</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">الحالة</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
                      <tr 
                        key={product.id} 
                        className={`hover:bg-slate-50 transition-colors ${
                          isLowStock(product) ? 'bg-red-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <span className="font-medium text-slate-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {product.category || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {product.unit || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900">
                            {(product.price_sell || 0).toFixed(2)} ج.م
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${
                            isLowStock(product) ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {product.stock_quantity || 0}
                          </span>
                          {product.min_stock_level && product.min_stock_level > 0 && (
                            <span className="text-xs text-slate-500 mr-1">
                              / {product.min_stock_level}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isLowStock(product) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              مخزون منخفض
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              متوفر
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-blue-600"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deletingId === product.id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-600 hover:text-red-600 disabled:opacity-50"
                              title="حذف"
                            >
                              {deletingId === product.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

