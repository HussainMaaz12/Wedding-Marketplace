'use client'

import { useState } from 'react'

interface ReviewFormProps {
  vendorId: string
  bookingId: string
  onSuccess?: () => void
}

export default function ReviewForm({ vendorId, bookingId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          bookingId,
          rating,
          title,
          comment
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        if (onSuccess) onSuccess()
      } else {
        setError(data.message || 'Failed to submit review')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center border border-green-100">
        <p className="text-2xl mb-2">✨</p>
        <p className="font-medium">Thank you for your review!</p>
        <p className="text-sm mt-1">Your feedback helps others make better decisions.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--cream)] p-6 rounded-2xl border border-[var(--cream-dkr)]">
      <h3 className="font-[var(--font-display)] text-xl text-[var(--charcoal)] mb-4">Rate your experience</h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-bold tracking-widest uppercase text-[var(--test-light)] mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${rating >= star ? 'text-[var(--gold)]' : 'text-gray-300 hover:text-[var(--gold)]'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
         <label htmlFor="title" className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Summary (Optional)</label>
         <input 
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Amazing photography"
            className="w-full px-4 py-3 bg-white border border-[var(--cream-dkr)] rounded-xl focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none transition-all text-sm"
         />
      </div>

      <div className="mb-6">
         <label htmlFor="comment" className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">Review</label>
         <textarea 
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            placeholder="Tell us about your experience with this vendor..."
            className="w-full px-4 py-3 bg-white border border-[var(--cream-dkr)] rounded-xl focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none transition-all text-sm resize-none"
         />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-[var(--charcoal)] text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-black transition-colors disabled:opacity-70"
      >
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
