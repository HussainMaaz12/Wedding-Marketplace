// 📁 Location: src/components/homepage/VendorCard.tsx
"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

// Note: Keeping your existing interface and fetch logic

export default function FeaturedVendors() {
  // Mock data for UI testing since your API isn't built yet
  const vendors = [
    { _id: '1', slug: 'kapoor-studios', businessName: 'Kapoor Studios', city: 'Mumbai', startingPrice: 50000, averageRating: 4.9, totalReviews: 124, isVerified: true, categoryId: { name: 'Photography' } },
    { _id: '2', slug: 'royal-bites', businessName: 'Royal Bites Catering', city: 'Delhi', startingPrice: 1200, averageRating: 4.8, totalReviews: 89, isVerified: true, categoryId: { name: 'Catering' } },
    { _id: '3', slug: 'elegant-decors', businessName: 'Elegant Decors', city: 'Bangalore', startingPrice: 75000, averageRating: 4.7, totalReviews: 56, isVerified: false, categoryId: { name: 'Decoration' } },
  ];

  return (
    <section className="py-24 px-6 md:px-16 bg-cream-dk">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 text-burgundy text-xs font-medium tracking-[0.18em] uppercase mb-4">
            Hand-Picked Excellence
          </div>
          <h2 className="text-4xl md:text-5xl font-display text-charcoal">
            Featured <em className="text-gold font-light">Vendors</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vendors.map((vendor) => (
            <Link key={vendor._id} href={`/vendors/${vendor.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col border border-cream">
              
              {/* Image Section */}
              <div className="relative h-60 bg-gradient-to-br from-cream-dkr to-cream-dk overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 z-20 bg-burgundy text-white text-[0.65rem] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                  Featured
                </div>
                {vendor.isVerified && (
                  <div className="absolute top-4 right-4 z-20 bg-green/90 backdrop-blur-sm text-white text-[0.65rem] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md flex items-center gap-1">
                    ✓ Verified
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="p-6 flex flex-col flex-1">
                <div className="text-xs text-gold font-medium uppercase tracking-wider mb-2">
                  {vendor.categoryId?.name}
                </div>
                <div className="text-2xl font-display font-semibold text-charcoal mb-1 group-hover:text-burgundy transition-colors">
                  {vendor.businessName}
                </div>
                <div className="text-sm text-text-muted mb-4 flex items-center gap-1">
                  📍 {vendor.city}
                </div>

                {/* Footer/Meta */}
                <div className="mt-auto pt-4 border-t border-cream-dk flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-gold text-sm">★★★★★</span>
                    <span className="text-xs text-text-muted mt-1">{vendor.averageRating} ({vendor.totalReviews} reviews)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-charcoal">₹{vendor.startingPrice.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-text-muted">onwards</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}