'use client'

<<<<<<< HEAD
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

// غيرنا اسم loading لـ authLoading عشان متبقاش زي اللي فوقها
const { store, user, isLoaded, loading: storeLoading, isAuthLoading } = useStore()



  const fetchProducts = useCallback(async () => {
    // ✅ STORE-DRIVEN: No auth.getUser() needed
    if (!store.id || storeLoading || !isLoaded) {
      console.log('⏳ [PRODUCTS] Store not ready, skipping fetch')
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

      console.log('📥 [PRODUCTS] Fetching for shop:', store.id)

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', store.id)  // ✅ Direct store.id
        .order('name', { ascending: true })

      if (productsError) {
        setError('خطأ في جلب المنتجات: ' + productsError.message)
        setLoading(false)
        return
      }

      setProducts(productsData || [])
      setFilteredProducts(productsData || [])
      setShopId(store.id)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }, [store.id, storeLoading, isLoaded])

  useEffect(() => {
    if (isLoaded && !storeLoading) {
      fetchProducts()
    }
  }, [fetchProducts, isLoaded, storeLoading])

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
=======
import React, { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useStore } from "@/hooks/use-store"
import {
  ShoppingCart, Plus, Minus, Trash2, X, Search, Package,
  Printer, CheckCircle, AlertTriangle, Loader2, Users,
  Factory, FileText, LayoutDashboard, Settings, LogOut,
  ChevronRight, ChevronLeft, Menu, Tag, Hash,
  ShoppingBag, TrendingUp, Boxes, Edit3, Save,
} from "lucide-react"

/* ─── Types ─────────────────────────────────── */
interface Product {
  id: string
  name: string
  price: number
  cost_price?: number
  quantity: number
  unit?: string
  category?: string
  sku?: string
  shop_id: string
}

interface CartItem {
  product: Product
  qty: number
  unit_price: number
}

interface Account {
  id: string
  name: string
  account_number: string
  total_debt?: number
  type: "customer" | "supplier"
}

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap"

/* ─── Modal ─────────────────────────────────── */
function Modal({
  open, onClose, children, maxW = "max-w-lg", noPad = false,
}: {
  open: boolean; onClose: () => void
  children: React.ReactNode; maxW?: string; noPad?: boolean
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-3xl w-full ${maxW} max-h-[94vh] overflow-y-auto shadow-2xl ${noPad ? "" : "p-6"}`}
        style={{ animation: "popIn .2s cubic-bezier(.34,1.56,.64,1)" }}
      >
        {children}
      </div>
>>>>>>> blackboxai-upload-all-changes
    </div>
  )
}

<<<<<<< HEAD
=======
/* ─── Print Invoice ──────────────────────────── */
function printInvoice(
  cart: CartItem[],
  invoiceType: "sale" | "purchase",
  account: Account | null,
  invoiceNum: string,
  storeName: string,
  discount: number,
) {
  const total = cart.reduce((s, i) => s + i.qty * i.unit_price, 0)
  const net = total - discount
  const date = new Date().toLocaleDateString("ar-EG", {
    year: "numeric", month: "long", day: "numeric",
  })
  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<title>فاتورة ${invoiceNum}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Cairo',sans-serif; padding:20mm; color:#111; background:#fff; }
  .header { text-align:center; border-bottom:3px double #333; padding-bottom:12px; margin-bottom:16px; }
  .header h1 { font-size:22px; font-weight:900; }
  .header p { font-size:12px; color:#555; margin-top:2px; }
  .meta { display:flex; justify-content:space-between; margin-bottom:16px; font-size:12px; }
  .meta div { line-height:1.8; }
  .badge { display:inline-block; background:${invoiceType==="sale"?"#6C63FF":"#f97316"}; color:#fff; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  table { width:100%; border-collapse:collapse; margin-bottom:16px; font-size:12px; }
  thead tr { background:#f3f4f6; }
  th, td { border:1px solid #e5e7eb; padding:8px 10px; text-align:right; }
  th { font-weight:700; font-size:11px; }
  .totals { margin-right:auto; margin-left:0; width:220px; font-size:12px; }
  .totals tr td { border:none; padding:4px 6px; }
  .totals tr.net td { font-weight:900; font-size:15px; border-top:2px solid #333; padding-top:8px; }
  .footer { text-align:center; margin-top:24px; font-size:11px; color:#888; border-top:1px dashed #ccc; padding-top:10px; }
</style>
</head>
<body>
<div class="header">
  <h1>${storeName}</h1>
  <p>نظام IMD ERP</p>
</div>
<div class="meta">
  <div>
    <span class="badge">${invoiceType==="sale"?"فاتورة بيع":"فاتورة شراء"}</span><br/>
    <strong>رقم الفاتورة:</strong> ${invoiceNum}<br/>
    <strong>التاريخ:</strong> ${date}
  </div>
  <div>
    ${account ? `<strong>${invoiceType==="sale"?"العميل":"المورد"}:</strong> ${account.name}<br/>
    <strong>رقم الحساب:</strong> ${account.account_number}` : "<em>نقدي</em>"}
  </div>
</div>
<table>
  <thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
  <tbody>
    ${cart.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.product.name}</td>
        <td>${item.qty} ${item.product.unit ?? ""}</td>
        <td>${item.unit_price.toLocaleString("ar-EG")} ج.م</td>
        <td>${(item.qty * item.unit_price).toLocaleString("ar-EG")} ج.م</td>
      </tr>`).join("")}
  </tbody>
</table>
<table class="totals">
  <tr><td>المجموع:</td><td><strong>${total.toLocaleString("ar-EG")} ج.م</strong></td></tr>
  ${discount > 0 ? `<tr><td>الخصم:</td><td><strong style="color:#ef4444">- ${discount.toLocaleString("ar-EG")} ج.م</strong></td></tr>` : ""}
  <tr class="net"><td>الصافي:</td><td>${net.toLocaleString("ar-EG")} ج.م</td></tr>
</table>
<div class="footer">شكراً لتعاملكم معنا • ${storeName}</div>
</body>
</html>`
  const w = window.open("", "_blank")
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.onload = () => { w.print() }
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function ProductsPage() {
  const { store, isLoaded, user, signOut } = useStore()
  const [mounted, setMounted] = useState(false)

  /* sidebar */
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  /* products */
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("الكل")
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  /* cart */
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [invoiceType, setInvoiceType] = useState<"sale" | "purchase">("sale")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountSearch, setAccountSearch] = useState("")
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState("")
  const [cartLoading, setCartLoading] = useState(false)

  /* add/edit product */
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [pName, setPName] = useState("")
  const [pPrice, setPPrice] = useState(0)
  const [pCost, setPCost] = useState(0)
  const [pQty, setPQty] = useState(0)
  const [pUnit, setPUnit] = useState("")
  const [pCat, setPCat] = useState("")
  const [pSku, setPSku] = useState("")
  const [prodLoading, setProdLoading] = useState(false)

  /* misc */
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showInvoiceSuccess, setShowInvoiceSuccess] = useState(false)
  const [lastInvoiceNum, setLastInvoiceNum] = useState("")

  /* ── mount ── */
  useEffect(() => {
    setMounted(true)
    const link = document.createElement("link")
    link.href = FONT_URL; link.rel = "stylesheet"
    document.head.appendChild(link)
    const style = document.createElement("style")
    style.textContent = `
      @keyframes popIn { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      .card-appear { animation: fadeUp .25s ease-out both; }
      .cart-badge { animation: popIn .15s ease-out; }
    `
    document.head.appendChild(style)
    return () => {
      try { document.head.removeChild(link) } catch (_) {}
      try { document.head.removeChild(style) } catch (_) {}
    }
  }, [])

  /* ── sidebar persist ── */
  useEffect(() => {
    const s = localStorage.getItem("sidebar-collapsed")
    if (s) setCollapsed(s === "true")
  }, [])
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed))
  }, [collapsed])

  /* ── auto clear msgs ── */
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t) } }, [success])
  useEffect(() => { if (error) { const t = setTimeout(() => setError(""), 5000); return () => clearTimeout(t) } }, [error])

  /* ── fetch products ── */
  const fetchProducts = useCallback(async () => {
    if (!isLoaded || !store?.id) return
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from("products").select("*").eq("shop_id", store.id).order("name")
      if (err) throw err
      const prods: Product[] = data ?? []
      setProducts(prods)
      const cats = ["الكل", ...Array.from(new Set(prods.map((p) => p.category ?? "عام").filter(Boolean)))]
      setCategories(cats)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [isLoaded, store?.id])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  /* ── realtime ── */
  useEffect(() => {
    if (!store?.id) return
    const ch = supabase.channel("products-rt")
    ch.on("postgres_changes", { event: "*", schema: "public", table: "products" }, fetchProducts)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [store?.id, fetchProducts])

  /* ── fetch accounts ── */
  const fetchAccounts = useCallback(async () => {
    if (!store?.id) return
    const [c, s] = await Promise.all([
      supabase.from("customers").select("id,name,account_number,total_debt").eq("shop_id", store.id),
      supabase.from("suppliers").select("id,name,account_number,total_debt").eq("shop_id", store.id),
    ])
    const custs = (c.data ?? []).map((x) => ({ ...x, type: "customer" as const }))
    const supps = (s.data ?? []).map((x) => ({ ...x, type: "supplier" as const }))
    setAccounts([...custs, ...supps])
  }, [store?.id])

  useEffect(() => { if (showCart) fetchAccounts() }, [showCart, fetchAccounts])

  /* ── filter ── */
  useEffect(() => {
    let list = products
    if (catFilter !== "الكل") list = list.filter((p) => (p.category ?? "عام") === catFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [products, search, catFilter])

  /* ── cart helpers ── */
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.unit_price, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const netTotal = cartTotal - discount

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === p.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { product: p, qty: 1, unit_price: p.price }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    )
  }

  const updatePrice = (id: string, val: number) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === id ? { ...i, unit_price: val } : i)
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== id))
  }

  const clearCart = () => {
    setCart([]); setSelectedAccount(null); setDiscount(0); setNotes("")
    setAccountSearch(""); setInvoiceType("sale")
  }

  /* ── confirm invoice ── */
  const handleConfirmInvoice = async () => {
    if (cart.length === 0) return setError("السلة فارغة!")
    setCartLoading(true)
    setError("")
    try {
      const invoiceNum = `INV-${Date.now().toString().slice(-8)}`
      const isSale = invoiceType === "sale"

      /* 1. Save invoice header */
      const { data: invData, error: invErr } = await supabase
        .from("invoices")
        .insert({
          shop_id: store!.id,
          invoice_number: invoiceNum,
          invoice_type: invoiceType,
          account_id: selectedAccount?.id ?? null,
          account_type: selectedAccount?.type ?? null,
          customer_id: selectedAccount?.type === "customer" ? selectedAccount.id : null,
          total_amount: cartTotal,
          discount,
          net_amount: netTotal,
          notes: notes || null,
          status: "confirmed",
        })
        .select()
        .single()
      if (invErr) throw invErr

      /* 2. Save invoice items */
      const items = cart.map((i) => ({
        invoice_id: invData.id,
        shop_id: store!.id,
        product_id: i.product.id,
        quantity: i.qty,
        unit_price: i.unit_price,
        total: i.qty * i.unit_price,
      }))
      const { error: itemsErr } = await supabase.from("invoice_items").insert(items)
      if (itemsErr) throw itemsErr

      /* 3. Update stock quantity for each product */
      for (const item of cart) {
        const newQty = isSale
          ? item.product.quantity - item.qty   /* بيع → خصم */
          : item.product.quantity + item.qty   /* شراء → إضافة */
        await supabase
          .from("products")
          .update({ quantity: Math.max(0, newQty) })
          .eq("id", item.product.id)
      }

      /* 4. Update account debt if linked */
      if (selectedAccount) {
        const debtDelta = isSale ? netTotal : -netTotal
        const newDebt = (selectedAccount.total_debt ?? 0) + debtDelta
        const table = selectedAccount.type === "customer" ? "customers" : "suppliers"
        await supabase.from(table).update({ total_debt: newDebt }).eq("id", selectedAccount.id)

        /* 5. Ledger entry */
        await supabase.from("account_ledger").insert({
          account_id: selectedAccount.id,
          account_type: selectedAccount.type,
          shop_id: store!.id,
          transaction_type: isSale ? "sale" : "purchase",
          amount: netTotal,
          description: `فاتورة ${isSale ? "بيع" : "شراء"} رقم ${invoiceNum}`,
          balance_after: newDebt,
        })
      }

      setLastInvoiceNum(invoiceNum)
      setShowInvoiceSuccess(true)
      fetchProducts()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCartLoading(false)
    }
  }

  /* ── add/edit product ── */
  const openAddProduct = () => {
    setEditProduct(null)
    setPName(""); setPPrice(0); setPCost(0); setPQty(0)
    setPUnit(""); setPCat(""); setPSku("")
    setShowAddProduct(true)
  }

  const openEditProduct = (p: Product) => {
    setEditProduct(p)
    setPName(p.name); setPPrice(p.price); setPCost(p.cost_price ?? 0)
    setPQty(p.quantity); setPUnit(p.unit ?? ""); setPCat(p.category ?? ""); setPSku(p.sku ?? "")
    setShowAddProduct(true)
  }

  const handleSaveProduct = async () => {
    if (!pName.trim()) return setError("اسم المنتج مطلوب")
    setProdLoading(true)
    try {
      const payload = {
        shop_id: store!.id,
        name: pName.trim(),
        price: Number(pPrice),
        cost_price: Number(pCost),
        quantity: Number(pQty),
        unit: pUnit.trim() || null,
        category: pCat.trim() || "عام",
        sku: pSku.trim() || null,
      }
      const { error: err } = editProduct
        ? await supabase.from("products").update(payload).eq("id", editProduct.id)
        : await supabase.from("products").insert([payload])
      if (err) throw err
      setShowAddProduct(false)
      setSuccess(editProduct ? "✅ تم تحديث المنتج" : "✅ تم إضافة المنتج")
      fetchProducts()
    } catch (e: any) { setError(e.message) }
    finally { setProdLoading(false) }
  }

  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`حذف "${p.name}" نهائياً؟`)) return
    const { error: err } = await supabase.from("products").delete().eq("id", p.id)
    if (err) return setError(err.message)
    setSuccess("✅ تم حذف المنتج")
    fetchProducts()
  }

  /* ── sidebar ── */
  const sidebarW = collapsed ? "lg:w-20" : "lg:w-64"
  const mainMr   = collapsed ? "lg:mr-20" : "lg:mr-64"

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "لوحة التحكم", href: "/dashboard" },
    { icon: <Users className="w-5 h-5" />, label: "العملاء", href: "/customers" },
    { icon: <Package className="w-5 h-5" />, label: "المنتجات", href: "/products", active: true },
    { icon: <FileText className="w-5 h-5" />, label: "التقارير", href: "/reports" },
    { icon: <Settings className="w-5 h-5" />, label: "الإعدادات", href: "/settings" },
  ]

  const filteredAccounts = accounts.filter((a) => {
    const t = invoiceType === "sale" ? "customer" : "supplier"
    return a.type === t && (
      !accountSearch ||
      a.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
      a.account_number.includes(accountSearch)
    )
  })

  const inputCls = "w-full p-3 border border-slate-200 rounded-xl focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 font-medium outline-none transition text-sm bg-slate-50 focus:bg-white"

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-[#6C63FF]" />
    </div>
  )

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }} className="min-h-screen bg-[#f4f6fb]">

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ════════════════════════════
          SIDEBAR
      ════════════════════════════ */}
      <aside className={`
        fixed top-0 right-0 h-full z-50 bg-[#161c2d] text-white flex flex-col
        transition-all duration-300 ease-in-out shadow-2xl w-64 ${sidebarW}
        ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-black text-xs">ERP</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black text-white">IMD ERP</h1>
                {store?.name && <p className="text-xs text-slate-400 truncate">{store.name}</p>}
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-black text-xs">ERP</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition flex-shrink-0">
            {collapsed ? <ChevronLeft className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm
                ${item.active ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30" : "text-slate-400 hover:bg-white/10 hover:text-white"}
                ${collapsed ? "justify-center px-2" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="p-2.5 border-t border-white/10 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-white/5">
              <p className="text-xs text-slate-500">المستخدم</p>
              <p className="font-bold text-xs text-white truncate">{user?.email?.split("@")[0] ?? "—"}</p>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className={`w-full flex items-center gap-2 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl font-semibold transition-all text-sm ${collapsed ? "justify-center" : ""}`}
            title="تسجيل خروج">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && "تسجيل خروج"}
          </button>
        </div>
      </aside>

      {/* ════════════════════════════
          MAIN
      ════════════════════════════ */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMr}`}>

        {/* ── TOPBAR ── */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-slate-900">إدارة المنتجات</h1>
              <p className="text-xs text-slate-400 hidden sm:block">{products.length} منتج في المخزون</p>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5A55E6] text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">السلة</span>
              {cartCount > 0 && (
                <span className="cart-badge absolute -top-2 -left-2 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={openAddProduct}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">منتج جديد</span>
            </button>
          </div>

          {/* Search + filter bar */}
          <div className="px-4 pb-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الكود أو الفئة..."
                className="w-full pr-9 pl-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 outline-none bg-slate-50 focus:bg-white transition" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 flex-nowrap">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    catFilter === cat
                      ? "bg-[#6C63FF] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="flex-1 p-4 max-w-7xl w-full mx-auto">

          {/* Messages */}
          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="flex-1 font-semibold text-emerald-800 text-sm">{success}</span>
              <button onClick={() => setSuccess("")}><X className="w-4 h-4 text-emerald-400" /></button>
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="flex-1 font-semibold text-red-800 text-sm">{error}</span>
              <button onClick={() => setError("")}><X className="w-4 h-4 text-red-400" /></button>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "إجمالي المنتجات", value: products.length, icon: <Boxes className="w-4 h-4" />, color: "text-[#6C63FF] bg-[#6C63FF]/10" },
              { label: "قيمة المخزون", value: products.reduce((s, p) => s + p.price * p.quantity, 0).toLocaleString("ar-EG") + " ج.م", icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-50" },
              { label: "مخزون منخفض", value: products.filter((p) => p.quantity < 5).length, icon: <AlertTriangle className="w-4 h-4" />, color: "text-orange-500 bg-orange-50" },
              { label: "في السلة", value: cartCount, icon: <ShoppingCart className="w-4 h-4" />, color: "text-pink-500 bg-pink-50" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${s.color}`}>{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 truncate">{s.label}</p>
                  <p className="font-black text-slate-900 text-sm">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
              <Loader2 className="h-10 w-10 animate-spin text-[#6C63FF] mb-3" />
              <p className="text-slate-400 font-bold text-sm">جاري تحميل المنتجات...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Package className="w-14 h-14 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-400 mb-2">لا توجد منتجات</h3>
              <button onClick={openAddProduct}
                className="bg-[#6C63FF] text-white px-5 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 mt-2 shadow-md hover:bg-[#5A55E6] transition">
                <Plus className="w-4 h-4" /> أضف منتجاً
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((p, i) => {
                const inCart = cart.find((c) => c.product.id === p.id)
                const lowStock = p.quantity < 5
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow card-appear group"
                    style={{ animationDelay: `${i * 20}ms` }}>
                    {/* Card header */}
                    <div className="p-4 pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 text-sm truncate">{p.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {p.category && (
                              <span className="px-2 py-0.5 bg-[#6C63FF]/10 text-[#6C63FF] text-xs rounded-lg font-bold">
                                {p.category}
                              </span>
                            )}
                            {p.sku && (
                              <span className="text-xs text-slate-400 font-mono">#{p.sku}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                          <button onClick={() => openEditProduct(p)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg transition">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div>
                          <p className="text-xl font-black text-[#6C63FF]">
                            {p.price.toLocaleString("ar-EG")}
                            <span className="text-xs font-semibold text-slate-400 mr-1">ج.م</span>
                          </p>
                          {p.cost_price != null && p.cost_price > 0 && (
                            <p className="text-xs text-slate-400">
                              التكلفة: {p.cost_price.toLocaleString("ar-EG")} ج.م
                            </p>
                          )}
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-black ${lowStock ? "text-red-500" : "text-emerald-600"}`}>
                            {p.quantity} {p.unit ?? ""}
                          </p>
                          {lowStock && (
                            <p className="text-xs text-red-400 font-semibold">مخزون منخفض!</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to cart */}
                    {inCart ? (
                      <div className="px-3 pb-3 flex items-center gap-2">
                        <div className="flex-1 flex items-center justify-between bg-[#6C63FF]/10 rounded-xl px-3 py-1.5">
                          <button onClick={() => updateQty(p.id, -1)}
                            className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-[#6C63FF] hover:text-white transition">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-[#6C63FF] text-sm">{inCart.qty}</span>
                          <button onClick={() => updateQty(p.id, 1)}
                            className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-[#6C63FF] hover:text-white transition">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(p.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-400 rounded-xl transition">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)}
                        disabled={p.quantity === 0}
                        className="w-full py-2.5 bg-[#6C63FF]/8 hover:bg-[#6C63FF] text-[#6C63FF] hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed border-t border-slate-100">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {p.quantity === 0 ? "نفد المخزون" : "أضف للسلة"}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════
          CART MODAL
      ════════════════════════════ */}
      <Modal open={showCart} onClose={() => setShowCart(false)} maxW="max-w-2xl" noPad>
        <div className="flex flex-col max-h-[94vh]">
          {/* Cart header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">🛒 سلة المشتريات</h2>
              <p className="text-xs text-slate-400 mt-0.5">{cartCount} منتج في السلة</p>
            </div>
            <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-100 rounded-xl transition">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Invoice type toggle */}
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2">نوع الفاتورة</label>
              <div className="flex gap-2">
                <button onClick={() => { setInvoiceType("sale"); setSelectedAccount(null); setAccountSearch("") }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    invoiceType === "sale" ? "bg-[#6C63FF] text-white shadow-md" : "border-2 border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}>
                  <ShoppingBag className="w-4 h-4" /> فاتورة بيع
                </button>
                <button onClick={() => { setInvoiceType("purchase"); setSelectedAccount(null); setAccountSearch("") }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    invoiceType === "purchase" ? "bg-orange-500 text-white shadow-md" : "border-2 border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}>
                  <Factory className="w-4 h-4" /> فاتورة شراء
                </button>
              </div>
            </div>

            {/* Account selector */}
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2">
                {invoiceType === "sale" ? "العميل (اختياري)" : "المورد (اختياري)"}
              </label>
              {selectedAccount ? (
                <div className="flex items-center gap-3 p-3 bg-[#6C63FF]/8 border border-[#6C63FF]/20 rounded-xl">
                  <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-xs">{selectedAccount.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{selectedAccount.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{selectedAccount.account_number}</p>
                  </div>
                  <button onClick={() => { setSelectedAccount(null); setAccountSearch("") }}
                    className="p-1 hover:bg-red-50 rounded-lg transition">
                    <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input value={accountSearch} onChange={(e) => setAccountSearch(e.target.value)}
                      placeholder={`ابحث عن ${invoiceType === "sale" ? "عميل" : "مورد"}...`}
                      className="w-full pr-9 pl-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#6C63FF] outline-none bg-slate-50 focus:bg-white transition" />
                  </div>
                  {accountSearch && filteredAccounts.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-40 overflow-y-auto">
                      {filteredAccounts.slice(0, 5).map((a) => (
                        <button key={a.id} onClick={() => { setSelectedAccount(a); setAccountSearch("") }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition text-right border-b border-slate-100 last:border-0">
                          <div className="w-7 h-7 bg-[#6C63FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-[#6C63FF] font-black text-xs">{a.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">{a.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{a.account_number}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart items */}
            {cart.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold text-sm">السلة فارغة</p>
                <p className="text-slate-300 text-xs mt-1">أضف منتجات من القائمة</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2">المنتجات ({cart.length})</label>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-9 h-9 bg-[#6C63FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-[#6C63FF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{item.product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Qty control */}
                          <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 px-1.5 py-0.5">
                            <button onClick={() => updateQty(item.product.id, -1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded transition">
                              <Minus className="w-3 h-3 text-slate-500" />
                            </button>
                            <span className="text-sm font-black text-slate-800 px-1 min-w-[20px] text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.product.id, 1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded transition">
                              <Plus className="w-3 h-3 text-slate-500" />
                            </button>
                          </div>
                          {/* Price edit */}
                          <div className="flex items-center gap-1">
                            <input type="number"
                              value={item.unit_price}
                              onChange={(e) => updatePrice(item.product.id, Number(e.target.value))}
                              className="w-20 text-xs font-bold text-center border border-slate-200 rounded-lg py-0.5 px-1.5 focus:border-[#6C63FF] outline-none bg-white"
                            />
                            <span className="text-xs text-slate-400">ج.م</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="font-black text-[#6C63FF] text-sm">
                          {(item.qty * item.unit_price).toLocaleString("ar-EG")}
                          <span className="text-xs font-normal text-slate-400 mr-0.5">ج.م</span>
                        </p>
                        <button onClick={() => removeFromCart(item.product.id)}
                          className="text-xs text-red-400 hover:text-red-600 mt-0.5 flex items-center gap-0.5 transition">
                          <X className="w-3 h-3" /> حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discount + notes */}
            {cart.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">الخصم (ج.م)</label>
                  <input type="number" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">ملاحظات</label>
                  <input value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="اختياري" className={inputCls} />
                </div>
              </div>
            )}
          </div>

          {/* Cart footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl space-y-3">
              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع:</span>
                  <span className="font-bold">{cartTotal.toLocaleString("ar-EG")} ج.م</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>الخصم:</span>
                    <span className="font-bold">- {discount.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>الصافي:</span>
                  <span className="text-[#6C63FF]">{netTotal.toLocaleString("ar-EG")} ج.م</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button onClick={handleConfirmInvoice} disabled={cartLoading || cart.length === 0}
                  className="flex-1 bg-[#6C63FF] hover:bg-[#5A55E6] disabled:opacity-40 text-white py-3 rounded-xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2">
                  {cartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> تأكيد الفاتورة</>}
                </button>
                <button onClick={clearCart}
                  className="px-4 py-3 border-2 border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 rounded-xl font-bold text-sm transition-all flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> إفراغ
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ════════════════════════════
          INVOICE SUCCESS MODAL
      ════════════════════════════ */}
      <Modal open={showInvoiceSuccess} onClose={() => { setShowInvoiceSuccess(false); setShowCart(false); clearCart() }} maxW="max-w-sm">
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">تم تأكيد الفاتورة! 🎉</h2>
          <p className="text-sm text-slate-500 mb-1">رقم الفاتورة:</p>
          <p className="font-mono font-black text-[#6C63FF] text-lg mb-4">{lastInvoiceNum}</p>
          <p className="text-xs text-slate-400 mb-5 bg-slate-50 rounded-xl p-3">
            ✅ تم حفظ الفاتورة في قاعدة البيانات<br/>
            ✅ تم تحديث المخزون تلقائياً<br/>
            {selectedAccount && "✅ تم تحديث رصيد الحساب"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                printInvoice(cart, invoiceType, selectedAccount, lastInvoiceNum, store?.name ?? "المتجر", discount)
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition shadow-md">
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button
              onClick={() => { setShowInvoiceSuccess(false); setShowCart(false); clearCart() }}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition shadow-md">
              إغلاق
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════
          ADD / EDIT PRODUCT MODAL
      ════════════════════════════ */}
      <Modal open={showAddProduct} onClose={() => setShowAddProduct(false)}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">{editProduct ? "تعديل المنتج" : "منتج جديد"}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{editProduct ? `تعديل بيانات ${editProduct.name}` : "إضافة منتج للمخزون"}</p>
          </div>
          <button onClick={() => setShowAddProduct(false)} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-black text-slate-500 mb-1.5">اسم المنتج *</label>
            <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="مثال: شاي أحمر 500جم" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1.5">سعر البيع *</label>
              <input type="number" value={pPrice || ""} onChange={(e) => setPPrice(Number(e.target.value))} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1.5">سعر التكلفة</label>
              <input type="number" value={pCost || ""} onChange={(e) => setPCost(Number(e.target.value))} placeholder="0" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1.5">الكمية</label>
              <input type="number" value={pQty || ""} onChange={(e) => setPQty(Number(e.target.value))} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1.5">الوحدة</label>
              <input value={pUnit} onChange={(e) => setPUnit(e.target.value)} placeholder="كجم / قطعة / علبة" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1.5">الفئة</label>
              <input value={pCat} onChange={(e) => setPCat(e.target.value)} placeholder="مثال: مواد غذائية" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1.5">كود المنتج (SKU)</label>
              <input value={pSku} onChange={(e) => setPSku(e.target.value)} placeholder="اختياري" className={inputCls} dir="ltr" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleSaveProduct} disabled={prodLoading || !pName.trim()}
              className="flex-1 bg-[#6C63FF] hover:bg-[#5A55E6] disabled:opacity-40 text-white py-3 rounded-xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2">
              {prodLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {editProduct ? "حفظ التعديلات" : "إضافة المنتج"}</>}
            </button>
            <button onClick={() => setShowAddProduct(false)}
              className="px-5 py-3 border-2 border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-600 transition">
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
>>>>>>> blackboxai-upload-all-changes
