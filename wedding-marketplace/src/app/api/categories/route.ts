// src/app/api/categories/route.ts
// GET /api/categories — returns all active categories

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Category } from '@/models'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    const categories = await Category
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean()

    return NextResponse.json(apiSuccess(categories))

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Failed to fetch categories'),
      { status: 500 }
    )
  }
}
