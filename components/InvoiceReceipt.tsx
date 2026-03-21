'use client'

import React from 'react'
import { useStore } from '@/hooks/use-store'
import { X, Printer } from 'lucide-react'

interface InvoiceProps {
  shopName: string
  shopLogo?: string
  invoiceId: string
  date: string
  cashierName: string
  items: { name: string; quantity: number; price: number }[]
  totalAmount: number
  onClose: () => void
}

function formatInvoiceDate(dateString?: string): string {
  let now: Date
  try {
    now = dateString ? new Date(dateString) : new Date()
    if (isNaN(now.getTime())) {
      throw new Error('Invalid date')
    }
  } catch {
    now = new Date()
  }
  
  return now.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function InvoiceReceipt(props: InvoiceProps) {
  const { store: globalStore } = useStore()
  const formattedDate = formatInvoiceDate(props.date)
  const finalShopName = props.shopName || globalStore.name || 'متجر الدهانات'
  const finalLogo = props.shopLogo || globalStore.logo_url

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <button
        onClick={props.onClose}
        className="print:hidden absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="invoice-container bg-white shadow-2xl relative overflow-auto max-h-[95vh]"
        style={{ 
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm',
          fontFamily: 'Cairo, Tajawal, Tahoma, Arial, sans-serif',
          direction: 'rtl',
          fontSize: '13px',
          lineHeight: '1.4',
          border: '1px solid #e5e7eb',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <span 
            className="transform -rotate-45 whitespace-nowrap"
            style={{ 
              opacity: 0.08, 
              transform: 'rotate(-45deg)',
              fontSize: '80px',
              fontWeight: 'bold',
              color: '#1e3a8a',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {finalShopName}
          </span>
        </div>

        <div className="relative z-10">
          <div className="border-b-2 border-gray-300 pb-4 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-800">فاتورة بيع</h1>
                <p className="text-gray-600 mt-1">
                  <span className="font-semibold">رقم الفاتورة:</span> {props.invoiceId}
                </p>
              </div>
              
              <div className="text-left">
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">التاريخ:</span> {formattedDate}
                </p>
              </div>
            </div>

            <div className="text-center">
              {finalLogo && (
                <div className="mb-3">
                  <img src={finalLogo} alt="Logo" className="w-20 h-20 mx-auto object-contain rounded-lg" />
                </div>
              )}
              <h2 className="text-3xl font-bold" style={{ color: '#1e3a8a' }}>
                {finalShopName}
              </h2>
              {globalStore.address && (
                <p className="text-gray-600 mt-1">{globalStore.address}</p>
              )}
              {globalStore.phone && (
                <p className="text-gray-600 text-sm">{globalStore.phone}</p>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-700">
                <span className="font-semibold">الكاشير:</span> {props.cashierName}
              </p>
            </div>

            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">#</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">الصنف</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">الكمية</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">السعر</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {props.items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">{item.name}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{item.price.toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-6">
              <div className="border border-gray-300 p-4 bg-gray-50" style={{ minWidth: '200px' }}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع:</span>
                    <span>{props.totalAmount.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الضريبة (0%):</span>
                    <span>0.00 ج.م</span>
                  </div>
                  <div className="border-t border-gray-300 my-2"></div>
                  <div className="flex justify-between">
                    <span className="font-bold text-lg">الإجمالي النهائي:</span>
                    <span className="font-bold text-lg">{props.totalAmount.toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4 mt-8">
              <div className="text-center mb-8">
                <p className="text-lg font-semibold text-gray-800">شكراً لتعاملكم معنا</p>
              </div>
              <div className="flex justify-start">
                <div className="w-64">
                  <div className="border-t border-gray-400 pt-2">
                    <p className="text-sm text-gray-600">توقيع العميل</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="print:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
            طباعة الفاتورة
          </button>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
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
              box-shadow: none;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
