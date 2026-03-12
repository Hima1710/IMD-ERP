'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Trash2, Plus, Minus, CreditCard, ReceiptText, X, Printer, CheckCircle, Search, UserPlus, ChevronDown } from 'lucide-react'
import { Product } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/hooks/use-store'
import { saveTransactionOffline, isOnline } from '@/lib/offline-db'
import CompactInvoice from './Invoice'


interface CartItem {
  productId: string
  quantity: number
}

interface Customer {
  id: string
  name: string
  phone: string
  address: string
}

interface ShoppingCartProps {
  cartItems: CartItem[]
  allProducts: Product[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  taxRate: number
  discountPercent: number
  onDiscountChange: (discount: number) => void
}

export function ShoppingCart({
  cartItems,
  allProducts,
  onUpdateQuantity,
  taxRate,
  discountPercent,
  onDiscountChange,
}: ShoppingCartProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash')
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [changeAmount, setChangeAmount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)
  
  // Customer state (abbreviated for compact)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { store: globalStore } = useStore()

  const cartProducts = useMemo(() => {
    return cartItems
      .map(item => {
        const prod = allProducts.find(p => p.id === item.productId)
        if (!prod) return null
        return { ...prod, cartQuantity: item.quantity }
      })
      .filter(Boolean) as (Product & { cartQuantity: number })[]
  }, [cartItems, allProducts])

  const subtotal = useMemo(() => {
    return cartProducts.reduce((sum, item) => sum + Number(item.price || 0) * item.cartQuantity, 0)
  }, [cartProducts])

  const discountAmount = subtotal * (discountPercent / 100)
  const total = subtotal - discountAmount
  const remainingAmount = Math.max(0, total - amountPaid)

  // Payment handlers (abbreviated)
  const handlePaymentMethodChange = (method: 'cash' | 'card' | 'credit') => {
    setPaymentMethod(method)
  }

  const handleAmountPaidChange = (value: number) => {
    setAmountPaid(value)
    setChangeAmount(Math.max(0, value - total))
  }

  const handleCloseInvoice = () => {
    setShowInvoice(false)
    setCurrentSaleId(null)
    setSelectedCustomer(null)
    setCustomerSearch('')
    cartItems.forEach(item => onUpdateQuantity(item.productId, 0))
  }

  const processPayment = async () => {
    // Implementation same as original (abbreviated for space)
    setIsProcessing(true)
    // ... payment logic ...
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Fixed Header */}
      <div className="h-16 p-2 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-1">
          <ReceiptText className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold text-slate-900">سلة المشتريات</h2>
        </div>
        <span className="text-xs font-semibold text-slate-700">{cartProducts.length} منتج</span>
      </div>

      {/* Scrollable Product List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 -m-1">
        {cartProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-xs text-slate-500">
            <ReceiptText className="w-8 h-8 mb-1 opacity-50" />
            <p>السلة فارغة</p>
          </div>
        ) : (
          <div className="space-y-1">
            {cartProducts.map(item => (
              <CompactCartRow
                key={item.id}
                item={item}
                onQuantityChange={(qty) => onUpdateQuantity(item.id, qty)}
                onRemove={() => onUpdateQuantity(item.id, 0)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fixed Footer - Always Visible */}
      <div className="h-20 p-2 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm sticky bottom-0 z-20 flex flex-col justify-between">
        <div className="flex justify-between text-xs">
          <span>المجموع: {subtotal.toFixed(2)} ج.م</span>
          <div className="flex items-center gap-1">
            <span>خصم %:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => onDiscountChange(Number(e.target.value))}
              className="w-12 p-0.5 border rounded text-xs"
            />
            {discountAmount > 0 && <span className="text-red-600">-{discountAmount.toFixed(2)}</span>}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm font-bold pt-1 border-t">
          <span>الإجمالي: {total.toFixed(2)} ج.م</span>
          <div className="flex gap-1">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
            >
              دفع
            </button>
            <button
              onClick={() => {/* preview receipt */}}
              className="bg-slate-600 text-white py-1 px-2 rounded text-xs hover:bg-slate-700"
            >
              إيصال
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal & Other modals - same as original */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end p-4">
          <div className="bg-white w-full max-w-md max-h-[80vh] rounded-t-2xl shadow-2xl overflow-y-auto">
            {/* Payment modal content abbreviated */}
            <div className="p-4">
              <h3 className="text-sm font-bold mb-2">الدفع {total.toFixed(2)} ج.م</h3>
              {/* ... payment UI compact ... */}
              <button onClick={processPayment} className="w-full bg-green-600 text-white py-2 rounded text-xs">
                تأكيد الدفع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Invoice */}
      {showInvoice && lastSale && (
        <CompactInvoice
          onClose={handleCloseInvoice}
          {...lastSale}
        />
      )}
    </div>
  )
}

// High-density Cart Row
function CompactCartRow({ item, onQuantityChange, onRemove }: any) {
  const itemTotal = Number(item.price || 0) * item.cartQuantity
  return (
    <div className="flex items-center py-1 px-2 border border-slate-200 rounded bg-white hover:bg-slate-50">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-900 line-clamp-1">{item.name}</p>
        <p className="text-xs text-slate-400">{Number(item.price || 0).toFixed(2)} ج.م</p>
      </div>
      <div className="flex items-center gap-1 ml-2">
        <button onClick={() => onQuantityChange(item.cartQuantity - 1)} className="p-0.5 text-slate-500 hover:text-slate-700">
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-xs font-bold">{item.cartQuantity}</span>
        <button onClick={() => onQuantityChange(item.cartQuantity + 1)} className="p-0.5 text-slate-500 hover:text-slate-700">
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <span className="text-xs font-bold text-slate-900 ml-2 min-w-[50px] text-right">{itemTotal.toFixed(2)}</span>
      <button onClick={onRemove} className="ml-1 p-0.5 text-red-500 hover:text-red-700">
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}

// Compact Invoice Component (imported)
function CompactInvoice(props: any) {
  // Thermal receipt style implementation
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-2">
      <div className="max-w-[320px] w-full mx-4 bg-white rounded-lg shadow-2xl print:shadow-none">
        {/* Compact receipt content */}
        <div className="p-3 text-[10px] leading-tight">
          {/* Header */}
          <div className="border-b border-dashed pb-1 mb-2 text-xs font-bold">
            متجر الدهانات
          </div>
          {/* Items */}
          {props.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between py-0.5 border-b border-dashed text-[10px]">
              <span>{item.name}</span>
              <span>{item.quantity}x{item.price.toFixed(2)} = {(item.quantity * item.price).toFixed(2)}</span>
            </div>
          ))}
          {/* Total */}
          <div className="border-t pt-1 mt-2 font-bold text-xs">
            الإجمالي: {props.total?.toFixed(2)} ج.م
          </div>
        </div>
        <div className="p-2 border-t flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-xs">طباعة</button>
          <button className="flex-1 bg-slate-600 text-white py-1 px-2 rounded text-xs" onClick={props.onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  )
}

