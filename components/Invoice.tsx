'use client'

import CompactInvoice from './CompactInvoice'
import React from 'react'
import { useStore } from '@/hooks/use-store'

// Wrapper to maintain compatibility - redirects to CompactInvoice
export default function Invoice(props: any) {
  return <CompactInvoice {...props} />
}

