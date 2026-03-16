'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { formatPrice } from '@/lib/utils'

interface Booking {
  _id: string
  bookingNumber: string
  customerId: { name: string; email: string; phone?: string }
  packageId?: { name: string; price: number }
  eventDate: string
  eventType: string
  totalAmount: number
  status: string
  createdAt: string
  guestCount?: number
  eventVenue?: string
  specialRequests?: string
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('ALL') // ALL, ENQUIRY, ACCEPTED, CONFIRMED
  const [actionLoading, setActionLoading] = useState<string | null>(null) // stores booking ID
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/vendor/bookings')
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

  const handleAction = async (bookingId: string, action: 'ACCEPT' | 'REJECT') => {
    if (action === 'REJECT' && !rejectingId) {
      setRejectingId(bookingId)
      return
    }

    setActionLoading(bookingId)
    try {
      const res = await fetch(`/api/vendor/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'REJECT' ? rejectionReason : undefined
        })
      })

      if (res.ok) {
        // Optimistic UI update
        const newStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b))
        setRejectingId(null)
        setRejectionReason('')
      } else {
        const data = await res.json()
        alert(data.message)
      }
    } catch (error) {
      alert('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredBookings = activeTab === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ENQUIRY': return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">Enquiry</span>
      case 'ACCEPTED': return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">Awaiting Payment</span>
      case 'CONFIRMED': return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">Confirmed</span>
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">Rejected</span>
      case 'CANCELLED': return <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">Cancelled</span>
      default: return <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">{status}</span>
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--charcoal)] mb-2">Booking Requests</h1>
          <p className="text-[var(--text-muted)]">Manage customer enquiries and confirmed bookings.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[var(--cream-dkr)] pb-px overflow-x-auto">
        {['ALL', 'ENQUIRY', 'ACCEPTED', 'CONFIRMED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-[var(--burgundy)] text-[var(--burgundy)]' 
                : 'border-transparent text-[var(--text-light)] hover:text-[var(--charcoal)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--burgundy)]"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="font-[var(--font-display)] text-xl text-[var(--charcoal)] mb-2">No bookings found</h3>
          <p className="text-[var(--text-muted)] text-sm">You dont have any {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} bookings at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-6 shadow-sm hover:border-[var(--gold)] transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Info Section */}
                <div className="flex-grow space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)]">
                          {booking.bookingNumber}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>
                      <h3 className="font-[var(--font-display)] text-xl text-[var(--charcoal)]">
                        {booking.customerId.name} — {booking.eventType}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        Requested on {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-1">Total Value</p>
                      <p className="text-xl font-bold text-[var(--burgundy)]">{formatPrice(booking.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--cream)] rounded-xl p-4">
                    <div>
                      <p className="text-xs text-[var(--text-light)] mb-1">Event Date</p>
                      <p className="text-sm font-medium">{format(new Date(booking.eventDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-light)] mb-1">Selected Package</p>
                      <p className="text-sm font-medium">{booking.packageId?.name || 'Custom Quote'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-light)] mb-1">Est. Guests</p>
                      <p className="text-sm font-medium">{booking.guestCount || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-light)] mb-1">Venue / City</p>
                      <p className="text-sm font-medium">{booking.eventVenue || 'Not specified'}</p>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="text-sm">
                      <span className="font-semibold text-[var(--charcoal)]">Special Requests: </span>
                      <span className="text-[var(--text)]">{booking.specialRequests}</span>
                    </div>
                  )}

                  {/* Customer Contact (Only show if accepted/confirmed) */}
                  {(booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') && (
                    <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] pt-2 border-t border-[var(--cream-dkr)]">
                      <span>📧 {booking.customerId.email}</span>
                      {booking.customerId.phone && <span>📞 {booking.customerId.phone}</span>}
                    </div>
                  )}
                </div>

                {/* Actions Section */}
                {booking.status === 'ENQUIRY' && (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {rejectingId === booking._id ? (
                      <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-4">
                        <textarea 
                          placeholder="Reason for rejection (optional)"
                          className="w-full px-3 py-2 text-sm border border-[var(--cream-dkr)] rounded-lg focus:border-[var(--gold)] outline-none resize-none"
                          rows={2}
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAction(booking._id, 'REJECT')}
                            disabled={actionLoading === booking._id}
                            className="flex-1 py-2 bg-red-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => { setRejectingId(null); setRejectionReason('') }}
                            className="flex-1 py-2 bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAction(booking._id, 'ACCEPT')}
                          disabled={actionLoading === booking._id}
                          className="w-full py-3 bg-[var(--gold)] text-[#4a3f2b] text-xs font-bold tracking-widest uppercase rounded-lg hover:brightness-95 transition-all shadow-sm"
                        >
                          {actionLoading === booking._id ? 'Processing...' : 'Accept Enquiry'}
                        </button>
                        <button 
                          onClick={() => setRejectingId(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="w-full py-3 bg-[var(--cream)] border border-[var(--cream-dkr)] text-[var(--charcoal)] text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <p className="text-xs text-[var(--text-light)] text-center mt-2">
                      Accepting notifies the customer to pay the advance.
                    </p>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
