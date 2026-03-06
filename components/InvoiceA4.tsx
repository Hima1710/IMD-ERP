'use client'

import React from 'react'

interface InvoiceItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface InvoiceA4Props {
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

// Safe date formatting function
function formatInvoiceDate(dateString?: string): string {
  try {
    const date = dateString ? new Date(dateString) : new Date()
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
}

export default function InvoiceA4({
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
  storeName = 'متجر الدهانات',
  storeAddress = '',
  storePhone = '',
}: InvoiceA4Props) {
  const formattedDate = formatInvoiceDate(date)
  const finalInvoiceId = invoiceId || `INV-${Date.now()}`

  return (
    <>
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .invoice-a4 {
            background: white !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>

      <div className="invoice-a4 bg-white text-black mx-auto shadow-lg" style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        fontFamily: 'Cairo, Tajawal, Tahoma, Arial, sans-serif',
        direction: 'rtl'
      }}>

        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
          <div className="mb-4">
            {/* Logo Placeholder */}
            <div className="w-20 h-20 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">شعار الشركة</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{storeName}</h1>
          {storeAddress && <p className="text-gray-600">{storeAddress}</p>}
          {storePhone && <p className="text-gray-600">هاتف: {storePhone}</p>}
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">فاتورة مبيعات</h2>
            <p className="text-gray-600">رقم الفاتورة: {finalInvoiceId}</p>
          </div>
          <div className="text-left">
            <p className="text-gray-600">التاريخ: {formattedDate}</p>
            {cashierName && <p className="text-gray-600">الكاشير: {cashierName}</p>}
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">معلومات العميل</h3>
          <p className="text-gray-600">الاسم: {customerName || 'عميل نقدي'}</p>
          {customerPhone && <p className="text-gray-600">الهاتف: {customerPhone}</p>}
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-right">المنتج</th>
                <th className="border border-gray-300 px-4 py-2 text-center">الكمية</th>
                <th className="border border-gray-300 px-4 py-2 text-center">السعر</th>
                <th className="border border-gray-300 px-4 py-2 text-center">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.price.toFixed(2)} ج.م</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.total.toFixed(2)} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="font-semibold">المجموع الفرعي:</span>
              <span>{subtotal.toFixed(2)} ج.م</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="font-semibold">الخصم:</span>
                <span>-{discountAmount.toFixed(2)} ج.م</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b-2 border-gray-300 font-bold text-lg">
              <span>الإجمالي:</span>
              <span>{total.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">طريقة الدفع:</span>
              <span>{paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">المدفوع:</span>
              <span>{amountPaid.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">الباقي:</span>
              <span>{changeAmount.toFixed(2)} ج.م</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t-2 border-gray-300 pt-4">
          <p className="text-gray-600 mb-2">شكراً لزيارتكم</p>
          <p className="text-sm text-gray-500">نتمنى أن نراكم مرة أخرى قريباً</p>
        </div>

        {/* Print Button */}
        <div className="text-center mt-8 no-print">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            طباعة الفاتورة
          </button>
        </div>
      </div>
    </>
  )
}