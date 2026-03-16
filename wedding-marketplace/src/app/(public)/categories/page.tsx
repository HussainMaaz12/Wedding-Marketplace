import { Metadata } from 'next'
import Link from 'next/link'
import { connectDB } from '@/lib/db'
import { Category, Vendor } from '@/models'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wedding Vendor Categories | WeddingConnect',
  description: 'Browse all wedding vendor categories from photographers to venues.',
}

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[var(--cream-dkr)] pt-32 pb-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-[var(--font-display)] text-4xl md:text-5xl font-light text-[var(--charcoal)] mb-4">
            Browse by <em className="italic text-[var(--burgundy)]">Category</em>
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            Find exactly what you need for your perfect day. Choose a category below to see our top-rated vendors.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <CategoryGrid />
      </div>
    </main>
  )
}

// Server Component to fetch categories and their live counts
async function CategoryGrid() {
  await connectDB()
  
  // Fetch active categories
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean()

  // For each category, get the count of active vendors
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Vendor.countDocuments({ 
        categoryId: cat._id, 
        status: { $in: ['PENDING', 'APPROVED'] } 
      })
      return { ...cat, count }
    })
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {categoriesWithCounts.map((cat: any) => (
        <Link 
          key={cat._id.toString()} 
          href={`/categories/${cat.slug}`}
          className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-8 flex flex-col items-center justify-center text-center hover:border-[var(--gold)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
        >
          <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
            {cat.icon}
          </span>
          <h3 className="font-[var(--font-display)] text-lg text-[var(--charcoal)] mb-1 group-hover:text-[var(--burgundy)] transition-colors">
            {cat.name}
          </h3>
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--text-light)]">
            {cat.count} {cat.count === 1 ? 'Vendor' : 'Vendors'}
          </span>
        </Link>
      ))}
    </div>
  )
}
