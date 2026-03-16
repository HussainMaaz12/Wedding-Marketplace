// src/lib/seed.ts
// Populates MongoDB with initial data
// Run: npm run db:seed

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Load env variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding_marketplace'

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  // Import models after connecting
  const { User, Vendor, Category, Package, Coupon } = await import('@/models')

  // ─────────────────────────────────────────────
  // SEED CATEGORIES
  // ─────────────────────────────────────────────

  const categories = [
    { name: 'Wedding Photography', slug: 'wedding-photography', icon: '📸', sortOrder: 0 },
    { name: 'Wedding Videography', slug: 'wedding-videography', icon: '🎥', sortOrder: 1 },
    { name: 'Catering',            slug: 'catering',            icon: '🍽️', sortOrder: 2 },
    { name: 'Decoration & Florist',slug: 'decoration-florist',  icon: '💐', sortOrder: 3 },
    { name: 'Makeup Artist',       slug: 'makeup-artist',       icon: '💄', sortOrder: 4 },
    { name: 'Mehendi Artist',      slug: 'mehendi-artist',      icon: '🌿', sortOrder: 5 },
    { name: 'Wedding Band / DJ',   slug: 'band-dj',             icon: '🎶', sortOrder: 6 },
    { name: 'Wedding Venue',       slug: 'wedding-venue',       icon: '🏛️', sortOrder: 7 },
    { name: 'Wedding Planner',     slug: 'wedding-planner',     icon: '📋', sortOrder: 8 },
    { name: 'Invitation Cards',    slug: 'invitation-cards',    icon: '💌', sortOrder: 9 },
  ]

  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true })
  }
  console.log(`✅ ${categories.length} categories seeded`)

  // ─────────────────────────────────────────────
  // SEED ADMIN USER
  // ─────────────────────────────────────────────

  const adminExists = await User.findOne({ email: 'admin@weddingconnect.com' })
  if (!adminExists) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@weddingconnect.com',
      phone: '9000000000',
      passwordHash: await bcrypt.hash('Admin@123', 12),
      role: 'ADMIN',
      isEmailVerified: true,
    })
  }
  console.log('✅ Admin: admin@weddingconnect.com / Admin@123')

  // ─────────────────────────────────────────────
  // SEED TEST CUSTOMER
  // ─────────────────────────────────────────────

  const customerExists = await User.findOne({ email: 'customer@test.com' })
  if (!customerExists) {
    await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '9111111111',
      passwordHash: await bcrypt.hash('Customer@123', 12),
      role: 'CUSTOMER',
      isEmailVerified: true,
    })
  }
  console.log('✅ Customer: customer@test.com / Customer@123')

  // ─────────────────────────────────────────────
  // SEED TEST VENDOR
  // ─────────────────────────────────────────────

  let vendorUser = await User.findOne({ email: 'vendor@test.com' })
  if (!vendorUser) {
    vendorUser = await User.create({
      name: 'Raj Sharma',
      email: 'vendor@test.com',
      phone: '9222222222',
      passwordHash: await bcrypt.hash('Vendor@123', 12),
      role: 'VENDOR',
      isEmailVerified: true,
    })
  }

  const photoCategory = await Category.findOne({ slug: 'wedding-photography' })
  const vendorExists = await Vendor.findOne({ userId: vendorUser._id })

  if (!vendorExists && photoCategory) {
    const vendor = await Vendor.create({
      userId: vendorUser._id,
      businessName: 'Raj Photography Studio',
      slug: 'raj-photography-studio',
      categoryId: photoCategory._id,
      description: 'We capture your most precious moments with a blend of traditional and contemporary photography. With 10+ years of experience, we have covered 500+ weddings across India.',
      city: 'Mumbai',
      state: 'Maharashtra',
      businessPhone: '9222222222',
      startingPrice: 45000,
      status: 'APPROVED',
      isVerified: true,
      averageRating: 4.8,
      totalReviews: 12,
    })

    await Package.create([
      {
        vendorId: vendor._id,
        name: 'Basic Package',
        price: 45000,
        includes: ['8 hours coverage', '1 photographer', '300 edited photos', 'Online gallery'],
      },
      {
        vendorId: vendor._id,
        name: 'Premium Package',
        price: 85000,
        includes: ['2 days coverage', '2 photographers', '1 videographer', '700+ photos', 'Highlight reel', 'Printed album'],
      },
    ])
  }
  console.log('✅ Vendor: vendor@test.com / Vendor@123')

  // ─────────────────────────────────────────────
  // SEED COUPON
  // ─────────────────────────────────────────────

  const couponExists = await Coupon.findOne({ code: 'WELCOME20' })
  if (!couponExists) {
    await Coupon.create({
      code: 'WELCOME20',
      type: 'PERCENTAGE',
      value: 20,
      maxDiscount: 5000,
      minOrderAmount: 10000,
      usageLimit: 100,
      perUserLimit: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    })
  }
  console.log('✅ Coupon: WELCOME20 (20% off, max ₹5000)')

  console.log('\n🎊 Database seeded successfully!')
  await mongoose.disconnect()
}

seed().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})