import Dexie, { type Table } from 'dexie'

// Offline Transaction interface
export interface OfflineTransaction {
  id?: number
  localId: string // Unique ID for this offline record
  shop_id: string
  customer_id: string | null
  total_amount: number
  amount_paid: number
  remaining_amount: number
  final_amount: number
  discount_amount: number
  payment_method: string
  change_amount: number
  items: any[]
  sale_date: string
  synced: number // 0 = not synced, 1 = synced (for Dexie index)
  status: 'pending_sync' | 'syncing' | 'synced' | 'failed' // Status for tracking sync state
  created_at: string
}

// Offline Supplier interface
export interface OfflineSupplier {
  id?: number
  localId: string
  shop_id: string
  name: string
  phone: string
  address: string
  total_debt: number
  synced: number
  status: 'pending_sync' | 'syncing' | 'synced' | 'failed'
  created_at: string
}

// Offline Supplier Transaction interface
export interface OfflineSupplierTransaction {
  id?: number
  localId: string
  shop_id: string
  supplier_id: string
  type: 'purchase' | 'payment' | 'return'  // Updated to match DB constraints (lowercase)
  amount: number
  notes: string
  product_id: string | null
  quantity: number
  synced: number
  status: 'pending_sync' | 'syncing' | 'synced' | 'failed'
  created_at: string
}

// Offline Expense interface
export interface OfflineExpense {
  id?: number
  localId: string
  shop_id: string
  category: string
  amount: number
  notes: string
  expense_date: string
  synced: number
  status: 'pending_sync' | 'syncing' | 'synced' | 'failed'
  created_at: string
}

// Dexie Database for Offline Storage
class POSOfflineDatabase extends Dexie {
  offline_transactions!: Table<OfflineTransaction>
  offline_suppliers!: Table<OfflineSupplier>
  offline_supplier_transactions!: Table<OfflineSupplierTransaction>
  offline_expenses!: Table<OfflineExpense>

  constructor() {
    super('POSOfflineDB')
    this.version(3).stores({
      offline_transactions: '++id, localId, shop_id, customer_id, synced, status, created_at',
      offline_suppliers: '++id, localId, shop_id, synced, status, created_at',
      offline_supplier_transactions: '++id, localId, shop_id, supplier_id, synced, status, created_at',
      offline_expenses: '++id, localId, shop_id, synced, status, created_at'
    })
  }
}

// Export the database instance
export const offlineDB = new POSOfflineDatabase()

// Helper functions for offline transactions

// Save transaction to local storage when offline
export async function saveTransactionOffline(transaction: Omit<OfflineTransaction, 'id' | 'synced' | 'status' | 'created_at'>): Promise<string> {
  const localId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await offlineDB.offline_transactions.add({
    ...transaction,
    localId,
    synced: 0, // 0 = not synced
    status: 'pending_sync', // Mark as pending sync
    created_at: new Date().toISOString()
  })
  
  return localId
}

// Get all unsynced transactions with pending_sync status
export async function getPendingSyncTransactions(): Promise<OfflineTransaction[]> {
  return await offlineDB.offline_transactions
    .where('status')
    .equals('pending_sync')
    .toArray()
}

// Get all unsynced transactions (legacy support)
export async function getUnsyncedTransactions(): Promise<OfflineTransaction[]> {
  return await offlineDB.offline_transactions
    .where('synced')
    .equals(0)
    .toArray()
}

// Update transaction status
export async function updateTransactionStatus(localId: string, status: 'pending_sync' | 'syncing' | 'synced' | 'failed'): Promise<void> {
  await offlineDB.offline_transactions
    .where('localId')
    .equals(localId)
    .modify({ status })
}

// Get count of pending transactions
export async function getPendingSyncCount(): Promise<number> {
  return await offlineDB.offline_transactions
    .where('synced')
    .equals(0)
    .count()
}

// Mark transaction as synced
export async function markTransactionSynced(localId: string): Promise<void> {
  await offlineDB.offline_transactions
    .where('localId')
    .equals(localId)
    .modify({ synced: 1 })
}

// Delete synced transaction from local storage
export async function deleteSyncedTransaction(localId: string): Promise<void> {
  await offlineDB.offline_transactions
    .where('localId')
    .equals(localId)
    .delete()
}

// Clear all synced transactions
export async function clearSyncedTransactions(): Promise<number> {
  const count = await offlineDB.offline_transactions
    .where('synced')
    .equals(1)
    .delete()
  
  return count
}

// Check if we're online
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

// Listen for online event
export function onOnline(callback: () => void): () => void {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', callback)
    return () => window.removeEventListener('online', callback)
  }
  return () => {}
}

// Listen for offline event
export function onOffline(callback: () => void): () => void {
  if (typeof window !== 'undefined') {
    window.addEventListener('offline', callback)
    return () => window.removeEventListener('offline', callback)
  }
  return () => {}
}

// ============== SUPPLIERS OFFLINE FUNCTIONS ==============

// Save supplier to local storage when offline
export async function saveSupplierOffline(supplier: Omit<OfflineSupplier, 'id' | 'synced' | 'status' | 'created_at'>): Promise<string> {
  const localId = `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await offlineDB.offline_suppliers.add({
    ...supplier,
    localId,
    synced: 0,
    status: 'pending_sync',
    created_at: new Date().toISOString()
  })
  
  return localId
}

// Get pending sync suppliers
export async function getPendingSyncSuppliers(): Promise<OfflineSupplier[]> {
  return await offlineDB.offline_suppliers
    .where('status')
    .equals('pending_sync')
    .toArray()
}

// Update supplier status
export async function updateSupplierStatus(localId: string, status: 'pending_sync' | 'syncing' | 'synced' | 'failed'): Promise<void> {
  await offlineDB.offline_suppliers
    .where('localId')
    .equals(localId)
    .modify({ status })
}

// Mark supplier as synced
export async function markSupplierSynced(localId: string): Promise<void> {
  await offlineDB.offline_suppliers
    .where('localId')
    .equals(localId)
    .modify({ synced: 1 })
}

// Delete synced supplier from local storage
export async function deleteSyncedSupplier(localId: string): Promise<void> {
  await offlineDB.offline_suppliers
    .where('localId')
    .equals(localId)
    .delete()
}

// ============== SUPPLIER TRANSACTIONS OFFLINE FUNCTIONS ==============

// Save supplier transaction to local storage when offline
export async function saveSupplierTransactionOffline(transaction: Omit<OfflineSupplierTransaction, 'id' | 'synced' | 'status' | 'created_at'>): Promise<string> {
  const localId = `supplier_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await offlineDB.offline_supplier_transactions.add({
    ...transaction,
    localId,
    synced: 0,
    status: 'pending_sync',
    created_at: new Date().toISOString()
  })
  
  return localId
}

// Get pending sync supplier transactions
export async function getPendingSyncSupplierTransactions(): Promise<OfflineSupplierTransaction[]> {
  return await offlineDB.offline_supplier_transactions
    .where('status')
    .equals('pending_sync')
    .toArray()
}

// Update supplier transaction status
export async function updateSupplierTransactionStatus(localId: string, status: 'pending_sync' | 'syncing' | 'synced' | 'failed'): Promise<void> {
  await offlineDB.offline_supplier_transactions
    .where('localId')
    .equals(localId)
    .modify({ status })
}

// Mark supplier transaction as synced
export async function markSupplierTransactionSynced(localId: string): Promise<void> {
  await offlineDB.offline_supplier_transactions
    .where('localId')
    .equals(localId)
    .modify({ synced: 1 })
}

// Delete synced supplier transaction from local storage
export async function deleteSyncedSupplierTransaction(localId: string): Promise<void> {
  await offlineDB.offline_supplier_transactions
    .where('localId')
    .equals(localId)
    .delete()
}

// ============== EXPENSES OFFLINE FUNCTIONS ==============

// Save expense to local storage when offline
export async function saveExpenseOffline(expense: Omit<OfflineExpense, 'id' | 'synced' | 'status' | 'created_at'>): Promise<string> {
  const localId = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await offlineDB.offline_expenses.add({
    ...expense,
    localId,
    synced: 0,
    status: 'pending_sync',
    created_at: new Date().toISOString()
  })
  
  return localId
}

// Get pending sync expenses
export async function getPendingSyncExpenses(): Promise<OfflineExpense[]> {
  return await offlineDB.offline_expenses
    .where('status')
    .equals('pending_sync')
    .toArray()
}

// Update expense status
export async function updateExpenseStatus(localId: string, status: 'pending_sync' | 'syncing' | 'synced' | 'failed'): Promise<void> {
  await offlineDB.offline_expenses
    .where('localId')
    .equals(localId)
    .modify({ status })
}

// Mark expense as synced
export async function markExpenseSynced(localId: string): Promise<void> {
  await offlineDB.offline_expenses
    .where('localId')
    .equals(localId)
    .modify({ synced: 1 })
}

// Delete synced expense from local storage
export async function deleteSyncedExpense(localId: string): Promise<void> {
  await offlineDB.offline_expenses
    .where('localId')
    .equals(localId)
    .delete()
}

// Get count of pending expenses
export async function getPendingExpensesCount(): Promise<number> {
  return await offlineDB.offline_expenses
    .where('synced')
    .equals(0)
    .count()
}
