'use client'

import React from 'react'

interface InvoiceItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface InvoiceData {
  id: string
  date: string // created_at timestamp
  customer_name: string
}

interface Totals {
  subtotal: number
  tax: number
  final_total: number
}

interface InvoiceTemplateProps {
  invoiceData: InvoiceData
  items: InvoiceItem[]
  shopName: string
  totals: Totals
}

export default function InvoiceTemplate({
  invoiceData,
  items,
  shopName,
  totals
}: InvoiceTemplateProps) {
  // Safely parse date with fallback
  const parseDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }
      return date
    } catch {
      return new Date() // Fallback to current date
    }
  }

  // Format date as DD/MM/YYYY hh:mm AM/PM
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${day}/${month}/${year} ${displayHours}:${minutes} ${ampm}`
  }

  const invoiceDate = parseDate(invoiceData.date)
  const formattedDate = formatDate(invoiceDate)

  return (
    <div className="invoice-template bg-white text-black max-w-4xl mx-auto p-8 shadow-lg print:shadow-none print:max-w-none print:p-0 print:m-0">
      {/* Header */}
      <div className="text-center mb-8 print:mb-12">
        <h1 className="text-4xl font-bold text-gray-800 print:text-5xl print:font-extrabold">
          {shopName}
        </h1>
        <p className="text-lg text-gray-600 mt-2 print:text-xl">فاتورة مبيعات</p>
      </div>

      {/* Invoice Details */}
      <div className="flex justify-between items-center mb-8 print:mb-12">
        <div className="text-left">
          <p className="text-lg font-semibold text-gray-800 print:text-xl">
            رقم الفاتورة: {invoiceData.id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-800 print:text-xl">
            التاريخ: {formattedDate}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8 print:mb-12">
        <p className="text-lg font-semibold text-gray-800 print:text-xl">
          العميل: {invoiceData.customer_name || 'عميل نقدي'}
        </p>
      </div>

      {/* Items Table */}
      <div className="overflow-hidden border border-gray-300 rounded-lg print:border-2 print:border-black">
        <table className="w-full text-sm print:text-base">
          <thead className="bg-gray-100 print:bg-white">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-800 border-b border-gray-300 print:border-black print:px-6 print:py-4">
                الصنف
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-800 border-b border-gray-300 print:border-black print:px-6 print:py-4">
                الكمية
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-800 border-b border-gray-300 print:border-black print:px-6 print:py-4">
                السعر
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-800 border-b border-gray-300 print:border-black print:px-6 print:py-4">
                الإجمالي
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } print:${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
              >
                <td className="px-4 py-3 text-right border-b border-gray-200 print:border-black print:px-6 print:py-4">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-200 print:border-black print:px-6 print:py-4">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-200 print:border-black print:px-6 print:py-4">
                  {item.price.toFixed(2)} ريال
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-200 print:border-black print:px-6 print:py-4">
                  {item.total.toFixed(2)} ريال
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="mt-8 flex justify-between items-center print:mt-12">
        <div className="text-left">
          <p className="text-lg font-semibold text-gray-800 print:text-xl">
            شكراً لزيارتكم
          </p>
          <p className="text-sm text-gray-600 mt-2 print:text-base">
            نتمنى أن نراكم مرة أخرى قريباً
          </p>
        </div>
        <div className="text-right">
          <div className="space-y-2 print:space-y-3">
            <div className="flex justify-between w-48 print:w-64">
              <span className="font-semibold text-gray-800 print:text-lg">المجموع الفرعي:</span>
              <span className="font-semibold text-gray-800 print:text-lg">{totals.subtotal.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between w-48 print:w-64">
              <span className="font-semibold text-gray-800 print:text-lg">الضريبة:</span>
              <span className="font-semibold text-gray-800 print:text-lg">{totals.tax.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between w-48 print:w-64 border-t-2 border-gray-400 pt-2 print:border-black">
              <span className="font-bold text-gray-900 print:text-xl">المجموع النهائي:</span>
              <span className="font-bold text-gray-900 print:text-xl">{totals.final_total.toFixed(2)} ريال</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .invoice-template {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 20mm;
            box-shadow: none;
            background: white;
            color: black;
          }
          
          /* Hide any buttons or interactive elements */
          button, input, select, textarea {
            display: none !important;
          }
          
          /* Ensure full page usage */
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
          }
          
          /* Page break controls */
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  )
}