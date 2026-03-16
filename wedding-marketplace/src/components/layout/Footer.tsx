// ============================================================
// Footer.tsx
// 📁 Location: src/components/layout/Footer.tsx
//
// Used in: src/app/(public)/layout.tsx
// ============================================================

import Link from 'next/link'

const FOOTER_LINKS = {
  'For Couples': [
    { label: 'Browse Vendors',   href: '/vendors' },
    { label: 'Categories',       href: '/categories' },
    { label: 'How It Works',     href: '/#how-it-works' },
    { label: 'Planning Guide',   href: '/guide' },
  ],
  'For Vendors': [
    { label: 'Join as Vendor',   href: '/register?role=vendor' },
    { label: 'Vendor Dashboard', href: '/vendor/dashboard' },
    { label: 'Pricing & Plans',  href: '/vendor/pricing' },
    { label: 'Success Stories',  href: '/vendors/stories' },
  ],
  'Company': [
    { label: 'About Us',         href: '/about' },
    { label: 'Contact',          href: '/contact' },
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy',    href: '/refund' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">

      {/* ── Main Footer Grid ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div>
            <div className="font-display text-3xl font-semibold text-white mb-3">
              Wedding<span className="text-gold">Connect</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50 max-w-[260px]">
              India's most trusted wedding vendor marketplace. Connecting couples with the best
              wedding professionals since 2020.
            </p>
            {/* Social Icons placeholder */}
            <div className="flex gap-3 mt-5">
              {['𝕏', 'in', 'f', '📷'].map(icon => (
                <button
                  key={icon}
                  className="w-8 h-8 flex items-center justify-center rounded border border-white/15 text-white/40 text-xs hover:border-gold hover:text-gold transition-colors duration-200"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <div className="text-xs font-medium tracking-[0.18em] uppercase text-gold mb-4">
                {title}
              </div>
              <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/45 hover:text-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Gold Divider ── */}
        <hr className="border-none h-px bg-white/10 mb-6" />

        {/* ── Bottom Bar ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30 text-center md:text-left">
          <span>© {new Date().getFullYear()} WeddingConnect. All rights reserved.</span>
          <span>Made with ❤️ for Indian weddings</span>
        </div>
      </div>
    </footer>
  )
}