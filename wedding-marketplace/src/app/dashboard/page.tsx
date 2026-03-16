'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatPrice } from '@/lib/utils'

interface DashboardData {
  stats: {
    totalBookings: number
    totalSpent: number
    upcomingEvents: number
    pendingEnquiries: number
  }
  recentActivity: any[]
}

export default function DashboardIndex() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/user/dashboard')
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
      } else {
        setError(json.message)
      }
    } catch (err) {
      setError('Failed to fetch dashboard data')
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
        {error || 'Failed to load dashboard'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--charcoal)] mb-2">Overview</h1>
        <p className="text-[var(--text-muted)]">Your wedding planning at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm">
          <p className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Upcoming Events</p>
          <p className="text-3xl font-[var(--font-display)] text-[var(--charcoal)]">{data.stats.upcomingEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm">
          <p className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Pending Enquiries</p>
          <p className="text-3xl font-[var(--font-display)] text-[var(--charcoal)]">{data.stats.pendingEnquiries}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm">
          <p className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Total Bookings</p>
          <p className="text-3xl font-[var(--font-display)] text-[var(--charcoal)]">{data.stats.totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm">
          <p className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Total Spent</p>
          <p className="text-3xl font-[var(--font-display)] text-[var(--burgundy)]">{formatPrice(data.stats.totalSpent)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--cream-dkr)] shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[var(--font-display)] text-xl text-[var(--charcoal)]">Recent Activity</h2>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-[var(--burgundy)] hover:underline">
            View All
          </Link>
        </div>
        
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No recent activity found.</p>
        ) : (
          <div className="space-y-4">
            {data.recentActivity.map(booking => (
              <div key={booking._id} className="flex items-center justify-between p-4 bg-[var(--cream)] rounded-xl">
                <div>
                  <p className="font-medium text-[var(--charcoal)]">{booking.vendorId.businessName}</p>
                  <p className="text-xs text-[var(--text-light)]">For {booking.eventType} on {format(new Date(booking.eventDate), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border border-[var(--cream-dkr)]">
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
