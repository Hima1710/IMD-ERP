'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Store, 
  Users, 
  DollarSign, 
  Plus, 
  Loader2,
  Package,
  Settings,
  Building2,
  UserPlus,
  LogOut
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Shop {
  id: string
  name: string
  location: string
  created_at: string
}

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: string
  shop_name: string
  shop_id: string
}

interface Stats {
  totalShops: number
  totalUsers: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'stats' | 'shops' | 'users'>('stats')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ totalShops: 0, totalUsers: 0, totalRevenue: 0 })
  const [shops, setShops] = useState<Shop[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [showAddShopModal, setShowAddShopModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [shopForm, setShopForm] = useState({ name: '', location: '' })
  const [userForm, setUserForm] = useState({ 
    email: '', 
    full_name: '', 
    shop_id: '',
    role: 'cashier'
  })

  // Logout function
  const handleLogout = async () => {
    if (!supabase) return
    try {
      await supabase.auth.signOut()
      router.replace('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    if (!supabase) return
    
    try {
      setLoading(true)
      
      // Fetch shops count
      const { data: shopsData } = await supabase
        .from('shops')
        .select('*')
      setShops(shopsData || [])
      
      // Fetch profiles with shop info
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, role, shop_id, shops(name)')
      
      const usersWithShops: UserProfile[] = (profilesData || []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name || 'Unknown',
        email: p.email || '',
        role: p.role || 'cashier',
        shop_name: p.shops?.name || 'No Shop',
        shop_id: p.shop_id || ''
      }))
      setUsers(usersWithShops)
      
      // Fetch total revenue from transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('total_amount')
      
      const totalRevenue = (transactionsData || []).reduce((sum, t) => sum + (t.total_amount || 0), 0)
      
      setStats({
        totalShops: (shopsData || []).length,
        totalUsers: (profilesData || []).length,
        totalRevenue
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddShop = async () => {
    if (!supabase || !shopForm.name.trim()) return
    
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('shops')
        .insert([{ 
          name: shopForm.name, 
          location: shopForm.location 
        }])
      
      if (error) {
        alert('Error adding shop: ' + error.message)
        return
      }
      
      setShowAddShopModal(false)
      setShopForm({ name: '', location: '' })
      fetchStats()
      alert('Shop added successfully!')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddUser = async () => {
    if (!supabase || !userForm.email.trim() || !userForm.full_name.trim()) return
    
    try {
      setSaving(true)
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userForm.email,
        password: 'temp123456', // Temporary password
        email_confirm: true
      })
      
      if (authError) {
        alert('Error creating user: ' + authError.message)
        return
      }
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          full_name: userForm.full_name,
          shop_id: userForm.shop_id || null,
          role: userForm.role
        }])
      
      if (profileError) {
        alert('Error creating profile: ' + profileError.message)
        return
      }
      
      setShowAddUserModal(false)
      setUserForm({ email: '', full_name: '', shop_id: '', role: 'cashier' })
      fetchStats()
      alert('User added successfully!')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold">لوحة تحكم المدير العام</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="flex gap-1 px-6">
          {[
            { id: 'stats', label: 'الإحصائيات', icon: DollarSign },
            { id: 'shops', label: 'المتاجر', icon: Store },
            { id: 'users', label: 'المستخدمين', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Store className="w-10 h-10 text-blue-500" />
                <span className="text-xs text-slate-500">المتاجر</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalShops}</p>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-10 h-10 text-green-500" />
                <span className="text-xs text-slate-500">المستخدمين</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-10 h-10 text-purple-500" />
                <span className="text-xs text-slate-500">إجمالي الإيرادات</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)} ج.م</p>
            </div>
          </div>
        )}

        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">إدارة المتاجر</h2>
              <button
                onClick={() => setShowAddShopModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة متجر
              </button>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold">اسم المتجر</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">الموقع</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-medium">{shop.name}</td>
                      <td className="px-4 py-3 text-slate-400">{shop.location || '-'}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(shop.created_at).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                  {shops.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        لا توجد متاجر
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">إدارة المستخدمين</h2>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                إضافة مستخدم
              </button>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold">الاسم</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">البريد الإلكتروني</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">الدور</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">المتجر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-medium">{user.full_name}</td>
                      <td className="px-4 py-3 text-slate-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'super_admin' 
                            ? 'bg-purple-500/20 text-purple-400'
                            : user.role === 'manager'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {user.role === 'super_admin' ? 'مدير عام' : user.role === 'manager' ? 'مدير' : 'كاشير'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{user.shop_name}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        لا يوجد مستخدمين
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Shop Modal */}
      {showAddShopModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4 border border-slate-700">
            <h3 className="text-lg font-bold mb-4">إضافة متجر جديد</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">اسم المتجر</label>
                <input
                  type="text"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="أدخل اسم المتجر"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">الموقع (اختياري)</label>
                <input
                  type="text"
                  value={shopForm.location}
                  onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="أدخل الموقع"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddShopModal(false)}
                className="flex-1 px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddShop}
                disabled={saving || !shopForm.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4 border border-slate-700">
            <h3 className="text-lg font-bold mb-4">إضافة مستخدم جديد</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="أدخل الاسم"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">المتجر</label>
                <select
                  value={userForm.shop_id}
                  onChange={(e) => setUserForm({ ...userForm, shop_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="">اختر المتجر</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">الدور</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="cashier">كاشير</option>
                  <option value="manager">مدير</option>
                  <option value="super_admin">مدير عام</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddUser}
                disabled={saving || !userForm.email.trim() || !userForm.full_name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

