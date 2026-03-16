// src/lib/cloudinary.ts
// Cloudinary configuration and upload helper

import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary — needs env vars:
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

/**
 * Upload a base64 image to Cloudinary
 * @param base64Data - The base64-encoded image string (with or without data URI prefix)
 * @param folder - Cloudinary folder to store the image in
 */
export async function uploadImage(
  base64Data: string,
  folder: string = 'wedding-marketplace'
): Promise<UploadResult> {
  // Ensure it has the data URI prefix
  const data = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`

  const result = await cloudinary.uploader.upload(data, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }, // Auto-optimize
      { width: 1600, crop: 'limit' },             // Max 1600px wide
    ],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

/**
 * Delete an image from Cloudinary by its public ID
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary
