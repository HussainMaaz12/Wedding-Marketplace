// ============================================================
// Input.tsx
// 📁 Location: src/components/ui/Input.tsx
// ============================================================

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:    string
  error?:    string
  hint?:     string
  icon?:     React.ReactNode   // icon shown on the LEFT inside the input
  required?: boolean
}

export default function Input({
  label,
  error,
  hint,
  icon,
  required,
  className = '',
  id,
  ...props
}: InputProps) {
  // Generate a unique id if none provided (for label <-> input linking)
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">

      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.65rem] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]"
        >
          {label}
          {required && <span className="text-[var(--burgundy)] ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper (handles icon positioning) */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          className={[
            'w-full px-4 py-3 text-[0.9rem]',
            'bg-[var(--cream)] border text-[var(--text)]',
            'outline-none transition-colors duration-200',
            'placeholder:text-[var(--text-light)]',
            // Error state
            error
              ? 'border-[var(--red)] focus:border-[var(--red)]'
              : 'border-[var(--cream-dkr)] focus:border-[var(--gold)]',
            // Shift text right if icon present
            icon ? 'pl-10' : 'pl-4',
            className,
          ].join(' ')}
          {...props}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[0.72rem] text-[var(--red)]">{error}</p>
      )}

      {/* Hint message */}
      {hint && !error && (
        <p className="text-[0.72rem] text-[var(--text-muted)]">{hint}</p>
      )}
    </div>
  )
}


// ── Select variant ──────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:    string
  error?:    string
  options:   { value: string; label: string }[]
  required?: boolean
}

export function Select({
  label,
  error,
  options,
  required,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[0.65rem] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]"
        >
          {label}
          {required && <span className="text-[var(--burgundy)] ml-1">*</span>}
        </label>
      )}

      <select
        id={selectId}
        className={[
          'w-full px-4 py-3 text-[0.9rem] appearance-none',
          'bg-[var(--cream)] border text-[var(--text)]',
          'outline-none transition-colors duration-200',
          error
            ? 'border-[var(--red)]'
            : 'border-[var(--cream-dkr)] focus:border-[var(--gold)]',
          className,
        ].join(' ')}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-[0.72rem] text-[var(--red)]">{error}</p>
      )}
    </div>
  )
}