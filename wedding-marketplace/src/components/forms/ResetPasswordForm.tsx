'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.newPassword) e.newPassword = 'Password is required'
    else if (formData.newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters'
    else if (!/[A-Z]/.test(formData.newPassword)) e.newPassword = 'Must contain at least one uppercase letter'
    else if (!/[0-9]/.test(formData.newPassword)) e.newPassword = 'Must contain at least one number'
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (formData.newPassword !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (!token || !email) {
      setServerError('Invalid reset link. Please request a new one.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          newPassword: formData.newPassword,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setServerError(data.message || 'Password reset failed')
        return
      }

      setSuccess(true)
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Missing or invalid token
  if (!token || !email) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-[var(--cream-dk)] flex items-center justify-center text-3xl">
          ⚠️
        </div>
        <h3 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)]">
          Invalid Reset Link
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-2 text-sm font-medium text-burgundy hover:text-gold transition-colors"
        >
          Request New Link →
        </Link>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-[var(--cream-dk)] flex items-center justify-center text-3xl">
          ✅
        </div>
        <h3 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)]">
          Password Reset!
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
          Your password has been updated successfully. You can now sign in with your new password.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-2 px-8 py-3 bg-burgundy text-white text-sm font-medium tracking-[0.1em] uppercase rounded-lg hover:bg-burgundy-dk transition-colors"
        >
          Sign In →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div className="px-4 py-3 bg-red-lt border border-red text-red text-sm rounded-lg">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="text-xs font-medium tracking-[0.12em] uppercase text-text-muted">
          New Password <span className="text-burgundy">*</span>
        </label>
        <div className="relative">
          <input
            id="newPassword" name="newPassword" type={showPass ? 'text' : 'password'}
            autoComplete="new-password" placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={formData.newPassword} onChange={handleChange}
            className={`w-full px-4 py-3 pr-12 text-sm bg-cream border outline-none transition-colors duration-200 text-text placeholder:text-text-light rounded-lg ${
              errors.newPassword ? 'border-red' : 'border-cream-dkr focus:border-gold'
            }`}
          />
          <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-burgundy transition-colors text-sm">
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
        {errors.newPassword && <p className="text-xs text-red">{errors.newPassword}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-xs font-medium tracking-[0.12em] uppercase text-text-muted">
          Confirm Password <span className="text-burgundy">*</span>
        </label>
        <input
          id="confirmPassword" name="confirmPassword" type={showPass ? 'text' : 'password'}
          autoComplete="new-password" placeholder="Re-enter your new password"
          value={formData.confirmPassword} onChange={handleChange}
          className={`w-full px-4 py-3 text-sm bg-cream border outline-none transition-colors duration-200 text-text placeholder:text-text-light rounded-lg ${
            errors.confirmPassword ? 'border-red' : 'border-cream-dkr focus:border-gold'
          }`}
        />
        {errors.confirmPassword && <p className="text-xs text-red">{errors.confirmPassword}</p>}
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full py-3.5 mt-2 bg-burgundy text-white text-sm font-medium tracking-[0.1em] uppercase border border-transparent transition-all duration-200 hover:bg-burgundy-dk disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
      >
        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  )
}
