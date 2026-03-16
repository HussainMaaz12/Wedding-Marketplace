// 📁 Location: src/components/ui/Button.tsx
import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  fullWidth?: boolean
  children:  React.ReactNode
}

const styles: Record<ButtonVariant, string> = {
  primary:   'bg-burgundy text-white hover:bg-burgundy-dk border border-transparent',
  secondary: 'bg-transparent text-burgundy border border-burgundy hover:bg-cream-dk',
  ghost:     'bg-transparent text-text-muted border border-transparent hover:text-burgundy',
  gold:      'bg-gold text-charcoal hover:bg-gold-lt border border-transparent',
  danger:    'bg-red text-white hover:opacity-90 border border-transparent',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs tracking-widest',
  md: 'px-6 py-3 text-[0.82rem] tracking-widest',
  lg: 'px-10 py-4 text-[0.88rem] tracking-widest',
}

export default function Button({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-body font-medium uppercase transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed rounded-lg',
        styles[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}