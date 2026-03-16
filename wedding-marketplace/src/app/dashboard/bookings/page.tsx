'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Booking {
  _id: string
  bookingNumber: string
  vendorId: { _id: string; businessName: string; coverImage?: string; slug: string }
  packageId?: { name: string }
  eventDate: string
  eventType: string
  totalAmount: number
  status: string
  createdAt: string
  advanceAmount: number
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (res.ok) {
        setBookings(data.data.bookings)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to fetch bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ENQUIRY': return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">Enquiry Sent</span>
      case 'ACCEPTED': return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">Action Required: Pay Advance</span>
      case 'CONFIRMED': return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">Booking Confirmed</span>
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">Declined by Vendor</span>
      case 'CANCELLED': return <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">Cancelled</span>
      default: return <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">{status}</span>
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--charcoal)] mb-2">My Bookings</h1>
        <p className="text-[var(--text-muted)]">Track your quotes, pay advances, and manage your wedding vendors.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--burgundy)]"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-12 text-center">
          <div className="text-4xl mb-4">🥂</div>
          <h3 className="font-[var(--font-display)] text-xl text-[var(--charcoal)] mb-2">No bookings yet</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">Browse our marketplace and find the perfect vendors for your big day.</p>
          <Link href="/vendors" className="inline-block px-6 py-3 bg-[var(--burgundy)] text-white text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-[var(--burgundy-dk)] transition-colors">
            Explore Vendors
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map(booking => {
            const defaultImage = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop"
            
            return (
              <div key={booking._id} className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-6 shadow-sm hover:border-[var(--gold)] transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Vendor Image */}
                  <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0 rounded-xl overflow-hidden bg-[var(--cream)] relative">
                    <img 
                      src={booking.vendorId.coverImage || defaultImage} 
                      alt={booking.vendorId.businessName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold tracking-widest uppercase text-[var(--text-light)]">
                              #{booking.bookingNumber}
                            </span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <Link href={`/vendors/${booking.vendorId.slug}`}>
                            <h3 className="font-[var(--font-display)] text-xl text-[var(--charcoal)] hover:text-[var(--burgundy)] transition-colors">
                              {booking.vendorId.businessName}
                            </h3>
                          </Link>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-0.5">Total Value</p>
                          <p className="text-xl font-bold text-[var(--charcoal)]">{formatPrice(booking.totalAmount)}</p>
                        </div>
                      </div>

                      <div className="text-sm text-[var(--text-muted)] flex flex-wrap gap-x-6 gap-y-2 mt-4">
                        <div>
                          <span className="font-semibold text-[var(--charcoal)]">Event: </span>
                          {booking.eventType} on {format(new Date(booking.eventDate), 'MMM dd, yyyy')}
                        </div>
                        {booking.packageId && (
                          <div>
                            <span className="font-semibold text-[var(--charcoal)]">Package: </span>
                            {booking.packageId.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="mt-6 pt-6 border-t border-[var(--cream-dkr)] flex items-center justify-between">
                      <div>
                        {booking.status === 'ACCEPTED' && (
                          <p className="text-sm text-[var(--text-muted)]">
                            Please pay the advance amount of <strong className="text-[var(--burgundy)]">{formatPrice(booking.advanceAmount)}</strong> to confirm.
                          </p>
                        )}
                        {booking.status === 'ENQUIRY' && (
                          <p className="text-sm text-[var(--text-muted)] italic">Awaiting vendor review...</p>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <p className="text-sm text-green-700 font-medium">✨ Booking is secured</p>
                        )}
                      </div>

                      {booking.status === 'ACCEPTED' && (
                        <Link 
                          href={`/dashboard/bookings/${booking._id}/checkout`}
                          className="px-6 py-2.5 bg-[var(--gold)] text-[#4a3f2b] text-sm font-bold tracking-widest uppercase rounded-lg hover:brightness-95 transition-all shadow-sm"
                        >
                          Pay Advance
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
