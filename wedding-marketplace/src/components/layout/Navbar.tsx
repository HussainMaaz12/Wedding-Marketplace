'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '../ui/Button'

const NAV_LINKS = [
  { label: 'Browse Vendors', href: '/vendors' },
  { label: 'How It Works',   href: '/#how-it-works' },
  { label: 'Real Weddings',  href: '/weddings' },
  { label: 'List Your Business', href: '/vendor/dashboard' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-5 transition-all duration-300 ${
        scrolled 
          ? 'bg-cream/95 backdrop-blur-md shadow-md shadow-burgundy/5 border-b border-gold/20 py-4' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* ── Logo ── */}
      <Link href="/" className="font-display text-2xl md:text-3xl font-semibold text-burgundy tracking-tight">
        Wedding<span className="text-gold">Connect</span>
      </Link>

      {/* ── Desktop Nav Links ── */}
      <ul className="hidden md:flex items-center gap-10 list-none m-0 p-0">
        {NAV_LINKS.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`text-[0.85rem] font-medium tracking-[0.06em] uppercase transition-colors duration-200 ${
                pathname === link.href ? 'text-burgundy' : 'text-text-muted hover:text-burgundy'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* ── Desktop Actions ── */}
      <div className="hidden md:flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-charcoal hover:text-burgundy transition-colors">
          Sign In
        </Link>
        <Link href="/register">
          {/* Note: Ensure your Button component inside src/components/ui/Button.tsx uses valid tailwind utility classes too! */}
          <Button variant="primary" size="sm">Get Started</Button>
        </Link>
      </div>

      {/* ── Mobile Hamburger ── */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2 z-50"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* ── Mobile Menu Drawer ── */}
      <div 
        className={`absolute top-full left-0 right-0 bg-cream border-b border-cream-dk shadow-xl transition-all duration-300 overflow-hidden md:hidden ${
          menuOpen ? 'max-h-[500px] py-4' : 'max-h-0 py-0 border-transparent'
        }`}
      >
        <ul className="flex flex-col list-none m-0 p-0">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block px-8 py-3 text-sm font-medium text-text-muted hover:text-burgundy hover:bg-cream-dk transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 px-8 pb-6 pt-4 border-t border-cream-dk mt-2">
          <Link href="/login" className="w-full">
            <Button variant="ghost" size="sm" className="w-full border border-burgundy/20">Sign In</Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button variant="primary" size="sm" className="w-full">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}