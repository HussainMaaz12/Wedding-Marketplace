'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface Package {
  _id: string
  name: string
  description: string
  price: number
  includes: string[]
  isActive: boolean
}

const EMPTY_PKG = { name: '', description: '', price: '', includes: '' }

export default function VendorPackagesPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_PKG)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const loadPackages = async () => {
    try {
      const res = await fetch('/api/vendor/packages')
      const data = await res.json()
      if (data.data) setPackages(data.data.filter((p: Package) => p.isActive))
    } catch {
      showToast('error', 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPackages() }, [])

  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY_PKG)
    setShowModal(true)
  }

  const openEdit = (pkg: Package) => {
    setEditId(pkg._id)
    setForm({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price.toString(),
      includes: pkg.includes.join('\n'),
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('error', 'Package name is required'); return }
    if (!form.price || Number(form.price) < 500) { showToast('error', 'Price must be at least ₹500'); return }

    setSaving(true)
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        includes: form.includes.split('\n').map(l => l.trim()).filter(Boolean),
      }

      const url = editId ? `/api/vendor/packages/${editId}` : '/api/vendor/packages'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) { showToast('error', data.message || 'Save failed'); return }

      showToast('success', editId ? 'Package updated!' : 'Package created!')
      setShowModal(false)
      loadPackages()
    } catch {
      showToast('error', 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return

    try {
      const res = await fetch(`/api/vendor/packages/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) { showToast('error', data.message || 'Delete failed'); return }

      showToast('success', 'Package deleted')
      loadPackages()
    } catch {
      showToast('error', 'Something went wrong')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[var(--burgundy)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Loading packages...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? '✓ ' : '✗ '}{toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[var(--cream-dkr)]">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-display)] text-3xl font-light text-[var(--charcoal)]">
              Service <em className="italic text-[var(--burgundy)]">Packages</em>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Create packages that couples can choose from when booking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/vendor/dashboard')}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--burgundy)] transition-colors"
            >
              ← Dashboard
            </button>
            <button
              onClick={openCreate}
              className="px-5 py-2.5 bg-[var(--burgundy)] text-white text-xs font-medium tracking-[0.08em] uppercase rounded-lg hover:bg-[var(--burgundy-dk)] transition-colors"
            >
              + New Package
            </button>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {packages.length === 0 ? (
          <div className="bg-white rounded-xl border border-[var(--cream-dkr)] p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)] mb-2">No packages yet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
              Create your first service package so couples can see your pricing and what&apos;s included.
            </p>
            <button
              onClick={openCreate}
              className="px-8 py-3 bg-[var(--burgundy)] text-white text-sm font-medium tracking-[0.08em] uppercase rounded-lg hover:bg-[var(--burgundy-dk)] transition-colors"
            >
              Create First Package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {packages.map(pkg => (
              <div key={pkg._id} className="bg-white rounded-xl border border-[var(--cream-dkr)] overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-[var(--charcoal)] text-lg">{pkg.name}</h3>
                    <span className="text-lg font-semibold text-[var(--burgundy)]">{formatPrice(pkg.price)}</span>
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">{pkg.description}</p>
                  )}
                  {pkg.includes.length > 0 && (
                    <ul className="flex flex-col gap-1.5 mt-3">
                      {pkg.includes.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-[var(--text)]">
                          <span className="text-[var(--gold)] text-xs">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="px-6 py-3 bg-[var(--cream)] border-t border-[var(--cream-dkr)] flex items-center justify-end gap-3">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--burgundy)] transition-colors uppercase tracking-wider"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg._id)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[var(--cream-dkr)] flex items-center justify-between">
              <h2 className="font-[var(--font-display)] text-xl text-[var(--charcoal)]">
                {editId ? 'Edit' : 'New'} <em className="italic text-[var(--burgundy)]">Package</em>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--charcoal)] text-lg">✕</button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <FormField label="Package Name" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Premium Wedding"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe what's special about this package..."
                  rows={2}
                  className={inputClass + ' resize-none'}
                />
              </FormField>

              <FormField label="Price (₹)" required>
                <input
                  type="number" value={form.price}
                  onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="25000"
                  className={inputClass}
                />
              </FormField>

              <FormField label="What's Included (one per line)">
                <textarea
                  value={form.includes}
                  onChange={(e) => setForm(p => ({ ...p, includes: e.target.value }))}
                  placeholder={"8 hours coverage\n2 photographers\n500+ edited photos\nOnline gallery"}
                  rows={4}
                  className={inputClass + ' resize-none font-mono text-xs'}
                />
              </FormField>
            </div>

            <div className="px-6 py-4 border-t border-[var(--cream-dkr)] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--charcoal)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2.5 bg-[var(--burgundy)] text-white text-sm font-medium tracking-[0.08em] uppercase rounded-lg hover:bg-[var(--burgundy-dk)] disabled:opacity-60 transition-all flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function FormField({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
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
