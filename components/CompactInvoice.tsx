'use client'

import React from 'react'
import { useStore } from '@/hooks/use-store'
import { X, Printer } from 'lucide-react'

interface CompactInvoiceProps {
  onClose: () => void
  items?: { name: string; quantity: number; price: number }[]
  subtotal?: number
  discountAmount?: number
  total?: number
  paymentMethod?: string
  amountPaid?: number
  changeAmount?: number
  remainingAmount?: number
  date?: string
  invoiceId?: string | null
  customerName?: string
  customerPhone?: string
  storeName?: string
}

export default function CompactInvoice({ onClose, items = [], total = 0, date = '', invoiceId, customerName, storeName = 'متجر الدهانات', ...props }: CompactInvoiceProps) {
  const { store } = useStore()
  const displayDate = date || new Date().toLocaleString('ar-EG')
  
  const handlePrint = () => window.print()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .compact-invoice, .compact-invoice * { visibility: visible; }
          .compact-invoice { 
            position: absolute !important; left: 0 !important; top: 0 !important; 
            width: 80mm !important; 
          }
          .no-print { display: none !important; }
        }
      ` }} />
      
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 no-print">
        <div className="max-w-[320px] w-full bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto print:shadow-none border">
          {/* Header */}
          <div className="p-2 border-b border-slate-200 text-xs font-bold text-center uppercase tracking-wide">
            {storeName}
            {invoiceId && <div className="text-[10px] mt-0.5">#{invoiceId}</div>}
            <div className="text-[10px] mt-1 opacity-75">{displayDate}</div>
            {customerName && (
              <div className="text-[10px] mt-1 border-t pt-1">
                عميل: {customerName}
              </div>
            )}
          </div>

          {/* Items - High density */}
          <div className="p-2 space-y-0.5">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-[10px] py-0.5 border-b border-dashed border-slate-200 last:border-b-0">
                <span className="truncate flex-1 min-w-0">{item.name}</span>
                <div className="text-right w-20">
                  <div>{item.quantity}x{Number(item.price || 0).toFixed(2)}</div>
                  <div className="font-bold">{(item.quantity * Number(item.price || 0)).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-2 border-t space-y-0.5 text-[11px]">
            <div className="flex justify-between font-semibold">
              <span>المجموع الفرعي:</span>
              <span>{props.subtotal?.toFixed(2) || '0.00'} ج.م</span>
            </div>
            {props.discountAmount && props.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>الخصم:</span>
                <span>-{props.discountAmount.toFixed(2)} ج.م</span>
              </div>
            )}
            <div className="border-t pt-1 mt-1 font-bold text-xs uppercase tracking-wide">
              <div className="flex justify-between text-lg">
                <span>الإجمالي:</span>
                <span className="text-blue-600">{total.toFixed(2)} ج.م</span>
              </div>
              {props.changeAmount && props.changeAmount > 0 && (
                <div className="text-green-600 text-[10px] mt-0.5">
                  الباقي للعميل: {props.changeAmount.toFixed(2)} ج.م
                </div>
              )}
              {props.remainingAmount && props.remainingAmount > 0 && (
                <div className="text-orange-600 text-[10px] mt-0.5">
                  المتبقي: {props.remainingAmount.toFixed(2)} ج.م
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-2 border-t bg-slate-50 flex gap-2 no-print">
            <button 
              onClick={handlePrint}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Printer className="w-3 h-3" />
              طباعة
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
            >
              إغلاق
            </button>
          </div>

          {/* Print signature line */}
          <div className="p-2 text-center print:block hidden border-t">
            <div className="border-b border-dashed border-slate-400 mx-4 py-4 text-[10px] opacity-75">
              توقيع المستلم / ختم المحل
            </div>
            <p className="text-[9px] mt-2 opacity-50 tracking-wide">IMD ERP System</p>
          </div>
        </div>
      </div>
    </>
  )
}

