'use client'

import React from 'react'
import { useStore } from '@/hooks/use-store'
import { STORE_CONFIG } from '@/config/app.config'

interface InvoiceItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface InvoiceProps {
  items: InvoiceItem[]
  subtotal: number
  discountAmount: number
  total: number
  paymentMethod: 'cash' | 'card'
  amountPaid: number
  changeAmount: number
  date?: string
  invoiceId?: string
  cashierName?: string
  customerName?: string
  customerPhone?: string
  storeName?: string
  storeAddress?: string
  storePhone?: string
}

// Format date as DD/MM/YYYY and get day name in Arabic
function formatInvoiceDate(dateString?: string): { date: string; dayName: string; time: string } {
  const now = dateString ? new Date(dateString) : new Date()
  
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'Saturday']
  const dayIndex = now.getDay()
  
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  return {
    date: `${day}/${month}/${year}`,
    dayName: dayNames[dayIndex] || '',
    time: `${hours}:${minutes}`
  }
}

// Generate a short invoice ID
function generateInvoiceId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function Invoice({
  items,
  subtotal,
  discountAmount,
  total,
  paymentMethod,
  amountPaid,
  changeAmount,
  date,
  invoiceId,
  cashierName,
  customerName,
  customerPhone,
}: InvoiceProps) {
  const { store: globalStore } = useStore()

  // Generate invoice ID if not provided
  const finalInvoiceId = invoiceId || generateInvoiceId()
  
  // Format date
  const { date: formattedDate, dayName, time } = formatInvoiceDate(date)

  // Calculate remaining balance (if any)
  const remainingBalance = Math.max(0, total - amountPaid)

  // Use props or fallback to store
  const storeName = globalStore.name || STORE_CONFIG.stores.find(s => s.id === STORE_CONFIG.defaultStore)?.name || 'متجر الدهانات'
  const storeAddress = globalStore.address || ''
  const storePhone = globalStore.phone || ''

  return (
    <div 
      className="invoice-container bg-white p-4 max-w-[300px] mx-auto text-black select-none"
      dir="rtl"
      style={{ 
        fontFamily: 'Cairo, Tajawal, Tahoma, Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4'
      }}
    >
      {/* ==================== WATERMARK (Anti-Fraud) ==================== */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
      >
        <span 
          className="text-6xl font-bold text-gray-400 opacity-10 transform -rotate-45 whitespace-nowrap"
          style={{ 
            opacity: 0.08, 
            transform: 'rotate(-45deg)',
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#666',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            fontFamily: 'Cairo, Tajawal, sans-serif'
          }}
        >
          {storeName}
        </span>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="relative" style={{ position: 'relative', zIndex: 10 }}>
        
        {/* ==================== TOP RIGHT: Date & Time ==================== */}
        <div className="text-left mb-3 text-xs" style={{ fontSize: '10px' }}>
          <p className="text-slate-600">{formattedDate} - {time}</p>
          <p className="text-slate-600">{dayName}</p>
        </div>

        {/* ==================== CENTER: Store Info ==================== */}
        <div className="text-center border-b-2 border-black pb-2 mb-3">
          {globalStore.logo_url ? (
            <div className="mb-2">
              <img 
                src={globalStore.logo_url} 
                alt="Logo" 
                className="w-16 h-16 mx-auto object-contain"
              />
            </div>
          ) : null}
          
          <h1 
            className="text-xl font-bold mb-1"
            style={{ fontSize: '18px', fontWeight: 'bold' }}
          >
            {storeName}
          </h1>
          
          {storeAddress && (
            <p className="text-xs" style={{ fontSize: '10px' }}>{storeAddress}</p>
          )}
          {storePhone && (
            <p className="text-xs" style={{ fontSize: '10px' }}>{storePhone}</p>
          )}
        </div>

        {/* ==================== TOP LEFT: Invoice Number ==================== */}
        <div className="text-right mb-3" style={{ marginBottom: '12px' }}>
          <div className="inline-block bg-slate-100 px-3 py-1 rounded">
            <span className="text-xs font-bold" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
             فاتورة رقم: {finalInvoiceId}
            </span>
          </div>
        </div>

        {/* ==================== CUSTOMER INFO ==================== */}
        {(customerName || customerPhone) && (
          <div className="border-b border-gray-300 pb-2 mb-3" style={{ borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '12px' }}>
            <p className="text-xs" style={{ fontSize: '10px' }}>
              <span className="font-medium">العميل:</span> {customerName || '-'}
            </p>
            {customerPhone && (
              <p className="text-xs" style={{ fontSize: '10px' }}>
                <span className="font-medium">الهاتف:</span> {customerPhone}
              </p>
            )}
          </div>
        )}

        {/* ==================== ITEMS TABLE HEADER ==================== */}
        <div className="border-b border-gray-400 pb-1 mb-2" style={{ borderBottom: '1px solid #666', paddingBottom: '4px', marginBottom: '8px' }}>
          <div className="flex text-xs font-bold" style={{ fontSize: '10px', fontWeight: 'bold' }}>
            <span className="flex-1 text-right">الصنف</span>
            <span className="w-12 text-center" style={{ width: '48px', textAlign: 'center' }}>الكمية</span>
            <span className="w-14 text-left" style={{ width: '56px', textAlign: 'left' }}>السعر</span>
            <span className="w-14 text-left" style={{ width: '56px', textAlign: 'left' }}>الإجمالي</span>
          </div>
        </div>

        {/* ==================== ITEMS LIST ==================== */}
        <div className="border-b border-gray-400 pb-2 mb-3" style={{ borderBottom: '1px solid #666', paddingBottom: '8px', marginBottom: '12px' }}>
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex text-xs py-0.5" 
              style={{ fontSize: '10px', paddingTop: '2px', paddingBottom: '2px' }}
            >
              <span className="flex-1 text-right truncate" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
                {item.name}
              </span>
              <span className="w-12 text-center" style={{ width: '48px', textAlign: 'center' }}>
                {item.quantity}
              </span>
              <span className="w-14 text-left" style={{ width: '56px', textAlign: 'left' }}>
                {item.price.toFixed(2)}
              </span>
              <span className="w-14 text-left" style={{ width: '56px', textAlign: 'left' }}>
                {item.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* ==================== SUMMARY (Financials) ==================== */}
        <div className="space-y-1 mb-3" style={{ marginBottom: '12px' }}>
          {/* Subtotal */}
          <div className="flex justify-between text-xs" style={{ fontSize: '10px' }}>
            <span>المجموع:</span>
            <span>{subtotal.toFixed(2)} ج.م</span>
          </div>
          
          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-red-600" style={{ fontSize: '10px', color: '#dc2626' }}>
              <span>الخصم:</span>
              <span>-{discountAmount.toFixed(2)} ج.م</span>
            </div>
          )}
          
          {/* Total */}
          <div 
            className="flex justify-between text-base font-bold border-t-2 border-black pt-1"
            style={{ fontSize: '14px', fontWeight: 'bold', borderTopWidth: '2px', paddingTop: '4px', marginTop: '4px' }}
          >
            <span>الإجمالي:</span>
            <span>{total.toFixed(2)} ج.م</span>
          </div>
        </div>

        {/* ==================== PAYMENT DETAILS ==================== */}
        <div className="border-t border-gray-300 pt-2 mb-3" style={{ borderTop: '1px solid #ccc', paddingTop: '8px', marginBottom: '12px' }}>
          {/* Payment Method */}
          <div className="flex justify-between text-xs" style={{ fontSize: '10px' }}>
            <span>طريقة الدفع:</span>
            <span>{paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}</span>
          </div>
          
          {/* Amount Paid */}
          <div className="flex justify-between text-xs" style={{ fontSize: '10px' }}>
            <span>المدفوع:</span>
            <span>{amountPaid.toFixed(2)} ج.م</span>
          </div>
          
          {/* Change (if cash) */}
          {paymentMethod === 'cash' && changeAmount > 0 && (
            <div className="flex justify-between text-xs font-bold text-green-600" style={{ fontSize: '10px', fontWeight: 'bold', color: '#16a34a' }}>
              <span>الباقي:</span>
              <span>{changeAmount.toFixed(2)} ج.م</span>
            </div>
          )}
          
          {/* Remaining Balance (if any) */}
          {remainingBalance > 0 && (
            <div className="flex justify-between text-xs font-bold text-red-600" style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626' }}>
              <span>المتبقي:</span>
              <span>{remainingBalance.toFixed(2)} ج.م</span>
            </div>
          )}
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="text-center pt-2 border-t border-gray-300" style={{ borderTop: '1px solid #ccc', paddingTop: '8px' }}>
          <p className="text-sm font-bold" style={{ fontSize: '12px', fontWeight: 'bold' }}>
            شكراً لتعاملكم معنا
          </p>
          <p className="text-xs text-gray-500 mt-1" style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
            {storeName}
          </p>
        </div>

        {/* ==================== BARCODE SIMULATION ==================== */}
        <div className="mt-3 text-center" style={{ marginTop: '12px' }}>
          <div 
            className="h-8 bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden"
            style={{ 
              height: '32px', 
              backgroundColor: '#f5f5f5', 
              borderColor: '#ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#666', letterSpacing: '2px' }}>
              ═══ {finalInvoiceId} ═══
            </span>
          </div>
        </div>

        {/* ==================== CUT LINE ==================== */}
        <div className="mt-4 text-center" style={{ marginTop: '16px' }}>
          <div style={{ borderTop: '1px dashed #999' }} />
        </div>
      </div>

      {/* ==================== PRINT STYLES ==================== */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap');
        
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container,
          .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 5mm;
            box-shadow: none;
          }
          @page {
            margin: 0;
            size: 58mm auto;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        /* Thermal Printer Optimizations */
        @media print and (min-width: 0) {
          .invoice-container {
            width: 58mm !important;
            max-width: 58mm !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
          }
        }
      `}</style>
    </div>
  )
}

