'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Trash2, Plus, Minus, CreditCard, ReceiptText, X, Printer, CheckCircle, Search, UserPlus, ChevronDown } from 'lucide-react'
import { Product } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/hooks/use-store'
import Invoice from './Invoice'

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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [changeAmount, setChangeAmount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)
  
  // Customer selection state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' })
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [shopId, setShopId] = useState<string | null>(null)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { store: globalStore } = useStore()

  // Fetch customers when modal opens
  useEffect(() => {
    if (showPaymentModal && !customers.length) {
      fetchCustomers()
    }
  }, [showPaymentModal])

  // Filter customers based on search
  useEffect(() => {
    if (!customerSearch.trim()) {
      setFilteredCustomers(customers)
    } else {
      const term = customerSearch.toLowerCase()
      setFilteredCustomers(customers.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.phone?.toLowerCase().includes(term)
      ))
    }
  }, [customerSearch, customers])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchCustomers = async () => {
    if (!supabase) return
    
    try {
      setLoadingCustomers(true)
      
      // Get user and store_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single()

      if (!profile?.shop_id) return
      setShopId(profile.shop_id)

      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .eq('shop_id', profile.shop_id)
        .order('name', { ascending: true })

      setCustomers(customersData || [])
      setFilteredCustomers(customersData || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name)
    setShowCustomerDropdown(false)
  }

  const handleAddNewCustomer = async () => {
    if (!newCustomer.name.trim() || !shopId || !supabase) {
      alert('يرجى إدخال اسم العميل')
      return
    }

    try {
      setSavingCustomer(true)
      
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          shop_id: shopId,
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim(),
          address: newCustomer.address.trim()
        }])
        .select()
        .single()

      if (error) {
        alert('خطأ في إضافة العميل: ' + error.message)
        return
      }

      const updatedCustomers = [...customers, data].sort((a, b) => a.name.localeCompare(b.name))
      setCustomers(updatedCustomers)
      setFilteredCustomers(updatedCustomers)
      setSelectedCustomer(data)
      setCustomerSearch(data.name)
      setShowAddCustomerModal(false)
      setNewCustomer({ name: '', phone: '', address: '' })
      alert('تم إضافة العميل بنجاح')
    } catch (error) {
      console.error('Error adding customer:', error)
      alert('حدث خطأ في إضافة العميل')
    } finally {
      setSavingCustomer(false)
    }
  }

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
    return cartProducts.reduce((sum, item) => sum + (item.price_sell || 0) * item.cartQuantity, 0)
  }, [cartProducts])

  const discountAmount = subtotal * (discountPercent / 100)
  const total = subtotal - discountAmount
  const remainingAmount = Math.max(0, total - amountPaid)

  const handlePaymentMethodChange = (method: 'cash' | 'card') => {
    setPaymentMethod(method)
    if (method === 'cash') {
      setAmountPaid(total)
      setChangeAmount(0)
    } else {
      setAmountPaid(total)
      setChangeAmount(0)
    }
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
    setLastSale(null)
  }

  const printReceipt = () => {
    window.print()
  }

  const processPayment = async () => {
    // Validation: Credit payment requires customer
    if (paymentMethod === 'card' && !selectedCustomer) {
      alert('يرجى اختيار عميل للدفع بالبطاقة (آجل)!')
      return
    }

    if (paymentMethod === 'cash' && amountPaid < total) {
      alert('المبلغ المدفوع أقل من الإجمالي!')
      return
    }

    setIsProcessing(true)
    const supabaseClient = supabase

    try {
      // Get store info
      let storeName = globalStore.name || 'متجر الدهانات'
      
      if (!supabaseClient) {
        setLastSale({
          saleId: 'LOCAL-' + Date.now(),
          items: cartProducts.map(item => ({
            name: item.name,
            quantity: item.cartQuantity,
            price: item.price_sell,
            total: (item.price_sell || 0) * item.cartQuantity,
          })),
          subtotal,
          discountAmount,
          total,
          paymentMethod,
          amountPaid,
          changeAmount,
          remainingAmount: Math.max(0, total - amountPaid),
          date: new Date().toLocaleString('ar-EG'),
          customerName: selectedCustomer?.name,
          customerPhone: selectedCustomer?.phone,
          storeName: storeName,
        })
        setShowPaymentModal(false)
        setShowInvoice(true)
        setIsProcessing(false)
        return
      }

      const saleItems = cartProducts.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.cartQuantity,
        unit_price: item.price_sell,
        total_price: (item.price_sell || 0) * item.cartQuantity,
      }))

      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        alert('الرجاء تسجيل الدخول أولاً')
        setIsProcessing(false)
        return
      }

      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single()

      if (!profile?.shop_id) {
        alert('System Error: No shop linked to this user.')
        setIsProcessing(false)
        return
      }

      // Get shop name
      const { data: shopData } = await supabaseClient
        .from('shops')
        .select('name')
        .eq('id', profile.shop_id)
        .single()
      
      if (shopData?.name) {
        storeName = shopData.name
      }

      const finalAmount = Number(total)
      const paid = Number(amountPaid || 0)
      const remaining = finalAmount - paid

      const { data: saleData, error: saleError } = await supabaseClient
        .from('transactions')
        .insert([{
          total_amount: finalAmount,
          amount_paid: paid,
          remaining_amount: remaining,
          final_amount: finalAmount,
          discount_amount: Number(discountAmount),
          payment_method: paymentMethod,
          change_amount: Number(changeAmount),
          customer_id: selectedCustomer?.id || null,
          items: saleItems,
          sale_date: new Date().toISOString(),
          shop_id: profile.shop_id,
        }])
        .select()

      if (saleError) {
        console.error('Error saving sale:', saleError)
        alert('خطأ في حفظ الفاتورة: ' + saleError.message)
        setIsProcessing(false)
        return
      }

      const newSaleId = saleData?.[0]?.id || null

      for (const item of cartProducts) {
        const newStock = (item.stock || 0) - item.cartQuantity
        await supabaseClient
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.id)
      }

      setLastSale({
        saleId: newSaleId,
        items: cartProducts.map(item => ({
          name: item.name,
          quantity: item.cartQuantity,
          price: item.price_sell,
          total: (item.price_sell || 0) * item.cartQuantity,
        })),
        subtotal,
        discountAmount,
        total,
        paymentMethod,
        amountPaid,
        changeAmount,
        remainingAmount: remaining,
        date: new Date().toLocaleString('ar-EG'),
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        storeName: storeName,
      })

      setCurrentSaleId(newSaleId)
      setShowPaymentModal(false)
      setShowInvoice(true)

    } catch (error) {
      console.error('Payment error:', error)
      alert('حدث خطأ في processPayment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShowReceipt = () => {
    let storeName = globalStore.name || 'متجر الدهانات'
    
    setLastSale({
      saleId: null,
      items: cartProducts.map(item => ({
        name: item.name,
        quantity: item.cartQuantity,
        price: item.price_sell,
        total: (item.price_sell || 0) * item.cartQuantity,
      })),
      subtotal,
      discountAmount,
      total,
      paymentMethod,
      amountPaid,
      changeAmount,
      remainingAmount: Math.max(0, total - amountPaid),
      date: new Date().toLocaleString('ar-EG'),
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      storeName: storeName,
    })
    setShowReceiptModal(true)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="flex items-center gap-2 mb-1">
          <ReceiptText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">سلة المشتريات</h2>
        </div>
        <p className="text-xs text-slate-500">{cartItems.length} منتج</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {cartProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4">
            <ReceiptText className="w-12 h-12 text-slate-300 mb-2" />
            <p className="text-slate-500 text-center text-sm">السلة فارغة</p>
            <p className="text-slate-400 text-xs text-center mt-1">أضف منتجات لتبدأ</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {cartProducts.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onQuantityChange={(qty) => onUpdateQuantity(item.id, qty)}
                onRemove={() => onUpdateQuantity(item.id, 0)}
              />
            ))}
          </div>
        )}
      </div>

      {cartProducts.length > 0 && (
        <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">المجموع:</span>
            <span className="font-semibold text-slate-900">{subtotal.toFixed(2)} ج.م</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <label className="text-slate-600">خصم %:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => onDiscountChange(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
              />
            </div>
            {discountAmount > 0 && (
              <span className="font-semibold text-red-600">-{discountAmount.toFixed(2)} ج.م</span>
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between bg-white px-2 py-2 rounded">
            <span className="font-bold text-slate-900">الإجمالي:</span>
            <span className="text-xl font-bold text-blue-600">{total.toFixed(2)} ج.م</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => { setAmountPaid(total); setShowPaymentModal(true); }}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <CreditCard className="w-4 h-4" />
              دفع
            </button>
            <button
              onClick={handleShowReceipt}
              className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <ReceiptText className="w-4 h-4" />
              إيصال
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">الدفع</h3>
              <button onClick={() => { setShowPaymentModal(false); setSelectedCustomer(null); setCustomerSearch(''); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                اختر العميل <span className="text-slate-400 text-xs">(اختياري للدفع النقدي - مطلوب للدفع بالبطاقة)</span>
              </label>
              
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      setSelectedCustomer(null)
                      setShowCustomerDropdown(true)
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="ابحث عن عميل..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Dropdown */}
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {loadingCustomers ? (
                      <div className="p-3 text-center text-slate-500 text-sm">جاري تحميل العملاء...</div>
                    ) : filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                        <button
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className="w-full text-right px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                        >
                          <p className="font-medium text-slate-900 text-sm">{customer.name}</p>
                          {customer.phone && <p className="text-xs text-slate-500">{customer.phone}</p>}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-slate-500 text-sm">لا توجد نتائج</div>
                    )}
                    
                    {/* Add New Customer Button */}
                    <button
                      onClick={() => {
                        setShowCustomerDropdown(false)
                        setShowAddCustomerModal(true)
                      }}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 border-t border-slate-200"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="text-sm font-medium">إضافة عميل جديد</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Selected Customer Badge */}
              {selectedCustomer && (
                <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-sm text-green-700">✓ {selectedCustomer.name}</span>
                  {selectedCustomer.phone && <span className="text-xs text-green-600">- {selectedCustomer.phone}</span>}
                  <button 
                    onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}
                    className="mr-auto text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4 text-center">
              <p className="text-sm text-slate-600">المبلغ الإجمالي</p>
              <p className="text-3xl font-bold text-blue-600">{total.toFixed(2)} ج.م</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">طريقة الدفع</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePaymentMethodChange('cash')}
                  className={"py-3 rounded-lg font-medium transition-colors " + (paymentMethod === 'cash' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}
                >
                  نقدي
                </button>
                <button
                  onClick={() => handlePaymentMethodChange('card')}
                  className={"py-3 rounded-lg font-medium transition-colors " + (paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}
                >
                  بطاقة (آجل)
                </button>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ المدفوع</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => handleAmountPaidChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg text-center"
                  min="0"
                  step="0.01"
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[total, total * 2, total * 5, 100].map((amount) => (
                    <button
                      key={`amount-${Math.ceil(amount)}`}
                      onClick={() => handleAmountPaidChange(Number(amount))}
                      className="px-2 py-1 bg-slate-100 rounded text-sm hover:bg-slate-200"
                    >
                      {Math.ceil(amount)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="mb-4 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-sm text-green-700">الباقي</p>
                <p className="text-2xl font-bold text-green-600">{changeAmount.toFixed(2)} ج.م</p>
              </div>
            )}

            <button
              onClick={processPayment}
              disabled={isProcessing || (paymentMethod === 'cash' && amountPaid < total)}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {isProcessing ? 'جاري المعالجة...' : 'دفع ' + total.toFixed(2) + ' ج.م'}
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">إضافة عميل جديد</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="اسم العميل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="رقم الهاتف"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
                  placeholder="العنوان"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddNewCustomer}
                disabled={savingCustomer}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
              >
                {savingCustomer ? 'جاري...' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoice && lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">ايصال الفاتورة</h3>
              {currentSaleId && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  #{currentSaleId.slice(0, 8)}
                </span>
              )}
            </div>

            <Invoice
              onClose={handleCloseInvoice}
              items={lastSale.items}
              subtotal={lastSale.subtotal}
              discountAmount={lastSale.discountAmount}
              total={lastSale.total}
              paymentMethod={lastSale.paymentMethod}
              amountPaid={lastSale.amountPaid}
              changeAmount={lastSale.changeAmount}
              date={lastSale.date}
              invoiceId={lastSale.saleId}
              customerName={lastSale.customerName}
              customerPhone={lastSale.customerPhone}
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={printReceipt}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </button>
              <button
                onClick={handleCloseInvoice}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                تم
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">ايصال بيع</h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <Invoice
              onClose={() => setShowReceiptModal(false)}
              items={lastSale.items}
              subtotal={lastSale.subtotal}
              discountAmount={lastSale.discountAmount}
              total={lastSale.total}
              paymentMethod={lastSale.paymentMethod}
              amountPaid={lastSale.amountPaid}
              changeAmount={lastSale.changeAmount}
              date={lastSale.date}
              invoiceId={lastSale.saleId}
              customerName={lastSale.customerName}
              customerPhone={lastSale.customerPhone}
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={printReceipt}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </button>
              <button
                onClick={() => { setShowReceiptModal(false); setSelectedCustomer(null); setCustomerSearch(''); }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface CartItemRowProps {
  item: Product & { cartQuantity: number }
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const itemTotal = (item.price_sell || 0) * item.cartQuantity

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-sm text-slate-900 line-clamp-1">{item.name}</p>
          <p className="text-xs text-slate-500">{(item.price_sell || 0).toFixed(2)} ج.م</p>
        </div>
        <button onClick={onRemove} className="text-slate-400 hover:text-red-600 transition-colors p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center border border-slate-200 rounded-lg">
          <button onClick={() => onQuantityChange(item.cartQuantity - 1)} className="px-2 py-1 text-slate-600 hover:bg-slate-100">
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-3 py-1 text-sm font-semibold text-slate-900 min-w-[40px] text-center">{item.cartQuantity}</span>
          <button onClick={() => onQuantityChange(item.cartQuantity + 1)} className="px-2 py-1 text-slate-600 hover:bg-slate-100">
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <span className="font-bold text-slate-900">{itemTotal.toFixed(2)} ج.م</span>
      </div>
    </div>
  )
}

