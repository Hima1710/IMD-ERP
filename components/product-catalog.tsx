'use client'

import React, { useState } from 'react'
import { Plus, Star, X } from 'lucide-react'
import { Product, ProductFormData, toProductUI } from '@/lib/types'

interface ProductCatalogProps {
  products: Product[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onAddToCart: (productId: string) => void
  onAddProduct?: (product: ProductFormData) => Promise<Product | null>
  loading?: boolean
}

const categories = [
  { id: 'all', name: 'الكل', nameEn: 'All' },
  { id: 'دهانات', name: 'الدهانات', nameEn: 'Paints' },
  { id: 'أدوات', name: 'الأدوات', nameEn: 'Tools' },
  { id: 'ديكور', name: 'الديكور', nameEn: 'Decor' },
]

export function ProductCatalog({
  products,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  onAddProduct,
  loading = false,
}: ProductCatalogProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'دهانات',
    unit: 'قطعة',
    price_buy: 0,
    price_sell: 0,
    stock: 0,
    min_quantity: 10,
  })

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.price_sell <= 0) {
      alert('يرجى ملء اسم المنتج والسعر')
      return
    }

    if (onAddProduct) {
      const result = await onAddProduct(newProduct)
      if (result) {
        setShowAddModal(false)
        setNewProduct({
          name: '',
          category: 'دهانات',
          unit: 'قطعة',
          price_buy: 0,
          price_sell: 0,
          stock: 0,
          min_quantity: 10,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Product Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">المنتجات</h2>
        {onAddProduct && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج جديد
          </button>
        )}
      </div>

      {/* Products Grid - Show all products directly without category filtering */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500">جاري تحميل المنتجات...</p>
          </div>
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-lg">لا توجد منتجات متطابقة</p>
            <p className="text-slate-400 text-sm mt-2">
              <button onClick={() => setShowAddModal(true)} className="text-blue-600 underline">
                اضغط هنا لإضافة منتج جديد
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">إضافة منتج جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="دهان داخلي فاخر"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    سعر البيع (ج.م)
                  </label>
                  <input
                    type="number"
                    value={newProduct.price_sell}
                    onChange={(e) => setNewProduct({...newProduct, price_sell: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    سعر التكلفة (ج.م)
                  </label>
                  <input
                    type="number"
                    value={newProduct.price_buy}
                    onChange={(e) => setNewProduct({...newProduct, price_buy: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    الكمية *
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    الوحدة
                  </label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="قطعة">قطعة</option>
                    <option value="بستلة">بستلة</option>
                    <option value="كجم">كجم</option>
                    <option value="لتر">لتر</option>
                    <option value="متر">متر</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                إضافة المنتج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const displayProduct = toProductUI(product)
  const isOutOfStock = displayProduct.stock <= 0

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
        <div className="text-3xl">📦</div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold">غير متوفر</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{displayProduct.name}</h3>
          <p className="text-xs text-slate-500">{displayProduct.category}</p>
        </div>

        {/* Price & Stock */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{(displayProduct.price_sell || 0).toFixed(2)} ج.م</p>
            </div>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
              {displayProduct.stock} {displayProduct.unit}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors text-sm ${
            isOutOfStock
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة</span>
        </button>
      </div>
    </div>
  )
}

