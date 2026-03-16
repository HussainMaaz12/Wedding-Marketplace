'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  _id: string
  name: string
  slug: string
  icon: string
}

interface VendorProfile {
  _id?: string
  businessName: string
  categoryId: string
  description: string
  city: string
  state: string
  address: string
  businessPhone: string
  businessEmail: string
  website: string
  startingPrice: string
  coverImage: string
  portfolioImages: string[]
}

const EMPTY_PROFILE: VendorProfile = {
  businessName: '', categoryId: '', description: '',
  city: '', state: '', address: '',
  businessPhone: '', businessEmail: '', website: '',
  startingPrice: '', coverImage: '', portfolioImages: [],
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
]

export default function VendorProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<VendorProfile>(EMPTY_PROFILE)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const portfolioRef = useRef<HTMLInputElement>(null)

  // Fetch profile + categories on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/vendor/profile').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([profileRes, catRes]) => {
      if (profileRes.data) {
        const v = profileRes.data
        setProfile({
          _id: v._id,
          businessName: v.businessName || '',
          categoryId: v.categoryId?._id || v.categoryId || '',
          description: v.description || '',
          city: v.city || '',
          state: v.state || '',
          address: v.address || '',
          businessPhone: v.businessPhone || '',
          businessEmail: v.businessEmail || '',
          website: v.website || '',
          startingPrice: v.startingPrice?.toString() || '',
          coverImage: v.coverImage || '',
          portfolioImages: v.portfolioImages || [],
        })
      }
      if (catRes.data) setCategories(catRes.data)
    }).catch(() => {
      showToast('error', 'Failed to load profile')
    }).finally(() => setLoading(false))
  }, [])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageUpload = async (file: File, type: 'cover' | 'portfolio') => {
    setUploading(true)
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, folder: 'vendors' }),
      })
      const data = await res.json()

      if (!res.ok) {
        showToast('error', data.message || 'Upload failed')
        return
      }

      if (type === 'cover') {
        setProfile(prev => ({ ...prev, coverImage: data.data.url }))
      } else {
        setProfile(prev => ({
          ...prev,
          portfolioImages: [...prev.portfolioImages, data.data.url],
        }))
      }
      showToast('success', 'Image uploaded!')
    } catch {
      showToast('error', 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removePortfolioImage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const data = await res.json()

      if (!res.ok) {
        showToast('error', data.message || 'Save failed')
        return
      }

      showToast('success', data.message || 'Profile saved!')
      if (!profile._id && data.data?._id) {
        setProfile(prev => ({ ...prev, _id: data.data._id }))
      }
    } catch {
      showToast('error', 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[var(--burgundy)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Loading profile...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? '✓ ' : '✗ '}{toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[var(--cream-dkr)]">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-display)] text-3xl font-light text-[var(--charcoal)]">
              Vendor <em className="italic text-[var(--burgundy)]">Profile</em>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {profile._id ? 'Update your business information' : 'Complete your profile to start getting bookings'}
            </p>
          </div>
          <button
            onClick={() => router.push('/vendor/dashboard')}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--burgundy)] transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Cover Image */}
        <section className="bg-white rounded-xl border border-[var(--cream-dkr)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--cream-dkr)]">
            <h2 className="text-sm font-medium tracking-[0.1em] uppercase text-[var(--charcoal)]">📸 Cover Image</h2>
          </div>
          <div className="p-6">
            {profile.coverImage ? (
              <div className="relative group">
                <img src={profile.coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                <button
                  onClick={() => setProfile(prev => ({ ...prev, coverImage: '' }))}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => coverRef.current?.click()}
                disabled={uploading}
                className="w-full h-48 border-2 border-dashed border-[var(--cream-dkr)] rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[var(--gold)] transition-colors text-[var(--text-muted)]"
              >
                <span className="text-3xl">🖼️</span>
                <span className="text-sm">{uploading ? 'Uploading...' : 'Click to upload cover image'}</span>
              </button>
            )}
            <input
              ref={coverRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'cover') }}
            />
          </div>
        </section>

        {/* Business Info */}
        <section className="bg-white rounded-xl border border-[var(--cream-dkr)]">
          <div className="px-6 py-4 border-b border-[var(--cream-dkr)]">
            <h2 className="text-sm font-medium tracking-[0.1em] uppercase text-[var(--charcoal)]">🏢 Business Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Business Name" required>
              <input name="businessName" value={profile.businessName} onChange={handleChange} placeholder="Kapoor Photography Studio" className={inputClass} />
            </FormField>

            <FormField label="Category" required>
              <select name="categoryId" value={profile.categoryId} onChange={handleChange} className={inputClass + ' appearance-none'}>
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Description">
                <textarea
                  name="description" value={profile.description} onChange={handleChange}
                  placeholder="Tell couples about your style, experience, and what makes you unique..."
                  rows={4} className={inputClass + ' resize-none'}
                />
              </FormField>
            </div>

            <FormField label="Starting Price (₹)">
              <input name="startingPrice" type="number" value={profile.startingPrice} onChange={handleChange} placeholder="25000" className={inputClass} />
            </FormField>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-xl border border-[var(--cream-dkr)]">
          <div className="px-6 py-4 border-b border-[var(--cream-dkr)]">
            <h2 className="text-sm font-medium tracking-[0.1em] uppercase text-[var(--charcoal)]">📍 Location</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="City" required>
              <input name="city" value={profile.city} onChange={handleChange} placeholder="Mumbai" className={inputClass} />
            </FormField>
            <FormField label="State" required>
              <select name="state" value={profile.state} onChange={handleChange} className={inputClass + ' appearance-none'}>
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Full Address">
                <input name="address" value={profile.address} onChange={handleChange} placeholder="123, MG Road, Bandra West" className={inputClass} />
              </FormField>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-xl border border-[var(--cream-dkr)]">
          <div className="px-6 py-4 border-b border-[var(--cream-dkr)]">
            <h2 className="text-sm font-medium tracking-[0.1em] uppercase text-[var(--charcoal)]">📞 Contact Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Business Phone">
              <input name="businessPhone" type="tel" value={profile.businessPhone} onChange={handleChange} placeholder="+91 98765 43210" className={inputClass} />
            </FormField>
            <FormField label="Business Email">
              <input name="businessEmail" type="email" value={profile.businessEmail} onChange={handleChange} placeholder="contact@yourstudio.com" className={inputClass} />
            </FormField>
            <FormField label="Website">
              <input name="website" type="url" value={profile.website} onChange={handleChange} placeholder="https://yourstudio.com" className={inputClass} />
            </FormField>
          </div>
        </section>

        {/* Portfolio */}
        <section className="bg-white rounded-xl border border-[var(--cream-dkr)]">
          <div className="px-6 py-4 border-b border-[var(--cream-dkr)]">
            <h2 className="text-sm font-medium tracking-[0.1em] uppercase text-[var(--charcoal)]">
              🎨 Portfolio Gallery
              <span className="text-[var(--text-light)] font-normal ml-2 normal-case tracking-normal">
                ({profile.portfolioImages.length}/20)
              </span>
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {profile.portfolioImages.map((url, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button
                    onClick={() => removePortfolioImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {profile.portfolioImages.length < 20 && (
                <button
                  onClick={() => portfolioRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square border-2 border-dashed border-[var(--cream-dkr)] rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[var(--gold)] transition-colors text-[var(--text-muted)]"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-xs">{uploading ? 'Uploading...' : 'Add Photo'}</span>
                </button>
              )}
            </div>
            <input
              ref={portfolioRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'portfolio') }}
            />
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-3.5 bg-[var(--burgundy)] text-white text-sm font-medium tracking-[0.1em] uppercase rounded-lg hover:bg-[var(--burgundy-dk)] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Saving...' : profile._id ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>

      </div>
    </main>
  )
}

// ─── Helper Components ───

function FormField({ label, required, children }: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium tracking-[0.08em] uppercase text-[var(--text-muted)]">
        {label} {required && <span className="text-[var(--burgundy)]">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = 'w-full px-4 py-3 text-sm bg-[var(--cream)] border border-[var(--cream-dkr)] outline-none transition-colors duration-200 text-[var(--text)] placeholder:text-[var(--text-light)] rounded-lg focus:border-[var(--gold)]'
