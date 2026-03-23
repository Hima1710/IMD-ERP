'use client'

<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { BottomNav } from '@/components/BottomNav'
import { MobileNav, FloatingMenuButton } from '@/components/MobileNav'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/hooks/use-store'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Users,
  Phone,
  MapPin,
  Loader2,
  X,
  UserPlus,
  CreditCard,
  Eye,
  Wallet,
  DollarSign,
  CheckCircle,
  History,
  Banknote,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Receipt,
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'


// ============== TYPES ==============

interface Customer {
  id: string
  shop_id: string
  name: string
  phone: string
  address: string
  created_at?: string
}

interface CustomerFormData {
  name: string
  phone: string
  address: string
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
  total_price: number
}

// Supplier Types
interface Supplier {
  id: string
  shop_id: string
  name: string
  phone: string
  address: string
  total_debt: number
  created_at?: string
}

interface SupplierTransaction {
  id: string
  shop_id: string
  supplier_id: string
  type: 'purchase' | 'payment' | 'return'
  amount: number
  notes: string
  product_id: string | null
  quantity: number
  created_at: string
}

// Expense Types
interface Expense {
  id: string
  shop_id: string
  category: string
  amount: number
  notes: string
  expense_date: string
  created_at?: string
}

// Product type for COGS calculation
interface Product {
  id: string
  name: string
  price: number
  price_buy: number
  stock: number
}

// Profit Report Types
interface DailyProfit {
  salesRevenue: number
  cogs: number
  expenses: number
  profit: number
}

// Expense categories
const EXPENSE_CATEGORIES = [
  'كهرباء',
  'مياه',
  'إنترنت',
  'صيانة',
  ' إيجار',
  ' رواتب',
  ' مواد تنظيف',
  'Transport',
  'تسويق',
  'أخرى'
]

export default function FinanceHubPage() {
  // سمينا الـ loading اللي جاية من الستور authLoading عشان نفرقها
  const { store, loading: storeLoading, isLoaded } = useStore()
  
  // ============== STATE ==============
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers' | 'expenses'>('customers')
  const [shopId, setShopId] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Customer State
  const [customers, setCustomers] = useState<Customer[]>([])

  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({ name: '', phone: '', address: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Credit Customers State
  const [creditTab, setCreditTab] = useState<'all' | 'credit'>('all')
  const [creditCustomers, setCreditCustomers] = useState<CreditCustomer[]>([])
  const [loadingCredit, setLoadingCredit] = useState(false)
  const [totalCustomersDebt, setTotalCustomersDebt] = useState<number>(0)
  const [selectedCustomerInvoices, setSelectedCustomerInvoices] = useState<CreditTransaction[]>([])
  const [showInvoicesModal, setShowInvoicesModal] = useState(false)
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('')
  const [selectedCustomerDebt, setSelectedCustomerDebt] = useState<number>(0)

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentCustomer, setPaymentCustomer] = useState<CreditCustomer | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Suppliers State
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('')
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false)
  const [showSupplyModal, setShowSupplyModal] = useState(false)
  const [showPaySupplierModal, setShowPaySupplierModal] = useState(false)
  const [savingSupplier, setSavingSupplier] = useState(false)
  const [savingSupply, setSavingSupply] = useState(false)
  const [savingPaySupplier, setSavingPaySupplier] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnFormData, setReturnFormData] = useState({ productId: '', quantity: '', notes: '' })
  const [savingReturn, setSavingReturn] = useState(false)
  const [supplierFormData, setSupplierFormData] = useState({ name: '', phone: '', address: '' })
  const [supplyFormData, setSupplyFormData] = useState({ productId: '', quantity: '', price: '', notes: '' })
  const [paySupplierData, setPaySupplierData] = useState({ amount: '', notes: '' })
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [supplierError, setSupplierError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [totalSuppliersDebt, setTotalSuppliersDebt] = useState<number>(0)

  // Expenses State
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loadingExpenses, setLoadingExpenses] = useState(false)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [savingExpense, setSavingExpense] = useState(false)
  const [expenseFormData, setExpenseFormData] = useState({ category: 'أخرى', amount: '', notes: '' })
  const [expenseError, setExpenseError] = useState<string | null>(null)
  const [todayExpenses, setTodayExpenses] = useState<number>(0)

  // Profit Report State
  const [dailyProfit, setDailyProfit] = useState<DailyProfit>({ salesRevenue: 0, cogs: 0, expenses: 0, profit: 0 })
  const [loadingProfit, setLoadingProfit] = useState(false)

  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // ============== HELPER FUNCTIONS ==============

  const toggleExpandedRow = (transactionId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId)
      } else {
        newSet.add(transactionId)
      }
      return newSet
    })
  }

  const parseTransactionItems = (itemsData: any): TransactionItem[] => {
    if (!itemsData) return []
    if (Array.isArray(itemsData)) return itemsData
    if (typeof itemsData === 'string') {
      try {
        return JSON.parse(itemsData)
      } catch {
        return []
      }
    }
    return []
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2) + ' ج.م'
  }

  // ============== CUSTOMER FUNCTIONS ==============

  const fetchCustomers = useCallback(async () => {
    // ✅ STORE-DRIVEN: No auth.getUser() needed
    if (!store?.id || storeLoading || !isLoaded) {
      console.log('⏳ [CUSTOMERS] Store not ready, skipping fetch')
      return
    }

    try {
      setLoading(true)

      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      console.log('👥 [CUSTOMERS] Fetching for shop:', store.id)
      setError(null)

      const { data: customersData, error } = await supabase
        .from('customers')
        .select('*')
        .eq('shop_id', store.id)  // ✅ Direct store.id
        .order('name', { ascending: true })


      if (error) {
        console.error('Error fetching customers:', error)
        setError('خطأ في جلب العملاء')
        return
      }

      setCustomers(customersData || [])
      setFilteredCustomers(customersData || [])
      setShopId(store.id)
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }, [store?.id, storeLoading, isLoaded, supabase])

  const fetchCreditCustomers = useCallback(async () => {
    if (!supabase || !shopId) return
    try {
      setLoadingCredit(true)
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('customer_id, remaining_amount, payment_method, total_amount, amount_paid, sale_date, id, items')
        .eq('shop_id', shopId)
        .not('customer_id', 'is', null)
        .order('sale_date', { ascending: false })

      if (transactionsError) return

      const customerDebts: { [key: string]: CreditCustomer } = {}
      const customerIds = [...new Set(transactionsData?.map(t => t.customer_id).filter(Boolean) || [])]
      
      if (customerIds.length === 0) {
        setCreditCustomers([])
        setTotalCustomersDebt(0)
        return
      }

      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds)

      transactionsData?.forEach(transaction => {
        if (!transaction.customer_id) return
        
        if (!customerDebts[transaction.customer_id]) {
          const customer = customersData?.find(c => c.id === transaction.customer_id)
          customerDebts[transaction.customer_id] = {
            customer: customer || { id: transaction.customer_id, shop_id: '', name: 'غير معروف', phone: '', address: '' },
            totalDebt: 0,
            transactions: []
          }
        }
        
        const items = parseTransactionItems(transaction.items)
        
        customerDebts[transaction.customer_id].transactions.push({
          id: transaction.id,
          sale_date: transaction.sale_date,
          total_amount: Number(transaction.total_amount || 0),
          amount_paid: Number(transaction.amount_paid || 0),
          remaining_amount: Number(transaction.remaining_amount || 0),
          payment_method: transaction.payment_method,
          items: items
        })
        
        customerDebts[transaction.customer_id].totalDebt += Number(transaction.remaining_amount || 0)
      })

      const creditCustomersList = Object.values(customerDebts)
        .filter(cc => cc.totalDebt > 0.01)
        .map(cc => ({
          ...cc,
          totalDebt: Math.max(0, cc.totalDebt)
        }))
      
      setCreditCustomers(creditCustomersList)
      const total = creditCustomersList.reduce((sum, cc) => sum + cc.totalDebt, 0)
      setTotalCustomersDebt(total)
    } catch (err) {
      console.error('Error fetching credit customers:', err)
    } finally {
      setLoadingCredit(false)
    }
  }, [supabase, shopId])

  const fetchProducts = useCallback(async () => {
    if (!supabase || !shopId) return
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, price_buy, stock')
        .eq('shop_id', shopId)
      
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }, [supabase, shopId])

  // ============== SUPPLIER FUNCTIONS ==============

  const fetchSuppliers = useCallback(async () => {
    if (!supabase || !shopId) return
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('shop_id', shopId)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching suppliers:', error)
        return
      }

      setSuppliers(data || [])
      setFilteredSuppliers(data || [])
      
      const total = (data || []).reduce((sum, s) => sum + (s.total_debt || 0), 0)
      setTotalSuppliersDebt(total)
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    }
  }, [supabase, shopId])

  // ============== EXPENSE FUNCTIONS ==============

  const fetchExpenses = useCallback(async () => {
    if (!supabase || !shopId) return
    try {
      setLoadingExpenses(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('shop_id', shopId)
        .order('expense_date', { ascending: false })

      if (error) {
        console.error('Error fetching expenses:', error)
        return
      }

      setExpenses(data || [])
      
      // Calculate today's expenses
      const today = new Date().toISOString().split('T')[0]
      const todayTotal = (data || [])
        .filter(e => e.expense_date === today)
        .reduce((sum, e) => sum + (e.amount || 0), 0)
      setTodayExpenses(todayTotal)
    } catch (err) {
      console.error('Error fetching expenses:', err)
    } finally {
      setLoadingExpenses(false)
    }
  }, [supabase, shopId])

  // ============== PROFIT REPORT FUNCTIONS ==============

  const fetchDailyProfit = useCallback(async () => {
    if (!supabase || !shopId) return
    try {
      setLoadingProfit(true)
      
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

      // Get today's transactions (sales)
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('total_amount, items, sale_date')
        .eq('shop_id', shopId)
        .gte('sale_date', today)
        .lt('sale_date', tomorrow)
        .neq('payment_method', 'debt_payment')

      // Calculate sales revenue
      const salesRevenue = (transactionsData || [])
        .reduce((sum, t) => sum + (t.total_amount || 0), 0)

      // Calculate COGS using price_buy
      let cogs = 0
      for (const transaction of (transactionsData || [])) {
        const items = parseTransactionItems(transaction.items)
        for (const item of items) {
          // Find the product to get price_buy
          const product = products.find(p => p.id === item.product_id)
          if (product && product.price_buy) {
            cogs += item.quantity * product.price_buy
          }
        }
      }

      // Get today's expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('shop_id', shopId)
        .eq('expense_date', today)

      const expenses = (expensesData || []).reduce((sum, e) => sum + (e.amount || 0), 0)

      // Calculate profit
      const profit = salesRevenue - cogs - expenses

      setDailyProfit({ salesRevenue, cogs, expenses, profit })
    } catch (err) {
      console.error('Error fetching profit:', err)
    } finally {
      setLoadingProfit(false)
    }
  }, [supabase, shopId, products])

  // ============== EFFECTS ==============

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    if (shopId) {
      fetchCreditCustomers()
      fetchSuppliers()
      fetchExpenses()
      fetchProducts()
    }
  }, [shopId, fetchCreditCustomers, fetchSuppliers, fetchExpenses, fetchProducts])

  useEffect(() => {
    if (products.length > 0 && shopId) {
      fetchDailyProfit()
    }
  }, [products, shopId, fetchDailyProfit])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers)
      return
    }
    const term = searchTerm.toLowerCase()
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term)
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  useEffect(() => {
    if (!supplierSearchTerm.trim()) {
      setFilteredSuppliers(suppliers)
      return
    }
    const term = supplierSearchTerm.toLowerCase()
    const filtered = suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(term) ||
      supplier.phone?.toLowerCase().includes(term)
    )
    setFilteredSuppliers(filtered)
  }, [supplierSearchTerm, suppliers])

  // ============== CUSTOMER HANDLERS ==============

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('يرجى إدخال اسم العميل')
      return
    }
    if (!shopId || !supabase) return

    try {
      setSavingCustomer(true)
      setFormError(null)

      const { data, error: insertError } = await supabase
        .from('customers')
        .insert([{
          shop_id: shopId,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim()
        }])
        .select()

      if (insertError) {
        setFormError('خطأ في إضافة العميل: ' + insertError.message)
        return
      }

      if (data && data.length > 0) {
        const newCustomer = data[0]
        const updatedCustomers = [...customers, newCustomer].sort((a, b) => a.name.localeCompare(b.name))
        setCustomers(updatedCustomers)
        setFilteredCustomers(updatedCustomers)
      }

      setShowAddModal(false)
      setFormData({ name: '', phone: '', address: '' })
      alert('تم إضافة العميل بنجاح')
    } catch (err) {
      console.error('Error adding customer:', err)
      setFormError('حدث خطأ في إضافة العميل')
    } finally {
      setSavingCustomer(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return
    try {
      setDeletingId(customerId)
      if (!supabase) return

      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (deleteError) {
        alert('خطأ في حذف العميل: ' + deleteError.message)
        return
      }

      const updatedCustomers = customers.filter(c => c.id !== customerId)
      setCustomers(updatedCustomers)
      setFilteredCustomers(updatedCustomers)
      alert('تم حذف العميل بنجاح')
    } catch (err) {
      console.error('Error deleting customer:', err)
      alert('حدث خطأ في حذف العميل')
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewInvoices = async (creditCustomer: CreditCustomer) => {
    if (!supabase || !shopId) return
    
    const { data: transactionsData, error } = await supabase
      .from('transactions')
      .select('customer_id, remaining_amount, payment_method, total_amount, amount_paid, sale_date, id, items')
      .eq('shop_id', shopId)
      .eq('customer_id', creditCustomer.customer.id)
      .order('sale_date', { ascending: false })

    if (error) return

    const parsedTransactions = (transactionsData || []).map(t => ({
      id: t.id,
      sale_date: t.sale_date,
      total_amount: Number(t.total_amount || 0),
      amount_paid: Number(t.amount_paid || 0),
      remaining_amount: Number(t.remaining_amount || 0),
      payment_method: t.payment_method,
      items: parseTransactionItems(t.items)
    }))

    setSelectedCustomerInvoices(parsedTransactions)
    setSelectedCustomerName(creditCustomer.customer.name)
    setSelectedCustomerDebt(creditCustomer.totalDebt)
    setShowInvoicesModal(true)
  }

  const handleOpenPaymentModal = (creditCustomer: CreditCustomer) => {
    setPaymentCustomer(creditCustomer)
    setPaymentAmount(creditCustomer.totalDebt.toString())
    setPaymentError(null)
    setShowPaymentModal(true)
  }

  const handlePayDebt = async () => {
    if (!paymentCustomer || !supabase || !shopId) return
    
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('يرجى إدخال مبلغ صحيح')
      return
    }

    if (amount > paymentCustomer.totalDebt) {
      setPaymentError('المبلغ المدفوع أكبر من إجمالي الدين')
      return
    }

    try {
      setIsProcessingPayment(true)
      setPaymentError(null)

      const { error: insertError } = await supabase
        .from('transactions')
        .insert([{
          shop_id: shopId,
          customer_id: paymentCustomer.customer.id,
          total_amount: 0,
          amount_paid: amount,
          remaining_amount: -amount,
          final_amount: 0,
          discount_amount: 0,
          payment_method: 'debt_payment',
          change_amount: 0,
          items: [],
          sale_date: new Date().toISOString()
        }])

      if (insertError) {
        setPaymentError('خطأ في تسجيل السداد: ' + insertError.message)
        return
      }

      alert(`تم تسجيل سداد مبلغ ${amount.toFixed(2)} ج.م بنجاح`)
      setShowPaymentModal(false)
      setPaymentCustomer(null)
      setPaymentAmount('')
      fetchCreditCustomers()
      
    } catch (err) {
      console.error('Error in payment:', err)
      setPaymentError('حدث خطأ في معالجة السداد')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // ============== SUPPLIER HANDLERS ==============

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierFormData.name.trim()) {
      setSupplierError('يرجى إدخال اسم المورد')
      return
    }
    if (!shopId || !supabase) return

    try {
      setSavingSupplier(true)
      setSupplierError(null)

      const { data, error: insertError } = await supabase
        .from('suppliers')
        .insert([{
          shop_id: shopId,
          name: supplierFormData.name.trim() || '',
          phone: supplierFormData.phone.trim() || '',
          address: supplierFormData.address.trim() || '',
          total_debt: 0
        }])
        .select()

      if (insertError) {
        setSupplierError('خطأ في إضافة المورد: ' + insertError.message)
        return
      }

      if (data && data.length > 0) {
        const updatedSuppliers = [...suppliers, data[0]].sort((a, b) => a.name.localeCompare(b.name))
        setSuppliers(updatedSuppliers)
        setFilteredSuppliers(updatedSuppliers)
      }

      setShowAddSupplierModal(false)
      setSupplierFormData({ name: '', phone: '', address: '' })
      alert('تم إضافة المورد بنجاح')
    } catch (err) {
      console.error('Error adding supplier:', err)
      setSupplierError('حدث خطأ في إضافة المورد')
    } finally {
      setSavingSupplier(false)
    }
  }

  const handleSupply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier || !shopId || !supabase) return
    
    const amount = parseFloat(supplyFormData.price)
    const quantity = parseFloat(supplyFormData.quantity)
    
    if (isNaN(amount) || amount <= 0 || isNaN(quantity) || quantity <= 0) {
      setSupplierError('يرجى إدخال بيانات صحيحة')
      return
    }

    try {
      setSavingSupply(true)
      setSupplierError(null)

      // 1. Create supplier transaction with all fields (shop_id, product_id, quantity, notes)
      const { error: txError } = await supabase
        .from('supplier_transactions')
        .insert([{
          shop_id: shopId, // Multi-tenant: use current shop's ID
          supplier_id: selectedSupplier.id,
          type: 'purchase', // Use 'purchase' for adding stock (lowercase)
          amount: amount,
          notes: supplyFormData.notes || '',
          product_id: supplyFormData.productId || null,
          quantity: quantity
        }])

      if (txError) {
        setSupplierError('خطأ في تسجيل التوريد: ' + txError.message)
        return
      }

      // 2. Update supplier debt
      const newDebt = selectedSupplier.total_debt + amount
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ total_debt: newDebt })
        .eq('id', selectedSupplier.id)
        .eq('shop_id', shopId) // Multi-tenant filter

      if (updateError) {
        setSupplierError('خطأ في تحديث الدين: ' + updateError.message)
        return
      }

      // 3. If product selected, update stock AND price_buy
      if (supplyFormData.productId) {
        const product = products.find(p => p.id === supplyFormData.productId)
        if (product) {
          // Calculate new unit cost price (total amount / quantity)
          const unitCostPrice = quantity > 0 ? amount / quantity : 0
          
          await supabase
            .from('products')
            .update({ 
              stock: product.stock + quantity,
              price_buy: unitCostPrice // Update cost price
            })
            .eq('id', supplyFormData.productId)
            .eq('shop_id', shopId) // Multi-tenant filter
        }
      }

      // Success feedback with toast
      alert(`✅ تم تسجيل توريد بضاعة بقيمة ${amount.toFixed(2)} ج.م\n📦 الكمية: ${quantity}\n🏪 المورد: ${selectedSupplier.name}`)
      
      // Reset form and close modal
      setShowSupplyModal(false)
      setSupplyFormData({ productId: '', quantity: '', price: '', notes: '' })
      
      // Refresh data
      fetchSuppliers()
      fetchProducts()
      
    } catch (err) {
      console.error('Error in supply:', err)
      setSupplierError('حدث خطأ في تسجيل التوريد')
    } finally {
      setSavingSupply(false)
    }
  }

  const handlePaySupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier || !shopId || !supabase) return
    
    const amount = parseFloat(paySupplierData.amount)
    
    if (isNaN(amount) || amount <= 0) {
      setSupplierError('يرجى إدخال مبلغ صحيح')
      return
    }

    if (amount > selectedSupplier.total_debt) {
      setSupplierError('المبلغ المدفوع أكبر من إجمالي الدين')
      return
    }

    try {
      setSavingPaySupplier(true)
      setSupplierError(null)

      // Create supplier transaction (payment)
      const { error: txError } = await supabase
        .from('supplier_transactions')
        .insert([{
          shop_id: shopId,
          supplier_id: selectedSupplier.id,
          type: 'payment',
          amount: -amount,
          notes: paySupplierData.notes,
          product_id: null,
          quantity: 0
        }])

      if (txError) {
        setSupplierError('خطأ في تسجيل السداد: ' + txError.message)
        return
      }

      // Update supplier debt
      const newDebt = selectedSupplier.total_debt - amount
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ total_debt: Math.max(0, newDebt) })
        .eq('id', selectedSupplier.id)

      if (updateError) {
        setSupplierError('خطأ في تحديث الدين: ' + updateError.message)
        return
      }

      alert(`تم تسجيل سداد مبلغ ${amount.toFixed(2)} ج.م للمورد`)
      setShowPaySupplierModal(false)
      setPaySupplierData({ amount: '', notes: '' })
      fetchSuppliers()
      
    } catch (err) {
      console.error('Error in payment:', err)
      setSupplierError('حدث خطأ في تسجيل السداد')
    } finally {
      setSavingPaySupplier(false)
    }
  }

  // ============== EXPENSE HANDLERS ==============

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopId || !supabase) return
    
    const amount = parseFloat(expenseFormData.amount)
    
    if (isNaN(amount) || amount <= 0) {
      setExpenseError('يرجى إدخال مبلغ صحيح')
      return
    }

    try {
      setSavingExpense(true)
      setExpenseError(null)

      const { error: insertError } = await supabase
        .from('expenses')
        .insert([{
          shop_id: shopId,
          category: expenseFormData.category,
          amount: amount,
          notes: expenseFormData.notes,
          expense_date: new Date().toISOString().split('T')[0]
        }])

      if (insertError) {
        setExpenseError('خطأ في إضافة المصروف: ' + insertError.message)
        return
      }

      alert(`تم تسجيل مصروف بقيمة ${amount.toFixed(2)} ج.م`)
      setShowAddExpenseModal(false)
      setExpenseFormData({ category: 'أخرى', amount: '', notes: '' })
      fetchExpenses()
      
    } catch (err) {
      console.error('Error adding expense:', err)
      setExpenseError('حدث خطأ في إضافة المصروف')
    } finally {
      setSavingExpense(false)
    }
  }

  // ============== SUPPLIER RETURN HANDLER ==============

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier || !shopId || !supabase) return
    
    const returnQuantity = parseFloat(returnFormData.quantity)
    
    if (isNaN(returnQuantity) || returnQuantity <= 0) {
      setSupplierError('يرجى إدخال كمية صحيحة')
      return
    }

    // Get the selected product
    const selectedProduct = products.find(p => p.id === returnFormData.productId)
    if (!selectedProduct) {
      setSupplierError('يرجى اختيار منتج')
      return
    }

    // Check if sufficient stock
    if (selectedProduct.stock < returnQuantity) {
      setSupplierError('الكمية المرتجعة أكبر من المخزون المتاح')
      return
    }

    try {
      setSavingReturn(true)
      setSupplierError(null)

      // Calculate return amount using price_buy
      const returnAmount = returnQuantity * (selectedProduct.price_buy || 0)

      // 1. Create supplier transaction (return)
      const { error: txError } = await supabase
        .from('supplier_transactions')
        .insert([{
          shop_id: shopId,
          supplier_id: selectedSupplier.id,
          type: 'return',
          amount: -returnAmount,
          notes: returnFormData.notes || 'مرتجع',
          product_id: returnFormData.productId,
          quantity: returnQuantity
        }])

      if (txError) {
        setSupplierError('خطأ في تسجيل المرتجع: ' + txError.message)
        return
      }

      // 2. Update supplier debt (decrease by return amount)
      const newDebt = selectedSupplier.total_debt - returnAmount
      const { error: updateDebtError } = await supabase
        .from('suppliers')
        .update({ total_debt: Math.max(0, newDebt) })
        .eq('id', selectedSupplier.id)
        .eq('shop_id', shopId)

      if (updateDebtError) {
        setSupplierError('خطأ في تحديث دين المورد: ' + updateDebtError.message)
        return
      }

      // 3. Update product stock (decrease)
      const { error: updateStockError } = await supabase
        .from('products')
        .update({ stock: Math.max(0, selectedProduct.stock - returnQuantity) })
        .eq('id', returnFormData.productId)
        .eq('shop_id', shopId)

      if (updateStockError) {
        setSupplierError('خطأ في تحديث المخزون: ' + updateStockError.message)
        return
      }

      alert(`تم تسجيل مرتجع بقيمة ${returnAmount.toFixed(2)} ج.م`)
      setShowReturnModal(false)
      setReturnFormData({ productId: '', quantity: '', notes: '' })
      fetchSuppliers()
      fetchProducts()
      
    } catch (err) {
      console.error('Error in return:', err)
      setSupplierError('حدث خطأ في تسجيل المرتجع')
    } finally {
      setSavingReturn(false)
    }
  }

  // ============== RENDER ==============

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <FloatingMenuButton onClick={() => setMobileNavOpen(true)} />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar selectedStore="customers" onStoreChange={() => {}} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <h1 className="text-base font-bold text-slate-900">المالية</h1>
        </div>
        
        <POSHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedStore="customers" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-6">
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Customers Debt */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium mb-1">ديون العملاء</p>
                  <p className="text-2xl md:text-3xl font-bold">{totalCustomersDebt.toFixed(2)} ج.م</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Total Suppliers Debt */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">ديون الموردين</p>
                  <p className="text-2xl md:text-3xl font-bold">{totalSuppliersDebt.toFixed(2)} ج.م</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Daily Profit */}
            <div className={`bg-gradient-to-r ${dailyProfit.profit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-xl p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">ربح اليوم</p>
                  <p className="text-2xl md:text-3xl font-bold">{dailyProfit.profit.toFixed(2)} ج.م</p>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-white/80">مبيعات: {dailyProfit.salesRevenue.toFixed(0)}</span>
                    <span className="text-white/80">تكلفة: {dailyProfit.cogs.toFixed(0)}</span>
                    <span className="text-white/80">مصروفات: {dailyProfit.expenses.toFixed(0)}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {dailyProfit.profit >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-white" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'customers' | 'suppliers' | 'expenses')}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="customers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                العملاء
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                الموردين
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                المصروفات
              </TabsTrigger>
            </TabsList>

            {/* ============== CUSTOMERS TAB ============== */}
            <TabsContent value="customers">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">إدارة العملاء</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {creditTab === 'all' ? `${filteredCustomers.length} عميل` : `${creditCustomers.length} عميل مدين`}
                  </p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95">
                  <UserPlus className="w-5 h-5" />
                  إضافة عميل
                </button>
              </div>

              <div className="flex gap-2 mb-6">
                <button onClick={() => setCreditTab('all')} className={`px-4 py-2 rounded-lg font-medium ${creditTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                  <Users className="w-4 h-4 inline-block ml-2" />
                  جميع العملاء
                </button>
                <button onClick={() => { setCreditTab('credit'); fetchCreditCustomers(); }} className={`px-4 py-2 rounded-lg font-medium ${creditTab === 'credit' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                  <CreditCard className="w-4 h-4 inline-block ml-2" />
                  العملاء المدينين
                </button>
              </div>

              {creditTab === 'credit' && (
                <>
                  {loadingCredit ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                    </div>
                  ) : creditCustomers.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                      <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">لا يوجد عملاء مدينين</h3>
                    </div>
                  ) : (
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-red-50 border-b border-red-100">
                            <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">اسم العميل</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">رقم الهاتف</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">إجمالي الدين</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-red-800">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-50">
                          {creditCustomers.map((creditCustomer) => (
                            <tr key={creditCustomer.customer.id} className="hover:bg-red-50/50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-red-600 font-semibold">{creditCustomer.customer.name.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <span className="font-medium">{creditCustomer.customer.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">{creditCustomer.customer.phone || '-'}</td>
                              <td className="px-4 py-3"><span className="font-bold text-red-600">{creditCustomer.totalDebt.toFixed(2)} ج.م</span></td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleOpenPaymentModal(creditCustomer)} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium">
                                    <Banknote className="w-4 h-4" />
                                    تسديد
                                  </button>
                                  <button onClick={() => handleViewInvoices(creditCustomer)} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium">
                                    <Eye className="w-4 h-4" />
                                    الفواتير
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {creditTab === 'all' && (
                <>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                      <p className="text-red-700 text-sm">{error}</p>
                      <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-sm underline">
                        إغلاق
                      </button>
                    </div>
                  )}
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                      <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">لا يوجد عملاء</h3>
                    </div>
                  ) : (

                    <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">اسم العميل</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">رقم الهاتف</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">العنوان</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold">{customer.name.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <span className="font-medium">{customer.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">{customer.phone || '-'}</td>
                              <td className="px-4 py-3">{customer.address || '-'}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => handleDeleteCustomer(customer.id)} disabled={deletingId === customer.id} className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 disabled:opacity-50">
                                  {deletingId === customer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* ============== SUPPLIERS TAB ============== */}
            <TabsContent value="suppliers">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">إدارة الموردين</h1>
                  <p className="text-sm text-slate-500 mt-1">{filteredSuppliers.length} مورد</p>
                </div>
                <button onClick={() => setShowAddSupplierModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95">
                  <Plus className="w-5 h-5" />
                  إضافة مورد
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="البحث عن مورد..."
                  value={supplierSearchTerm}
                  onChange={(e) => setSupplierSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-right"
                />
              </div>

              {filteredSuppliers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">لا يوجد موردين</h3>
                </div>
              ) : (
                <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-orange-50 border-b border-orange-100">
                        <th className="px-4 py-3 text-right text-sm font-semibold text-orange-800">اسم المورد</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-orange-800">رقم الهاتف</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-orange-800">إجمالي الدين</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-orange-800">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-50">
                      {filteredSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-orange-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <span className="text-orange-600 font-semibold">{supplier.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <span className="font-medium">{supplier.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{supplier.phone || '-'}</td>
                          <td className="px-4 py-3"><span className="font-bold text-orange-600">{(supplier.total_debt || 0).toFixed(2)} ج.م</span></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => { setSelectedSupplier(supplier); setShowSupplyModal(true); }} 
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium"
                              >
                                <Package className="w-4 h-4" />
                                توريد
                              </button>
                              <button 
                                onClick={() => { setSelectedSupplier(supplier); setReturnFormData({ productId: '', quantity: '', notes: '' }); setShowReturnModal(true); }} 
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium"
                              >
                                <Minus className="w-4 h-4" />
                                مرتجع
                              </button>
                              <button 
                                onClick={() => { setSelectedSupplier(supplier); setPaySupplierData({ amount: supplier.total_debt?.toString() || '', notes: '' }); setShowPaySupplierModal(true); }} 
                                disabled={(supplier.total_debt || 0) <= 0}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium disabled:opacity-50"
                              >
                                <Banknote className="w-4 h-4" />
                                تسديد
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ============== EXPENSES TAB ============== */}
            <TabsContent value="expenses">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">إدارة المصروفات</h1>
                  <p className="text-sm text-slate-500 mt-1">مصروفات اليوم: {todayExpenses.toFixed(2)} ج.م</p>
                </div>
                <button onClick={() => setShowAddExpenseModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95">
                  <Plus className="w-5 h-5" />
                  إضافة مصروف
                </button>
              </div>

              {/* Daily Profit Report Card */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 mb-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-4">تقرير الأرباح اليومية</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-purple-200 text-sm">المبيعات</p>
                    <p className="text-xl font-bold">{dailyProfit.salesRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-purple-200 text-sm">تكلفة البضاعة</p>
                    <p className="text-xl font-bold">-{dailyProfit.cogs.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-purple-200 text-sm">المصروفات</p>
                    <p className="text-xl font-bold">-{dailyProfit.expenses.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-white text-sm">صافي الربح</p>
                    <p className="text-2xl font-bold">{dailyProfit.profit.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm text-purple-200">
                    المعادلة: ({dailyProfit.salesRevenue.toFixed(2)} - {dailyProfit.cogs.toFixed(2)}) - {dailyProfit.expenses.toFixed(2)} = 
                    <span className="font-bold text-white mr-2">{dailyProfit.profit.toFixed(2)} ج.م</span>
                  </p>
                </div>
              </div>

              {loadingExpenses ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">لا يوجد مصروفات</h3>
                </div>
              ) : (
                <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-50 border-b border-purple-100">
                        <th className="px-4 py-3 text-right text-sm font-semibold text-purple-800">التاريخ</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-purple-800">الفئة</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-purple-800">المبلغ</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-purple-800">الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-purple-50/50">
                          <td className="px-4 py-3">{formatDate(expense.expense_date)}</td>
                          <td className="px-4 py-3">{expense.category}</td>
                          <td className="px-4 py-3"><span className="font-bold text-purple-600">{(expense.amount || 0).toFixed(2)} ج.م</span></td>
                          <td className="px-4 py-3 text-slate-500">{expense.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ============== MODALS ============== */}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">إضافة عميل جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-red-600 text-sm">{formError}</p></div>}

            <form onSubmit={handleAddCustomer}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">اسم العميل <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="أدخل اسم العميل" required />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="أدخل رقم الهاتف" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">العنوان</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none" rows={3} placeholder="أدخل العنوان" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">إلغاء</button>
                <button type="submit" disabled={savingCustomer} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg">
                  {savingCustomer ? 'جاري...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">إضافة مورد جديد</h3>
              <button onClick={() => setShowAddSupplierModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {supplierError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-red-600 text-sm">{supplierError}</p></div>}

            <form onSubmit={handleAddSupplier}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">اسم المورد <span className="text-red-500">*</span></label>
                <input type="text" value={supplierFormData.name} onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="أدخل اسم المورد" required />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                <input type="tel" value={supplierFormData.phone} onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="أدخل رقم الهاتف" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">العنوان</label>
                <textarea value={supplierFormData.address} onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none" rows={3} placeholder="أدخل العنوان" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddSupplierModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">إلغاء</button>
                <button type="submit" disabled={savingSupplier} className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg">
                  {savingSupplier ? 'جاري...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supply Modal */}
      {showSupplyModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">تسجيل توريد بضاعة</h3>
              <button onClick={() => setShowSupplyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-orange-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-700">المورد: <span className="font-bold">{selectedSupplier.name}</span></p>
              <p className="text-sm text-orange-700">الدين الحالي: <span className="font-bold">{(selectedSupplier.total_debt || 0).toFixed(2)} ج.م</span></p>
            </div>

            {supplierError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-red-600 text-sm">{supplierError}</p></div>}

            <form onSubmit={handleSupply}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">المنتج (اختياري)</label>
                <select 
                  value={supplyFormData.productId} 
                  onChange={(e) => setSupplyFormData({ ...supplyFormData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">اختر منتج...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (المخزون: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الكمية</label>
                  <input 
                    type="number" 
                    value={supplyFormData.quantity} 
                    onChange={(e) => setSupplyFormData({ ...supplyFormData, quantity: e.target.value })} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
                    placeholder="0" 
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">السعر الإجمالي</label>
                  <input 
                    type="number" 
                    value={supplyFormData.price} 
                    onChange={(e) => setSupplyFormData({ ...supplyFormData, price: e.target.value })} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
                    placeholder="0" 
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <textarea 
                  value={supplyFormData.notes} 
                  onChange={(e) => setSupplyFormData({ ...supplyFormData, notes: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none" 
                  rows={2} 
                  placeholder="ملاحظات..."
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSupplyModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">إلغاء</button>
                <button type="submit" disabled={savingSupply} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg">
                  {savingSupply ? 'جاري...' : 'تسجيل توريد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {showPaySupplierModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">تسديد مورد</h3>
              <button onClick={() => setShowPaySupplierModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-green-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700">المورد: <span className="font-bold">{selectedSupplier.name}</span></p>
              <p className="text-sm text-green-700">الدين الحالي: <span className="font-bold">{(selectedSupplier.total_debt || 0).toFixed(2)} ج.م</span></p>
            </div>

            {supplierError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-red-600 text-sm">{supplierError}</p></div>}

            <form onSubmit={handlePaySupplier}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">المبلغ المراد سداده</label>
                <input 
                  type="number" 
                  value={paySupplierData.amount} 
                  onChange={(e) => setPaySupplierData({ ...paySupplierData, amount: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg text-center font-bold" 
                  placeholder="0" 
                  step="0.01"
                  required
                />
                
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPaySupplierData({ ...paySupplierData, amount: (selectedSupplier.total_debt * pct).toFixed(2) })}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <textarea 
                  value={paySupplierData.notes} 
                  onChange={(e) => setPaySupplierData({ ...paySupplierData, notes: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none" 
                  rows={2} 
                  placeholder="ملاحظات..."
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPaySupplierModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">إلغاء</button>
                <button type="submit" disabled={savingPaySupplier} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg">
                  {savingPaySupplier ? 'جاري...' : 'تأكيد السداد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal (مرتجع) */}
      {showReturnModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">تسجيل مرتجع</h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">المورد: <span className="font-bold">{selectedSupplier.name}</span></p>
              <p className="text-sm text-red-700">الدين الحالي: <span className="font-bold">{(selectedSupplier.total_debt || 0).toFixed(2)} ج.م</span></p>
            </div>

            {supplierError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-red-600 text-sm">{supplierError}</p></div>}

            <form onSubmit={handleReturn}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">المنتج <span className="text-red-500">*</span></label>
                <select 
                  value={returnFormData.productId} 
                  onChange={(e) => setReturnFormData({ ...returnFormData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                >
                  <option value="">اختر منتج...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - سعر التكلفة: {(p.price_buy || 0).toFixed(2)} ج.م (المخزون: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">الكمية <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  value={returnFormData.quantity} 
                  onChange={(e) => setReturnFormData({ ...returnFormData, quantity: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg text-center font-bold" 
                  placeholder="0" 
                  step="0.01"
                  required
                />
                {returnFormData.productId && (
                  <p className="text-sm text-slate-500 mt-2">
                    القيمة: {(parseFloat(returnFormData.quantity || '0') * (products.find(p => p.id === returnFormData.productId)?.price_buy || 0)).toFixed(2)} ج.م
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <textarea 
                  value={returnFormData.notes} 
                  onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none" 
                  rows={2} 
                  placeholder="ملاحظات..."
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReturnModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">إلغاء</button>
                <button type="submit" disabled={savingReturn} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg">
                  {savingReturn ? 'جاري...' : 'تسجيل مرتجع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">إضافة مصروف جديد</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {expenseError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-red-600 text-sm">{expenseError}</p></div>}

            <form onSubmit={handleAddExpense}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">الفئة</label>
                <select 
                  value={expenseFormData.category} 
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">المبلغ</label>
                <input 
                  type="number" 
                  value={expenseFormData.amount} 
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg text-center font-bold" 
                  placeholder="0" 
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <textarea 
                  value={expenseFormData.notes} 
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, notes: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none" 
                  rows={2} 
                  placeholder="ملاحظات..."
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">إلغاء</button>
                <button type="submit" disabled={savingExpense} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg">
                  {savingExpense ? 'جاري...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Payment Modal */}
      {showPaymentModal && paymentCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">تسديد مبلغ</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="font-bold text-slate-900">{paymentCustomer.customer.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                إجمالي الدين: <span className="font-bold text-red-600">{paymentCustomer.totalDebt.toFixed(2)} ج.م</span>
              </p>
            </div>

            {paymentError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-red-600 text-sm">{paymentError}</p></div>}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">المبلغ المراد سداده</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg text-center font-bold"
                placeholder="أدخل المبلغ"
                step="0.01"
                min="0"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">إلغاء</button>
              <button onClick={handlePayDebt} disabled={isProcessingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0} className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg font-medium">
                {isProcessingPayment ? 'جاري...' : 'تأكيد السداد'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Modal */}
      {showInvoicesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">سجل المعاملات - {selectedCustomerName}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  إجمالي المستحقات: <span className="font-bold text-red-600">{selectedCustomerDebt.toFixed(2)} ج.م</span>
                </p>
              </div>
              <button onClick={() => setShowInvoicesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {selectedCustomerInvoices
                .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
                .map((transaction) => {
                  const isPayment = transaction.payment_method === 'debt_payment'
                  const isExpanded = expandedRows.has(transaction.id)
                  const items = transaction.items || []
                  
                  return (
                    <div key={transaction.id} className={`border rounded-lg overflow-hidden ${isPayment ? 'bg-green-50 border-green-200' : 'bg-white border-red-100'}`}>
                      <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => !isPayment && toggleExpandedRow(transaction.id)}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-right flex-1">
                            <div className="flex items-center gap-2">
                              {isPayment ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  سداد
                                </span>
                              ) : (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                    <CreditCard className="w-3 h-3" />
                                    آجل
                                  </span>
                                  {items.length > 0 && (isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
                                </>
                              )}
                              <span className="text-sm text-slate-500">{formatDate(transaction.sale_date)}</span>
                            </div>
                          </div>
                          <div className="text-left min-w-[100px]">
                            {isPayment ? (
                              <span className="text-green-600 font-bold">-{transaction.amount_paid.toFixed(2)}</span>
                            ) : (
                              <span className="text-red-600 font-bold">{transaction.remaining_amount.toFixed(2)}</span>
                            )}
                            <span className="text-xs text-slate-400 mr-1">ج.م</span>
                          </div>
                        </div>
                      </div>
                      
                      {!isPayment && isExpanded && items.length > 0 && (
                        <div className="bg-slate-50 border-t border-red-100 p-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-right text-slate-500 text-xs">
                                <th className="pb-1">المنتج</th>
                                <th className="pb-1 w-16">الكمية</th>
                                <th className="pb-1 w-20">سعر الوحدة</th>
                                <th className="pb-1 w-20 text-left">الإجمالي</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, idx) => (
                                <tr key={idx} className="border-t border-slate-200">
                                  <td className="py-1.5 text-right">{item.product_name}</td>
                                  <td className="py-1.5 text-center">{item.quantity}</td>
                                  <td className="py-1.5 text-center">{(item.unit_price || 0).toFixed(2)}</td>
                                  <td className="py-1.5 text-left font-medium">{(item.total_price || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <BottomNav cartCount={0} />
=======
import React, { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useStore } from "@/hooks/use-store"
import type { AccountEntity as Account } from "@/lib/types"
import {
  Users, Loader2, Menu, DollarSign, Package, Trash2, Plus, X,
  AlertTriangle, Search, Edit3, FileText, Phone, LayoutDashboard,
  Factory, LogOut, Settings, ChevronLeft, ChevronRight, TrendingDown,
  TrendingUp, CheckCircle
} from "lucide-react"

type Category = "Regular" | "VIP"

const TAJAWAL_URL =
  "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap"

/* ─────────────────────────────────────────────
   Modal Wrapper
───────────────────────────────────────────── */
function Modal({
  open,
  onClose,
  children,
  maxW = "max-w-md",
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxW?: string
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-3xl p-6 w-full ${maxW} max-h-[90vh] overflow-y-auto shadow-2xl`}
        style={{ animation: "modalIn 0.2s ease-out" }}
      >
        {children}
      </div>
>>>>>>> blackboxai-upload-all-changes
    </div>
  )
}

<<<<<<< HEAD
=======
/* ─────────────────────────────────────────────
   Account Form
───────────────────────────────────────────── */
function AccountForm({
  title, formType,
  name, setName,
  phone, setPhone,
  address, setAddress,
  debt, setDebt,
  category, setCategory,
  onSubmit, onClose, loading,
}: {
  title: string
  formType: "customer" | "supplier"
  name: string; setName: (v: string) => void
  phone: string; setPhone: (v: string) => void
  address: string; setAddress: (v: string) => void
  debt: number; setDebt: (v: number) => void
  category: Category; setCategory: (v: Category) => void
  onSubmit: () => void
  onClose: () => void
  loading: boolean
}) {
  const inputCls = "w-full p-3.5 border border-slate-200 rounded-2xl focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 font-medium outline-none transition text-sm bg-slate-50 focus:bg-white"

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {formType === "customer" ? "إضافة عميل جديد للنظام" : "إضافة مورد جديد للنظام"}
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 mr-1">الاسم الكامل *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل الاسم الكامل"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 mr-1">رقم الهاتف</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className={inputCls}
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 mr-1">العنوان</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="العنوان التفصيلي"
            className={`${inputCls} h-20 resize-none`}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 mr-1">الرصيد الابتدائي</label>
          <input
            type="number"
            value={debt || ""}
            onChange={(e) => setDebt(Number(e.target.value))}
            placeholder="0"
            className={inputCls}
          />
        </div>
        {formType === "customer" && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 mr-1">الفئة</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={inputCls}
            >
              <option value="Regular">عادي</option>
              <option value="VIP">مميز ⭐</option>
            </select>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onSubmit}
            disabled={loading || !name.trim()}
            className="flex-1 bg-[#6C63FF] hover:bg-[#5A55E6] disabled:opacity-40 text-white py-3.5 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "💾 حفظ البيانات"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3.5 border-2 border-slate-200 hover:bg-slate-50 rounded-2xl font-bold transition-all text-sm text-slate-600"
          >
            إلغاء
          </button>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function CustomersPage() {
  const { store, isLoaded, user } = useStore()
  const [mounted, setMounted] = useState(false)

  // ── Sidebar ──────────────────────────────
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // ── Data ─────────────────────────────────
  const [shopId, setShopId] = useState("")
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Account[]>([])
  const [suppliers, setSuppliers] = useState<Account[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([])
  const [customerDebtSum, setCustomerDebtSum] = useState(0)
  const [supplierDebtSum, setSupplierDebtSum] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"customers" | "suppliers">("customers")

  // ── Modals ────────────────────────────────
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [showStock, setShowStock] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [current, setCurrent] = useState<Account | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)

  // ── Form fields ───────────────────────────
  const [formType, setFormType] = useState<"customer" | "supplier">("customer")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [debt, setDebt] = useState(0)
  const [category, setCategory] = useState<Category>("Regular")

  // ── Pay ───────────────────────────────────
  const [payAmount, setPayAmount] = useState(0)
  const [payDesc, setPayDesc] = useState("")

  // ── Stock ─────────────────────────────────
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [stockQty, setStockQty] = useState(0)
  const [stockPrice, setStockPrice] = useState(0)
  const [stockType, setStockType] = useState<"incoming" | "return">("incoming")

  // ── Misc ──────────────────────────────────
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  // ── Mount & fonts ─────────────────────────
  useEffect(() => {
    setMounted(true)
    const link = document.createElement("link")
    link.href = TAJAWAL_URL
    link.rel = "stylesheet"
    document.head.appendChild(link)

    // inject keyframes
    const style = document.createElement("style")
    style.textContent = `
      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to   { opacity: 1; transform: scale(1)    translateY(0);    }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      .row-enter { animation: slideIn 0.2s ease-out; }
    `
    document.head.appendChild(style)

    return () => {
      try { document.head.removeChild(link) } catch (_) {}
      try { document.head.removeChild(style) } catch (_) {}
    }
  }, [])

  // ── Persist sidebar ───────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) setCollapsed(saved === "true")
  }, [])
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed))
  }, [collapsed])

  // ── Auto-clear messages ───────────────────
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 3000)
      return () => clearTimeout(t)
    }
  }, [successMsg])
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(t)
    }
  }, [error])

  // ── Fetch ─────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!isLoaded || !store?.id) return
    setLoading(true)
    setShopId(store.id)
    setError("")
    try {
      const [custRes, suppRes] = await Promise.all([
        supabase.from("customers").select("*").eq("shop_id", store.id).order("name"),
        supabase.from("suppliers").select("*").eq("shop_id", store.id).order("name"),
      ])
      if (custRes.error) throw custRes.error
      if (suppRes.error) throw suppRes.error

      const custs: Account[] = (custRes.data ?? []).map((c) => ({ ...c, type: "customer" as const }))
      const supps: Account[] = (suppRes.data ?? []).map((s) => ({ ...s, type: "supplier" as const }))

      setCustomers(custs)
      setSuppliers(supps)
      setCustomerDebtSum(custs.reduce((s, c) => s + Number(c.total_debt ?? 0), 0))
      setSupplierDebtSum(supps.reduce((s, c) => s + Number(c.total_debt ?? 0), 0))
    } catch (err: any) {
      setError(`خطأ في تحميل البيانات: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [isLoaded, store?.id])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Realtime ──────────────────────────────
  useEffect(() => {
    if (!store?.id) return
    const ch = supabase.channel("accounts-realtime")
    ch.on("postgres_changes", { event: "*", schema: "public", table: "customers" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "suppliers" }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [store?.id, fetchData])

  // ── Filter ────────────────────────────────
  useEffect(() => {
    const list = activeTab === "customers" ? customers : suppliers
    const q = searchTerm.toLowerCase()
    setFilteredAccounts(
      q
        ? list.filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.account_number.includes(q) ||
              (a.phone ?? "").includes(q)
          )
        : list
    )
  }, [searchTerm, activeTab, customers, suppliers])

  // ── Helpers ───────────────────────────────
  const genAccountNumber = (type: "customer" | "supplier") =>
    `${type === "customer" ? "CUST" : "SUPP"}-${Date.now().toString().slice(-6)}-${
      Math.floor(Math.random() * 10000).toString().padStart(4, "0")
    }`

  const resetForm = () => {
    setName(""); setPhone(""); setAddress(""); setDebt(0); setCategory("Regular")
  }

  const openAdd = (type: "customer" | "supplier") => {
    setFormType(type); resetForm(); setShowAdd(true)
  }

  const openEdit = (acc: Account) => {
    setFormType(acc.type as "customer" | "supplier")
    setCurrent(acc)
    setName(acc.name)
    setPhone(acc.phone ?? "")
    setAddress(acc.address ?? "")
    setDebt(acc.total_debt ?? 0)
    setCategory((acc.category as Category) ?? "Regular")
    setShowEdit(true)
  }

  const openPay = (acc: Account) => {
    setCurrent(acc); setPayAmount(0); setPayDesc(""); setShowPay(true)
  }

  const openDeleteConfirm = (acc: Account) => {
    setAccountToDelete(acc); setShowDeleteConfirm(true)
  }

  const openStock = async (acc: Account) => {
    setCurrent(acc)
    setSelectedProduct(null); setStockQty(0); setStockPrice(0); setStockType("incoming")
    const { data } = await supabase.from("products").select("*").eq("shop_id", shopId)
    setProducts(data ?? [])
    setShowStock(true)
  }

  // ── Actions ───────────────────────────────
  const handleSave = async (mode: "add" | "edit") => {
    if (!name.trim()) return setError("الاسم مطلوب")
    setActionLoading(true)
    setError("")
    try {
      const num = mode === "add" ? genAccountNumber(formType) : current!.account_number
      const payload: any = {
        shop_id: shopId,
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        account_number: num,
        total_debt: Number(debt),
        status: "active",
      }
      if (formType === "customer") payload.category = category
      const table = `${formType}s`
      const { error: err } =
        mode === "add"
          ? await supabase.from(table).insert([payload])
          : await supabase.from(table).update(payload).eq("id", current!.id)
      if (err) throw err
      resetForm()
      setShowAdd(false)
      setShowEdit(false)
      setSuccessMsg(mode === "add" ? "✅ تم إضافة الحساب بنجاح" : "✅ تم تحديث البيانات بنجاح")
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!accountToDelete) return
    setActionLoading(true)
    try {
      const { error: err } = await supabase.from(`${accountToDelete.type}s`).delete().eq("id", accountToDelete.id)
      if (err) throw err
      setShowDeleteConfirm(false)
      setAccountToDelete(null)
      setSuccessMsg("✅ تم حذف الحساب بنجاح")
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePay = async () => {
    if (!current || payAmount <= 0) return setError("أدخل مبلغاً صحيحاً")
    setActionLoading(true)
    setError("")
    try {
      const newDebt = (current.total_debt ?? 0) - payAmount
      const { error: e1 } = await supabase
        .from(`${current.type}s`)
        .update({ total_debt: newDebt })
        .eq("id", current.id)
      if (e1) throw e1
      const { error: e2 } = await supabase.from("account_ledger").insert({
        account_id: current.id,
        account_type: current.type,
        shop_id: shopId,
        transaction_type: "payment",
        amount: payAmount,
        description: payDesc || `دفعة - ${new Date().toLocaleDateString("ar")}`,
        balance_after: newDebt,
      })
      if (e2) throw e2
      setShowPay(false)
      setSuccessMsg(`✅ تم تسجيل دفعة ${payAmount.toLocaleString("ar-EG")} ج.م`)
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStock = async () => {
    if (!current || !selectedProduct || stockQty <= 0 || stockPrice <= 0)
      return setError("أكمل جميع البيانات المطلوبة")
    setActionLoading(true)
    setError("")
    try {
      const { data, error: err } = await supabase.rpc("handle_supplier_stock_transaction", {
        p_shop_id: shopId,
        p_supplier_id: current.id,
        p_product_id: selectedProduct.id,
        p_quantity: stockQty,
        p_price: stockPrice,
        p_type: stockType,
        p_description: "دفعة مخزون",
      })
      if (err) throw err
      if (!data?.success) throw new Error("فشلت العملية")
      setShowStock(false)
      setSuccessMsg("✅ تم تسجيل عملية المخزون بنجاح")
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // ─────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#6C63FF] mx-auto mb-4" />
          <p className="text-slate-500 font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const inputCls = "w-full p-3.5 border border-slate-200 rounded-2xl focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 font-medium outline-none transition text-sm bg-slate-50 focus:bg-white"

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "لوحة التحكم", href: "/dashboard" },
    { icon: <Users className="w-5 h-5" />, label: "العملاء", href: "/customers", active: true },
    { icon: <Package className="w-5 h-5" />, label: "المنتجات", href: "/products" },
    { icon: <FileText className="w-5 h-5" />, label: "التقارير", href: "/reports" },
    { icon: <Settings className="w-5 h-5" />, label: "الإعدادات", href: "/settings" },
  ]

  /* ─── SIDEBAR WIDTH CLASSES ─── */
  const sidebarW = collapsed ? "lg:w-20" : "lg:w-64"
  const mainMr   = collapsed ? "lg:mr-20" : "lg:mr-64"

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
      className="min-h-screen bg-[#f4f6fb] text-slate-900"
    >
      {/* ══════════════════════════════
          MOBILE OVERLAY
      ══════════════════════════════ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════════════════════════
          SIDEBAR
      ══════════════════════════════ */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50 bg-[#161c2d] text-white
          flex flex-col transition-all duration-300 ease-in-out shadow-2xl
          w-64 ${sidebarW}
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-black text-xs">ERP</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black text-white leading-tight">IMD ERP</h1>
                {store?.name && (
                  <p className="text-xs text-slate-400 truncate">{store.name}</p>
                )}
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-black text-xs">ERP</span>
            </div>
          )}
          {/* Desktop toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition flex-shrink-0"
          >
            {collapsed
              ? <ChevronLeft className="w-4 h-4 text-slate-400" />
              : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href ?? "#"}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm
                ${item.active
                  ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30"
                  : "text-slate-400 hover:bg-white/8 hover:text-white"}
                ${collapsed ? "justify-center px-2" : ""}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-2.5 border-t border-white/10 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-white/5">
              <p className="text-xs text-slate-500">المستخدم الحالي</p>
              <p className="font-bold text-xs text-white mt-0.5 truncate">
                {user?.email?.split("@")[0] ?? "غير معروف"}
              </p>
            </div>
          )}
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className={`
              w-full flex items-center gap-2 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20
              text-red-400 hover:text-red-300 rounded-xl font-semibold transition-all text-sm
              ${collapsed ? "justify-center" : ""}
            `}
            title="تسجيل خروج"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && "تسجيل خروج"}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════
          MAIN CONTENT — FIX: full class names
      ══════════════════════════════ */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMr}`}>

        {/* ── TOP BAR ── */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-slate-900 leading-tight">إدارة الحسابات</h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {customers.length} عميل · {suppliers.length} مورد
              </p>
            </div>
            {actionLoading && (
              <div className="flex items-center gap-1.5 text-[#6C63FF] text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">جاري التنفيذ...</span>
              </div>
            )}
            {/* Search - desktop */}
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالاسم أو الرقم أو الهاتف..."
                className="w-56 lg:w-72 pr-9 pl-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 outline-none bg-slate-50 focus:bg-white transition"
              />
            </div>
            <button
              onClick={() => openAdd(activeTab === "customers" ? "customer" : "supplier")}
              className="bg-[#6C63FF] hover:bg-[#5A55E6] text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة حساب</span>
              <span className="sm:hidden">إضافة</span>
            </button>
          </div>
          {/* Mobile search */}
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث..."
                className="w-full pr-9 pl-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-[#6C63FF] outline-none bg-slate-50 focus:bg-white transition"
              />
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="flex-1 p-4 space-y-4 max-w-7xl w-full mx-auto">

          {/* SUCCESS */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="flex-1 font-semibold text-emerald-800 text-sm">{successMsg}</span>
              <button onClick={() => setSuccessMsg("")} className="p-1 hover:bg-emerald-100 rounded-lg">
                <X className="w-3.5 h-3.5 text-emerald-500" />
              </button>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="flex-1 font-semibold text-red-800 text-sm">{error}</span>
              <button onClick={() => setError("")} className="p-1 hover:bg-red-100 rounded-lg">
                <X className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-[#6C63FF]/10 rounded-xl flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-[#6C63FF]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">مديونية العملاء</p>
                <p className="text-xl font-black text-slate-900 leading-tight">
                  {customerDebtSum.toLocaleString("ar-EG")}
                  <span className="text-xs font-semibold text-[#6C63FF] mr-1">ج.م</span>
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="p-2.5 bg-orange-50 rounded-xl flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">مديونية الموردين</p>
                <p className="text-xl font-black text-slate-900 leading-tight">
                  {supplierDebtSum.toLocaleString("ar-EG")}
                  <span className="text-xs font-semibold text-orange-500 mr-1">ج.م</span>
                </p>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100 gap-1">
            <button
              onClick={() => { setActiveTab("customers"); setSearchTerm("") }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                activeTab === "customers"
                  ? "bg-[#6C63FF] text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4" />
              العملاء ({customers.length})
            </button>
            <button
              onClick={() => { setActiveTab("suppliers"); setSearchTerm("") }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                activeTab === "suppliers"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Factory className="w-4 h-4" />
              الموردين ({suppliers.length})
            </button>
          </div>

          {/* TABLE / CARDS */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
              <Loader2 className="h-10 w-10 animate-spin text-[#6C63FF] mb-3" />
              <p className="font-bold text-slate-400 text-sm">جاري تحميل البيانات...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-400 mb-2">
                {searchTerm ? "لا توجد نتائج" : "لا توجد حسابات بعد"}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {searchTerm ? `لا يوجد حساب يطابق "${searchTerm}"` : "ابدأ بإضافة أول حساب الآن"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => openAdd(activeTab === "customers" ? "customer" : "supplier")}
                  className="bg-[#6C63FF] hover:bg-[#5A55E6] text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:shadow-xl transition-all text-sm inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> إضافة حساب جديد
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── DESKTOP TABLE ── */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-5 py-3.5 text-right text-xs font-black text-slate-500 uppercase tracking-wide">رقم الحساب</th>
                        <th className="px-5 py-3.5 text-right text-xs font-black text-slate-500 uppercase tracking-wide">الاسم</th>
                        <th className="px-5 py-3.5 text-right text-xs font-black text-slate-500 uppercase tracking-wide">الهاتف</th>
                        <th className="px-5 py-3.5 text-right text-xs font-black text-slate-500 uppercase tracking-wide">الرصيد</th>
                        <th className="px-5 py-3.5 text-center text-xs font-black text-slate-500 uppercase tracking-wide">الحالة</th>
                        <th className="px-5 py-3.5 text-center text-xs font-black text-slate-500 uppercase tracking-wide">العمليات السريعة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAccounts.map((acc, i) => (
                        <tr
                          key={acc.id}
                          className="hover:bg-slate-50/60 transition-colors group row-enter"
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-400 font-bold">{acc.account_number}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-[#6C63FF] font-black text-xs">{acc.name.charAt(0)}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 text-sm">{acc.name}</span>
{acc.category === "vip" && ( // ← خليتها حروف صغيرة عشان تطابق النوع (Type)
  <span className="mr-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-lg font-bold">⭐</span>
)}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {acc.phone ? (
                              <a href={`tel:${acc.phone}`} className="text-[#6C63FF] hover:underline font-medium flex items-center gap-1 text-sm">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {acc.phone}
                              </a>
                            ) : (
                              <span className="text-slate-300 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-lg font-black ${(acc.total_debt ?? 0) > 0 ? "text-red-500" : "text-emerald-600"}`}>
                              {(acc.total_debt ?? 0).toLocaleString("ar-EG")}
                            </span>
                            <span className="text-xs text-slate-400 mr-1">ج.م</span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">✓ نشط</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              {acc.type === "supplier" && (
                                <button
                                  onClick={() => openStock(acc)}
                                  className="p-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                                  title="مخزون"
                                >
                                  <Package className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => openPay(acc)}
                                className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                                title="تسجيل دفعة"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEdit(acc)}
                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                                title="تعديل"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(acc)}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
                  <p className="text-xs text-slate-400 font-medium">
                    إجمالي: {filteredAccounts.length} حساب
                    {searchTerm && ` · نتائج البحث عن "${searchTerm}"`}
                  </p>
                </div>
              </div>

              {/* ── MOBILE CARDS ── */}
              <div className="md:hidden space-y-3">
                {filteredAccounts.map((acc, i) => (
                  <div
                    key={acc.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 row-enter"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-[#6C63FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-[#6C63FF] font-black text-sm">{acc.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-black text-slate-900 text-sm">{acc.name}</h3>
{acc.category === "vip" && ( // ← خليتها حروف صغيرة عشان تطابق النوع (Type)
  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-lg font-bold">⭐</span>
)}
                          </div>
                          <p className="text-xs text-slate-400 font-mono">{acc.account_number}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`text-lg font-black ${(acc.total_debt ?? 0) > 0 ? "text-red-500" : "text-emerald-600"}`}>
                          {(acc.total_debt ?? 0).toLocaleString("ar-EG")}
                        </span>
                        <span className="text-xs text-slate-400 mr-1">ج.م</span>
                      </div>
                    </div>
                    {acc.phone && (
                      <a
                        href={`tel:${acc.phone}`}
                        className="flex items-center gap-1.5 text-xs text-[#6C63FF] mb-3 hover:underline font-medium"
                      >
                        <Phone className="w-3.5 h-3.5" /> {acc.phone}
                      </a>
                    )}
                    <div className="flex gap-2">
                      {acc.type === "supplier" && (
                        <button
                          onClick={() => openStock(acc)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <Package className="w-3.5 h-3.5" /> مخزون
                        </button>
                      )}
                      <button
                        onClick={() => openPay(acc)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> دفع
                      </button>
                      <button
                        onClick={() => openEdit(acc)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> تعديل
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(acc)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════
          MODALS
      ══════════════════════════════ */}

      {/* ADD */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); resetForm() }}>
        <AccountForm
          title={`إضافة ${formType === "customer" ? "عميل" : "مورد"} جديد`}
          formType={formType}
          name={name} setName={setName}
          phone={phone} setPhone={setPhone}
          address={address} setAddress={setAddress}
          debt={debt} setDebt={setDebt}
          category={category} setCategory={setCategory}
          onSubmit={() => handleSave("add")}
          onClose={() => { setShowAdd(false); resetForm() }}
          loading={actionLoading}
        />
      </Modal>

      {/* EDIT */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)}>
        <AccountForm
          title={`تعديل بيانات ${current?.name ?? ""}`}
          formType={formType}
          name={name} setName={setName}
          phone={phone} setPhone={setPhone}
          address={address} setAddress={setAddress}
          debt={debt} setDebt={setDebt}
          category={category} setCategory={setCategory}
          onSubmit={() => handleSave("edit")}
          onClose={() => setShowEdit(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* PAY */}
      <Modal open={showPay} onClose={() => setShowPay(false)} maxW="max-w-sm">
        {current && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">تسجيل دفعة</h2>
                <p className="text-sm text-slate-500 mt-0.5">للحساب: <span className="font-bold text-[#6C63FF]">{current.name}</span></p>
              </div>
              <button onClick={() => setShowPay(false)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">الرصيد الحالي</p>
              <p className={`text-3xl font-black ${(current.total_debt ?? 0) > 0 ? "text-red-500" : "text-emerald-600"}`}>
                {(current.total_debt ?? 0).toLocaleString("ar-EG")}
                <span className="text-sm font-semibold text-slate-400 mr-1">ج.م</span>
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">المبلغ المدفوع *</label>
                <input
                  type="number"
                  value={payAmount || ""}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  placeholder="أدخل المبلغ"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">وصف العملية</label>
                <input
                  value={payDesc}
                  onChange={(e) => setPayDesc(e.target.value)}
                  placeholder="اختياري"
                  className={inputCls}
                />
              </div>
              {payAmount > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-sm text-emerald-700 font-bold">
                  الرصيد بعد الدفع: {((current.total_debt ?? 0) - payAmount).toLocaleString("ar-EG")} ج.م
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handlePay}
                  disabled={actionLoading || payAmount <= 0}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white py-3.5 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {actionLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><DollarSign className="w-4 h-4" /> تأكيد الدفع</>}
                </button>
                <button
                  onClick={() => setShowPay(false)}
                  className="px-5 py-3.5 border-2 border-slate-200 hover:bg-slate-50 rounded-2xl font-bold text-sm text-slate-600 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* DELETE CONFIRM */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} maxW="max-w-sm">
        {accountToDelete && (
          <>
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-1">تأكيد الحذف</h2>
              <p className="text-sm text-slate-500">
                هل أنت متأكد من حذف حساب <span className="font-bold text-red-500">"{accountToDelete.name}"</span> نهائياً؟
              </p>
              <p className="text-xs text-red-400 mt-2 bg-red-50 py-2 px-3 rounded-xl">⚠️ لا يمكن التراجع عن هذا الإجراء</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirmed}
                disabled={actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white py-3.5 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> نعم، احذف</>}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 border-2 border-slate-200 hover:bg-slate-50 rounded-2xl font-bold text-sm text-slate-600 transition"
              >
                إلغاء
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* STOCK */}
      <Modal open={showStock} onClose={() => setShowStock(false)} maxW="max-w-lg">
        {current && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">إضافة مخزون</h2>
                <p className="text-sm text-slate-500 mt-0.5">المورد: <span className="font-bold text-teal-600">{current.name}</span></p>
              </div>
              <button onClick={() => setShowStock(false)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">المنتج *</label>
                <select
                  onChange={(e) => setSelectedProduct(products.find((p) => p.id === e.target.value) ?? null)}
                  className={inputCls}
                >
                  <option value="">— اختر منتج —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">الكمية *</label>
                  <input
                    type="number"
                    value={stockQty || ""}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">السعر *</label>
                  <input
                    type="number"
                    value={stockPrice || ""}
                    onChange={(e) => setStockPrice(Number(e.target.value))}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">نوع العملية</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStockType("incoming")}
                    className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1.5 ${
                      stockType === "incoming"
                        ? "bg-teal-500 text-white shadow-md"
                        : "border-2 border-slate-200 hover:bg-teal-50 text-slate-600"
                    }`}
                  >
                    📥 وارد
                  </button>
                  <button
                    onClick={() => setStockType("return")}
                    className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1.5 ${
                      stockType === "return"
                        ? "bg-orange-500 text-white shadow-md"
                        : "border-2 border-slate-200 hover:bg-orange-50 text-slate-600"
                    }`}
                  >
                    📤 مردود
                  </button>
                </div>
              </div>
              {stockQty > 0 && stockPrice > 0 && (
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-700 font-bold text-center">
                  الإجمالي: {(stockQty * stockPrice).toLocaleString("ar-EG")} ج.م
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleStock}
                  disabled={actionLoading || !selectedProduct || stockQty <= 0 || stockPrice <= 0}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white py-3.5 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Package className="w-4 h-4" /> تنفيذ العملية</>}
                </button>
                <button
                  onClick={() => setShowStock(false)}
                  className="px-5 py-3.5 border-2 border-slate-200 hover:bg-slate-50 rounded-2xl font-bold text-sm text-slate-600 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>

  )
}
>>>>>>> blackboxai-upload-all-changes
