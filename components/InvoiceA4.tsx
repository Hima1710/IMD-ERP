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
  shopName: string
  invoiceId: string
  cashierName: string
  totalAmount: number
}

// Safe date formatting function
function formatInvoiceDate(): string {
  return new Date().toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export default function InvoiceA4({
  items,
  shopName,
  invoiceId,
  cashierName,
  totalAmount,
}: InvoiceA4Props) {
  const formattedDate = formatInvoiceDate()

  return (
    <>
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .invoice-a4 {
            background: white !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 20mm;
            box-shadow: none;
          }
        }
      `}</style>

      <div className="invoice-a4 bg-white text-black mx-auto shadow-lg" style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        fontFamily: 'Cairo, Tajawal, Tahoma, Arial, sans-serif',
        direction: 'rtl',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>

        {/* Header */}
        <div className="mb-8">
          {/* Top Section */}
          <div className="flex justify-between items-start mb-4">
            {/* Top Right: Invoice Title and Number */}
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">فاتورة بيع</h1>
              <p className="text-gray-600">رقم الفاتورة: {invoiceId}</p>
            </div>
            {/* Top Left: Date & Time */}
            <div className="text-left">
              <p className="text-gray-600">التاريخ والوقت</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
          </div>

          {/* Center: Shop Name */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2">{shopName}</h2>
          </div>

          {/* Sub-Header: Cashier */}
          <div className="text-center">
            <p className="text-lg text-gray-700">المسؤول: <span className="font-semibold">{cashierName}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">#</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">الصنف</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">الكمية</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">السعر</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-bold">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-400 px-3 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-400 px-3 py-2 text-right">{item.name}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{item.price.toFixed(2)} ج.م</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{item.total.toFixed(2)} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-start">
          {/* Left: Summary Box */}
          <div className="border border-gray-400 p-4 bg-gray-50">
            <h3 className="font-bold text-lg mb-2">ملخص الفاتورة</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>الإجمالي:</span>
                <span className="font-semibold">{totalAmount.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة:</span>
                <span>0.00 ج.م</span>
              </div>
              <div className="flex justify-between border-t border-gray-400 pt-1">
                <span className="font-bold">الإجمالي النهائي:</span>
                <span className="font-bold">{totalAmount.toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>

          {/* Right: Empty for balance */}
          <div className="flex-1"></div>
        </div>

        {/* Bottom Center: Thank you and signature */}
        <div className="text-center mt-12">
          <p className="text-lg font-semibold text-gray-800 mb-4">شكراً لتعاملكم معنا</p>
          <div className="border-t border-gray-400 w-64 mx-auto mt-8">
            <p className="text-sm text-gray-600 mt-2">توقيع العميل</p>
          </div>
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