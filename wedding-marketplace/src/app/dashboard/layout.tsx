// src/app/dashboard/layout.tsx
// Customer dashboard layout — wraps all /dashboard/* pages
// Does NOT render <html> or <body> — that's handled by the root layout

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | My Dashboard',
    default: 'Dashboard',
  },
  description: 'Manage your bookings, wishlist, and account settings.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
