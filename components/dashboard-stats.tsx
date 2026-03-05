'use client'

import React from 'react'
import { ShoppingCart, TrendingUp, DollarSign, Package } from 'lucide-react'

interface StatCard {
  label: string
  labelAr: string
  value: string
  icon: React.ReactNode
  trend?: number
  color: string
}

interface DashboardStatsProps {
  stats: StatCard[]
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  // Dynamic grid columns based on number of stats
  const gridCols = stats.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  )
}

function StatCard({ stat }: { stat: StatCard }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">{stat.labelAr}</p>
          <p className="text-2xl font-bold text-slate-900 mb-2">{stat.value}</p>
          {stat.trend !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-3 h-3 ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-xs font-medium ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend >= 0 ? '+' : ''}{stat.trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`${stat.color} p-3 rounded-lg`}>
          {stat.icon}
        </div>
      </div>
    </div>
  )
}
