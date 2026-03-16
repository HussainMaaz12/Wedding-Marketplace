// src/app/api/upload/route.ts
// POST /api/upload — handles image uploads to Cloudinary
// Accepts base64 image data in JSON body

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// Increase body size limit for image uploads
export const maxDuration = 30 // 30 seconds timeout

export async function POST(req: NextRequest) {
  try {
    // 1. Verify user is authenticated
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json(apiError('Not authenticated'), { status: 401 })
    }

    // 2. Parse request body
    const { image, folder } = await req.json()

    if (!image) {
      return NextResponse.json(apiError('Image data is required'), { status: 400 })
    }

    // 3. Check Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json(
        apiError('Image upload is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'),
        { status: 503 }
      )
    }

    // 4. Upload to Cloudinary
    const result = await uploadImage(image, folder || 'wedding-marketplace')

    return NextResponse.json(
      apiSuccess(result, 'Image uploaded successfully'),
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      apiError(error.message || 'Upload failed'),
      { status: 500 }
    )
  }
}
