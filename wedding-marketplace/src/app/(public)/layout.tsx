// ============================================================
// layout.tsx  (Public Route Group Layout)
// 📁 Location: src/app/(public)/layout.tsx
//
// This layout wraps ALL pages inside the (public) folder:
//   - Homepage  /
//   - /vendors
//   - /vendors/[slug]
//   - /categories/[slug]
//   - /login
//   - /register
//
// It adds the shared Navbar + Footer around every public page.
// Admin and Vendor sections have their OWN layouts with sidebars.
// ============================================================

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Fixed top navbar — sits above everything */}
      <Navbar />

      {/*
        pt-[72px] = pushes content below the fixed navbar.
        Adjust this value if your navbar height changes.
      */}
      <main className="min-h-screen pt-[72px]">
        {children}
      </main>

      {/* Footer at the bottom of every public page */}
      <Footer />
    </>
  )
}