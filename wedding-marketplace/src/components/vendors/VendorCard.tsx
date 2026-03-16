import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface VendorProps {
  _id: string
  businessName: string
  slug: string
  category: {
    name: string
    icon: string
  }
  city: string
  coverImage?: string
  averageRating: number
  totalReviews: number
  startingPrice?: number
}

export default function VendorCard({ vendor }: { vendor: VendorProps }) {
  const { businessName, slug, category, city, coverImage, averageRating, totalReviews, startingPrice } = vendor
  
  // High quality placeholder if no cover image
  const defaultImage = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop"

  return (
    <Link 
      href={`/vendors/${slug}`}
      className="group bg-white rounded-xl border border-[var(--cream-dkr)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      {/* Cover Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--cream)]">
        <img
          src={coverImage || defaultImage}
          alt={businessName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Rating Badge */}
        {totalReviews > 0 && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
            <span className="text-[var(--gold)] text-sm">★</span>
            <span className="text-sm font-semibold text-[var(--charcoal)]">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-[var(--text-light)]">({totalReviews})</span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span className="text-xs">{category?.icon}</span>
          <span className="text-xs font-medium text-white tracking-wide">{category?.name}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-[var(--font-display)] text-[1.4rem] leading-tight text-[var(--charcoal)] mb-1 group-hover:text-[var(--burgundy)] transition-colors">
          {businessName}
        </h3>
        
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mb-4">
          <span className="text-xs">📍</span>
          {city}
        </div>

        {/* Footer Area - Pushed to bottom */}
        <div className="mt-auto pt-4 border-t border-[var(--cream-dkr)] flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-light)] mb-0.5">Starting From</span>
            {startingPrice ? (
              <span className="text-lg font-semibold text-[var(--burgundy)]">
                {formatPrice(startingPrice)}
              </span>
            ) : (
              <span className="text-sm text-[var(--text-muted)]">Price on request</span>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--cream)] group-hover:bg-[var(--burgundy)] group-hover:text-white flex items-center justify-center transition-colors">
            <span className="text-sm">→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
