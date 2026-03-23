'use client'

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
    </div>
  )
}

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