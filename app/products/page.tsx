'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { BottomNav } from '@/components/BottomNav'
import { MobileNav, FloatingMenuButton } from '@/components/MobileNav'

import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { useStore } from '@/hooks/use-store'
import {
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Package, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Menu
} from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [shopId, setShopId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    unit: 'قطعة',
    price_buy: 0,
    price: 0,
    stock: 0,
    min_quantity: 5
  })
  const [savingProduct, setSavingProduct] = useState(false)

  // Use centralized auth
  const { checkUser } = useStore()


  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData?.user) {
        setError('لم يتم العثور على المستخدم')
        setLoading(false)
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', userData.user.id)
        .single()

      if (profileError || !profileData?.shop_id) {
        setError('لم يتم العثور على متجر للمستخدم')
        setLoading(false)
        return
      }

      setShopId(profileData.shop_id)

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', profileData.shop_id)
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

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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

  const isLowStock = (product: Product): boolean => {
    return product.stock <= (product.min_quantity || 0)
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <FloatingMenuButton onClick={() => setMobileNavOpen(true)} />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar selectedStore="products" onStoreChange={() => {}} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button onClick={() => setMobileNavOpen(true)} className="p-2 rounded-xl bg-slate-100">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-base font-bold">المنتجات</h1>
          <div className="w-9" />
        </div>
        
        <POSHeader 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          selectedStore="products"
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">إدارة المنتجات</h1>
              <p className="text-sm text-slate-500 mt-1">
                {filteredProducts.length} منتج
                {searchTerm && ` (نتائج البحث: "${searchTerm}")`}
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span className="sm:hidden">إضافة</span>
                <span className="hidden sm:inline">إضافة منتج</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-slate-500">جاري تحميل المنتجات...</p>
              </div>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
              <div className="flex flex-col items-center justify-center">
                <Package className="w-14 h-14 sm:w-16 sm:h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  {searchTerm ? 'لا توجد نتائج بحث' : 'لا توجد منتجات'}
                </h3>
                <p className="text-slate-500 text-center">
                  {searchTerm ? 'جرب البحث بكلمات مختلفة' : 'أضف منتجك الأول للبدء'}
                </p>
              </div>
            </div>
          )}

          {/* Mobile Card View */}
          {!loading && !error && filteredProducts.length > 0 && (
            <>
              <div className="md:hidden space-y-3 mb-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-2xl shadow-sm p-4 ${isLowStock(product) ? 'border border-red-200' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
                          {isLowStock(product) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium flex-shrink-0 mr-2">
                              <AlertTriangle className="w-3 h-3" />
                              منخفض
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{product.category || 'بدون فئة'}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-slate-900">{Number(product.price || 0).toFixed(2)} ج.م</span>
                          <span className={`text-sm ${isLowStock(product) ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                            المخزون: {product.stock || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm">
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors text-sm disabled:opacity-50"
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
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
                          className={`hover:bg-slate-50 transition-colors ${isLowStock(product) ? 'bg-red-50/50' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <span className="font-medium text-slate-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{product.category || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{product.unit || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-900">{Number(product.price || 0).toFixed(2)} ج.م</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${isLowStock(product) ? 'text-red-600' : 'text-slate-900'}`}>
                              {product.stock || 0}
                            </span>
                            {product.min_quantity && product.min_quantity > 0 && (
                              <span className="text-xs text-slate-500 mr-1">/ {product.min_quantity}</span>
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
                              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 hover:text-blue-600" title="تعديل">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                className="p-2 hover:bg-red-50 rounded-xl transition-colors text-slate-600 hover:text-red-600 disabled:opacity-50"
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
            </>
          )}
        </div>
      </div>


      {/* Bottom Navigation */}
      <BottomNav cartCount={0} />

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">إضافة منتج جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="أدخل اسم المنتج"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الفئة</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="أدخل الفئة"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">سعر البيع (بيع) *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">سعر التكلفة (تكلفة)</label>
                  <input
                    type="number"
                    value={newProduct.price_buy}
                    onChange={(e) => setNewProduct({ ...newProduct, price_buy: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الكمية</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الحد الأدنى</label>
                  <input
                    type="number"
                    value={newProduct.min_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, min_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوحدة</label>
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="قطعة">قطعة</option>
                  <option value="كيلو">كيلو</option>
                  <option value=" لتر">لتر</option>
                  <option value="متر">متر</option>
                  <option value="كيس">كيس</option>
                  <option value="صندوق">صندوق</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={async () => {
                    if (!newProduct.name.trim()) {
                      alert('يرجى إدخال اسم المنتج')
                      return
                    }
                    if (!shopId || !supabase) {
                      alert('خطأ في النظام')
                      return
                    }
                    
                    setSavingProduct(true)
                    try {
                      const { error: insertError } = await supabase
                        .from('products')
                        .insert([{
                          shop_id: shopId,
                          name: newProduct.name.trim(),
                          category: newProduct.category.trim() || null,
                          unit: newProduct.unit,
                          price: Number(newProduct.price),
                          price_buy: Number(newProduct.price_buy),
                          stock: Number(newProduct.stock),
                          min_quantity: Number(newProduct.min_quantity)
                        }])

                      if (insertError) {
                        alert('خطأ في إضافة المنتج: ' + insertError.message)
                        return
                      }

                      // Clear form and close modal on success
                      setNewProduct({
                        name: '',
                        category: '',
                        unit: 'قطعة',
                        price: 0,
                        price_buy: 0,
                        stock: 0,
                        min_quantity: 5
                      })
                      setShowAddModal(false)
                      fetchProducts()
                    } catch (err) {
                      console.error('Error adding product:', err)
                      alert('حدث خطأ')
                    } finally {
                      setSavingProduct(false)
                    }
                  }}
                  disabled={savingProduct}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {savingProduct ? 'جاري...' : 'إضافة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

