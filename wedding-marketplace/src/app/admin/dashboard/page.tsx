'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'

interface DashboardData {
  stats: {
    totalUsers: number
    totalVendors: number
    totalBookings: number
    totalGMV: number
    totalPlatformRevenue: number
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
      } else {
        setError(json.message)
      }
    } catch (err) {
      setError('Failed to fetch admin dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--burgundy)]"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
        {error || 'Failed to load admin dashboard'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--charcoal)] mb-2">Platform Overview</h1>
        <p className="text-[var(--text-muted)]">Global metrics for Wedding Marketplace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm">
          <p className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Total Users</p>
          <p className="text-4xl font-[var(--font-display)] text-[var(--charcoal)]">{data.stats.totalUsers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm">
          <p className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Total Vendors</p>
          <p className="text-4xl font-[var(--font-display)] text-[var(--charcoal)]">{data.stats.totalVendors}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm">
          <p className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Total Bookings</p>
          <p className="text-4xl font-[var(--font-display)] text-[var(--charcoal)]">{data.stats.totalBookings}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--cream)] rounded-3xl p-8 border border-[var(--cream-dkr)]">
         <div>
            <p className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Gross Merchandise Value (GMV)</p>
            <p className="text-4xl lg:text-5xl font-[var(--font-display)] text-[var(--charcoal)] mb-4">{formatPrice(data.stats.totalGMV)}</p>
            <p className="text-sm text-[var(--text-muted)]">Total value of all confirmed and completed bookings across the platform.</p>
         </div>
         <div>
            <p className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] md:text-right mb-2">Platform Revenue</p>
            <p className="text-4xl lg:text-5xl font-[var(--font-display)] text-[var(--burgundy)] md:text-right mb-4">{formatPrice(data.stats.totalPlatformRevenue)}</p>
            <p className="text-sm text-[var(--text-muted)] md:text-right">Estimated platform commission from all successful bookings.</p>
         </div>
      </div>
    </div>
  )
}
