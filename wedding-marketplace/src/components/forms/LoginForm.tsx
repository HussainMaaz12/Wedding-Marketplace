'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email address'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok) {
        setServerError(data.message || 'Invalid email or password')
        return
      }

      // Force Next.js to realize the user state has changed!
      router.refresh()

      if (data.user?.role === 'VENDOR') router.push('/vendor/dashboard')
      else if (data.user?.role === 'ADMIN') router.push('/admin/dashboard')
      else router.push('/dashboard')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div className="px-4 py-3 bg-red-lt border border-red text-red text-sm rounded-lg">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium tracking-[0.12em] uppercase text-text-muted">
          Email Address <span className="text-burgundy">*</span>
        </label>
        <input
          id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
          value={formData.email} onChange={handleChange}
          className={`w-full px-4 py-3 text-sm bg-cream border outline-none transition-colors duration-200 text-text placeholder:text-text-light rounded-lg ${errors.email ? 'border-red' : 'border-cream-dkr focus:border-gold'
            }`}
        />
        {errors.email && <p className="text-xs text-red">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-medium tracking-[0.12em] uppercase text-text-muted">
            Password <span className="text-burgundy">*</span>
          </label>
          <Link href="/forgot-password" className="text-xs text-gold hover:text-burgundy transition-colors">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password" name="password" type={showPass ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password"
            value={formData.password} onChange={handleChange}
            className={`w-full px-4 py-3 pr-12 text-sm bg-cream border outline-none transition-colors duration-200 text-text placeholder:text-text-light rounded-lg ${errors.password ? 'border-red' : 'border-cream-dkr focus:border-gold'
              }`}
          />
          <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-burgundy transition-colors text-sm">
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red">{errors.password}</p>}
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full py-3.5 mt-2 bg-burgundy text-white text-sm font-medium tracking-[0.1em] uppercase border border-transparent transition-all duration-200 hover:bg-burgundy-dk disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
      >
        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex items-center gap-3 my-1">
        <hr className="flex-1 border-cream-dkr" />
        <span className="text-xs text-text-light uppercase tracking-wider">or</span>
        <hr className="flex-1 border-cream-dkr" />
      </div>

      <p className="text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-burgundy font-medium hover:text-gold transition-colors">
          Create one free →
        </Link>
      </p>
    </form>
  )
}