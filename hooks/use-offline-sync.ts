'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  offlineDB, 
  getUnsyncedTransactions, 
  getPendingSyncTransactions,
  getPendingSyncCount, 
  markTransactionSynced, 
  deleteSyncedTransaction,
  isOnline,
  onOnline,
  onOffline,
  updateTransactionStatus,
  type OfflineTransaction 
} from '@/lib/offline-db'

interface UseOfflineSyncReturn {
  isOnline: boolean
  pendingCount: number
  isSyncing: boolean
  lastSyncTime: Date | null
  syncNow: () => Promise<void>
  error: string | null
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [online, setOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check initial online status
  useEffect(() => {
    setOnline(isOnline())
  }, [])

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount()
      setPendingCount(count)
    } catch (err) {
      console.error('Error getting pending count:', err)
    }
  }, [])

  // Sync a single transaction to Supabase
  const syncTransaction = async (transaction: OfflineTransaction): Promise<boolean> => {
    if (!supabase) return false

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          shop_id: transaction.shop_id,
          customer_id: transaction.customer_id,
          total_amount: transaction.total_amount,
          amount_paid: transaction.amount_paid,
          remaining_amount: transaction.remaining_amount,
          final_amount: transaction.final_amount,
          discount_amount: transaction.discount_amount,
          payment_method: transaction.payment_method,
          change_amount: transaction.change_amount,
          items: transaction.items,
          sale_date: transaction.sale_date,
        }])
        .select()

      if (error) {
        console.error('Error syncing transaction:', error)
        return false
      }

      // Mark as synced in local DB
      await markTransactionSynced(transaction.localId)
      return true
    } catch (err) {
      console.error('Error in syncTransaction:', err)
      return false
    }
  }

  // Sync all pending transactions
  const syncAllTransactions = useCallback(async () => {
    if (!supabase || isSyncing) return

    // Check if we're actually online
    if (!isOnline()) {
      console.log('Cannot sync: currently offline')
      return
    }

    setIsSyncing(true)
    setError(null)

    try {
      // Get transactions with pending_sync status
      const unsyncedTransactions = await getPendingSyncTransactions()
      
      if (unsyncedTransactions.length === 0) {
        setLastSyncTime(new Date())
        setIsSyncing(false)
        return
      }

      let syncedCount = 0
      let failedCount = 0

      for (const transaction of unsyncedTransactions) {
        // Update status to syncing
        await updateTransactionStatus(transaction.localId, 'syncing')
        
        const success = await syncTransaction(transaction)
        if (success) {
          syncedCount++
          // Delete synced transaction from local storage
          await deleteSyncedTransaction(transaction.localId)
        } else {
          // Mark as failed
          await updateTransactionStatus(transaction.localId, 'failed')
          failedCount++
        }
      }

      if (failedCount > 0) {
        setError(`Failed to sync ${failedCount} transaction(s)`)
      }

      setLastSyncTime(new Date())
      await updatePendingCount()
    } catch (err) {
      console.error('Error syncing transactions:', err)
      setError('Failed to sync transactions')
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, updatePendingCount])

  // Listen for online/offline events
  useEffect(() => {
    const unsubscribeOnline = onOnline(() => {
      setOnline(true)
      // Auto-sync when coming back online
      syncAllTransactions()
    })

    const unsubscribeOffline = onOffline(() => {
      setOnline(false)
    })

    // Initial pending count check
    updatePendingCount()

    return () => {
      unsubscribeOnline()
      unsubscribeOffline()
    }
  }, [syncAllTransactions, updatePendingCount])

  // Periodically check for pending transactions
  useEffect(() => {
    const interval = setInterval(() => {
      updatePendingCount()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [updatePendingCount])

  return {
    isOnline: online,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncNow: syncAllTransactions,
    error
  }
}
