'use client'

import React from 'react'
import { useStore } from '@/hooks/use-store'
import { X, Printer } from 'lucide-react'

interface InvoiceProps {
  shopName?: string
  shopLogo?: string
  shopAddress?: string
  shopPhone?: string
  invoiceId?: string
  date?: string
  cashierName?: string
  items?: { name: string; quantity: number; price: number }[]
  totalAmount?: number
  onClose?: () => void
  // Additional props from shopping-cart
  subtotal?: number
  discountAmount?: number
  total?: number
  paymentMethod?: string
  amountPaid?: number
  changeAmount?: number
  customerName?: string
  customerPhone?: string
}

export default function Invoice(props: InvoiceProps) {
  const { store: globalStore } = useStore()
  
  // Use total if provided, otherwise fallback to totalAmount
  const finalTotalAmount = props.totalAmount ?? props.total ?? 0
  
  // حل مشكلة التاريخ Invalid Date الظاهرة في الصور
  const dateObj = props.date ? new Date(props.date) : new Date()
  const isDateValid = !isNaN(dateObj.getTime())
  const displayDate = isDateValid ? dateObj.toLocaleDateString('ar-EG') : new Date().toLocaleDateString('ar-EG')
  const displayTime = isDateValid ? dateObj.toLocaleTimeString('ar-EG') : new Date().toLocaleTimeString('ar-EG')

  const finalShopName = props.shopName || globalStore.name || 'متجر الدهانات'
  const finalLogo = props.shopLogo || globalStore.logo_url

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { display: none !important; }
          .invoice-printable-wrapper, .invoice-printable-wrapper * { display: block !important; }
          @page { size: A4; margin: 0; }
          .invoice-printable-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 20mm !important;
            background: white !important;
            direction: rtl !important;
            visibility: visible !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      {/* الحاوية السوداء - تأكد أن z-index أعلى من أي شيء آخر */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 no-print" dir="rtl">
        
        {/* زر الإغلاق المصلح */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            props.onClose?.();
          }} 
          className="absolute top-6 left-6 bg-red-600 text-white p-3 rounded-full shadow-2xl z-[10001] hover:bg-red-700 transition-all active:scale-90"
          title="إغلاق"
        >
          <X className="w-8 h-8" />
        </button>

        {/* جسم الفاتورة */}
        <div className="invoice-printable-wrapper bg-white relative shadow-2xl overflow-auto max-h-[95vh] print:max-h-none print:shadow-none"
          style={{ width: '210mm', minHeight: '297mm', padding: '15mm', fontFamily: 'Arial, sans-serif' }}>
          
          {/* العلامة المائية */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <span className="transform -rotate-45 opacity-[0.05] text-[110px] font-black text-blue-900 select-none whitespace-nowrap">
              {finalShopName}
            </span>
          </div>

          <div className="relative z-10">
            {/* رأس الفاتورة */}
            <div className="border-b-4 border-blue-900 pb-6 mb-8 flex justify-between items-center">
              <div className="text-right">
                <h1 className="text-4xl font-black text-blue-900 mb-2">فاتورة بيع</h1>
                <p className="text-lg font-bold">رقم الفاتورة: <span className="text-red-600 font-mono">#{props.invoiceId || '1'}</span></p>
                <div className="mt-4 text-sm text-gray-500 font-bold">
                  <p>التاريخ: {displayDate}</p>
                  <p>الوقت: {displayTime}</p>
                </div>
              </div>

              <div className="text-center">
                {finalLogo && <img src={finalLogo} className="w-24 h-24 mx-auto mb-2 object-contain" alt="لوجو المحل" />}
                <h2 className="text-3xl font-black">{finalShopName}</h2>
                <p className="text-sm font-bold text-gray-600">{globalStore.address || 'السادات'}</p>
                <p className="text-sm font-mono text-gray-600">{globalStore.phone}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 text-center min-w-[140px]">
                <p className="text-[10px] text-blue-400 font-black uppercase mb-1">المسؤول</p>
                <p className="font-bold text-blue-900 text-lg">{props.cashierName}</p>
              </div>
            </div>

            {/* الجدول */}
            <table className="w-full border-collapse border-2 border-gray-300 mb-10 text-lg">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border-2 border-gray-300 p-3 w-16 text-center">#</th>
                  <th className="border-2 border-gray-300 p-3 text-right">الصنف</th>
                  <th className="border-2 border-gray-300 p-3 text-center">الكمية</th>
                  <th className="border-2 border-gray-300 p-3 text-center">السعر</th>
                  <th className="border-2 border-gray-300 p-3 text-center">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {(props.items || []).map((item: any, i: number) => (
                  <tr key={i} className="even:bg-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="border-2 border-gray-300 p-3 text-center font-mono">{i + 1}</td>
                    <td className="border-2 border-gray-300 p-3 font-bold">{item.name}</td>
                    <td className="border-2 border-gray-300 p-3 text-center font-bold">{item.quantity}</td>
                    <td className="border-2 border-gray-300 p-3 text-center font-mono">{(item.price || 0).toFixed(2)}</td>
                    <td className="border-2 border-gray-300 p-3 text-center font-black bg-blue-50">{((item.quantity || 0) * (item.price || 0) || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ملخص الحساب */}
            <div className="flex justify-end mb-16">
              <div className="w-80 border-4 border-blue-900 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-blue-900 text-white p-3 text-center font-bold text-xl">إجمالي الفاتورة</div>
                <div className="p-6 bg-white flex justify-center text-4xl font-black text-blue-900">
                  <span>{(finalTotalAmount || 0).toFixed(2)} ج.م</span>
                </div>
              </div>
            </div>

            {/* التوقيعات */}
            <div className="grid grid-cols-2 gap-20 mt-20 px-10 text-center">
              <div><p className="text-sm font-black text-gray-400 mb-12">توقيع المستلم</p><div className="border-b-2 border-dashed border-gray-400"></div></div>
              <div><p className="text-sm font-black text-gray-400 mb-12">ختم وتوقيع المحل</p><div className="border-b-2 border-dashed border-gray-400"></div></div>
            </div>
            
            <div className="mt-24 text-center pt-8 border-t-2 border-gray-100">
              <p className="text-3xl font-black text-blue-900 mb-2 italic">"شكراً لتعاملكم معنا"</p>
              <p className="text-xs text-gray-400 tracking-[3px] uppercase">Powered by IMD ERP System</p>
            </div>
          </div>

          {/* زر الطباعة */}
          <div className="no-print flex justify-center mt-12 mb-6">
            <button 
              onClick={() => window.print()} 
              className="bg-blue-600 text-white px-20 py-5 rounded-2xl font-black text-2xl flex items-center gap-4 shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
            >
              <Printer className="w-8 h-8" /> طباعة الآن
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

