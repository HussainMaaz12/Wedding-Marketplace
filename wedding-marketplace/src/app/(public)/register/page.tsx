// ============================================================
// page.tsx  (Register Page)
// 📁 Location: src/app/(public)/register/page.tsx
// ============================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import RegisterForm from '@/components/forms/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join WeddingConnect — find and book the best wedding vendors across India.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex">

      {/* ── LEFT: Form Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-16 lg:px-16 overflow-y-auto">

        {/* Mobile logo */}
        <Link
          href="/"
          className="lg:hidden font-[var(--font-display)] text-2xl font-semibold text-[var(--burgundy)] mb-10"
        >
          Wedding<span className="text-[var(--gold)]">Connect</span>
        </Link>

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-[var(--font-display)] text-4xl font-light text-[var(--charcoal)] mb-2">
              Create <em className="italic text-[var(--burgundy)]">Account</em>
            </h1>
            <p className="text-[0.88rem] text-[var(--text-muted)]">
              Join thousands of couples planning their perfect wedding
            </p>
          </div>

          {/*
            Suspense is required here because RegisterForm uses
            useSearchParams() which needs a Suspense boundary
            in Next.js App Router.
          */}
          <Suspense fallback={<div className="text-[var(--text-muted)] text-sm">Loading...</div>}>
            <RegisterForm />
          </Suspense>

        </div>
      </div>

      {/* ── RIGHT: Decorative Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--charcoal) 0%, #4a2010 60%, var(--burgundy-dk) 100%)',
        }}
      >
        {/* Ornament */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 200 200"
            className="w-[480px] h-[480px] opacity-[0.07] animate-[spin_80s_linear_infinite]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="95" fill="none" stroke="#C9A84C" strokeWidth="0.4"/>
            <circle cx="100" cy="100" r="75" fill="none" stroke="#C9A84C" strokeWidth="0.4"/>
            <circle cx="100" cy="100" r="55" fill="none" stroke="#C9A84C" strokeWidth="0.4"/>
            <circle cx="100" cy="100" r="35" fill="none" stroke="#C9A84C" strokeWidth="0.4"/>
            <line x1="100" y1="5" x2="100" y2="195" stroke="#C9A84C" strokeWidth="0.4"/>
            <line x1="5" y1="100" x2="195" y2="100" stroke="#C9A84C" strokeWidth="0.4"/>
            <line x1="29" y1="29" x2="171" y2="171" stroke="#C9A84C" strokeWidth="0.4"/>
            <line x1="171" y1="29" x2="29" y2="171" stroke="#C9A84C" strokeWidth="0.4"/>
          </svg>
        </div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <Link
            href="/"
            className="font-[var(--font-display)] text-2xl font-semibold text-white mb-16"
          >
            Wedding<span className="text-[var(--gold)]">Connect</span>
          </Link>

          <div className="text-[0.68rem] font-medium tracking-[0.2em] uppercase text-[var(--gold-lt)] flex items-center gap-3 mb-5">
            <span className="block w-8 h-px bg-[var(--gold-lt)]" />
            Start Your Journey
          </div>

          <h2 className="font-[var(--font-display)] text-5xl font-light text-white leading-tight mb-6">
            Plan your<br />
            perfect<br />
            <em className="italic text-[var(--gold-lt)]">wedding</em>
          </h2>

          <p className="text-white/55 text-[0.88rem] leading-relaxed max-w-sm mb-10">
            Get access to thousands of verified vendors, compare packages,
            read real reviews, and book with complete confidence.
          </p>

          {/* Feature cards */}
          <div className="flex flex-col gap-3">
            {[
			   { icon: '📸', title: 'Photography',    sub: '420+ studios across India' },
              { icon: '💐', title: 'Decoration',     sub: '390+ decoration specialists' },
              { icon: '🍽️', title: 'Catering',      sub: '650+ caterers available' },
            ].map(item => (
              <div
                key={item.title}
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3"
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-white text-[0.84rem] font-medium">{item.title}</div>
                  <div className="text-white/40 text-[0.72rem]">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
				