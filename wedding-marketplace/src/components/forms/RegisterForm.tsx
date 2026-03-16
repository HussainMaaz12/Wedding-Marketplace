'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type Role = 'CUSTOMER' | 'VENDOR'

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get('role')?.toUpperCase() === 'VENDOR') ? 'VENDOR' : 'CUSTOMER'

  const [role, setRole] = useState<Role>(defaultRole)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', businessName: '', city: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'Full name is required'
    if (!formData.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email address'
    if (!formData.phone) e.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (role === 'VENDOR') {
      if (!formData.businessName.trim()) e.businessName = 'Business name is required'
      if (!formData.city) e.city = 'Please select your city'
    }
    if (!agreed) e.agreed = 'You must agree to the terms to continue'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      })
      const data = await res.json()

      if (!res.ok) {
        setServerError(data.message || 'Registration failed. Please try again.')
        return
      }

      if (role === 'VENDOR') router.push('/vendor/dashboard')
      else router.push('/dashboard')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Surat', 'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 'Goa']

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex border border-cream-dkr mb-2 rounded-lg overflow-hidden">
        {(['CUSTOMER', 'VENDOR'] as Role[]).map(r => (
          <button
            key={r} type="button" onClick={() => setRole(r)}
            className={`flex-1 py-3 text-xs font-medium tracking-[0.06em] uppercase transition-colors duration-200 ${
              role === r ? 'bg-burgundy text-white' : 'bg-transparent text-text-muted hover:bg-cream-dk'
            }`}
          >
            {r === 'CUSTOMER' ? '💑 I\'m a Couple' : '🏢 I\'m a Vendor'}
          </button>
        ))}
      </div>

      {serverError && (
        <div className="px-4 py-3 bg-red-lt border border-red text-red text-sm rounded-lg">
          {serverError}
        </div>
      )}

      <Field label="Full Name" required error={errors.name}>
        <input name="name" type="text" placeholder="Ananya Mehta" value={formData.name} onChange={handleChange} className={inputClass(!!errors.name)} />
      </Field>

      <Field label="Email Address" required error={errors.email}>
        <input name="email" type="email" placeholder="you@example.com" autoComplete="email" value={formData.email} onChange={handleChange} className={inputClass(!!errors.email)} />
      </Field>

      <Field label="Mobile Number" required error={errors.phone}>
        <div className="flex rounded-lg overflow-hidden border border-cream-dkr">
          <span className="flex items-center px-4 bg-cream-dk text-sm text-text-muted">🇮🇳 +91</span>
          <input name="phone" type="tel" placeholder="9876543210" maxLength={10} value={formData.phone} onChange={handleChange} className={`w-full px-4 py-3 text-sm bg-cream outline-none text-text ${errors.phone ? 'bg-red-lt' : ''}`} />
        </div>
        {errors.phone && <p className="text-xs text-red mt-1">{errors.phone}</p>}
      </Field>

      {role === 'VENDOR' && (
        <>
          <Field label="Business Name" required error={errors.businessName}>
            <input name="businessName" type="text" placeholder="Kapoor Photography Studio" value={formData.businessName} onChange={handleChange} className={inputClass(!!errors.businessName)} />
          </Field>
          <Field label="City" required error={errors.city}>
            <select name="city" value={formData.city} onChange={handleChange} className={inputClass(!!errors.city) + ' appearance-none'}>
              <option value="">Select your city</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </>
      )}

      <Field label="Password" required error={errors.password}>
        <div className="relative">
          <input name="password" type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" value={formData.password} onChange={handleChange} className={inputClass(!!errors.password) + ' pr-12'} />
          <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-burgundy text-sm">
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
      </Field>

      <Field label="Confirm Password" required error={errors.confirmPassword}>
        <input name="confirmPassword" type={showPass ? 'text' : 'password'} placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} className={inputClass(!!errors.confirmPassword)} />
      </Field>

      <div className="flex flex-col gap-1 mt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); if (errors.agreed) setErrors(p => ({ ...p, agreed: '' })) }} className="mt-1 accent-burgundy w-4 h-4 flex-shrink-0" />
          <span className="text-xs text-text-muted leading-relaxed">
            I agree to the <Link href="/terms" className="text-burgundy hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-burgundy hover:underline">Privacy Policy</Link>
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-red ml-7">{errors.agreed}</p>}
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full py-3.5 mt-2 bg-burgundy text-white text-sm font-medium tracking-[0.1em] uppercase transition-all duration-200 hover:bg-burgundy-dk disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
      >
        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {loading ? 'Creating account...' : role === 'VENDOR' ? 'Create Vendor Account' : 'Create My Account'}
      </button>

      <p className="text-center text-sm text-text-muted mt-1">
        Already have an account? <Link href="/login" className="text-burgundy font-medium hover:text-gold transition-colors">Sign in →</Link>
      </p>
    </form>
  )
}

function Field({ label, required, error, children }: { label: string, required?: boolean, error?: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium tracking-[0.12em] uppercase text-text-muted">
        {label} {required && <span className="text-burgundy ml-1">*</span>}
      </label>
      {children}
      {error && !label.includes('Mobile') && <p className="text-xs text-red">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-3 text-sm bg-cream border outline-none transition-colors duration-200 text-text placeholder:text-text-light rounded-lg ${hasError ? 'border-red' : 'border-cream-dkr focus:border-gold'}`
}