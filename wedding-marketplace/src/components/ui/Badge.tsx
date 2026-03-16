// ============================================================
// Badge.tsx
// 📁 Location: src/components/ui/Badge.tsx
// ============================================================

import React from 'react'

type BadgeVariant =
  | 'gold'
  | 'verified'
  | 'featured'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'enquiry'

interface BadgeProps {
  variant:  BadgeVariant
  children: React.ReactNode
  dot?:     boolean   // show a colored dot before text
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  gold:       'bg-[var(--gold)] text-[var(--charcoal)]',
  verified:   'bg-[var(--gold)] text-[var(--charcoal)]',
  featured:   'bg-[var(--burgundy)] text-white',
  pending:    'bg-[var(--blue-lt)] text-[var(--blue)]',
  approved:   'bg-[var(--green-lt)] text-[var(--green)]',
  rejected:   'bg-[var(--red-lt)] text-[var(--red)]',
  suspended:  'bg-gray-100 text-gray-500',
  confirmed:  'bg-[var(--green-lt)] text-[var(--green)]',
  completed:  'bg-purple-50 text-purple-600',
  cancelled:  'bg-gray-100 text-gray-400',
  enquiry:    'bg-[var(--blue-lt)] text-[var(--blue)]',
}

const dotColors: Record<BadgeVariant, string> = {
  gold:       'bg-[var(--charcoal)]',
  verified:   'bg-[var(--charcoal)]',
  featured:   'bg-white',
  pending:    'bg-[var(--blue)]',
  approved:   'bg-[var(--green)]',
  rejected:   'bg-[var(--red)]',
  suspended:  'bg-gray-400',
  confirmed:  'bg-[var(--green)]',
  completed:  'bg-purple-500',
  cancelled:  'bg-gray-300',
  enquiry:    'bg-[var(--blue)]',
}

export default function Badge({
  variant,
  children,
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'text-[0.62rem] font-medium tracking-[0.08em] uppercase',
        'px-2.5 py-1',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={['w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant]].join(' ')}
        />
      )}
      {children}
    </span>
  )
}