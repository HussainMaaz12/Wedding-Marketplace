'use client'

import { useState } from 'react'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Something went wrong')
        return
      }

      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-[var(--cream-dk)] flex items-center justify-center text-3xl">
          ✉️
        </div>
        <h3 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)]">
          Check your email
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
          If an account with <strong className="text-[var(--charcoal)]">{email}</strong> exists,
          we&apos;ve sent a password reset link. Check your inbox (and spam folder).
        </p>
        <p className="text-xs text-[var(--text-light)] mt-2">
          The link expires in 1 hour.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error && (
        <div className="px-4 py-3 bg-red-lt border border-red text-red text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium tracking-[0.12em] uppercase text-text-muted">
          Email Address <span className="text-burgundy">*</span>
        </label>
        <input
          id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
          value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
          className={`w-full px-4 py-3 text-sm bg-cream border outline-none transition-colors duration-200 text-text placeholder:text-text-light rounded-lg ${
            error ? 'border-red' : 'border-cream-dkr focus:border-gold'
          }`}
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full py-3.5 mt-2 bg-burgundy text-white text-sm font-medium tracking-[0.1em] uppercase border border-transparent transition-all duration-200 hover:bg-burgundy-dk disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
      >
        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  )
}
