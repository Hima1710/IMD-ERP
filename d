'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { BottomNav } from '@/components/BottomNav'
import { MobileNav, FloatingMenuButton } from '@/components/MobileNav'
import { supabase } from '@/lib/supabase'
import { 
  Plus, Trash2, Edit, Users, Phone, MapPin, Loader2, X, UserPlus,
  CreditCard, Eye, Wallet, DollarSign, CheckCircle, History, Banknote,
  ChevronDown, ChevronUp, Package, Truck, Receipt, TrendingUp, TrendingDown
} from 'lucide-react'

// Types
interface Customer {
  id: string
  shop_id: string
  name: string
  phone: string
  address: string
  created_at?: string
}

interface Supplier {
  id: string
  shop_id: string
  name: string
  phone: string
  address: string
  total_debt: number
  created_at?: string
}

interface Expense {
  id: string
  shop_id: string
  category: string
  amount: number
  notes: string
  expense_date: string
  created_at?: string
}

interface CreditCustomer {
  customer: Customer
  totalDebt: number
  transactions: CreditTransaction[]
}

interface CreditTransaction {
  id: string
  sale_date: string
  total_amount: number
  amount_paid: number
  remaining_amount: number
  payment_method?: string
  items?: TransactionItem[]
}

interface TransactionItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  cost_price: number
  total_price: number
}

interface SupplierTransaction {
  id: string
  type: 'supply' | 'payment'
  amount: number
  notes: string
  product_id?: string
  quantity?: number
  created_at: string
}

type TabType = 'customers' | 'suppliers' | 'expenses'

export default function FinanceHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('customers')
  const [searchTerm, setSearchTerm] = useState('')
  const [shopId, setShopId] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Financial Summary
  const [totalCustomersDebt, setTotalCustomersDebt] = useState(0)
  const [totalSuppliersDebt, setTotalSuppliersDebt] = useState(0)
  const [dailyProfit, setDailyProfit] = useState(0)
  const [dailySales, setDailySales] = useState(0)
  const [dailyCOGS, setDailyCOGS] = useState(0)
  const [dailyExpenses, setDailyExpenses] = useState(0)

  // Customers state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [creditCustomers, setCreditCustomers] = useState<CreditCustomer[]>([])
  const [customersTab, setCustomersTab] = useState<'all' | 'credit'>('all')

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false)
  const [showSupplyModal, setShowSupplyModal] = useState(false)
  const [showPaySupplierModal, setShowPaySupplierModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', address: '' })
  const [supplyForm, setSupplyForm] = useState({ productId: '', quantity: 0, price: 0, notes: '' })
  const [payForm, setPayForm] = useState({ amount: 0, notes: '' })
  const [savingSupplier, setSavingSupplier] = useState(false)

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: 0, notes: '' })
  const [savingExpense, setSavingExpense] = useState(false)

  // Products for supply modal
  const [products, setProducts] = useState<any[]>([])

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const fetchShopId = useCallback(async () => {
    if (!supabase) return null
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return null
    const { data: profile } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', userData.user.id)
      .single()
    return profile?.shop_id || null
  }, [])

  const fetchCustomers = useCallback(async () => {
    if (!supabase || !shopId) return
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', shopId)
      .order('name', { ascending: true })
    setCustomers(data || [])
    setFilteredCustomers(data || [])
  }, [supabase, shopId])

  const fetchSuppliers = useCallback(async () => {
    if (!supabase || !shopId) return
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .eq('shop_id', shopId)
      .order('name', { ascending: true })
    setSuppliers(data || [])
    setFilteredSuppliers(data || [])
  }, [supabase, shopId])

  const fetchExpenses = useCallback(async () => {
    if (!supabase || !shopId) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('shop_id', shopId)
      .eq('expense_date', today)
      .order('created_at', { ascending: false })
    setExpenses(data || [])
    setFilteredExpenses(data || [])
  }, [supabase, shopId])

  const fetchProducts = useCallback(async () => {
    if (!supabase || !shopId) return
    const { data } = await supabase
      .from('products')
      .select('id, name, price, price_buy, stock')
      .eq('shop_id', shopId)
    setProducts(data || [])
  }, [supabase, shopId])

  const fetchFinancialSummary = useCallback(async () => {
    if (!supabase || !shopId) return
    
    const today = new Date().toISOString().split('T')[0]
    const todayStart = `${today}T00:00:00`
    const todayEnd = `${today}T23:59:59`

    // Fetch today's transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('customer_id, remaining_amount, payment_method, total_amount, amount_paid, sale_date, id, items')
      .eq('shop_id', shopId)
      .gte('sale_date', todayStart)
      .lte('sale_date', todayEnd)

    // Fetch today's expenses
    const { data: todayExpenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('shop_id', shopId)
      .eq('expense_date', today)

    // Calculate customer debt
    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('customer_id, remaining_amount')
      .eq('shop_id', shopId)
      .not('customer_id', 'is', null)

    const customerDebt = (allTransactions || [])
      .reduce((sum, t) => sum + (Number(t.remaining_amount) || 0), 0)
    setTotalCustomersDebt(Math.max(0, customerDebt))

    // Calculate supplier debt
    const { data: allSuppliers } = await supabase
      .from('suppliers')
      .select('total_debt')
      .eq('shop_id', shopId)
    const supplierDebt = (allSuppliers || []).reduce((sum, s) => sum + (Number(s.total_debt) || 0), 0)
    setTotalSuppliersDebt(supplierDebt)

    // Calculate daily profit
    const salesRevenue = (transactions || []).reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0)
    
    // Calculate COGS (Cost of Goods Sold) using price_buy
    let cogs = 0
    transactions?.forEach(t => {
      const items = t.items || []
      items.forEach((item: any) => {
        cogs += (item.quantity || 0) * (item.cost_price || item.price_buy || 0)
      })
    })

    const totalExpenses = (todayExpenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

    const profit = salesRevenue - cogs - totalExpenses

    setDailySales(salesRevenue)
    setDailyCOGS(cogs)
    setDailyExpenses(totalExpenses)
    setDailyProfit(profit)
  }, [supabase, shopId])

  useEffect(() => {
    const init = async () => {
      const id = await fetchShopId()
      setShopId(id)
      setLoading(false)
    }
    init()
  }, [fetchShopId])

  useEffect(() => {
    if (shopId) {
      fetchCustomers()
      fetchSuppliers()
      fetchExpenses()
      fetchProducts()
      fetchFinancialSummary()
    }
  }, [shopId, fetchCustomers, fetchSuppliers, fetchExpenses, fetchProducts, fetchFinancialSummary])

  useEffect(() => {
    if (!searchTerm.trim()) {
      if (activeTab === 'customers') setFilteredCustomers(customers)
      else if (activeTab === 'suppliers') setFilteredSuppliers(suppliers)
      else if (activeTab === 'expenses') setFilteredExpenses(expenses)
      return
    }
    const term = searchTerm.toLowerCase()
    if (activeTab === 'customers') {
      setFilteredCustomers(customers.filter(c => c.name.toLowerCase().includes(term) || c.phone?.includes(term)))
    } else if (activeTab === 'suppliers') {
      setFilteredSuppliers(suppliers.filter(s => s.name.toLowerCase().includes(term) || s.phone?.includes(term)))
    } else if (activeTab === 'expenses') {
      setFilteredExpenses(expenses.filter(e => e.category.toLowerCase().includes(term) || e.notes?.toLowerCase().includes(term)))
    }
  }, [searchTerm, activeTab, customers, suppliers, expenses])

  const handleAddSupplier = async () => {
    if (!supplierForm.name.trim() || !shopId || !supabase) return
    setSavingSupplier(true)
    const { error } = await supabase.from('suppliers').insert([{
      shop_id: shopId,
      name: supplierForm.name.trim(),
      phone: supplierForm.phone.trim(),
      address: supplierForm.address.trim(),
      total_debt: 0
    }])
    if (!error) {
      setShowAddSupplierModal(false)
      setSupplierForm({ name: '', phone: '', address: '' })
      fetchSuppliers()
      fetchFinancialSummary()
    }
    setSavingSupplier(false)
  }

  const handleSupply = async () => {
    if (!selectedSupplier || !supplyForm.productId || !shopId || !supabase) return
    setSavingSupplier(true)
    const product = products.find(p => p.id === supplyForm.productId)
    const totalAmount = supplyForm.quantity * supplyForm.price

    // Add supplier transaction
    await supabase.from('supplier_transactions').insert([{
      shop_id: shopId,
      supplier_id: selectedSupplier.id,
      type: 'supply',
      amount: totalAmount,
      notes: supplyForm.notes,
      product_id: supplyForm.productId,
      quantity: supplyForm.quantity
    }])

    // Update supplier debt
    await supabase.from('suppliers').update({
      total_debt: Number(selectedSupplier.total_debt) + totalAmount
    }).eq('id', selectedSupplier.id)

    // Update product stock
    if (product) {
      await supabase.from('products').update({
        stock: Number(product.stock) + supplyForm.quantity
      }).eq('id', supplyForm.productId)
    }

    setShowSupplyModal(false)
    setSupplyForm({ productId: '', quantity: 0, price: 0, notes: '' })
    fetchSuppliers()
    fetchProducts()
    fetchFinancialSummary()
    setSavingSupplier(false)
  }

  const handlePaySupplier = async () => {
    if (!selectedSupplier || !payForm.amount || !shopId || !supabase) return
    setSavingSupplier(true)

    await supabase.from('supplier_transactions').insert([{
      shop_id: shopId,
      supplier_id: selectedSupplier.id,
      type: 'payment',
      amount: payForm.amount,
      notes: payForm.notes
    }])

    await supabase.from('suppliers').update({
      total_debt: Math.max(0, Number(selectedSupplier.total_debt) - payForm.amount)
    }).eq('id', selectedSupplier.id)

    setShowPaySupplierModal(false)
    setPayForm({ amount: 0, notes: '' })
    fetchSuppliers()
    fetchFinancialSummary()
    setSavingSupplier(false)
  }

  const handleAddExpense = async () => {
    if (!expenseForm.category || !expenseForm.amount || !shopId || !supabase) return
    setSavingExpense(true)
    const { error } = await supabase.from('expenses').insert([{
      shop_id: shopId,
      category: expenseForm.category,
      amount: expenseForm.amount,
      notes: expenseForm.notes,
      expense_date: new Date().toISOString().split('T')[0]
    }])
    if (!error) {
      setShowAddExpenseModal(false)
      setExpenseForm({ category: '', amount: 0, notes: '' })
      fetchExpenses()
      fetchFinancialSummary()
    }
    setSavingExpense(false)
  }

  const formatCurrency = (amount: number) => amount.toLocaleString('ar-EG') + ' ج.م'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <FloatingMenuButton onClick={() => setMobileNavOpen(true)} />
      <div className="hidden md:block">
        <Sidebar selectedStore="customers" onStoreChange={() => {}} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <h1 className="text-base font-bold">المالية</h1>
        </div>
        
        <POSHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedStore="customers" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-red-500" />
                <span className="text-xs text-slate-500">ديون العملاء</span>
              </div>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalCustomersDebt)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-orange-500" />
                <span className="text-xs text-slate-500">ديون الموردين</span>
              </div>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(totalSuppliersDebt)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs text-slate-500">المبيعات اليومية</span>
              </div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(dailySales)}</p>
            </div>
            <div className={`bg-white rounded-xl p-4 shadow-sm border ${dailyProfit >= 0 ? 'border-blue-100' : 'border-red-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                {dailyProfit >= 0 ? <TrendingUp className="w-5 h-5 text-blue-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                <span className="text-xs text-slate-500">صافي الربح</span>
              </div>
              <p className={`text-lg font-bold ${dailyProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(dailyProfit)}</p>
              <p className="text-xs text-slate-400">تكلفة: {formatCurrency(dailyCOGS)} | مصروفات: {formatCurrency(dailyExpenses)}</p>
            </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('customers')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              <Users className="w-4 h-4 inline-block ml-2" />
              العملاء
            </button>
            <button onClick={() => setActiveTab('suppliers')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'suppliers' ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              <Truck className="w-4 h-4 inline-block ml-2" />
              الموردين
            </button>
            <button onClick={() => setActiveTab('expenses')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'expenses' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              <Receipt className="w-4 h-4 inline-block ml-2" />
              المصروفات
            </button>
          </div>

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div>
              <div className="flex gap-2 mb-4">
                <button onClick={() => setCustomersTab('all')} className={`px-3 py-1.5 rounded-lg text-sm ${customersTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>الكل</button>
                <button onClick={() => setCustomersTab('credit')} className={`px-3 py-1.5 rounded-lg text-sm ${customersTab === 'credit' ? 'bg-red-600 text-white' : 'bg-slate-100'}`}>المدينين</button>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>قائمة العملاء - استخدم صفحة العملاء الحالية</p>
              </div>
          )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500">{filteredSuppliers.length} مورد</p>
                <button onClick={() => setShowAddSupplierModal(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg">
                  <Plus className="w-4 h-4" /> إضافة مورد
                </button>
              </div>
              <div className="space-y-3">
                {filteredSuppliers.map(supplier => (
                  <div key={supplier.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{supplier.name}</h3>
                        <p className="text-sm text-slate-500">{supplier.phone || 'لا يوجد رقم'}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-orange-600">{formatCurrency(supplier.total_debt || 0)}</p>
                        <p className="text-xs text-slate-400">مستحق</p>
                      </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setSelectedSupplier(supplier); setShowSupplyModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
                        <Package className="w-4 h-4" /> تسجيل توريد
                      </button>
                      <button onClick={() => { setSelectedSupplier(supplier); setPayForm({ amount: supplier.total_debt || 0, notes: '' }); setShowPaySupplierModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                        <Banknote className="w-4 h-4" /> تسديد
                      </button>
                    </div>
                ))}
              </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500">{filteredExpenses.length} مصروف اليوم</p>
                <button onClick={() => setShowAddExpenseModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg">
                  <Plus className="w-4 h-4" /> إضافة مصروف
                </button>
              </div>
              <div className="space-y-2">
                {filteredExpenses.map(expense => (
                  <div key={expense.id} className="bg-white rounded-xl p-3 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      {expense.notes && <p className="text-xs text-slate-500">{expense.notes}</p>}
                    </div>
                    <p className="font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                  </div>
                ))}
                {filteredExpenses.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>لا توجد مصروفات اليوم</p>
                  </div>
                )}
              </div>
          )}
        </div>

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">إضافة مورد جديد</h3>
            <input type="text" placeholder="اسم المورد *" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg mb-3" />
            <input type="tel" placeholder="رقم الهاتف" value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg mb-3" />
            <input type="text" placeholder="العنوان" value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowAddSupplierModal(false)} className="flex-1 px-4 py-2 border rounded-lg">إلغاء</button>
              <button onClick={handleAddSupplier} disabled={savingSupplier} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg">{savingSupplier ? 'جاري...' : 'إضافة'}</button>
            </div>
        </div>
      )}

      {/* Supply Modal */}
      {showSupplyModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">تسجيل توريد - {selectedSupplier.name}</h3>
            <select value={supplyForm.productId} onChange={e => setSupplyForm({...supplyForm, productId: e.target.value, price: products.find(p => p.id === e.target.value)?.price_buy || 0})} className="w-full px-3 py-2 border rounded-lg mb-3">
              <option value="">اختر المنتج</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (متوفر: {p.stock})</option>)}
            </select>
            <input type="number" placeholder="الكمية" value={supplyForm.quantity || ''} onChange={e => setSupplyForm({...supplyForm, quantity: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg mb-3" />
            <input type="number" placeholder="سعر التوريد" value={supplyForm.price || ''} onChange={e => setSupplyForm({...supplyForm, price: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg mb-3" />
            <input type="text" placeholder="ملاحظات" value={supplyForm.notes} onChange={e => setSupplyForm({...supplyForm, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg mb-4" />
            <p className="text-center mb-4 font-bold">الإجمالي: {formatCurrency(supplyForm.quantity * supplyForm.price)}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSupplyModal(false)} className="flex-1 px-4 py-2 border rounded-lg">إلغاء</button>
              <button onClick={handleSupply} disabled={savingSupplier || !supplyForm.productId || !supplyForm.quantity} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">{savingSupplier ? 'جاري...' : 'تسجيل'}</button>
            </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {showPaySupplierModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">تسديد للمورد - {selectedSupplier.name}</h3>
            <p className="text-sm text-slate-500 mb-4">المستحق: {formatCurrency(selectedSupplier.total_debt || 0)}</p>
            <input type="number" placeholder="المبلغ" value={payForm.amount || ''} onChange={e => setPayForm({...payForm, amount: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg mb-3" />
            <input type="text" placeholder="ملاحظات" value={payForm.notes} onChange={e => setPayForm({...payForm, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowPaySupplierModal(false)} className="flex-1 px-4 py-2 border rounded-lg">إلغاء</button>
              <button onClick={handlePaySupplier} disabled={savingSupplier || !payForm.amount} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">{savingSupplier ? 'جاري...' : 'تسديد'}</button>
            </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">إضافة مصروف</h3>
            <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg mb-3">
              <option value="">اختر الفئة</option>
              <option value="electricity">كهرباء</option>
              <option value="water">مياه</option>
              <option value="rent">إيجار</option>
              <option value="salaries">رواتب</option>
              <option value="maintenance">صيانة</option>
              <option value="transport">نقل</option>
              <option value="other">أخرى</option>
            </select>
            <input type="number" placeholder="المبلغ *" value={expenseForm.amount || ''} onChange={e => setExpenseForm({...expenseForm, amount: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg mb-3" />
            <textarea placeholder="ملاحظات" value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg mb-4" rows={3} />
            <div className="flex gap-3">
              <button onClick={() => setShowAddExpenseModal(false)} className="flex-1 px-4 py-2 border rounded-lg">إلغاء</button>
              <button onClick={handleAddExpense} disabled={savingExpense || !expenseForm.category || !expenseForm.amount} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">{savingExpense ? 'جاري...' : 'إضافة'}</button>
            </div>
        </div>
      )}

      <BottomNav cartCount={0} />
    </div>
  )
