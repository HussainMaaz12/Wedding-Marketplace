import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { connectDB } from '@/lib/db'
import { Vendor, Package } from '@/models'
import PortfolioGallery from '@/components/vendors/PortfolioGallery'
import BookingModalContainer from '@/components/bookings/BookingModalContainer'
import { formatPrice } from '@/lib/utils'
import ReviewsSection from '@/components/reviews/ReviewsSection'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await connectDB()
  const { slug } = await params
  const vendor = await Vendor.findOne({ slug }).lean()
  if (!vendor) return { title: 'Vendor Not Found | WeddingConnect' }
  return {
    title: `${vendor.businessName} | WeddingConnect Vendors`,
    description: `Book ${vendor.businessName} in ${vendor.city} on WeddingConnect. Read reviews and view pricing.`
  }
}

export default async function VendorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB()
  const { slug } = await params

  // Fetch Vendor
  const vendor = await Vendor.findOne({ 
    slug, 
    status: { $in: ['PENDING', 'APPROVED'] }
  })
    .populate('categoryId')
    .lean()

  if (!vendor) notFound()

  // Fetch Packages
  const packages = await Package.find({
    vendorId: vendor._id,
    isActive: true
  })
  .sort({ price: 1 })
  .lean()

  const defaultImage = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop"

  return (
    <main className="min-h-screen bg-[var(--cream)] pb-24">
      {/* Hero Cover */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-[#1a1a1a]">
        <img 
          src={vendor.coverImage || defaultImage} 
          alt={vendor.businessName}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Breadcrumb & Navigation */}
        <div className="absolute top-24 left-0 w-full px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-white/80">
            <Link href="/vendors" className="hover:text-white transition-colors">Vendors</Link>
            <span>/</span>
            <span className="text-white font-medium">{vendor.businessName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-10">
        
        {/* Main Info Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[var(--cream-dkr)] p-8 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--cream)] rounded-full mb-4">
                <span className="text-sm">{(vendor.categoryId as any)?.icon}</span>
                <span className="text-xs font-bold tracking-widest uppercase text-[var(--charcoal)]">
                  {(vendor.categoryId as any)?.name}
                </span>
              </div>
              <h1 className="font-[var(--font-display)] text-4xl md:text-5xl text-[var(--charcoal)] mb-3">
                {vendor.businessName}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-[var(--text-muted)] text-sm mb-6">
                <div className="flex items-center gap-2">
                  <span>📍</span> {vendor.city}, {vendor.state}
                </div>
                {vendor.totalReviews > 0 && (
                  <div className="flex items-center gap-1.5 text-[var(--charcoal)] font-medium">
                    <span className="text-[var(--gold)] text-lg">★</span>
                    {vendor.averageRating.toFixed(1)} <span className="text-[var(--text-light)] font-normal">({vendor.totalReviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-4 min-w-[240px]">
              <div className="bg-[var(--cream)] p-5 rounded-xl border border-[var(--cream-dkr)] text-center">
                <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-1">Starting Price</p>
                <p className="text-2xl font-bold text-[var(--burgundy)]">
                  {vendor.startingPrice ? formatPrice(vendor.startingPrice) : 'On Request'}
                </p>
              </div>
              <BookingModalContainer 
                vendorId={vendor._id.toString()} 
                vendorName={vendor.businessName}
                packages={packages.map((p: any) => ({
                  _id: p._id.toString(),
                  name: p.name,
                  price: p.price
                }))}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (About & Portfolio) */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            
            {/* About Section */}
            {vendor.description && (
              <section className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-8 md:p-10">
                <h2 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)] mb-6">
                  About <em className="italic text-[var(--burgundy)]">us</em>
                </h2>
                <div className="prose prose-stone max-w-none text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                  {vendor.description}
                </div>
              </section>
            )}

            {/* Portfolio Section */}
            {vendor.portfolioImages && vendor.portfolioImages.length > 0 && (
              <section className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)]">
                    Portfolio <em className="italic text-[var(--burgundy)]">Gallery</em>
                  </h2>
                  <span className="text-sm font-medium tracking-widest uppercase text-[var(--text-muted)]">
                    {vendor.portfolioImages.length} Photos
                  </span>
                </div>
                <PortfolioGallery images={vendor.portfolioImages} />
              </section>
            )}

            {/* Reviews Section */}
            <section className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                  <h2 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)]">
                    Customer <em className="italic text-[var(--burgundy)]">Reviews</em>
                  </h2>
                  <div className="flex items-center gap-2">
                     <span className="text-[var(--gold)] text-xl">★</span>
                     <span className="font-bold text-lg">{vendor.averageRating.toFixed(1)}</span>
                     <span className="text-sm text-[var(--text-muted)]">({vendor.totalReviews})</span>
                  </div>
              </div>
              <ReviewsSection vendorId={vendor._id.toString()} />
            </section>

          </div>

          {/* Right Column (Packages & Contact) */}
          <div className="space-y-8">
            
            {/* Packages Section */}
            <section className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-8">
              <h2 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)] mb-6">
                Service <em className="italic text-[var(--burgundy)]">Packages</em>
              </h2>
              
              {packages.length === 0 ? (
                <p className="text-[var(--text-muted)] italic text-sm">Packages are available upon request.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {packages.map((pkg: any) => (
                    <div key={pkg._id.toString()} className="border border-[var(--cream-dkr)] rounded-xl p-6 hover:border-[var(--gold)] transition-colors group">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-[var(--charcoal)] group-hover:text-[var(--burgundy)] transition-colors">
                          {pkg.name}
                        </h3>
                        <span className="font-bold text-[var(--burgundy)]">
                          {formatPrice(pkg.price)}
                        </span>
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
                          {pkg.description}
                        </p>
                      )}
                      
                      {/* Divider */}
                      <div className="h-px bg-[var(--cream-dkr)] w-full my-4" />
                      
                      <ul className="flex flex-col gap-2">
                        {pkg.includes.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                            <span className="text-[var(--gold)] shrink-0 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

        </div>
      </div>
    </main>
  )
}
