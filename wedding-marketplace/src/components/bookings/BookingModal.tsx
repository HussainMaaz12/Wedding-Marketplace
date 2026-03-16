'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PackageOption {
  _id: string
  name: string
  price: number
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  vendorId: string
  vendorName: string
  packages: PackageOption[]
}

export default function BookingModal({ isOpen, onClose, vendorId, vendorName, packages }: BookingModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form State
  const [eventDate, setEventDate] = useState('')
  const [eventType, setEventType] = useState('Wedding')
  const [packageId, setPackageId] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [eventVenue, setEventVenue] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        vendorId,
        packageId: packageId || undefined,
        eventDate,
        eventType,
        guestCount: guestCount ? parseInt(guestCount) : undefined,
        eventVenue,
        specialRequests
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to send a booking enquiry.')
        } else {
          setError(data.message || 'Failed to send enquiry')
        }
        return
      }

      setSuccess('Enquiry sent successfully! The vendor will review it shortly.')
      setTimeout(() => {
        onClose()
        router.push('/dashboard/bookings') // Redirect to user dashboard
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate minimum selectable date (tomorrow)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateString = minDate.toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <div className="sticky top-0 bg-white border-b border-[var(--cream-dkr)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)]">Request Quote</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--cream)] flex items-center justify-center text-[var(--text-muted)] hover:text-black transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Send an enquiry to <strong className="text-[var(--burgundy)]">{vendorName}</strong>. 
            They will review your request and get back to you.
          </p>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Event Date & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Event Date *</label>
                <input 
                  type="date"
                  required
                  min={minDateString}
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-xl focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none text-sm transition-all text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Event Type *</label>
                <select
                  required
                  value={eventType}
                  onChange={e => setEventType(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-xl focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none text-sm transition-all appearance-none cursor-pointer text-black"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
                  <option value="Reception">Reception</option>
                  <option value="Haldi/Mehendi">Haldi / Mehendi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Package Selection */}
            {packages && packages.length > 0 && (
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Select Package (Optional)</label>
                <select
                  value={packageId}
                  onChange={e => setPackageId(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-xl focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none text-sm transition-all appearance-none cursor-pointer text-black"
                >
                  <option value="">No package - Request custom quote</option>
                  {packages.map(pkg => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.name} — ₹{pkg.price.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Event Venue & Guest Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Venue / City</label>
                <input 
                  type="text"
                  placeholder="e.g. Taj Palace, Mumbai"
                  value={eventVenue}
                  onChange={e => setEventVenue(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-xl focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none text-sm transition-all text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Est. Guests</label>
                <input 
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={guestCount}
                  onChange={e => setGuestCount(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-xl focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none text-sm transition-all text-black"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Special Requests / Message</label>
              <textarea 
                rows={3}
                placeholder="Tell the vendor a bit about your event..."
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-xl focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none text-sm transition-all resize-none text-black"
              />
            </div>

            {/* Submit */}
            <button 
              type="submit"
              disabled={isLoading || !!success}
              className="w-full py-4 bg-[var(--burgundy)] text-white font-bold tracking-widest uppercase text-sm rounded-xl hover:bg-[var(--burgundy-dk)] transition-colors shadow-lg shadow-[var(--burgundy)]/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Sending...' : 'Send Enquiry'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
