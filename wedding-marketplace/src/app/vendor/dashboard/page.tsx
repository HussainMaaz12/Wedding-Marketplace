// src/app/vendor/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatPrice } from '@/lib/utils'

interface DashboardData {
  stats: {
    totalBookings: number
    totalRevenue: number
    averageRating: number
    totalReviews: number
    pendingEnquiries: number
    upcomingEvents: number
  }
  recentEnquiries: any[]
  needsProfileSetup?: boolean
}

export default function VendorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/vendor/dashboard')
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
      } else {
        setError(json.message)
      }
    } catch (err) {
      setError('Failed to fetch vendor dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--burgundy)]"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-4">
        <span className="text-2xl">⚠️</span>
        <p className="font-medium">{error || 'Failed to load vendor dashboard'}</p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="font-[var(--font-display)] text-4xl text-[var(--charcoal)] mb-2">Welcome Back.</h1>
        <p className="text-[var(--text-muted)] text-lg">Here is what is happening with your business today.</p>
      </div>

      {/* Profile Setup Banner */}
      {data.needsProfileSetup && (
        <div className="mb-10 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[var(--burgundy)] to-[#8a1c30] text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative z-10">
            <h2 className="font-[var(--font-display)] text-2xl mb-2 flex items-center gap-3">
              <span>🎉</span> Welcome to WeddingConnect!
            </h2>
            <p className="text-white/80 max-w-xl text-sm leading-relaxed">
              Your account is created, but your storefront is empty. Customers can't find you until you set up your business profile, add your location, and upload some stunning photos of your work.
            </p>
          </div>
          <Link
            href="/vendor/profile"
            className="relative z-10 whitespace-nowrap px-8 py-3.5 bg-[var(--gold)] text-[#4a3f2b] font-bold text-sm uppercase tracking-widest rounded-xl hover:brightness-105 transition-all shadow-md"
          >
            Complete Profile →
          </Link>

          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 right-32 w-40 h-40 bg-[var(--gold)] opacity-10 rounded-full blur-2xl translate-y-1/2"></div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl"></div>
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-3">Pending Enquiries</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-[var(--font-display)] text-[var(--charcoal)]">{data.stats.pendingEnquiries}</p>
            {data.stats.pendingEnquiries > 0 && (
              <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">Action Required</span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-2xl"></div>
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-3">Upcoming Events</p>
          <p className="text-4xl font-[var(--font-display)] text-[var(--charcoal)]">{data.stats.upcomingEvents}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl"></div>
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-3">Total Bookings</p>
          <p className="text-4xl font-[var(--font-display)] text-[var(--charcoal)]">{data.stats.totalBookings}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--cream-dkr)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gold)] rounded-l-2xl"></div>
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-3">Est. Revenue</p>
          <p className="text-4xl font-[var(--font-display)] text-[var(--burgundy)]">{formatPrice(data.stats.totalRevenue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--cream-dkr)] shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--cream-dkr)] flex items-center justify-between bg-[var(--cream-lt)]/50">
            <h2 className="font-[var(--font-display)] text-xl font-medium text-[var(--charcoal)] flex items-center gap-2">
              <span>📋</span> Recent Enquiries
            </h2>
            <Link href="/vendor/bookings" className="text-xs font-bold uppercase tracking-wider text-[var(--burgundy)] hover:text-[var(--gold)] transition-colors">
              View All →
            </Link>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {data.recentEnquiries.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-[var(--cream)] rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📬</span>
                </div>
                <p className="text-lg font-medium text-[var(--charcoal)] mb-1">No pending enquiries</p>
                <p className="text-sm text-[var(--text-muted)] max-w-sm">When customers request to book your services, they will appear right here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentEnquiries.map(enquiry => (
                  <div key={enquiry._id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-[var(--cream-dkr)] rounded-xl hover:border-[var(--gold)] transition-colors">
                    <div className="mb-4 sm:mb-0">
                      <p className="font-semibold text-[var(--charcoal)]">{enquiry.customerId?.name || 'Customer'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 bg-[var(--cream)] text-[var(--text-muted)] rounded-md">
                          {enquiry.eventType}
                        </span>
                        <span className="text-xs text-[var(--text-light)]">
                          {format(new Date(enquiry.eventDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-light)] uppercase tracking-wider mb-0.5">Value</p>
                        <p className="text-sm font-bold text-[var(--charcoal)]">{formatPrice(enquiry.totalAmount)}</p>
                      </div>
                      <Link
                        href={`/vendor/bookings/${enquiry._id}`}
                        className="px-5 py-2 bg-[var(--cream)] text-[var(--charcoal)] text-xs font-bold uppercase tracking-widest rounded-lg group-hover:bg-[var(--burgundy)] group-hover:text-white transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ratings Panel */}
        <div className="bg-white rounded-2xl border border-[var(--cream-dkr)] shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--cream-dkr)] bg-[var(--cream-lt)]/50">
            <h2 className="font-[var(--font-display)] text-xl font-medium text-[var(--charcoal)] flex items-center gap-2">
              <span>⭐</span> Customer Rating
            </h2>
          </div>

          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-40 h-40 rounded-full flex flex-col items-center justify-center mb-6 relative">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border-[8px] border-[var(--cream)]"></div>

              {/* Dynamic progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="46"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * (data.stats.averageRating / 5))}
                  className="transition-all duration-1500 ease-out"
                />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className="text-5xl font-[var(--font-display)] text-[var(--charcoal)] leading-none mb-1">
                  {data.stats.averageRating.toFixed(1)}
                </span>
                <span className="text-xs font-bold tracking-widest uppercase text-[var(--text-light)]">Out of 5</span>
              </div>
            </div>

            <div className="flex gap-1.5 mb-3 text-[var(--gold)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-6 h-6 ${i < Math.round(data.stats.averageRating) ? 'fill-current' : 'fill-gray-100'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-sm font-medium text-[var(--text-muted)] bg-[var(--cream)] px-4 py-1.5 rounded-full inline-block">
              Based on <span className="text-[var(--burgundy)] font-bold">{data.stats.totalReviews}</span> verified reviews
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}