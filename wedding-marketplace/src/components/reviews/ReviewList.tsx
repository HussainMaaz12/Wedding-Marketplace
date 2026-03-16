'use client'

import { useState } from 'react'
import { format } from 'date-fns'

interface Review {
  _id: string
  rating: number
  title?: string
  comment: string
  createdAt: string
  customerId: {
    name: string
    avatar?: string
  }
}

interface ReviewListProps {
  vendorId: string
  initialReviews?: Review[]
}

export default function ReviewList({ vendorId, initialReviews = [] }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // In a real app we'd fetch these if initialReviews is empty or for pagination
  // For now we'll assume they are passed down or fetched on mount

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-muted)] italic">No reviews yet. Be the first to leave a review after booking!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-6">
      {reviews.map(review => (
        <div key={review._id} className="border-b border-[var(--cream-dkr)] pb-6 last:border-0 last:pb-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--cream-dkr)] flex items-center justify-center overflow-hidden">
                {review.customerId?.avatar ? (
                  <img src={review.customerId.avatar} alt={review.customerId?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-[var(--charcoal)]">
                    {review.customerId?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-[var(--charcoal)]">{review.customerId?.name || 'Customer'}</p>
                <p className="text-xs text-[var(--text-light)]">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex text-[var(--gold)] text-sm">
               {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>
                    {i < review.rating ? '★' : '☆'}
                  </span>
               ))}
            </div>
          </div>
          
          {review.title && <h4 className="font-bold text-[var(--charcoal)] mb-1 text-sm">{review.title}</h4>}
          <p className="text-sm text-[var(--text)] leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  )
}
