'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { supabase } from '@/lib/supabase'
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Users,
  Phone,
  MapPin,
  Loader2,
  X,
  UserPlus
} from 'lucide-react'

// Types
interface Customer {
  id: string
  store_id: string
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [storeId, setStoreId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    address: ''
  })
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
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

      // Fetch customers for this store
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', profileData.store_id)
        .order('name', { ascending: true })

      if (customersError) {
        setError('خطأ في جلب العملاء: ' + customersError.message)
        setLoading(false)
        return
      }

      setCustomers(customersData || [])
      setFilteredCustomers(customersData || [])
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Filter customers based on search term
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

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '' })
    setFormError(null)
  }

  // Open/Close modal
  const handleOpenModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    resetForm()
  }

// Add customer handler
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setFormError('يرجى إدخال اسم العميل')
      return
    }

    if (!storeId) {
      setFormError('لم يتم العثور على متجر')
      return
    }

    if (!supabase) {
      setFormError('Supabase not configured')
      return
    }

    try {
      setSavingCustomer(true)
      setFormError(null)

      const { data, error: insertError } = await supabase
        .from('customers')
        .insert([{
          store_id: storeId,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim()
        }])
        .select()

      if (insertError) {
        setFormError('خطأ في إضافة العميل: ' + insertError.message)
        return
      }

      // Update local state
      if (data && data.length > 0) {
        const newCustomer = data[0]
        const updatedCustomers = [...customers, newCustomer].sort((a, b) => 
          a.name.localeCompare(b.name)
        )
        setCustomers(updatedCustomers)
        setFilteredCustomers(updatedCustomers.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        ))
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

  // Delete customer handler
  const handleDelete = async (customerId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      return
    }

    try {
      setDeletingId(customerId)

      if (!supabase) {
        alert('Supabase not configured')
        return
      }

      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (deleteError) {
        alert('خطأ في حذف العميل: ' + deleteError.message)
        return
      }

      // Remove from local state
      const updatedCustomers = customers.filter(c => c.id !== customerId)
      setCustomers(updatedCustomers)
      setFilteredCustomers(updatedCustomers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
      
      alert('تم حذف العميل بنجاح')
    } catch (err) {
      console.error('Error deleting customer:', err)
      alert('حدث خطأ في حذف العميل')
    } finally {
      setDeletingId(null)
    }
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar selectedStore="customers" onStoreChange={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <POSHeader 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          selectedStore="customers"
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">إدارة العملاء</h1>
              <p className="text-sm text-slate-500 mt-1">
                {filteredCustomers.length} عميل
                {searchTerm && ` (نتائج البحث: "${searchTerm}")`}
              </p>
            </div>
            
            <button 
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <UserPlus className="w-5 h-5" />
              إضافة عميل
            </button>
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
                <p className="text-slate-500">جاري تحميل العملاء...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredCustomers.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12">
              <div className="flex flex-col items-center justify-center">
                <Users className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  {searchTerm ? 'لا توجد نتائج بحث' : 'لا يوجد عملاء'}
                </h3>
                <p className="text-slate-500 text-center">
                  {searchTerm 
                    ? 'جرب البحث بكلمات مختلفة' 
                    : 'أضف عميلك الأول للبدء'}
                </p>
              </div>
            </div>
          )}

          {/* Customers Table */}
          {!loading && !error && filteredCustomers.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
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
                      <tr 
                        key={customer.id} 
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-slate-900">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {customer.phone ? (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="w-4 h-4 text-slate-400" />
                              {customer.phone}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {customer.address ? (
                            <div className="flex items-center gap-2 text-slate-600 max-w-xs">
                              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{customer.address}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {formatDate(customer.created_at)}
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
                              onClick={() => handleDelete(customer.id)}
                              disabled={deletingId === customer.id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-600 hover:text-red-600 disabled:opacity-50"
                              title="حذف"
                            >
                              {deletingId === customer.id ? (
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">إضافة عميل جديد</h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer}>
              {/* Form Error */}
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{formError}</p>
                </div>
              )}

              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  اسم العميل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسم العميل"
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              {/* Address Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  العنوان
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="أدخل العنوان"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingCustomer}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {savingCustomer ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      إضافة
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

