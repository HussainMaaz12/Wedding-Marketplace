// ============================================================
// page.tsx  (Reset Password Page)
// 📁 Location: src/app/(public)/reset-password/page.tsx
// ============================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import ResetPasswordForm from '@/components/forms/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your WeddingConnect account.',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex">

      {/* ── LEFT: Decorative Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--burgundy-dk) 0%, var(--burgundy) 60%, #a0243c 100%)',
        }}
      >
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
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
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
            Secure Reset
          </div>

          <h2
            className="font-[var(--font-display)] text-5xl font-light text-white leading-tight mb-6"
          >
            Choose a<br />
            new <em className="italic text-[var(--gold-lt)]">password</em>
          </h2>

          <p className="text-white/60 text-[0.9rem] leading-relaxed max-w-sm">
            Create a strong password with at least 8 characters, including an uppercase letter and a number.
          </p>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-16 lg:px-16">

        <Link
          href="/"
          className="lg:hidden font-[var(--font-display)] text-2xl font-semibold text-[var(--burgundy)] mb-10"
        >
          Wedding<span className="text-[var(--gold)]">Connect</span>
        </Link>

        <div className="w-full max-w-md">

          <div className="mb-8">
            <h1
              className="font-[var(--font-display)] text-4xl font-light text-[var(--charcoal)] mb-2"
            >
              New <em className="italic text-[var(--burgundy)]">Password</em>
            </h1>
            <p className="text-[0.88rem] text-[var(--text-muted)]">
              Enter your new password below
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

        </div>
      </div>

    </div>
  )
}
