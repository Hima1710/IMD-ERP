'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { supabase } from '@/lib/supabase'
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
  Wallet
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
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [shopId, setShopId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    address: ''
  })
  const [formError, setFormError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'all' | 'credit'>('all')
  const [creditCustomers, setCreditCustomers] = useState<CreditCustomer[]>([])
  const [loadingCredit, setLoadingCredit] = useState(false)
  const [totalDebt, setTotalDebt] = useState<number>(0)
  const [selectedCustomerInvoices, setSelectedCustomerInvoices] = useState<CreditTransaction[]>([])
  const [showInvoicesModal, setShowInvoicesModal] = useState(false)
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('')

  const fetchCreditCustomers = useCallback(async () => {
    if (!supabase || !shopId) return
    try {
      setLoadingCredit(true)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('shop_id', shopId)
        .gt('remaining_amount', 0)
        .order('sale_date', { ascending: false })

      if (transactionsError) return

      const customerIds = [...new Set(transactionsData?.map(t => t.customer_id).filter(Boolean) || [])]
      if (customerIds.length === 0) {
        setCreditCustomers([])
        setTotalDebt(0)
        return
      }

      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds)

      const customerDebts: { [key: string]: CreditCustomer } = {}
      transactionsData?.forEach(transaction => {
        if (transaction.customer_id && transaction.remaining_amount > 0) {
          if (!customerDebts[transaction.customer_id]) {
            const customer = customersData?.find(c => c.id === transaction.customer_id)
            customerDebts[transaction.customer_id] = {
              customer: customer || { id: transaction.customer_id, shop_id: '', name: 'غير معروف', phone: '', address: '' },
              totalDebt: 0,
              transactions: []
            }
          }
          customerDebts[transaction.customer_id].totalDebt += Number(transaction.remaining_amount)
          customerDebts[transaction.customer_id].transactions.push({
            id: transaction.id,
            sale_date: transaction.sale_date,
            total_amount: Number(transaction.total_amount),
            amount_paid: Number(transaction.amount_paid),
            remaining_amount: Number(transaction.remaining_amount)
          })
        }
      })

      const creditCustomersList = Object.values(customerDebts)
      setCreditCustomers(creditCustomersList)
      const total = creditCustomersList.reduce((sum, cc) => sum + cc.totalDebt, 0)
      setTotalDebt(total)
    } catch (err) {
      console.error('Error fetching credit customers:', err)
    } finally {
      setLoadingCredit(false)
    }
  }, [supabase, shopId])

  useEffect(() => {
    if (activeTab === 'credit' && shopId && !creditCustomers.length) {
      fetchCreditCustomers()
    }
  }, [activeTab, shopId, fetchCreditCustomers, creditCustomers.length])

  const handleViewInvoices = (creditCustomer: CreditCustomer) => {
    setSelectedCustomerInvoices(creditCustomer.transactions)
    setSelectedCustomerName(creditCustomer.customer.name)
    setShowInvoicesModal(true)
  }

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        setError('لم يتم العثور على المستخدم')
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', userData.user.id)
        .single()

      if (!profileData?.shop_id) {
        setError('لم يتم العثور على متجر للمستخدم')
        setLoading(false)
        return
      }

      setShopId(profileData.shop_id)

      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .eq('shop_id', profileData.shop_id)
        .order('name', { ascending: true })

      setCustomers(customersData || [])
      setFilteredCustomers(customersData || [])
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

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

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '' })
    setFormError(null)
  }

  const handleOpenModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    resetForm()
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('يرجى إدخال اسم العميل')
      return
    }
    if (!shopId || !supabase) {
      setFormError('لم يتم العثور على متجر')
      return
    }

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

      handleCloseModal()
      alert('تم إضافة العميل بنجاح')
    } catch (err) {
      console.error('Error adding customer:', err)
      setFormError('حدث خطأ في إضافة العميل')
    } finally {
      setSavingCustomer(false)
    }
  }

  const handleDelete = async (customerId: string) => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar selectedStore="customers" onStoreChange={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <POSHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedStore="customers" />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">إدارة العملاء</h1>
              <p className="text-sm text-slate-500 mt-1">
                {activeTab === 'all' ? `${filteredCustomers.length} عميل` : `${creditCustomers.length} عميل مدين`}
              </p>
            </div>
            <button onClick={handleOpenModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              <UserPlus className="w-5 h-5" />
              إضافة عميل
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              <Users className="w-4 h-4 inline-block ml-2" />
              جميع العملاء
            </button>
            <button onClick={() => setActiveTab('credit')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'credit' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              <CreditCard className="w-4 h-4 inline-block ml-2" />
              العملاء المدينين
            </button>
          </div>

          {activeTab === 'credit' && (
            <>
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 mb-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-1">إجمالي المستحقات</p>
                    <p className="text-4xl font-bold">{totalDebt.toFixed(2)} ج.م</p>
                    <p className="text-red-200 text-sm mt-2">{creditCustomers.length} عميل مدين</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {loadingCredit ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
              ) : creditCustomers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">لا يوجد عملاء مدينين</h3>
                  <p className="text-slate-500">جميع العملاء سددوا مستحقاتهم</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
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
                            <button onClick={() => handleViewInvoices(creditCustomer)} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium">
                              <Eye className="w-4 h-4" />
                              عرض الفواتير
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

          {activeTab === 'all' && (
            <>
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"><p className="text-red-600 text-sm">{error}</p></div>}
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">{searchTerm ? 'لا توجد نتائج بحث' : 'لا يوجد عملاء'}</h3>
                  <p className="text-slate-500">{searchTerm ? 'جرب البحث بكلمات مختلفة' : 'أضف عميلك الأول للبدء'}</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">اسم العميل</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">رقم الهاتف</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">العنوان</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">تاريخ الإضافة</th>
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
                          <td className="px-4 py-3 text-sm">{formatDate(customer.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600" title="تعديل">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(customer.id)} disabled={deletingId === customer.id} className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 disabled:opacity-50" title="حذف">
                                {deletingId === customer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">إضافة عميل جديد</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-red-600 text-sm">{formError}</p></div>}

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
              <button onClick={handleCloseModal} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">إلغاء</button>
              <button onClick={handleAddCustomer} disabled={savingCustomer} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg">
                {savingCustomer ? 'جاري...' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoicesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">فواتير {selectedCustomerName}</h3>
              <button onClick={() => setShowInvoicesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-right text-sm font-semibold">التاريخ</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold">الإجمالي</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold">المدفوع</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold">المتبقي</th>
                </tr>
              </thead>
              <tbody>
                {selectedCustomerInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="px-3 py-2 text-sm">{formatDate(invoice.sale_date)}</td>
                    <td className="px-3 py-2 text-sm">{invoice.total_amount.toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm text-green-600">{invoice.amount_paid.toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm font-bold text-red-600">{invoice.remaining_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

