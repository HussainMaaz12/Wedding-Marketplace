import { connectDB } from '@/lib/db'
import { Category } from '@/models'
import { redirect, notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

// This route acts as a clean, SEO-friendly URL that simply redirects
// to the powerful search directory page with the correct category filter applied.
// e.g., /categories/wedding-photography -> /vendors?category=65fc...

export default async function CategoryRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB()
  
  const { slug } = await params
  
  const category = await Category.findOne({ slug, isActive: true })
    .select('_id')
    .lean()

  if (!category) {
    notFound()
  }

  // Redirect to the main vendors directory with this category ID selected
  redirect(`/vendors?category=${category._id.toString()}`)
}
