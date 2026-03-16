'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

// Add Razorpay to the Window object interface
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 1. Fetch booking details to ensure it's ACCEPTED and belongs to user
    const fetchBooking = async () => {
      try {
        const res = await fetch('/api/bookings')
        const data = await res.json()
        if (res.ok) {
          const found = data.data.bookings.find((b: any) => b._id === bookingId)
          if (!found) {
            setError('Booking not found')
          } else if (found.status !== 'ACCEPTED') {
            setError(`This booking cannot be checked out. Current status: ${found.status}`)
          } else {
            setBooking(found)
          }
        } else {
          setError(data.message)
        }
      } catch (err) {
        setError('Failed to load booking details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()

    // 2. Load Razorpay script asynchronously
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })
    }
    loadRazorpayScript()
  }, [bookingId])

  const handlePayment = async () => {
    setIsProcessing(true)
    setError('')

    try {
      // Step 1: Create Order via our Backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      })
      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to initialize payment')
      }

      const { orderId, amount, currency, keyId } = orderData.data

      // Step 2: Configure Razorpay UI Options
      const options = {
        key: keyId, // Enter the Key ID generated from the Dashboard
        amount: amount, 
        currency: currency,
        name: 'WeddingConnect',
        description: `Advance Payment for ${booking.vendorId.businessName}`,
        image: '/logo.png', // Or use your specific logo URL
        order_id: orderId,
        handler: async function (response: any) {
          // Step 3: Verify Payment on success
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId
              })
            })

            const verifyData = await verifyRes.json()
            if (verifyRes.ok) {
              // Success! Redirect back to bookings with success state
              router.push('/dashboard/bookings?payment=success')
            } else {
              setError(verifyData.message || 'Payment verification failed')
            }
          } catch (err) {
            setError('Failed to verify payment with server. Please contact support.')
          }
        },
        prefill: {
          name: booking.customerId?.name || '',
          email: booking.customerId?.email || '',
          contact: booking.customerId?.phone || ''
        },
        theme: {
          color: '#5B1E38' // Our burgundy hex
        }
      }

      // Step 4: Open Razorpay modal
      const paymentObject = new window.Razorpay(options)
      paymentObject.on('payment.failed', function (response: any) {
        setError(`Payment Failed: ${response.error.description}`)
      })
      paymentObject.open()

    } catch (err: any) {
      setError(err.message || 'Something went wrong while initiating payment.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--burgundy)]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 mb-6 text-center">
          <p className="font-bold mb-2">Checkout Error</p>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/dashboard/bookings')}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="font-[var(--font-display)] text-3xl text-[var(--charcoal)] mb-8 text-center">Secure Checkout</h1>
      
      <div className="bg-white rounded-2xl border border-[var(--cream-dkr)] shadow-xl overflow-hidden">
        
        {/* Order Summary Header */}
        <div className="bg-[var(--cream)] p-6 md:p-8 border-b border-[var(--cream-dkr)]">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[var(--text-light)] mb-4">Order Summary</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="font-[var(--font-display)] text-2xl text-[var(--charcoal)]">{booking.vendorId.businessName}</p>
              <p className="text-[var(--text-muted)] mt-1">{booking.eventType} Packaging</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-1">Total Booking Value</p>
              <p className="text-2xl font-bold text-[var(--charcoal)]">{formatPrice(booking.totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="font-semibold mb-1">Advance Payment Required</p>
              <p>You only need to pay the advance amount today to securely lock in this vendor for your dates. The remaining balance will be handled subsequently.</p>
            </div>
          </div>

          <div className="border border-[var(--cream-dkr)] rounded-xl divide-y divide-[var(--cream-dkr)]">
            <div className="flex justify-between items-center p-4">
              <span className="text-[var(--text-muted)]">Booking Reference</span>
              <span className="font-semibold text-[var(--charcoal)]">#{booking.bookingNumber}</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-[var(--text-muted)]">Advance Amount Due</span>
              <span className="font-semibold text-2xl text-[var(--burgundy)]">{formatPrice(booking.advanceAmount)}</span>
            </div>
          </div>

          <p className="text-xs text-center text-[var(--text-light)]">
            By clicking "Pay Now", you are agreeing to the vendor's cancellation and refund policies.
          </p>

          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-4 bg-[var(--burgundy)] text-white font-bold tracking-widest uppercase text-sm rounded-xl hover:bg-[var(--burgundy-dk)] transition-colors shadow-lg shadow-[var(--burgundy)]/30 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
               Processing Securely...
              </>
            ) : (
              `Pay ${formatPrice(booking.advanceAmount)} Now`
            )}
          </button>
          
          <div className="flex justify-center items-center gap-2 mt-4 text-[var(--text-light)]">
            <span className="text-xs">Secured by</span>
            <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-4 grayscale opacity-60" />
          </div>
        </div>
      </div>
    </div>
  )
}
