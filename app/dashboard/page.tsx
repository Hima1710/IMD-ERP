'use client'

import React, { useState, useEffect, useCallback } from "react"
import { useStore } from "@/hooks/use-store"
import { supabase } from "@/lib/supabase"
import {
  LayoutDashboard, Users, Package, FileText, Settings,
  Menu, ChevronLeft, ChevronRight, LogOut,
  TrendingUp, Wallet, ShoppingCart, AlertCircle,
  X, Loader2, RefreshCw, DollarSign, ArrowUpRight,
  ArrowDownRight, ShoppingBag, CreditCard
} from "lucide-react"

const FONT_URL = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap"

/* ── Types ── */
interface DashStats {
  todaySales: number
  totalDebt: number
  totalInvoices: number
  totalProducts: number
  totalCustomers: number
  totalSuppliers: number
  totalExpenses: number
  lowStockCount: number
}

interface ChartPoint {
  day: string
  sales: number
  payments: number
}

interface RecentActivity {
  id: string
  type: string
  amount: number
  name: string
  time: string
  color: "emerald" | "blue" | "orange" | "purple"
}

/* ── Bar Chart Component ── */
function BarChart({ data }: { data: ChartPoint[] }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.sales, d.payments)), 1)

  return (
    <div className="w-full h-64 flex flex-col">
      {/* Bars */}
      <div className="flex-1 flex items-end gap-1.5 px-2">
        {data.map((point, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full flex gap-0.5 items-end" style={{ height: "200px" }}>
              {/* Sales bar */}
              <div className="flex-1 relative">
                <div
                  className="w-full bg-[#6C63FF] rounded-t-md transition-all duration-500 hover:bg-[#5A55E6] cursor-pointer"
                  style={{ height: `${(point.sales / maxVal) * 100}%`, minHeight: point.sales > 0 ? "4px" : "0" }}
                  title={`مبيعات: ${point.sales.toLocaleString("ar-EG")} ج.م`}
                />
              </div>
              {/* Payments bar */}
              <div className="flex-1 relative">
                <div
                  className="w-full bg-emerald-400 rounded-t-md transition-all duration-500 hover:bg-emerald-500 cursor-pointer"
                  style={{ height: `${(point.payments / maxVal) * 100}%`, minHeight: point.payments > 0 ? "4px" : "0" }}
                  title={`تحصيل: ${point.payments.toLocaleString("ar-EG")} ج.م`}
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium rotate-0 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
              {point.day}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#6C63FF] rounded-sm" />
          <span className="text-xs text-slate-500 font-medium">المبيعات</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-400 rounded-sm" />
          <span className="text-xs text-slate-500 font-medium">التحصيل</span>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════ */
export default function DashboardPage() {
  const { store, user, signOut } = useStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [stats, setStats] = useState<DashStats>({
    todaySales: 0, totalDebt: 0, totalInvoices: 0,
    totalProducts: 0, totalCustomers: 0, totalSuppliers: 0,
    totalExpenses: 0, lowStockCount: 0,
  })
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  const shopId = store?.id ?? null

  /* ── mount ── */
  useEffect(() => {
    setMounted(true)
    const link = document.createElement("link"); link.href = FONT_URL; link.rel = "stylesheet"
    document.head.appendChild(link)
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) setCollapsed(saved === "true")
    return () => { try { document.head.removeChild(link) } catch (_) {} }
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed.toString())
  }, [collapsed])

  /* ── fetch dashboard data ── */
  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (!shopId) return
    isRefresh ? setRefreshing(true) : setLoading(true)

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString()

      /* جيب كل customer IDs في هذا الـ shop */
      const { data: shopCustomers } = await supabase
        .from("customers").select("id, total_debt").eq("shop_id", shopId)
      const customerIds = (shopCustomers ?? []).map(c => c.id)
      const customerDebt = (shopCustomers ?? []).reduce((s, c) => s + Number(c.total_debt ?? 0), 0)

      /* sales اليوم */
      let todaySales = 0
      if (customerIds.length > 0) {
        const { data: todaySalesData } = await supabase
          .from("sales")
          .select("total_amount")
          .in("customer_id", customerIds)
          .gte("created_at", todayStr)
        todaySales = (todaySalesData ?? []).reduce((s, x) => s + Number(x.total_amount ?? 0), 0)
      }

      /* باقي الإحصائيات */
      const [invoicesRes, productsRes, suppliersRes, expensesRes, ledgerRes] = await Promise.all([
        supabase.from("invoices").select("id, net_amount, total_amount").eq("shop_id", shopId),
        supabase.from("products").select("id, stock, min_stock, min_quantity").eq("shop_id", shopId),
        supabase.from("suppliers").select("id, total_debt").eq("shop_id", shopId),
        supabase.from("expenses").select("amount").eq("shop_id", shopId),
        supabase.from("account_ledger")
          .select("*, customer:customers(name), supplier:suppliers(name)")
          .eq("shop_id", shopId)
          .order("created_at", { ascending: false })
          .limit(8),
      ])

      const products = productsRes.data ?? []
      const suppliers = suppliersRes.data ?? []
      const invoices = invoicesRes.data ?? []
      const expenses = expensesRes.data ?? []
      const ledger = ledgerRes.data ?? []

      const supplierDebt = suppliers.reduce((s, x) => s + Number(x.total_debt ?? 0), 0)
      const lowStockCount = products.filter(p =>
        Number(p.stock ?? 0) <= Number(p.min_stock ?? p.min_quantity ?? 5)
      ).length

      setStats({
        todaySales,
        totalDebt: customerDebt + supplierDebt,
        totalInvoices: invoices.reduce((s, x) => s + Number(x.net_amount ?? x.total_amount ?? 0), 0),
        totalProducts: products.length,
        totalCustomers: shopCustomers?.length ?? 0,
        totalSuppliers: suppliers.length,
        totalExpenses: expenses.reduce((s, x) => s + Number(x.amount ?? 0), 0),
        lowStockCount,
      })

      /* ── Chart: آخر 14 يوم ── */
      const days14: ChartPoint[] = []
      for (let i = 13; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const nextD = new Date(d); nextD.setDate(nextD.getDate() + 1)

        const dayLabel = d.toLocaleDateString("ar-EG", { day: "numeric", month: "numeric" })

        /* sales لهذا اليوم */
        let daySales = 0
        if (customerIds.length > 0) {
          const { data: ds } = await supabase
            .from("sales")
            .select("total_amount")
            .in("customer_id", customerIds)
            .gte("created_at", d.toISOString())
            .lt("created_at", nextD.toISOString())
          daySales = (ds ?? []).reduce((s, x) => s + Number(x.total_amount ?? 0), 0)
        }

        /* payments لهذا اليوم */
        const { data: dp } = await supabase
          .from("account_ledger")
          .select("amount")
          .eq("shop_id", shopId)
          .eq("transaction_type", "payment")
          .gte("created_at", d.toISOString())
          .lt("created_at", nextD.toISOString())
        const dayPayments = (dp ?? []).reduce((s, x) => s + Number(x.amount ?? 0), 0)

        days14.push({ day: dayLabel, sales: daySales, payments: dayPayments })
      }
      setChartData(days14)

      /* ── Recent Activity ── */
      const activities: RecentActivity[] = ledger.map(entry => {
        const name = entry.customer?.name ?? entry.supplier?.name ?? "غير محدد"
        const amount = Number(entry.amount ?? 0)
        const type = entry.transaction_type
        const time = new Date(entry.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
        let color: RecentActivity["color"] = "blue"
        let typeLabel = type
        if (type === "payment") { color = "emerald"; typeLabel = "دفعة" }
        else if (type === "sale") { color = "purple"; typeLabel = "بيع" }
        else if (type === "purchase") { color = "orange"; typeLabel = "شراء" }
        return { id: entry.id, type: typeLabel, amount, name, time, color }
      })
      setRecentActivity(activities)

    } catch (e: any) {
      console.error("[DASHBOARD]", e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [shopId])

  useEffect(() => {
    if (shopId && mounted) fetchDashboard()
  }, [shopId, mounted, fetchDashboard])

  if (!mounted) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-[#6C63FF]" />
    </div>
  )

  const navItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", href: "/dashboard", active: true },
    { icon: Users, label: "العملاء", href: "/customers" },
    { icon: Package, label: "المنتجات", href: "/products" },
    { icon: FileText, label: "التقارير", href: "/reports" },
    { icon: Settings, label: "الإعدادات", href: "/settings" },
  ]

  const sidebarW = collapsed ? "lg:w-20" : "lg:w-64"
  const mainMr   = collapsed ? "lg:mr-20" : "lg:mr-64"

  const fmt = (n: number) => n.toLocaleString("ar-EG")

  /* Stats cards data */
  const statCards = [
    {
      title: "مبيعات اليوم",
      value: `${fmt(stats.todaySales)} ج.م`,
      icon: ShoppingBag,
      color: "text-[#6C63FF] bg-[#6C63FF]/10",
      sub: "إجمالي مبيعات اليوم",
    },
    {
      title: "إجمالي الديون",
      value: `${fmt(stats.totalDebt)} ج.م`,
      icon: AlertCircle,
      color: "text-red-500 bg-red-50",
      sub: "عملاء + موردين",
    },
    {
      title: "إجمالي الفواتير",
      value: `${fmt(stats.totalInvoices)} ج.م`,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
      sub: `${stats.totalCustomers} عميل`,
    },
    {
      title: "المخزون",
      value: `${fmt(stats.totalProducts)} منتج`,
      icon: Package,
      color: stats.lowStockCount > 0 ? "text-orange-500 bg-orange-50" : "text-blue-500 bg-blue-50",
      sub: stats.lowStockCount > 0 ? `⚠️ ${stats.lowStockCount} منتج مخزون منخفض` : "المخزون كافي",
    },
  ]

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }} className="min-h-screen bg-[#f4f6fb] text-slate-900">

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside className={`
        fixed top-0 right-0 h-full z-50 bg-[#161c2d] text-white flex flex-col
        transition-all duration-300 shadow-2xl w-64 ${sidebarW}
        ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-xs">ERP</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black text-white">IMD ERP</h1>
                <p className="text-xs text-slate-400 truncate">{store?.name}</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center mx-auto">
              <span className="text-white font-black text-xs">ERP</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition">
            {collapsed ? <ChevronLeft className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, href, active }) => (
            <a key={label} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm
                ${active ? "bg-[#6C63FF] text-white shadow-lg" : "text-slate-400 hover:bg-white/10 hover:text-white"}
                ${collapsed ? "justify-center px-2" : ""}`}
              title={collapsed ? label : undefined}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </a>
          ))}
        </nav>

        <div className="p-2.5 border-t border-white/10 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-white/5">
              <p className="text-xs text-slate-500">المستخدم</p>
              <p className="font-bold text-xs text-white truncate">{user?.email?.split("@")[0] ?? "—"}</p>
              <p className="text-xs text-slate-400 truncate">{store?.name}</p>
            </div>
          )}
          <button onClick={() => signOut()}
            className={`w-full flex items-center gap-2 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold text-sm transition-all ${collapsed ? "justify-center" : ""}`}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && "تسجيل الخروج"}
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMr}`}>

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-slate-900">لوحة التحكم</h1>
              <p className="text-xs text-slate-400 hidden sm:block">{store?.name} — {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="p-2 hover:bg-slate-100 rounded-xl transition" title="تحديث">
              <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4 max-w-7xl w-full mx-auto">

          {/* WELCOME */}
          <div className="bg-gradient-to-l from-[#6C63FF]/10 to-white rounded-2xl p-5 border border-[#6C63FF]/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  مرحباً، {user?.email?.split("@")[0] ?? "مدير"} 👋
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">نظرة شاملة على أداء محلك اليوم</p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-center bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-400">العملاء</p>
                  <p className="font-black text-[#6C63FF] text-lg">{stats.totalCustomers}</p>
                </div>
                <div className="text-center bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-400">الموردين</p>
                  <p className="font-black text-orange-500 text-lg">{stats.totalSuppliers}</p>
                </div>
                <div className="text-center bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-400">المنتجات</p>
                  <p className="font-black text-emerald-600 text-lg">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded mb-3 w-2/3" />
                  <div className="h-7 bg-slate-100 rounded mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {statCards.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${s.color}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-slate-500 truncate">{s.title}</p>
                  </div>
                  <p className="text-xl font-black text-slate-900 leading-tight mb-1">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* CHART + ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ── BAR CHART ── */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">حركة المبيعات والتحصيل</h3>
                  <p className="text-xs text-slate-400 mt-0.5">آخر 14 يوم</p>
                </div>
                {!loading && (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {fmt(chartData.reduce((s, d) => s + d.sales, 0))} ج.م
                  </div>
                )}
              </div>
              {loading ? (
                <div className="h-64 bg-slate-50 rounded-xl animate-pulse flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
              ) : chartData.every(d => d.sales === 0 && d.payments === 0) ? (
                <div className="h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                  <TrendingUp className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-slate-400 font-bold text-sm">لا توجد بيانات بعد</p>
                  <p className="text-slate-300 text-xs mt-1">ابدأ بتسجيل مبيعات لعرض الرسم البياني</p>
                </div>
              ) : (
                <BarChart data={chartData} />
              )}
            </div>

            {/* ── RECENT ACTIVITY ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900">أحدث النشاط</h3>
                <a href="/reports" className="text-xs text-[#6C63FF] font-bold hover:underline">عرض الكل</a>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="flex-1 h-3 bg-slate-100 rounded" />
                      <div className="h-3 w-16 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">لا توجد معاملات بعد</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        activity.color === "emerald" ? "bg-emerald-500"
                        : activity.color === "blue" ? "bg-blue-500"
                        : activity.color === "purple" ? "bg-purple-500"
                        : "bg-orange-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{activity.name}</p>
                        <p className="text-xs text-slate-400">{activity.type} · {activity.time}</p>
                      </div>
                      <span className={`font-black text-sm flex-shrink-0 ${
                        activity.color === "emerald" ? "text-emerald-600"
                        : activity.color === "blue" ? "text-blue-600"
                        : activity.color === "purple" ? "text-[#6C63FF]"
                        : "text-orange-600"
                      }`}>
                        {fmt(activity.amount)} ج.م
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EXTRA STATS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <p className="text-xs text-slate-500 font-medium">إجمالي الفواتير</p>
              </div>
              <p className="text-xl font-black text-slate-900">{fmt(stats.totalInvoices)} ج.م</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-4 h-4 text-red-500" />
                <p className="text-xs text-slate-500 font-medium">إجمالي المصروفات</p>
              </div>
              <p className="text-xl font-black text-slate-900">{fmt(stats.totalExpenses)} ج.م</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-orange-500" />
                <p className="text-xs text-slate-500 font-medium">مخزون منخفض</p>
              </div>
              <p className="text-xl font-black text-slate-900">
                {stats.lowStockCount > 0
                  ? <span className="text-orange-500">{stats.lowStockCount} منتج ⚠️</span>
                  : <span className="text-emerald-600">كل شيء كافي ✅</span>
                }
              </p>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-[#6C63FF]" />
              إجراءات سريعة
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: "/customers", icon: Users,        label: "إدارة العملاء",  color: "bg-[#6C63FF]/10 text-[#6C63FF]" },
                { href: "/products",  icon: Package,      label: "المنتجات",       color: "bg-emerald-50 text-emerald-600" },
                { href: "/reports",   icon: FileText,     label: "التقارير",       color: "bg-blue-50 text-blue-600" },
                { href: "/settings",  icon: Settings,     label: "الإعدادات",      color: "bg-orange-50 text-orange-600" },
              ].map((item, i) => (
                <a key={i} href={item.href}
                  className="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 hover:border-[#6C63FF]/30 transition-all hover:shadow-md group">
                  <div className={`p-3 rounded-xl ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-[#6C63FF] transition-colors text-center">{item.label}</p>
                </a>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}