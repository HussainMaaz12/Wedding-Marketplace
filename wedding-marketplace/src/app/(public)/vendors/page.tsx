import { Metadata } from 'next'
import VendorCard from '@/components/vendors/VendorCard'
import VendorFilters from '@/components/vendors/VendorFilters'
import { connectDB } from '@/lib/db'
import { Vendor } from '@/models'
import '@/models/Category' // Ensure registered

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Find Wedding Vendors | WeddingConnect',
  description: 'Search and filter the best wedding vendors including photographers, makeup artists, venues, and more.',
}

// In Next.js App Router, page params are async in dynamic routes, 
// and searchParams are an awaited promise in Server Components.
export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await connectDB()

  // Resolve searchParams promise
  const params = await searchParams

  const search = typeof params.search === 'string' ? params.search : undefined
  const category = typeof params.category === 'string' ? params.category : undefined
  const city = typeof params.city === 'string' ? params.city : undefined
  const minPrice = typeof params.minPrice === 'string' ? params.minPrice : undefined
  const maxPrice = typeof params.maxPrice === 'string' ? params.maxPrice : undefined
  const sort = typeof params.sort === 'string' ? params.sort : 'newest'

  // Build Query
  const query: any = { status: { $in: ['PENDING', 'APPROVED'] } }

  if (search) {
    query.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }
  if (category) query.categoryId = category
  if (city) query.city = { $regex: new RegExp(`^${city}$`, 'i') }

  if (minPrice || maxPrice) {
    query.startingPrice = {}
    if (minPrice) query.startingPrice.$gte = Number(minPrice)
    if (maxPrice) query.startingPrice.$lte = Number(maxPrice)
  }

  // Build Sort
  let sortObj: any = {}
  switch (sort) {
    case 'price_asc': sortObj = { startingPrice: 1 }; break
    case 'price_desc': sortObj = { startingPrice: -1 }; break
    case 'rating': sortObj = { averageRating: -1, totalReviews: -1 }; break
    case 'newest':
    default: sortObj = { createdAt: -1 }; break
  }

  // Fetch Vendors Server-Side
  const vendorsResponse = await Vendor.find(query)
    .populate('categoryId', 'name slug icon')
    .sort(sortObj)
    .select('-__v -updatedAt -userId -businessEmail -businessPhone -address')
    .lean()

  // Convert _id to string for Server Component to Client Component serialization
  const vendors = vendorsResponse.map(v => ({
    ...v,
    _id: v._id.toString(),
    categoryId: typeof v.categoryId === 'object' && v.categoryId !== null
      ? { ...v.categoryId, _id: (v.categoryId as any)._id.toString() }
      : v.categoryId
  }))

  return (
    <main className="min-h-screen bg-[var(--cream)] pb-20">

      {/* Directory Header Minimal */}
      <div className="bg-white border-b border-[var(--cream-dkr)] pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-[var(--font-display)] text-4xl md:text-5xl font-light text-[var(--charcoal)] mb-4">
            Find Your <em className="italic text-[var(--burgundy)]">Perfect Vendor</em>
          </h1>
          <p className="text-[var(--text-muted)] max-w-2xl text-lg">
            Browse our curated marketplace of India&apos;s finest wedding professionals.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <VendorFilters />
          </aside>

          {/* Results Grid */}
          <section className="flex-grow w-full">

            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-medium tracking-widest uppercase text-[var(--text-muted)]">
                {vendors.length} {vendors.length === 1 ? 'Vendor' : 'Vendors'} Found
              </span>
            </div>

            {/* Grid */}
            {vendors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vendors.map((vendor: any) => (
                  <VendorCard key={vendor._id} vendor={{
                    ...vendor,
                    category: vendor.categoryId
                  }} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-[var(--font-display)] text-2xl text-[var(--charcoal)] mb-2">No vendors found</h3>
                <p className="text-[var(--text-muted)]">
                  Try adjusting your filters or searching for something else.
                </p>
              </div>
            )}

          </section>
        </div>
      </div>
    </main>
  )
}
