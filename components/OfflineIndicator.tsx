'use client'

import { useOfflineSync } from '@/hooks/use-offline-sync'
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'

export function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing, syncNow, error } = useOfflineSync()

  // Don't show anything if online and no pending
  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Offline Badge */}
      {!isOnline && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-sm font-medium shadow-lg">
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </div>
      )}

      {/* Pending Sync Badge */}
      {isOnline && pendingCount > 0 && (
        <button
          onClick={syncNow}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm font-medium shadow-lg transition-colors disabled:opacity-50"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{pendingCount} pending</span>
        </button>
      )}

      {/* Error Badge */}
      {error && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-full text-sm font-medium shadow-lg">
          <AlertCircle className="w-4 h-4" />
          <span>Sync Error</span>
        </div>
      )}
    </div>
  )
}

// Compact version for mobile
export function OfflineIndicatorCompact() {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync()

  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 md:hidden">
      {!isOnline ? (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-full text-xs font-medium shadow-lg">
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </div>
      ) : pendingCount > 0 && (
        <div className={`flex items-center gap-1.5 px-3 py-2 ${isSyncing ? 'bg-blue-500' : 'bg-amber-500'} text-white rounded-full text-xs font-medium shadow-lg`}>
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Wifi className="w-3 h-3" />
          )}
          <span>{pendingCount}</span>
        </div>
      )}
    </div>
  )
}
