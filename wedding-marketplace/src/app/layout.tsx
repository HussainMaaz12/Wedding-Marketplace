// ============================================================
// layout.tsx  (Root Layout)
// 📁 Location: src/app/layout.tsx
//
// This is the OUTERMOST wrapper for your entire app.
// Every page — public, vendor, admin — inherits this.
// It sets the HTML <head>, loads fonts, and wraps children.
// ============================================================

import type { Metadata } from 'next'
import './globals.css'

// ── App Metadata (shows in browser tab + Google search) ──
export const metadata: Metadata = {
  title: {
    // %s will be replaced by each page's own title
    // e.g. "Browse Vendors | WeddingConnect"
    template: '%s | WeddingConnect',
    default:  'WeddingConnect — India\'s Premium Wedding Marketplace',
  },
  description:
    'Discover verified photographers, caterers, decorators, and more. Compare packages, read real reviews, and book with complete confidence.',
  keywords: [
    'wedding vendors India',
    'wedding photography Mumbai',
    'wedding catering Delhi',
    'wedding decoration',
    'bridal makeup artist',
  ],
  openGraph: {
    type:        'website',
    siteName:    'WeddingConnect',
    title:       'WeddingConnect — India\'s Premium Wedding Marketplace',
    description: 'Find and book verified wedding vendors across India.',
  },
}

// ── Root Layout Component ──
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are loaded via @import in globals.css.
          You could also use next/font here for better performance —
          but globals.css import works fine for now.
        */}
      </head>
      <body>
        {/*
          children = whatever page or layout is nested inside.
          The Navbar and Footer are NOT here — they live in
          the (public)/layout.tsx so admin/vendor can have
          their own different headers.
        */}
        {children}
      </body>
    </html>
  )
}