// src/modules/search/search.service.ts
// Vendor discovery — Mongoose version

import { connectDB } from '@/lib/db'
import { Vendor, Category } from '@/models'
import { DEFAULT_PAGE_SIZE } from '@/config/constants'
import type { VendorSearchFilters } from '@/types'

// ─────────────────────────────────────────────
// SEARCH VENDORS
// ─────────────────────────────────────────────

export async function searchVendors(filters: VendorSearchFilters) {
  await connectDB()

  const {
    city,
    categorySlug,
    minPrice,
    maxPrice,
    minRating,
    sortBy = 'popular',
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  } = filters

  // Build MongoDB query object
  const query: Record<string, any> = { status: 'APPROVED' }

  if (city) {
    // Case-insensitive city search
    query.city = { $regex: city, $options: 'i' }
  }

  if (categorySlug) {
    // First find the category, then filter by its ID
    const category = await Category.findOne({ slug: categorySlug })
    if (category) query.categoryId = category._id
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.startingPrice = {}
    if (minPrice !== undefined) query.startingPrice.$gte = minPrice
    if (maxPrice !== undefined) query.startingPrice.$lte = maxPrice
  }

  if (minRating !== undefined) {
    query.averageRating = { $gte: minRating }
  }

  // Build sort options
  let sortOptions: Record<string, any> = {}
  switch (sortBy) {
    case 'rating':
      sortOptions = { averageRating: -1, totalReviews: -1 }
      break
    case 'price_low':
      sortOptions = { startingPrice: 1 }
      break
    case 'price_high':
      sortOptions = { startingPrice: -1 }
      break
    case 'popular':
    default:
      sortOptions = { isFeatured: -1, totalBookings: -1 }
  }

  const skip = (page - 1) * limit

  // Run query and count in parallel
  const [vendors, total] = await Promise.all([
    Vendor.find(query)
      .populate('categoryId', 'name slug icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),   // .lean() returns plain JS objects (faster, no mongoose overhead)

    Vendor.countDocuments(query),
  ])

  return {
    vendors,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  }
}

// ─────────────────────────────────────────────
// GET FEATURED VENDORS (for homepage)
// ─────────────────────────────────────────────

export async function getFeaturedVendors(limit = 8) {
  await connectDB()

  return Vendor.find({ status: 'APPROVED', isFeatured: true })
    .populate('categoryId', 'name icon')
    .sort({ averageRating: -1 })
    .limit(limit)
    .lean()
}

// ─────────────────────────────────────────────
// GET ACTIVE CITIES
// ─────────────────────────────────────────────

export async function getActiveCities() {
  await connectDB()

  // MongoDB aggregation to group by city and count vendors
  const result = await Vendor.aggregate([
    { $match: { status: 'APPROVED' } },
    { $group: { _id: '$city', vendorCount: { $sum: 1 } } },
    { $sort: { vendorCount: -1 } },
    { $project: { city: '$_id', vendorCount: 1, _id: 0 } },
  ])

  return result
}

// ─────────────────────────────────────────────
// GET CATEGORIES WITH VENDOR COUNT
// ─────────────────────────────────────────────

export async function getCategoriesWithCount() {
  await connectDB()

  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 })

  // Count approved vendors in each category
  const counts = await Vendor.aggregate([
    { $match: { status: 'APPROVED' } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ])

  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]))

  return categories.map((cat) => ({
    ...cat.toObject(),
    vendorCount: countMap.get(cat._id.toString()) || 0,
  }))
}