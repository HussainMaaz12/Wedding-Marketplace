// src/app/vendor/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  const navLinks = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: '📊' },
    { name: 'My Profile', href: '/vendor/profile', icon: '🏪' },
    { name: 'Packages', href: '/vendor/packages', icon: '📦' },
    { name: 'Bookings', href: '/vendor/bookings', icon: '📅' },
    { name: 'Payouts', href: '/vendor/payouts', icon: '💳' },
  ]

  return (
    <div className="min-h-screen bg-[var(--cream)] flex">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[var(--cream-dkr)] fixed h-full z-20">
        <div className="p-6 border-b border-[var(--cream-dkr)]">
          <Link href="/" className="font-[var(--font-display)] text-2xl font-semibold text-[var(--burgundy)]">
            Wedding<span className="text-[var(--gold)]">Connect</span>
          </Link>
          <p className="text-xs text-[var(--text-light)] uppercase tracking-widest mt-1">Vendor Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? 'bg-[var(--burgundy)] text-white shadow-md'
                    : 'text-[var(--text-muted)] hover:bg-[var(--cream)] hover:text-[var(--burgundy)]'
                  }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[var(--cream-dkr)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <span className="text-lg">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Header & Menu ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-[var(--cream-dkr)] z-30 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-[var(--font-display)] text-xl font-semibold text-[var(--burgundy)]">
          Wedding<span className="text-[var(--gold)]">Connect</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[var(--charcoal)] text-2xl">
          ☰
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-20 pt-20 px-6 flex flex-col">
          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium ${pathname === link.href ? 'bg-[var(--burgundy)] text-white' : 'text-[var(--text-muted)]'
                  }`}
              >
                <span>{link.icon}</span> {link.name}
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout} className="mt-auto mb-8 py-4 text-red-600 font-medium border border-red-200 rounded-xl">
            Sign Out
          </button>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main className="flex-1 md:ml-64 pt-20 md:pt-0 p-6 md:p-10 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Topbar for Desktop */}
          <header className="hidden md:flex justify-end items-center mb-10 pb-4 border-b border-[var(--cream-dkr)]">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--burgundy)] transition-colors flex items-center gap-2">
                <span>🏠</span> Go to Marketplace
              </Link>
            </div>
          </header>

          {children}
        </div>
      </main>
    </div>
  )
}