'use client'

import { useState, useEffect } from 'react'
import ReviewList from './ReviewList'
import ReviewForm from './ReviewForm'

export default function ReviewsSection({ vendorId }: { vendorId: string }) {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  // In a real app we would check if the current user has a completed booking to show the form.
  // For this demo, we'll let them click a button to reveal the form, but the API will block submission if they don't have a booking.

  useEffect(() => {
    fetchReviews()
  }, [vendorId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?vendorId=${vendorId}`)
      const data = await res.json()
      if (res.ok) setReviews(data.data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewSuccess = () => {
    setShowForm(false)
    fetchReviews()
  }

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-[var(--text-muted)]">Real experiences from past clients.</p>
          <button 
             onClick={() => setShowForm(!showForm)}
             className="text-xs font-bold uppercase tracking-widest text-[var(--burgundy)] hover:text-black transition-colors"
          >
             {showForm ? 'Cancel Form' : 'Write a Review'}
          </button>
       </div>

       {showForm && (
         <div className="mb-10 animate-in fade-in slide-in-from-top-4">
           {/* For the demo, we need a booking ID. In a real app, this form would only be shown inside the Customer Dashboard on a specific completed booking, or we would fetch the user's booking ID for this vendor. */}
           {/* We will leave bookingId empty here and rely on the API error handling to tell them they can't review */}
           <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm mb-4 border border-yellow-100">
             <span className="font-bold">Note:</span> You can only submit a review if you have a confirmed or completed booking with this vendor.
           </div>
           
           <ReviewForm vendorId={vendorId} bookingId="" onSuccess={handleReviewSuccess} />
         </div>
       )}

       {isLoading ? (
         <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--burgundy)]"></div>
         </div>
       ) : (
         <ReviewList vendorId={vendorId} initialReviews={reviews} />
       )}
    </div>
  )
}
