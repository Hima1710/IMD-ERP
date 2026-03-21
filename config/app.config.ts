/**
 * PaintMaster ERP Configuration
 * 
 * This file contains all configurable settings for the POS system.
 * Modify values here to customize the application behavior.
 */

// Store Configuration
export const STORE_CONFIG = {
  stores: [
    { id: 'riyadh', name: 'الرياض', nameEn: 'Riyadh', city: 'الرياض' },
    { id: 'jeddah', name: 'جدة', nameEn: 'Jeddah', city: 'جدة' },
    { id: 'dammam', name: 'الدمام', nameEn: 'Dammam', city: 'الدمام' },
  ],
  defaultStore: 'riyadh',
} as const

// Tax Configuration
export const TAX_CONFIG = {
  defaultRate: 0.15, // 15% VAT
  label: 'الضريبة',
  labelEn: 'Tax',
} as const

// Currency Configuration
export const CURRENCY_CONFIG = {
  code: 'EGP',
  symbol: 'ج.م',
  locale: 'ar-EG',
  name: 'الجنيه المصري',
  nameEn: 'Egyptian Pound',
} as const

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'الكل', nameEn: 'All' },
  { id: 'paint', name: 'الدهانات', nameEn: 'Paints' },
  { id: 'tools', name: 'الأدوات', nameEn: 'Tools' },
  { id: 'decor', name: 'الديكور', nameEn: 'Decor' },
] as const

// Theme Configuration
export const THEME_CONFIG = {
  colors: {
    primary: '#1e3a5f',
    primaryLight: '#3b82f6',
    accent: '#ea580c',
    accentLight: '#f97316',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  fonts: {
    primary: 'Cairo, Geist, sans-serif',
    mono: 'Geist Mono, monospace',
  },
} as const

// UI Configuration
export const UI_CONFIG = {
  sidebar: {
    width: 'w-72',
    collapsed: 'w-20',
  },
  cart: {
    width: 'w-80',
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  enableBarcodeScanner: true,
  enableReceiptPrinting: true,
  enablePaymentIntegration: false,
  enableInventoryTracking: true,
  enableCustomerLoyalty: false,
  enableSalesAnalytics: false,
} as const

// API Endpoints (placeholder for future integration)
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 5000,
  retries: 3,
} as const

// Localization
export const LOCALE_CONFIG = {
  defaultLocale: 'ar',
  supportedLocales: ['ar', 'en'],
  rtlLocales: ['ar'],
  timeFormat: '24h',
  dateFormat: 'DD/MM/YYYY',
} as const

// Validation Rules
export const VALIDATION_CONFIG = {
  discountMax: 100,
  discountMin: 0,
  quantityMax: 9999,
  quantityMin: 1,
  searchMinLength: 1,
} as const

export default {
  STORE_CONFIG,
  TAX_CONFIG,
  CURRENCY_CONFIG,
  PRODUCT_CATEGORIES,
  THEME_CONFIG,
  UI_CONFIG,
  FEATURE_FLAGS,
  API_CONFIG,
  LOCALE_CONFIG,
  VALIDATION_CONFIG,
}
