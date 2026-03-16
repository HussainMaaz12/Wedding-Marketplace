// ============================================================
// page.tsx  (Login Page)
// 📁 Location: src/app/(public)/login/page.tsx
// ============================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/forms/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your WeddingConnect account.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex">

      {/* ── LEFT: Decorative Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--burgundy-dk) 0%, var(--burgundy) 60%, #a0243c 100%)',
        }}
      >
        {/* Ornament SVG — same mandala from homepage design */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-[420px] h-[420px] opacity-10 animate-[spin_60s_linear_infinite]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="95" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="65" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="50" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="35" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
            <line x1="100" y1="5" x2="100" y2="195" stroke="#C9A84C" strokeWidth="0.5"/>
            <line x1="5" y1="100" x2="195" y2="100" stroke="#C9A84C" strokeWidth="0.5"/>
            <line x1="29" y1="29" x2="171" y2="171" stroke="#C9A84C" strokeWidth="0.5"/>
            <line x1="171" y1="29" x2="29" y2="171" stroke="#C9A84C" strokeWidth="0.5"/>
            <ellipse cx="100" cy="20" rx="8" ry="18" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
            <ellipse cx="100" cy="180" rx="8" ry="18" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
            <ellipse cx="20" cy="100" rx="18" ry="8" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
            <ellipse cx="180" cy="100" rx="18" ry="8" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
          </svg>
        </div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          {/* Logo */}
          <Link
            href="/"
            className="font-[var(--font-display)] text-2xl font-semibold text-white mb-16"
          >
            Wedding<span className="text-[var(--gold)]">Connect</span>
          </Link>

          <div
            className="text-[0.68rem] font-medium tracking-[0.2em] uppercase text-[var(--gold-lt)]
                        flex items-center gap-3 mb-5"
          >
            <span className="block w-8 h-px bg-[var(--gold-lt)]" />
            Welcome Back
          </div>

          <h2
            className="font-[var(--font-display)] text-5xl font-light text-white leading-tight mb-6"
          >
            Your dream<br />
            wedding<br />
            <em className="italic text-[var(--gold-lt)]">awaits</em>
          </h2>

          <p className="text-white/60 text-[0.9rem] leading-relaxed max-w-sm">
            Sign in to manage your bookings, discover new vendors,
            and track every detail of your perfect day.
          </p>

          {/* Trust badges */}
          <div className="flex flex-col gap-3 mt-12">
            {[
              { icon: '✓', text: '5,000+ verified vendors across India' },
              { icon: '✓', text: '100% secure payments via Razorpay' },
              { icon: '✓', text: '12,000+ happy couples served' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-white/55 text-[0.82rem]">
                <span className="text-[var(--gold)] font-bold">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-16 lg:px-16">

        {/* Mobile logo — only shows on small screens */}
        <Link
          href="/"
          className="lg:hidden font-[var(--font-display)] text-2xl font-semibold text-[var(--burgundy)] mb-10"
        >
          Wedding<span className="text-[var(--gold)]">Connect</span>
        </Link>

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <h1
              className="font-[var(--font-display)] text-4xl font-light text-[var(--charcoal)] mb-2"
            >
              Sign <em className="italic text-[var(--burgundy)]">In</em>
            </h1>
            <p className="text-[0.88rem] text-[var(--text-muted)]">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Vendor CTA */}
          <div
            className="mt-8 p-4 border border-[var(--gold-lt)] bg-[var(--cream-dk)]
                        flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-[0.78rem] font-medium text-[var(--charcoal)]">
                Are you a wedding vendor?
              </p>
              <p className="text-[0.72rem] text-[var(--text-muted)]">
                Join 5,000+ vendors on WeddingConnect
              </p>
            </div>
            <Link
              href="/register?role=vendor"
              className="text-[0.72rem] font-medium tracking-[0.06em] uppercase
                         text-[var(--gold)] border border-[var(--gold)] px-4 py-2
                         hover:bg-[var(--gold)] hover:text-[var(--charcoal)]
                         transition-colors whitespace-nowrap"
            >
              Join as Vendor
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}