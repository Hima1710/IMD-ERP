'use client'

import React, { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/BottomNav"
import { MobileNav, FloatingMenuButton } from "@/components/MobileNav"
import { supabase } from "@/lib/supabase"
import { useStore } from "@/hooks/use-store"
import type { Product } from "@/lib/types"
import { 
  Users, Loader2, Menu, DollarSign, Package, Trash2, Plus, X, Check, AlertTriangle, Search,
  Edit3 as Edit, FileText, Phone, MapPin
} from "lucide-react"

type Account = {
  id: string
  shop_id: string
  name: string
  phone?: string | null
  address?: string | null
  account_number: string
  total_debt: number
  status: 'active' | 'suspended'
  category?: 'Regular' | 'VIP'
  type: 'customer' | 'supplier'
}

export default function CustomersPage() {
  const { store, isLoaded } = useStore()
  
  // All states
  const [mounted, setMounted] = useState(false)
  const [shopId, setShopId] = useState('')
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Account[]>([])
  const [suppliers, setSuppliers] = useState<Account[]>([])
  const [currentAccounts, setCurrentAccounts] = useState<Account[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([])
  const [customerDebtSum, setCustomerDebtSum] = useState(0)
  const [supplierDebtSum, setSupplierDebtSum] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers')
  const [error, setError] = useState('')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
  
  // Form states
  const [addType, setAddType] = useState<'customer' | 'supplier'>('customer')
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newDebt, setNewDebt] = useState(0)
  const [newCategory, setNewCategory] = useState<'Regular' | 'VIP'>('Regular')
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentDesc, setPaymentDesc] = useState('')
  
  // Stock states
  const [modalProducts, setModalProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [stockSearch, setStockSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [stockQuantity, setStockQuantity] = useState(0)
  const [stockPrice, setStockPrice] = useState(0)
  const [stockType, setStockType] = useState<'incoming' | 'return'>('incoming')
  const [stockDesc, setStockDesc] = useState('')
  
  const [actionLoading, setActionLoading] = useState(false)

  // Effects - SAFE from setState warnings
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isLoaded && store?.id) {
      fetchAccounts()
    }
  }, [isLoaded, store?.id])

  useEffect(() => {
    const list = activeTab === 'customers' ? customers : suppliers
    setCurrentAccounts(list)
  }, [activeTab, customers, suppliers])

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase()
    setFilteredAccounts(currentAccounts.filter(account =>
      account.name.toLowerCase().includes(lowerSearch) ||
      account.account_number.includes(searchTerm) ||
      account.phone?.includes(searchTerm)
    ))
  }, [searchTerm, currentAccounts])

  useEffect(() => {
    const term = stockSearch.toLowerCase()
    setFilteredProducts(modalProducts.filter(product =>
      product.name.toLowerCase().includes(term) ||
      (product.category && product.category.toLowerCase().includes(term))
    ))
  }, [stockSearch, modalProducts])

  // Memoized functions
  const fetchAccounts = useCallback(async () => {
    if (!store.id) return
    
    setLoading(true)
    setError('')
    try {
      const [custRes, suppRes] = await Promise.all([
        supabase.from('customers').select('*').eq('shop_id', store.id).order('name'),
        supabase.from('suppliers').select('*').eq('shop_id', store.id).order('name')
      ])

      if (custRes.error) throw custRes.error
      if (suppRes.error) throw suppRes.error

      const mappedCustomers = (custRes.data || []).map(c => ({ 
        ...c, 
        type: 'customer' as const 
      })) as Account[]

      const mappedSuppliers = (suppRes.data || []).map(s => ({ 
        ...s, 
        type: 'supplier' as const 
      })) as Account[]

      setCustomers(mappedCustomers)
      setSuppliers(mappedSuppliers)

      const custDebt = mappedCustomers.reduce((sum, c) => sum + Number(c.total_debt || 0), 0)
      const suppDebt = mappedSuppliers.reduce((sum, s) => sum + Number(s.total_debt || 0), 0)
      
      setCustomerDebtSum(custDebt)
      setSupplierDebtSum(suppDebt)
      setShopId(store.id)
    } catch (error: any) {
      setError(`خطأ في تحميل الحسابات: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [store.id])

  const generateAccountNumber = useCallback(() => {
    const prefix = addType === 'customer' ? 'CUST' : 'SUPP'
    return `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
  }, [addType])

  // ADD ACCOUNT
  const handleAddAccount = useCallback(async () => {
    if (!newName.trim()) {
      setError('الاسم مطلوب')
      return
    }

    setActionLoading(true)
    try {
      const accountNumber = generateAccountNumber()
      const basePayload = {
        shop_id: shopId,
        name: newName.trim(),
        phone: newPhone.trim() || null,
        address: newAddress.trim() || null,
        account_number: accountNumber,
        total_debt: Number(newDebt),
        status: 'active' as const
      }

      const payload = addType === 'customer' 
        ? { ...basePayload, category: newCategory }
        : basePayload

      const { error } = await supabase
        .from(`${addType}s`)
        .insert([payload])

      if (error) throw error

      setError('')
      resetAddForm()
      await fetchAccounts()
      setShowAddModal(false)
    } catch (error: any) {
      setError(`خطأ في الإضافة: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [newName, newPhone, newAddress, newDebt, newCategory, addType, shopId, generateAccountNumber])

  const resetAddForm = useCallback(() => {
    setNewName('')
    setNewPhone('')
    setNewAddress('')
    setNewDebt(0)
    setNewCategory('Regular')
  }, [])

  // DELETE
  const handleDeleteAccount = useCallback(async (account: Account) => {
    if (!confirm(`هل تريد حذف "${account.name}" نهائياً؟`)) return

    setActionLoading(true)
    try {
      await supabase
        .from(`${account.type}s`)
        .delete()
        .eq('id', account.id)

      await fetchAccounts()
    } catch (error: any) {
      setError(`خطأ في الحذف: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [])

  // PAYMENT
  const handlePayment = useCallback(async () => {
    if (!currentAccount || paymentAmount <= 0) return

    setActionLoading(true)
    try {
      const tableName = `${currentAccount.type}s`
      const newDebt = currentAccount.total_debt - paymentAmount

      // Update debt
      await supabase
        .from(tableName)
        .update({ total_debt: newDebt })
        .eq('id', currentAccount.id)

      // Ledger entry
      await supabase.from('account_ledger').insert({
        account_id: currentAccount.id,
        account_type: currentAccount.type,
        shop_id: shopId,
        transaction_type: 'payment',
        amount: paymentAmount,
        description: paymentDesc || `دفعة نقدية - ${new Date().toLocaleDateString('ar-SA')}`,
        balance_after: newDebt
      })

      setShowPaymentModal(false)
      setPaymentAmount(0)
      setPaymentDesc('')
      await fetchAccounts()
    } catch (error: any) {
      setError(`خطأ في الدفع: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [currentAccount, paymentAmount, paymentDesc, shopId])

  // STOCK
  const openStockModal = useCallback(async (account: Account) => {
    setCurrentAccount(account)
    setActionLoading(true)
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('name', { ascending: true })

      setModalProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error('Error fetching stock products:', error)
    }
    setShowStockModal(true)
    setActionLoading(false)
  }, [shopId])

  const handleStockTransaction = useCallback(async () => {
    if (!currentAccount || !selectedProduct || stockQuantity <= 0 || stockPrice <= 0) return

    setActionLoading(true)
    try {
      const { data, error } = await supabase.rpc('handle_supplier_stock_transaction', {
        p_shop_id: shopId,
        p_supplier_id: currentAccount.id,
        p_product_id: selectedProduct.id,
        p_quantity: stockQuantity,
        p_price: stockPrice,
        p_type: stockType,
        p_description: stockDesc
      })

      if (error) throw error

      const result = data as any
      if (!result.success) throw new Error(result.error || 'خطأ غير معروف')

      alert(
        `✅ تمت العملية بنجاح!\n\n` +
        `📦 المخزون الجديد: ${result.new_stock}\n` +
        `💰 دين المورد الجديد: ${result.new_debt?.toLocaleString('ar-SA')} ج.م`
      )

      setShowStockModal(false)
      await fetchAccounts()
    } catch (error: any) {
      setError(`خطأ في المخزون: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }, [currentAccount, selectedProduct, stockQuantity, stockPrice, stockType, stockDesc, shopId])

  const getStockTotal = useCallback(() => {
    return Number(stockQuantity) * Number(stockPrice)
  }, [stockQuantity, stockPrice])

  if (!mounted) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 text-slate-900" dir="rtl">
      {/* Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r-lg shadow-2xl z-40">
        <Sidebar selectedStore="customers" />
      </div>
      
      {/* Overlay for mobile sidebar */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-30 lg:hidden" />
      
      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b-lg shadow-xl p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <button className="p-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl hover:shadow-md transition-all">
              <Menu className="w-7 h-7" />
            </button>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text">
              الحسابات
            </h1>
            <div className="w-20" />
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 max-w-4xl bg-red-50 border-2 border-red-200 rounded-3xl p-6 shadow-lg animate-pulse">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-xl text-red-900 mb-2">خطأ!</h3>
                <p className="text-lg text-red-800 leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap ml-4 flex-shrink-0"
              >
                تم
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
          <div className="group p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl ring-4 ring-emerald-200/50">
                <Users className="w-12 h-12 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">مديونية العملاء</div>
                <div className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                  {customerDebtSum.toLocaleString('ar-SA')}
                </div>
                <div className="text-2xl font-bold text-emerald-700 mt-2">ج.م</div>
              </div>
            </div>
          </div>

          <div className="group p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl ring-4 ring-orange-200/50">
                <Users className="w-12 h-12 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-2">مديونية الموردين</div>
                <div className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                  {supplierDebtSum.toLocaleString('ar-SA')}
                </div>
                <div className="text-2xl font-bold text-orange-700 mt-2">ج.م</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl border-b-2 px-8 py-6">
          <div className="flex gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTab('customers')}
              className={`
                flex-1 p-6 rounded-3xl font-bold text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 group
                ${
                  activeTab === 'customers'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-indigo-500/50 scale-105 ring-4 ring-indigo-200/50'
                    : 'bg-white text-slate-700 border-2 border-indigo-200 hover:bg-indigo-50 hover:shadow-indigo-200 hover:scale-105 hover:border-indigo-300'
                }
              `}
            >
              <Users className="w-8 h-8 group-hover:scale-110 transition-transform" />
              العملاء ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`
                flex-1 p-6 rounded-3xl font-bold text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 group
                ${
                  activeTab === 'suppliers'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/50 scale-105 ring-4 ring-orange-200/50'
                    : 'bg-white text-slate-700 border-2 border-orange-200 hover:bg-orange-50 hover:shadow-orange-200 hover:scale-105 hover:border-orange-300'
                }
              `}
            >
              <Users className="w-8 h-8 group-hover:scale-110 transition-transform" />
              الموردين ({suppliers.length})
            </button>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="p-8 bg-white/50 backdrop-blur-sm border-b-2">
          <div className="flex gap-6 max-w-4xl mx-auto items-center">
            <div className="flex-1 relative max-w-2xl">
              <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 w-7 h-7 text-slate-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="🔍 البحث بالاسم، رقم الحساب، الهاتف..."
                className="w-full pr-16 pl-6 py-5 text-xl border-2 border-slate-200 rounded-3xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 shadow-xl bg-white/60 backdrop-blur-sm placeholder-slate-400 transition-all hover:shadow-lg"
              />
            </div>
            <button
              onClick={() => {
                setAddType(activeTab === 'customers' ? 'customer' : 'supplier')
                resetAddForm()
                setShowAddModal(true)
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-12 py-6 rounded-3xl shadow-2xl hover:shadow-3xl font-black text-xl flex items-center gap-4 transition-all duration-300 whitespace-nowrap"
            >
              <Plus className="w-7 h-7" />
              إضافة حساب جديد
            </button>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="flex-1 p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px] gap-8 p-12">
              <div className="animate-pulse">
                <Loader2 className="w-20 h-20 text-indigo-500 animate-spin" />
                <div className="text-2xl font-bold text-slate-500 mt-6">جاري تحميل الحسابات</div>
              </div>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-20 bg-white/50 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-dashed border-slate-200">
              <Users className="w-40 h-40 text-slate-300 mb-12 animate-bounce" />
              <h2 className="text-4xl font-black text-slate-400 mb-6">لا توجد حسابات</h2>
              <p className="text-xl text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">
                ابدأ بإضافة {activeTab === 'customers' ? 'عميل' : 'مورد'} جديد لإدارة حساباتك بسهولة وسرعة
              </p>
              <button 
                onClick={() => {
                  setAddType(activeTab === 'customers' ? 'customer' : 'supplier')
                  setShowAddModal(true)
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-16 py-6 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-4"
              >
                <Plus className="w-8 h-8" />
                إضافة أول {activeTab === 'customers' ? 'عميل' : 'مورد'}
              </button>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-b from-white to-slate-50">
                    <tr>
                      <th className="p-8 text-lg font-black text-slate-800 text-right pr-8">رقم الحساب</th>
                      <th className="p-8 text-lg font-black text-slate-800 text-right">الاسم الكامل</th>
                      <th className="p-8 text-lg font-black text-slate-800 text-right pr-8">الهاتف</th>
                      <th className="p-8 text-lg font-black text-slate-800 text-right pr-12">الرصيد الحالي</th>
                      <th className="p-8 text-lg font-black text-slate-800 text-center pr-8">الحالة</th>
                      <th className="p-8 text-lg font-black text-slate-800 text-left pl-8">العمليات السريعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAccounts.map((account, index) => (
                      <tr 
                        key={account.id} 
                        className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 group transition-all duration-300 border-b-2 border-slate-100"
                      >
                        <td className="p-8 font-mono text-lg font-bold text-slate-900 text-right pr-8 group-hover:text-indigo-700">
                          {account.account_number}
                        </td>
                        <td className="p-8">
                          <div className="text-xl font-black text-slate-900 group-hover:text-slate-800">{account.name}</div>
                          {account.category && (
                            <span className="ml-4 inline-flex px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm font-bold rounded-xl shadow-md mt-2">
                              {account.category === 'VIP' ? '⭐ مميز' : 'عادي'}
                            </span>
                          )}
                        </td>
                        <td className="p-8 text-lg font-semibold text-slate-700 pr-8">
                          {account.phone || <span className="text-slate-400 italic">لم يُحدد</span>}
                        </td>
                        <td className="p-8 text-right pr-12">
                          <div className={`text-3xl font-black ${
                            account.total_debt > 5000 ? 'text-orange-600' : 
                            account.total_debt > 0 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {account.total_debt.toLocaleString('ar-SA')}
                          </div>
                          <div className="text-lg font-bold text-slate-500 mt-1">ج.م</div>
                        </td>
                        <td className="p-8 text-center pr-8">
                          <span className={`inline-flex px-6 py-3 rounded-2xl text-lg font-bold shadow-lg transform transition-all ${
                            account.status === 'suspended'
                              ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-300 hover:scale-105 hover:shadow-red-400 hover:-rotate-3'
                              : 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-emerald-300 hover:scale-105 hover:shadow-emerald-400 hover:rotate-3'
                          }`}>
                            {account.status === 'suspended' ? '🚫 موقوف' : '✅ نشط'}
                          </span>
                        </td>
                        <td className="p-8 pl-8">
                          <div className="flex gap-3">
                            {activeTab === 'suppliers' && (
                              <button
                                onClick={() => openStockModal(account)}
                                className="group relative p-4 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl w-20 h-20 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-3"
                                title="إدارة المخزون والديون"
                              >
                                <Package className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                <span className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-purple-500 opacity-0 group-hover:opacity-100 transition-all">
                                  🏪
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setCurrentAccount(account)
                                setPaymentAmount(0)
                                setPaymentDesc('')
                                setShowPaymentModal(true)
                              }}
                              className="group relative p-4 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-xl hover:shadow-2xl w-20 h-20 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-rotate-6"
                              title="دفعة سريعة"
                            >
                              <DollarSign className="w-8 h-8 group-hover:scale-110 transition-transform" />
                              <span className="absolute -top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-emerald-500 opacity-0 group-hover:opacity-100 transition-all">
                                💰
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setCurrentAccount(account)
                                setShowEditModal(true)
                              }}
                              className="group relative p-4 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-2xl shadow-xl hover:shadow-2xl w-20 h-20 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                              title="تعديل الحساب"
                            >
                              <Edit className="w-8 h-8 group-hover:scale-110 transition-transform" />
                              <span className="absolute -bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                                ✏️
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account)}
                              disabled={actionLoading}
                              className="group relative p-4 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl shadow-xl hover:shadow-2xl w-20 h-20 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-180"
                              title="حذف نهائي"
                            >
                              {actionLoading ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                              ) : (
                                <Trash2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
                              )}
                              <span className="absolute -top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                🗑️
                              </span>
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
