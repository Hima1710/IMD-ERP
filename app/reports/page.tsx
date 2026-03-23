'use client'

<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { POSHeader } from '@/components/pos-header'
import { BottomNav } from '@/components/BottomNav'
import { MobileNav, FloatingMenuButton } from '@/components/MobileNav'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { useStore } from '@/hooks/use-store'
import Invoice from '@/components/Invoice'
import { 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  Eye,
  Loader2,
  TrendingUp,
  Calendar,
  CreditCard,
  ArrowUpDown,
  Package,
  Menu
} from 'lucide-react'

// Types
interface Sale {
  id: string
  total_amount: number
  final_amount: number
  discount_amount: number
  payment_method: 'cash' | 'card'
  amount_paid: number
  change_amount: number
  remaining_amount: number
  items: any[]
  sale_date: string
  shop_id: string
  created_at?: string
}

interface DashboardStats {
  todayRevenue: number
  monthlyRevenue: number
  monthlyOrders: number
}

interface TopProduct {
  name: string
  totalSold: number
}

export default function ReportsPage() {
  const { store, isLoaded, loading: storeLoading } = useStore()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    monthlyRevenue: 0,
    monthlyOrders: 0
  })
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Get date ranges
  const getDateRanges = () => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    return {
      todayStart: todayStart.toISOString(),
      monthStart: monthStart.toISOString()
    }
  }

// ✅ STORE-DRIVEN: No auth.getUser() needed
  const fetchData = useCallback(async () => {
    // Guard: Wait for store to be ready
    if (!store.id) {
      console.log('⏳ [REPORTS] Store not ready, skipping')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (!supabase) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }

      const { todayStart, monthStart } = getDateRanges()

      console.log('📊 [REPORTS] Fetching for shop:', store.id)

      // Fetch transactions for this shop
      const { data: salesData, error: salesError } = await supabase
        .from('transactions')
        .select('*')
        .eq('shop_id', store.id)  // ✅ Direct store.id
        .order('created_at', { ascending: false })

      if (salesError) {
        console.error('Error fetching sales:', salesError)
      }

      // Fetch ALL products for this shop
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', store.id)  // ✅ Direct store.id

      if (productsError) {
        console.error('Error fetching products:', productsError)
      }

      const allSales = salesData || []
      const allProducts = productsData || []

      // Calculate Today's Revenue
      const todayRevenue = allSales
        .filter(s => new Date(s.created_at || s.sale_date) >= new Date(todayStart))
        .reduce((sum, s) => sum + (s.total_amount || 0), 0)

      // Calculate Monthly Revenue
      const monthlyRevenue = allSales
        .filter(s => new Date(s.created_at || s.sale_date) >= new Date(monthStart))
        .reduce((sum, s) => sum + (s.total_amount || 0), 0)

      // Calculate Monthly Orders
      const monthlyOrders = allSales.filter(s => 
        new Date(s.created_at || s.sale_date) >= new Date(monthStart)
      ).length

      // Filter low stock products
      const lowStock = allProducts.filter(p => 
        (p.stock || 0) <= (p.min_quantity || 0)
      )

      // Calculate Top Selling Products
      const productSales: Record<string, number> = {}
      allSales
        .filter(s => new Date(s.created_at || s.sale_date) >= new Date(monthStart))
        .forEach(sale => {
          if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach((item: any) => {
              const key = item.product_name || item.name || 'Unknown'
              productSales[key] = (productSales[key] || 0) + (item.quantity || 1)
            })
          }
        })

      const top5Products = Object.entries(productSales)
        .map(([name, totalSold]) => ({ name, totalSold }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5)

      setStats({
        monthlyRevenue,
        monthlyOrders,
        todayRevenue
      })
      setLowStockProducts(lowStock)
      setTopProducts(top5Products)
      setSales(allSales.slice(0, 20))
      setProducts(allProducts)

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('حدث خطأ في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }, [store.id])

  useEffect(() => {
    if (isLoaded && store?.id) {
      fetchData()
    }
  }, [isLoaded, store?.id])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const recentSales = sales.slice(0, 20)

  const getItemsCount = (sale: Sale): number => {
    if (sale.items && Array.isArray(sale.items)) {
      return sale.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    }
    return 0
  }

  const getInvoiceData = (sale: Sale) => {
    const items = sale.items?.map((item: any) => ({
      name: item.product_name || item.name || 'منتج',
      quantity: item.quantity || 1,
      price: item.unit_price || item.price || 0,
      total: item.total_price || item.total || 0
    })) || []

    return {
      items,
      subtotal: sale.total_amount || 0,
      discountAmount: sale.discount_amount || 0,
      total: sale.final_amount || 0,
      paymentMethod: sale.payment_method as 'cash' | 'card',
      amountPaid: sale.amount_paid || 0,
      changeAmount: sale.change_amount || 0,
      date: formatDate(sale.created_at || sale.sale_date),
      invoiceId: sale.id
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
        <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <FloatingMenuButton onClick={() => setMobileNavOpen(true)} />
        
        <div className="hidden md:block">
          <Sidebar selectedStore="reports" onStoreChange={() => {}} />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
            <button onClick={() => setMobileNavOpen(true)} className="p-2 rounded-xl bg-slate-100">
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <h1 className="text-base font-bold">التقارير</h1>
            <div className="w-9" />
          </div>
          
          <POSHeader searchTerm="" onSearchChange={() => {}} selectedStore="reports" />
          
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl shadow-sm">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-slate-500">جاري تحميل التقارير...</p>
            </div>
          </div>
        </div>
        
        <BottomNav cartCount={0} />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <FloatingMenuButton onClick={() => setMobileNavOpen(true)} />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar selectedStore="reports" onStoreChange={() => {}} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button onClick={() => setMobileNavOpen(true)} className="p-2 rounded-xl bg-slate-100">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-base font-bold">التقارير</h1>
          <div className="w-9" />
        </div>
        
        <POSHeader searchTerm="" onSearchChange={() => {}} selectedStore="reports" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">التقارير</h1>
            <p className="text-sm text-slate-500 mt-1">نظرة شاملة على أداء متجرك</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Today's Revenue */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs text-slate-500">اليوم</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.todayRevenue.toFixed(2)}</p>
              <p className="text-sm text-slate-500">ج.م</p>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs text-slate-500">هذا الشهر</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.monthlyRevenue.toFixed(2)}</p>
              <p className="text-sm text-slate-500">ج.م</p>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs text-slate-500">هذا الشهر</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.monthlyOrders}</p>
              <p className="text-sm text-slate-500">فاتورة</p>
            </div>
          </div>

          {/* Low Stock Alerts - Card on Mobile, Table on Desktop */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-slate-900">تنبيهات المخزون المنخفض</h2>
                {lowStockProducts.length > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {lowStockProducts.length}
                  </span>
                )}
              </div>
            </div>
            
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-semibold text-green-600">ممتاز! المخزون في حالة جيدة</p>
                <p className="text-sm text-slate-500 mt-1">جميع المنتجات متوفرة بكميات كافية</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-2 p-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-red-700">{product.name}</p>
                          <p className="text-xs text-red-500">{product.category || '-'}</p>
                        </div>
                        <span className="font-bold text-red-600">{product.stock || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-red-50 border-b border-red-100">
                        <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">اسم المنتج</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">الفئة</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">الكمية الحالية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-50">
                      {lowStockProducts.map((product) => (
                        <tr key={product.id} className="bg-red-50/50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-red-700">{product.name}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{product.category || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-red-600">{product.stock || 0}</span>
                          </td>
=======
import React, { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useStore } from "@/hooks/use-store"
import {
  Loader2, Menu, DollarSign, TrendingDown, TrendingUp, AlertTriangle,
  Search, X, CheckCircle, ChevronLeft, ChevronRight, Eye, Printer,
  LayoutDashboard, Users, Package, Settings, LogOut, FileText,
  ShoppingBag, CreditCard, BarChart3, Calendar, Hash, RefreshCw,
  ArrowUpRight, ArrowDownRight, Receipt, Wallet
} from "lucide-react"

const FONT_URL = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap"

/* ════════════════════════════════════════
   TYPES
════════════════════════════════════════ */
interface Sale {
  id: string
  store_id: string | null
  customer_id: string | null
  total_amount: number | null
  paid_amount: number | null
  remaining_amount: number | null
  created_at: string
  customer?: { name: string; phone: string | null } | null
}

interface LedgerEntry {
  id: string
  customer_id: string | null
  supplier_id: string | null
  transaction_type: string
  amount: number
  description: string | null
  created_at: string
  customer?: { name: string } | null
  supplier?: { name: string } | null
}

interface InvoiceItem {
  id: string
  quantity: number
  unit_price: number
  total: number
  product?: { name: string; unit: string | null } | null
}

interface Invoice {
  id: string
  invoice_number: string | null
  customer_id: string | null
  account_id: string | null
  account_type: string | null
  total_amount: number | null
  discount: number | null
  net_amount: number | null
  invoice_type: string | null
  status: string | null
  notes: string | null
  created_at: string
  customer?: { name: string; phone: string | null } | null
}

interface Expense {
  id: string
  category: string
  amount: number
  notes: string | null
  expense_date: string
}

type Tab = "invoices" | "sales" | "ledger" | "expenses"

/* ════════════════════════════════════════
   MODAL
════════════════════════════════════════ */
function Modal({ open, onClose, children, maxW = "max-w-md" }: {
  open: boolean; onClose: () => void; children: React.ReactNode; maxW?: string
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-3xl p-6 w-full ${maxW} max-h-[92vh] overflow-y-auto shadow-2xl`}
        style={{ animation: "popIn .2s cubic-bezier(.34,1.56,.64,1)" }}>
        {children}
      </div>
    </div>
  )
}

function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub?: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">{icon}</div>
      <h3 className="text-lg font-black text-slate-400">{text}</h3>
      {sub && <p className="text-sm text-slate-300 mt-1">{sub}</p>}
    </div>
  )
}

/* ════════════════════════════════════════
   PRINT FUNCTIONS
════════════════════════════════════════ */
function printSaleReceipt(sale: Sale, storeName: string) {
  const date = new Date(sale.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/><title>إيصال بيع</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Cairo',sans-serif;padding:15mm;color:#111;max-width:80mm}
.h{text-align:center;padding-bottom:10px;margin-bottom:14px;border-bottom:2px dashed #333}
.h h1{font-size:18px;font-weight:900}.h p{font-size:11px;color:#555}
.r{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #eee;font-size:12px}
.total{font-weight:900;font-size:15px;border-top:2px solid #333;margin-top:6px;padding-top:6px}
.f{text-align:center;margin-top:16px;font-size:10px;color:#888;border-top:1px dashed #ccc;padding-top:8px}
</style></head><body>
<div class="h"><h1>${storeName}</h1><p>إيصال مبيعة</p></div>
<div class="r"><span>رقم:</span><span style="font-family:monospace;font-size:10px">${sale.id.slice(0, 10).toUpperCase()}</span></div>
<div class="r"><span>العميل:</span><span>${sale.customer?.name ?? "نقدي"}</span></div>
<div class="r"><span>التاريخ:</span><span>${date}</span></div>
<div style="height:6px"></div>
<div class="r"><span>الإجمالي:</span><span><strong>${Number(sale.total_amount ?? 0).toLocaleString("ar-EG")} ج.م</strong></span></div>
<div class="r"><span>المدفوع:</span><span style="color:#10b981"><strong>${Number(sale.paid_amount ?? 0).toLocaleString("ar-EG")} ج.م</strong></span></div>
<div class="r total"><span>المتبقي:</span><span style="color:${(sale.remaining_amount ?? 0) > 0 ? '#ef4444' : '#10b981'}">${Number(sale.remaining_amount ?? 0).toLocaleString("ar-EG")} ج.م</span></div>
<div class="f">شكراً لتعاملكم معنا<br/>${storeName}</div>
</body></html>`
  const w = window.open("", "_blank"); if (!w) return
  w.document.write(html); w.document.close(); w.onload = () => w.print()
}

function printInvoiceFull(inv: Invoice, items: InvoiceItem[], storeName: string) {
  const date = new Date(inv.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
  const isSale = inv.invoice_type !== "purchase"
  const net = Number(inv.net_amount ?? inv.total_amount ?? 0)
  const itemsHtml = items.length > 0
    ? items.map((item, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${item.product?.name ?? "منتج"}</td>
        <td style="text-align:center">${item.quantity} ${item.product?.unit ?? ""}</td>
        <td style="text-align:center">${Number(item.unit_price).toLocaleString("ar-EG")}</td>
        <td style="text-align:center;font-weight:700">${Number(item.total).toLocaleString("ar-EG")}</td>
      </tr>`).join("")
    : `<tr><td colspan="5" style="text-align:center;color:#999;padding:12px">لا توجد تفاصيل منتجات</td></tr>`

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/><title>فاتورة ${inv.invoice_number ?? ""}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Cairo',sans-serif;padding:15mm;color:#111}
.header{text-align:center;border-bottom:3px double #333;padding-bottom:14px;margin-bottom:18px}
.header h1{font-size:24px;font-weight:900}.header p{font-size:12px;color:#666;margin-top:3px}
.meta{display:flex;justify-content:space-between;margin-bottom:18px;font-size:12px;gap:20px}
.meta-box{background:#f8f9fa;padding:10px 14px;border-radius:8px;flex:1;line-height:2}
.badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:900;color:#fff;background:${isSale ? "#6C63FF" : "#f97316"};margin-bottom:6px}
table{width:100%;border-collapse:collapse;margin-bottom:18px;font-size:12px}
thead{background:#f1f3f5}th{padding:9px 12px;text-align:right;font-size:11px;font-weight:900;color:#555;border-bottom:2px solid #dee2e6}
td{padding:8px 12px;border-bottom:1px solid #f1f3f5}
.totals{width:260px;margin-right:auto;font-size:13px}
.totals tr td{padding:5px 8px}
.totals tr.final td{font-weight:900;font-size:16px;border-top:2px solid #333;padding-top:10px;color:#6C63FF}
.footer{text-align:center;margin-top:24px;padding-top:12px;border-top:1px dashed #ccc;font-size:11px;color:#888}
</style></head><body>
<div class="header"><h1>${storeName}</h1><p>نظام IMD ERP للإدارة</p></div>
<div class="meta">
  <div class="meta-box">
    <div class="badge">${isSale ? "🛍 فاتورة بيع" : "📦 فاتورة شراء"}</div><br/>
    <strong>رقم الفاتورة:</strong> ${inv.invoice_number ?? inv.id.slice(0, 10).toUpperCase()}<br/>
    <strong>التاريخ:</strong> ${date}<br/>
    <strong>الحالة:</strong> ${inv.status === "confirmed" ? "✓ مؤكدة" : inv.status === "paid" ? "💰 مدفوعة" : inv.status ?? "—"}
  </div>
  <div class="meta-box">
    <strong>${isSale ? "العميل" : "المورد"}:</strong> ${inv.customer?.name ?? "نقدي"}<br/>
    ${inv.customer?.phone ? `<strong>الهاتف:</strong> ${inv.customer.phone}<br/>` : ""}
    ${inv.notes ? `<strong>ملاحظات:</strong> ${inv.notes}` : ""}
  </div>
</div>
<table>
  <thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر الوحدة (ج.م)</th><th>الإجمالي (ج.م)</th></tr></thead>
  <tbody>${itemsHtml}</tbody>
</table>
<table class="totals">
  <tr><td>المجموع الكلي:</td><td><strong>${Number(inv.total_amount ?? 0).toLocaleString("ar-EG")} ج.م</strong></td></tr>
  ${Number(inv.discount ?? 0) > 0 ? `<tr><td>الخصم:</td><td style="color:#ef4444">- ${Number(inv.discount).toLocaleString("ar-EG")} ج.م</td></tr>` : ""}
  <tr class="final"><td>الصافي المستحق:</td><td>${net.toLocaleString("ar-EG")} ج.م</td></tr>
</table>
<div class="footer">شكراً لتعاملكم معنا • ${storeName} • نظام IMD ERP</div>
</body></html>`
  const w = window.open("", "_blank"); if (!w) return
  w.document.write(html); w.document.close(); w.onload = () => w.print()
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function ReportsPage() {
  const { store, isLoaded, user, signOut } = useStore()
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  /* data */
  const [activeTab, setActiveTab] = useState<Tab>("invoices")
  const [sales, setSales] = useState<Sale[]>([])
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    totalInvoices: 0, totalSales: 0, totalCollected: 0,
    totalRemaining: 0, totalExpenses: 0, customerDebt: 0, supplierDebt: 0,
  })

  /* modals */
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [payAmount, setPayAmount] = useState(0)
  const [payDesc, setPayDesc] = useState("")
  const [payTarget, setPayTarget] = useState<Sale | null>(null)

  /* invoice detail */
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  const shopId = store?.id ?? null

  /* ── mount ── */
  useEffect(() => {
    setMounted(true)
    const link = document.createElement("link"); link.href = FONT_URL; link.rel = "stylesheet"
    document.head.appendChild(link)
    const style = document.createElement("style")
    style.textContent = `
      @keyframes popIn { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
      @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      .row-in { animation: slideUp .2s ease-out both; }
    `
    document.head.appendChild(style)
    return () => {
      try { document.head.removeChild(link) } catch (_) {}
      try { document.head.removeChild(style) } catch (_) {}
    }
  }, [])

  useEffect(() => { const s = localStorage.getItem("sidebar-collapsed"); if (s) setCollapsed(s === "true") }, [])
  useEffect(() => { localStorage.setItem("sidebar-collapsed", String(collapsed)) }, [collapsed])
  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t) } }, [successMsg])
  useEffect(() => { if (error) { const t = setTimeout(() => setError(""), 6000); return () => clearTimeout(t) } }, [error])

  /* ── fetch all data ── */
  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isLoaded || !shopId) return
    isRefresh ? setRefreshing(true) : setLoading(true)
    setError("")

    try {
      /* customers IDs في هذا الـ shop */
      const { data: shopCustomers } = await supabase
        .from("customers").select("id").eq("shop_id", shopId)
      const customerIds = (shopCustomers ?? []).map(c => c.id)

      /* sales عن طريق customers */
      let salesData: Sale[] = []
      if (customerIds.length > 0) {
        const { data: sw, error: sErr } = await supabase
          .from("sales")
          .select("*, customer:customers(name, phone)")
          .in("customer_id", customerIds)
          .order("created_at", { ascending: false })
        if (sErr) throw sErr
        salesData = sw ?? []
      }

      /* sales نقدية */
      const { data: storeRow } = await supabase.from("stores").select("id").limit(1).maybeSingle()
      if (storeRow?.id) {
        const { data: cashSales } = await supabase
          .from("sales")
          .select("*, customer:customers(name, phone)")
          .eq("store_id", storeRow.id).is("customer_id", null)
          .order("created_at", { ascending: false })
        if (cashSales?.length) {
          const ids = new Set(salesData.map(s => s.id))
          cashSales.forEach(s => { if (!ids.has(s.id)) salesData.push(s) })
        }
      }
      salesData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      /* باقي الجداول بـ shop_id */
      const [ledgerRes, invoicesRes, expensesRes, custRes, suppRes] = await Promise.all([
        supabase.from("account_ledger")
          .select("*, customer:customers(name), supplier:suppliers(name)")
          .eq("shop_id", shopId).order("created_at", { ascending: false }),
        supabase.from("invoices")
          .select("*, customer:customers(name, phone)")
          .eq("shop_id", shopId).order("created_at", { ascending: false }),
        supabase.from("expenses")
          .select("*").eq("shop_id", shopId).order("expense_date", { ascending: false }),
        supabase.from("customers").select("total_debt").eq("shop_id", shopId),
        supabase.from("suppliers").select("total_debt").eq("shop_id", shopId),
      ])

      if (ledgerRes.error) throw ledgerRes.error
      if (invoicesRes.error) throw invoicesRes.error
      if (expensesRes.error) throw expensesRes.error

      const invData = invoicesRes.data ?? []
      const expData = expensesRes.data ?? []

      setSales(salesData)
      setLedger(ledgerRes.data ?? [])
      setInvoices(invData)
      setExpenses(expData)

      setStats({
        totalInvoices:  invData.reduce((s, x) => s + Number(x.net_amount ?? x.total_amount ?? 0), 0),
        totalSales:     salesData.reduce((s, x) => s + Number(x.total_amount ?? 0), 0),
        totalCollected: salesData.reduce((s, x) => s + Number(x.paid_amount ?? 0), 0),
        totalRemaining: salesData.reduce((s, x) => s + Number(x.remaining_amount ?? 0), 0),
        totalExpenses:  expData.reduce((s, x) => s + Number(x.amount ?? 0), 0),
        customerDebt:   (custRes.data ?? []).reduce((s, c) => s + Number(c.total_debt ?? 0), 0),
        supplierDebt:   (suppRes.data ?? []).reduce((s, c) => s + Number(c.total_debt ?? 0), 0),
      })
    } catch (e: any) {
      setError(`خطأ في تحميل البيانات: ${e.message}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [isLoaded, shopId])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── فتح تفاصيل فاتورة ── */
  const openInvoice = async (inv: Invoice) => {
    setSelectedInvoice(inv)
    setInvoiceItems([])
    setLoadingItems(true)
    try {
      const { data } = await supabase
        .from("invoice_items")
        .select("*, product:products(name, unit)")
        .eq("invoice_id", inv.id)
      setInvoiceItems(data ?? [])
    } catch (_) {
      setInvoiceItems([])
    } finally {
      setLoadingItems(false)
    }
  }

  /* ── دفعة ── */
  const handlePay = async () => {
    if (!payTarget || payAmount <= 0) return setError("أدخل مبلغاً صحيحاً")
    setActionLoading(true)
    try {
      const newRemaining = Math.max(0, Number(payTarget.remaining_amount ?? 0) - payAmount)
      const newPaid = Number(payTarget.paid_amount ?? 0) + payAmount
      const { error: e1 } = await supabase.from("sales")
        .update({ paid_amount: newPaid, remaining_amount: newRemaining }).eq("id", payTarget.id)
      if (e1) throw e1
      if (payTarget.customer_id && shopId) {
        await supabase.from("account_ledger").insert({
          shop_id: shopId, customer_id: payTarget.customer_id,
          transaction_type: "payment", amount: payAmount,
          description: payDesc || `دفعة على مبيعة ${payTarget.id.slice(0, 8)}`,
        })
      }
      setShowPayModal(false); setPayTarget(null); setPayAmount(0); setPayDesc("")
      setSuccessMsg(`✅ تم تسجيل دفعة ${payAmount.toLocaleString("ar-EG")} ج.م بنجاح`)
      fetchData(true)
    } catch (e: any) { setError(e.message) }
    finally { setActionLoading(false) }
  }

  const fmt = (n: number) => n.toLocaleString("ar-EG") + " ج.م"
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })

  const q = searchTerm.toLowerCase()
  const filteredInvoices = invoices.filter(i =>
    !q || (i.customer?.name ?? "").toLowerCase().includes(q) || (i.invoice_number ?? "").toLowerCase().includes(q)
  )
  const filteredSales = sales.filter(s =>
    !q || (s.customer?.name ?? "نقدي").toLowerCase().includes(q)
  )
  const filteredLedger = ledger.filter(l =>
    !q || (l.customer?.name ?? l.supplier?.name ?? "").toLowerCase().includes(q) || (l.description ?? "").toLowerCase().includes(q)
  )
  const filteredExpenses = expenses.filter(e =>
    !q || e.category.toLowerCase().includes(q) || (e.notes ?? "").toLowerCase().includes(q)
  )

  const sidebarW = collapsed ? "lg:w-20" : "lg:w-64"
  const mainMr   = collapsed ? "lg:mr-20" : "lg:mr-64"

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "لوحة التحكم", href: "/dashboard" },
    { icon: <Users className="w-5 h-5" />,           label: "العملاء",     href: "/customers" },
    { icon: <Package className="w-5 h-5" />,          label: "المنتجات",    href: "/products" },
    { icon: <BarChart3 className="w-5 h-5" />,        label: "التقارير",    href: "/reports", active: true },
    { icon: <Settings className="w-5 h-5" />,         label: "الإعدادات",   href: "/settings" },
  ]

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]">
      <Loader2 className="h-10 w-10 animate-spin text-[#6C63FF]" />
    </div>
  )

  const inputCls = "w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 outline-none bg-slate-50 focus:bg-white transition"

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }} className="min-h-screen bg-[#f4f6fb]">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* ════ SIDEBAR ════ */}
      <aside className={`fixed top-0 right-0 h-full z-50 bg-[#161c2d] text-white flex flex-col transition-all duration-300 w-64 ${sidebarW} ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-xs">ERP</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black text-white">IMD ERP</h1>
                {store?.name && <p className="text-xs text-slate-400 truncate">{store.name}</p>}
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
          {navItems.map(item => (
            <a key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm
                ${item.active ? "bg-[#6C63FF] text-white shadow-lg" : "text-slate-400 hover:bg-white/10 hover:text-white"}
                ${collapsed ? "justify-center px-2" : ""}`}
              title={collapsed ? item.label : undefined}>
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>
        <div className="p-2.5 border-t border-white/10 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-white/5">
              <p className="text-xs text-slate-500">المستخدم</p>
              <p className="font-bold text-xs text-white truncate">{user?.email?.split("@")[0] ?? "—"}</p>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className={`w-full flex items-center gap-2 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold text-sm ${collapsed ? "justify-center" : ""}`}>
            <LogOut className="w-4 h-4 flex-shrink-0" />{!collapsed && "تسجيل خروج"}
          </button>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMr}`}>

        {/* TOPBAR */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-slate-900">التقارير المالية</h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {invoices.length} فاتورة · {sales.length} مبيعة · {ledger.length} معاملة
              </p>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2 hover:bg-slate-100 rounded-xl transition"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin text-[#6C63FF]" />}
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث بالاسم أو الرقم..."
                className="w-64 pr-9 pl-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-[#6C63FF] outline-none bg-slate-50 focus:bg-white transition" />
            </div>
          </div>
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="بحث..."
                className="w-full pr-9 pl-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-[#6C63FF] outline-none bg-slate-50 transition" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-4 max-w-7xl w-full mx-auto">

          {/* MESSAGES */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="flex-1 font-semibold text-emerald-800 text-sm">{successMsg}</span>
              <button onClick={() => setSuccessMsg("")}><X className="w-4 h-4 text-emerald-400" /></button>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="flex-1 font-semibold text-red-800 text-sm">{error}</span>
              <button onClick={() => setError("")}><X className="w-4 h-4 text-red-400" /></button>
            </div>
          )}

          {/* STATS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "إجمالي الفواتير",  value: fmt(stats.totalInvoices),  icon: <Receipt className="w-5 h-5" />,        c: "text-[#6C63FF] bg-[#6C63FF]/10",  sub: `${invoices.length} فاتورة` },
              { label: "إجمالي المبيعات",  value: fmt(stats.totalSales),     icon: <ArrowUpRight className="w-5 h-5" />,   c: "text-emerald-600 bg-emerald-50",   sub: `${sales.length} عملية` },
              { label: "المبالغ المتبقية", value: fmt(stats.totalRemaining),  icon: <ArrowDownRight className="w-5 h-5" />, c: "text-red-500 bg-red-50",           sub: "مستحق التحصيل" },
              { label: "إجمالي المصروفات",value: fmt(stats.totalExpenses),   icon: <Wallet className="w-5 h-5" />,         c: "text-orange-500 bg-orange-50",     sub: `${expenses.length} مصروف` },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${s.c}`}>{s.icon}</div>
                  <p className="text-xs font-medium text-slate-500 leading-tight">{s.label}</p>
                </div>
                <p className="text-xl font-black text-slate-900 leading-tight">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* DEBT CARDS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-l from-purple-50 to-white rounded-2xl p-4 border border-purple-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <p className="text-xs font-bold text-purple-600">ديون العملاء</p>
              </div>
              <p className="text-2xl font-black text-purple-700">{fmt(stats.customerDebt)}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl p-4 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-bold text-blue-600">ديون الموردين</p>
              </div>
              <p className="text-2xl font-black text-blue-700">{fmt(stats.supplierDebt)}</p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100 gap-1 overflow-x-auto">
            {([
              { id: "invoices", label: `الفواتير (${invoices.length})`,        icon: <Hash className="w-4 h-4" />,        color: "bg-[#6C63FF]" },
              { id: "sales",    label: `المبيعات (${sales.length})`,           icon: <ShoppingBag className="w-4 h-4" />, color: "bg-emerald-500" },
              { id: "ledger",   label: `دفتر الحسابات (${ledger.length})`,     icon: <FileText className="w-4 h-4" />,    color: "bg-blue-500" },
              { id: "expenses", label: `المصروفات (${expenses.length})`,       icon: <CreditCard className="w-4 h-4" />,  color: "bg-orange-500" },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as Tab); setSearchTerm("") }}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap px-2
                  ${activeTab === tab.id ? `${tab.color} text-white shadow-md` : "text-slate-500 hover:bg-slate-50"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
              <Loader2 className="h-10 w-10 animate-spin text-[#6C63FF] mb-3" />
              <p className="font-bold text-slate-400 text-sm">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <>
              {/* ══ INVOICES TAB ══ */}
              {activeTab === "invoices" && (
                filteredInvoices.length === 0
                  ? <EmptyState icon={<Hash className="w-10 h-10 text-slate-300" />} text="لا توجد فواتير بعد" sub="ابدأ ببيع منتج من صفحة المنتجات" />
                  : (
                    <>
                      {/* desktop */}
                      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              {["رقم الفاتورة", "العميل/المورد", "النوع", "الإجمالي", "الخصم", "الصافي", "الحالة", "التاريخ", ""].map(h => (
                                <th key={h} className="px-4 py-3 text-right text-xs font-black text-slate-500">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredInvoices.map((inv, i) => (
                              <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors row-in" style={{ animationDelay: `${i * 20}ms` }}>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500 font-bold">
                                  {inv.invoice_number ?? inv.id.slice(0, 8).toUpperCase()}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-[#6C63FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <span className="text-[#6C63FF] font-black text-xs">{(inv.customer?.name ?? "؟").charAt(0)}</span>
                                    </div>
                                    <span className="font-bold text-sm">{inv.customer?.name ?? "—"}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${inv.invoice_type === "purchase" ? "bg-orange-100 text-orange-700" : "bg-[#6C63FF]/10 text-[#6C63FF]"}`}>
                                    {inv.invoice_type === "purchase" ? "📦 شراء" : "🛍 بيع"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-700 text-sm">{fmt(Number(inv.total_amount ?? 0))}</td>
                                <td className="px-4 py-3 text-red-400 font-bold text-sm">
                                  {Number(inv.discount ?? 0) > 0 ? `- ${fmt(Number(inv.discount))}` : "—"}
                                </td>
                                <td className="px-4 py-3 font-black text-[#6C63FF] text-sm">{fmt(Number(inv.net_amount ?? inv.total_amount ?? 0))}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${inv.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : inv.status === "paid" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-600"}`}>
                                    {inv.status === "confirmed" ? "✓ مؤكدة" : inv.status === "paid" ? "💰 مدفوعة" : inv.status ?? "—"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(inv.created_at)}</td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1.5">
                                    <button onClick={() => openInvoice(inv)}
                                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg transition" title="عرض التفاصيل">
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={async () => { await openInvoice(inv); setTimeout(() => printInvoiceFull(inv, invoiceItems, store?.name ?? "المتجر"), 600) }}
                                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition" title="طباعة">
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/50">
                          <p className="text-xs text-slate-400">{filteredInvoices.length} فاتورة · إجمالي {fmt(stats.totalInvoices)}</p>
                        </div>
                      </div>
                      {/* mobile */}
                      <div className="md:hidden space-y-3">
                        {filteredInvoices.map((inv, i) => (
                          <div key={inv.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 row-in" style={{ animationDelay: `${i * 20}ms` }}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-mono text-xs text-slate-400">{inv.invoice_number ?? inv.id.slice(0, 8).toUpperCase()}</p>
                                <p className="font-black text-sm text-slate-900 mt-0.5">{inv.customer?.name ?? "—"}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${inv.invoice_type === "purchase" ? "bg-orange-100 text-orange-700" : "bg-[#6C63FF]/10 text-[#6C63FF]"}`}>
                                    {inv.invoice_type === "purchase" ? "📦 شراء" : "🛍 بيع"}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${inv.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600"}`}>
                                    {inv.status === "confirmed" ? "✓ مؤكدة" : inv.status ?? "—"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-left">
                                <p className="font-black text-lg text-[#6C63FF]">{fmt(Number(inv.net_amount ?? inv.total_amount ?? 0))}</p>
                                <p className="text-xs text-slate-400">{fmtDate(inv.created_at)}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button onClick={() => openInvoice(inv)}
                                className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> عرض التفاصيل
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
              )}

              {/* ══ SALES TAB ══ */}
              {activeTab === "sales" && (
                filteredSales.length === 0
                  ? <EmptyState icon={<ShoppingBag className="w-10 h-10 text-slate-300" />} text="لا توجد مبيعات بعد" />
                  : (
                    <>
                      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              {["العميل", "الإجمالي", "المدفوع", "المتبقي", "التاريخ", "إجراءات"].map(h => (
                                <th key={h} className="px-4 py-3 text-right text-xs font-black text-slate-500">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredSales.map((sale, i) => (
                              <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors row-in" style={{ animationDelay: `${i * 20}ms` }}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <span className="text-emerald-600 font-black text-xs">{(sale.customer?.name ?? "ن").charAt(0)}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-sm">{sale.customer?.name ?? "نقدي"}</span>
                                      {sale.customer?.phone && <p className="text-xs text-slate-400">{sale.customer.phone}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-black text-slate-800 text-sm">{fmt(Number(sale.total_amount ?? 0))}</td>
                                <td className="px-4 py-3 font-bold text-emerald-600 text-sm">{fmt(Number(sale.paid_amount ?? 0))}</td>
                                <td className="px-4 py-3">
                                  <span className={`font-black text-sm ${Number(sale.remaining_amount ?? 0) > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                    {fmt(Number(sale.remaining_amount ?? 0))}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(sale.created_at)}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={() => setSelectedSale(sale)}
                                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg transition" title="عرض">
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    {Number(sale.remaining_amount ?? 0) > 0 && (
                                      <button onClick={() => { setPayTarget(sale); setShowPayModal(true) }}
                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-500 rounded-lg transition" title="تسجيل دفعة">
                                        <DollarSign className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button onClick={() => printSaleReceipt(sale, store?.name ?? "المتجر")}
                                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition" title="طباعة">
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/50">
                          <p className="text-xs text-slate-400">{filteredSales.length} عملية بيع · تحصيل {fmt(stats.totalCollected)}</p>
                        </div>
                      </div>
                      {/* mobile sales */}
                      <div className="md:hidden space-y-3">
                        {filteredSales.map((sale, i) => (
                          <div key={sale.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 row-in" style={{ animationDelay: `${i * 20}ms` }}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <span className="text-emerald-600 font-black">{(sale.customer?.name ?? "ن").charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-black text-sm">{sale.customer?.name ?? "نقدي"}</p>
                                  <p className="text-xs text-slate-400">{fmtDate(sale.created_at)}</p>
                                </div>
                              </div>
                              <div className="text-left">
                                <p className={`font-black text-lg ${Number(sale.remaining_amount ?? 0) > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                  {fmt(Number(sale.remaining_amount ?? 0))}
                                </p>
                                <p className="text-xs text-slate-400">متبقي</p>
                              </div>
                            </div>
                            <div className="flex gap-1.5 text-xs mb-3">
                              <span className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                                <span className="text-slate-400 block">الإجمالي</span>
                                <span className="font-black text-slate-800">{fmt(Number(sale.total_amount ?? 0))}</span>
                              </span>
                              <span className="flex-1 bg-emerald-50 rounded-lg p-2 text-center">
                                <span className="text-slate-400 block">المدفوع</span>
                                <span className="font-black text-emerald-600">{fmt(Number(sale.paid_amount ?? 0))}</span>
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setSelectedSale(sale)}
                                className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> عرض
                              </button>
                              {Number(sale.remaining_amount ?? 0) > 0 && (
                                <button onClick={() => { setPayTarget(sale); setShowPayModal(true) }}
                                  className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                                  <DollarSign className="w-3.5 h-3.5" /> دفع
                                </button>
                              )}
                              <button onClick={() => printSaleReceipt(sale, store?.name ?? "المتجر")}
                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl">
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
              )}

              {/* ══ LEDGER TAB ══ */}
              {activeTab === "ledger" && (
                filteredLedger.length === 0
                  ? <EmptyState icon={<FileText className="w-10 h-10 text-slate-300" />} text="لا توجد معاملات بعد" />
                  : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            {["الحساب", "نوع المعاملة", "المبلغ", "الوصف", "التاريخ"].map(h => (
                              <th key={h} className="px-4 py-3 text-right text-xs font-black text-slate-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredLedger.map((entry, i) => (
                            <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors row-in" style={{ animationDelay: `${i * 15}ms` }}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-black text-xs">{(entry.customer?.name ?? entry.supplier?.name ?? "؟").charAt(0)}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-sm">{entry.customer?.name ?? entry.supplier?.name ?? "—"}</span>
                                    <p className="text-xs text-slate-400">{entry.customer_id ? "عميل" : "مورد"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                  entry.transaction_type === "payment" ? "bg-emerald-100 text-emerald-700"
                                  : entry.transaction_type === "sale" ? "bg-[#6C63FF]/10 text-[#6C63FF]"
                                  : "bg-orange-100 text-orange-700"
                                }`}>
                                  {entry.transaction_type === "payment" ? "💳 دفعة"
                                    : entry.transaction_type === "sale" ? "🛍 بيع"
                                    : entry.transaction_type === "purchase" ? "📦 شراء"
                                    : entry.transaction_type}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-black text-slate-800 text-sm">{fmt(Number(entry.amount))}</td>
                              <td className="px-4 py-3 text-sm text-slate-500 max-w-[200px] truncate">{entry.description ?? "—"}</td>
                              <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(entry.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/50">
                        <p className="text-xs text-slate-400">{filteredLedger.length} معاملة</p>
                      </div>
                    </div>
                  )
              )}

              {/* ══ EXPENSES TAB ══ */}
              {activeTab === "expenses" && (
                filteredExpenses.length === 0
                  ? <EmptyState icon={<CreditCard className="w-10 h-10 text-slate-300" />} text="لا توجد مصروفات مسجلة" />
                  : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            {["الفئة", "المبلغ", "ملاحظات", "التاريخ"].map(h => (
                              <th key={h} className="px-4 py-3 text-right text-xs font-black text-slate-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredExpenses.map((exp, i) => (
                            <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors row-in" style={{ animationDelay: `${i * 15}ms` }}>
                              <td className="px-4 py-3">
                                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">{exp.category}</span>
                              </td>
                              <td className="px-4 py-3 font-black text-red-500 text-sm">{fmt(Number(exp.amount))}</td>
                              <td className="px-4 py-3 text-sm text-slate-500 max-w-[200px] truncate">{exp.notes ?? "—"}</td>
                              <td className="px-4 py-3 text-xs text-slate-400">
                                <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(exp.expense_date)}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/50">
                        <p className="text-xs text-slate-400">{filteredExpenses.length} مصروف · إجمالي {fmt(stats.totalExpenses)}</p>
                      </div>
                    </div>
                  )
              )}
            </>
          )}
        </div>
      </div>

      {/* ════ INVOICE DETAIL MODAL ════ */}
      <Modal open={!!selectedInvoice} onClose={() => { setSelectedInvoice(null); setInvoiceItems([]) }} maxW="max-w-2xl">
        {selectedInvoice && (
          <>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-black text-slate-900">تفاصيل الفاتورة</h2>
                  <span className={`px-2.5 py-0.5 rounded-xl text-xs font-black ${selectedInvoice.invoice_type === "purchase" ? "bg-orange-100 text-orange-700" : "bg-[#6C63FF]/10 text-[#6C63FF]"}`}>
                    {selectedInvoice.invoice_type === "purchase" ? "📦 شراء" : "🛍 بيع"}
                  </span>
                </div>
                <p className="font-mono text-sm text-slate-400 font-bold">
                  {selectedInvoice.invoice_number ?? selectedInvoice.id.slice(0, 12).toUpperCase()}
                </p>
              </div>
              <button onClick={() => { setSelectedInvoice(null); setInvoiceItems([]) }} className="p-2 hover:bg-slate-100 rounded-xl transition">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* info */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: "العميل / المورد", value: selectedInvoice.customer?.name ?? "—" },
                { label: "الهاتف",           value: selectedInvoice.customer?.phone ?? "—" },
                { label: "التاريخ",          value: fmtDate(selectedInvoice.created_at) },
                { label: "الحالة",           value: selectedInvoice.status === "confirmed" ? "✓ مؤكدة" : selectedInvoice.status === "paid" ? "💰 مدفوعة" : selectedInvoice.status ?? "—" },
              ].map((row, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{row.label}</p>
                  <p className="font-bold text-sm text-slate-900">{row.value}</p>
                </div>
              ))}
            </div>

            {/* items */}
            <div className="mb-5">
              <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#6C63FF]" /> المنتجات المشمولة
              </h3>
              {loadingItems ? (
                <div className="flex items-center justify-center py-8 bg-slate-50 rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-[#6C63FF]" />
                  <span className="mr-2 text-sm text-slate-400 font-medium">جاري تحميل المنتجات...</span>
                </div>
              ) : invoiceItems.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">لا توجد تفاصيل منتجات محفوظة</p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="px-3 py-2.5 text-right text-xs font-black text-slate-500">#</th>
                        <th className="px-3 py-2.5 text-right text-xs font-black text-slate-500">المنتج</th>
                        <th className="px-3 py-2.5 text-right text-xs font-black text-slate-500">الكمية</th>
                        <th className="px-3 py-2.5 text-right text-xs font-black text-slate-500">السعر</th>
                        <th className="px-3 py-2.5 text-right text-xs font-black text-slate-500">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {invoiceItems.map((item, i) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2.5 text-xs text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2.5 font-bold text-sm text-slate-900">{item.product?.name ?? "منتج"}</td>
                          <td className="px-3 py-2.5 text-sm text-slate-700 font-medium">{item.quantity} {item.product?.unit ?? ""}</td>
                          <td className="px-3 py-2.5 text-sm font-bold text-slate-700">{fmt(Number(item.unit_price))}</td>
                          <td className="px-3 py-2.5 font-black text-[#6C63FF] text-sm">{fmt(Number(item.total))}</td>
>>>>>>> blackboxai-upload-all-changes
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
<<<<<<< HEAD
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">أحدث المعاملات</h2>
                </div>
              </div>

              {recentSales.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">لا توجد معاملات بعد</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-2 p-4">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="bg-slate-50 rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-900">#{sale.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-500">{formatDate(sale.created_at || sale.sale_date)}</p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-900">{(sale.final_amount || 0).toFixed(2)} ج.م</p>
                          <button onClick={() => setSelectedSale(sale)} className="text-blue-600 text-xs">عرض</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">الفاتورة</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">التاريخ</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">العدد</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">الإجمالي</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">عرض</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2">
                              <span className="text-xs font-mono text-slate-600">#{sale.id.slice(0, 8)}</span>
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-600">{formatDate(sale.created_at || sale.sale_date)}</td>
                            <td className="px-3 py-2 text-xs text-slate-600">{getItemsCount(sale)} items</td>
                            <td className="px-3 py-2">
                              <span className="text-sm font-semibold text-slate-900">{(sale.final_amount || 0).toFixed(2)} ج.م</span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button onClick={() => setSelectedSale(sale)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Top Selling Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-bold text-slate-900">الأكثر مبيعاً</h2>
                </div>
              </div>

              {topProducts.length === 0 ? (
                <div className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">لا توجد مبيعات بعد</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{product.totalSold}</span>
                        <span className="text-xs text-slate-500">وحدة</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">تفاصيل الفاتورة</h3>
              <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

<Invoice {...getInvoiceData(selectedSale)} onClose={() => setSelectedSale(null)} />

            <div className="flex gap-2 mt-4">
              <button onClick={() => window.print()} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                طباعة
              </button>
              <button onClick={() => setSelectedSale(null)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav cartCount={0} />
    </div>
  )
}

=======
              )}
            </div>

            {/* totals */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 border border-slate-200">
              <div className="flex justify-between text-sm text-slate-600">
                <span>المجموع الكلي:</span>
                <span className="font-bold">{fmt(Number(selectedInvoice.total_amount ?? 0))}</span>
              </div>
              {Number(selectedInvoice.discount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>الخصم:</span>
                  <span className="font-bold">- {fmt(Number(selectedInvoice.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200 pt-2 mt-1">
                <span>الصافي المستحق:</span>
                <span className="text-[#6C63FF]">{fmt(Number(selectedInvoice.net_amount ?? selectedInvoice.total_amount ?? 0))}</span>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-xs text-yellow-600 font-bold mb-1">📝 ملاحظات</p>
                <p className="text-sm text-yellow-800">{selectedInvoice.notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => printInvoiceFull(selectedInvoice, invoiceItems, store?.name ?? "المتجر")}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition shadow-md"
              >
                <Printer className="w-4 h-4" /> طباعة الفاتورة
              </button>
              <button
                onClick={() => { setSelectedInvoice(null); setInvoiceItems([]) }}
                className="px-6 py-3 border-2 border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-600 transition"
              >
                إغلاق
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ════ PAY MODAL ════ */}
      <Modal open={showPayModal} onClose={() => setShowPayModal(false)} maxW="max-w-sm">
        {payTarget && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">تسجيل دفعة</h2>
                <p className="text-sm text-slate-500 mt-0.5">{payTarget.customer?.name ?? "نقدي"}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl text-center mb-4 border border-red-100">
              <p className="text-xs text-slate-500 mb-1">المتبقي حالياً</p>
              <p className="text-3xl font-black text-red-500">{fmt(Number(payTarget.remaining_amount ?? 0))}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">المبلغ المدفوع *</label>
                <input type="number" value={payAmount || ""} onChange={e => setPayAmount(Number(e.target.value))}
                  className={inputCls} placeholder="0" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">وصف العملية</label>
                <input value={payDesc} onChange={e => setPayDesc(e.target.value)}
                  className={inputCls} placeholder="اختياري" />
              </div>
              {payAmount > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <p className="text-xs text-slate-500">الرصيد بعد الدفع</p>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">{fmt(Math.max(0, Number(payTarget.remaining_amount ?? 0) - payAmount))}</p>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={handlePay} disabled={actionLoading || payAmount <= 0}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white py-3 rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><DollarSign className="w-4 h-4" /> تأكيد الدفعة</>}
                </button>
                <button onClick={() => setShowPayModal(false)}
                  className="px-5 py-3 border-2 border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-600">
                  إلغاء
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* ════ SALE DETAIL MODAL ════ */}
      <Modal open={!!selectedSale && !showPayModal} onClose={() => setSelectedSale(null)} maxW="max-w-sm">
        {selectedSale && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-slate-900">تفاصيل البيعة</h2>
              <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 mb-5">
              {[
                { label: "العميل",    value: selectedSale.customer?.name ?? "نقدي" },
                { label: "الهاتف",    value: selectedSale.customer?.phone ?? "—" },
                { label: "رقم البيعة", value: selectedSale.id.slice(0, 14).toUpperCase(), mono: true },
                { label: "التاريخ",   value: fmtDate(selectedSale.created_at) },
                { label: "الإجمالي",  value: fmt(Number(selectedSale.total_amount ?? 0)),    purple: true },
                { label: "المدفوع",   value: fmt(Number(selectedSale.paid_amount ?? 0)),     green: true },
                { label: "المتبقي",   value: fmt(Number(selectedSale.remaining_amount ?? 0)), red: Number(selectedSale.remaining_amount ?? 0) > 0 },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium">{row.label}</span>
                  <span className={`text-sm font-black
                    ${(row as any).mono ? "font-mono text-slate-400 text-xs" : ""}
                    ${(row as any).green ? "text-emerald-600" : ""}
                    ${(row as any).red ? "text-red-500" : ""}
                    ${(row as any).purple ? "text-[#6C63FF]" : "text-slate-900"}
                  `}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => printSaleReceipt(selectedSale, store?.name ?? "المتجر")}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md">
                <Printer className="w-4 h-4" /> طباعة
              </button>
              {Number(selectedSale.remaining_amount ?? 0) > 0 && (
                <button onClick={() => { setPayTarget(selectedSale); setSelectedSale(null); setShowPayModal(true) }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md">
                  <DollarSign className="w-4 h-4" /> تسجيل دفعة
                </button>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
>>>>>>> blackboxai-upload-all-changes
