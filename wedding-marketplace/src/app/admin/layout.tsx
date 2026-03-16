// src/app/admin/layout.tsx
// Admin panel layout — wraps all /admin/* pages
// Does NOT render <html> or <body> — that's handled by the root layout

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Panel',
    default: 'Admin Dashboard',
  },
  description: 'WeddingConnect administration panel.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
