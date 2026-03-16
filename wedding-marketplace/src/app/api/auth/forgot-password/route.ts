// src/app/api/auth/forgot-password/route.ts
// POST /api/auth/forgot-password
// Generates a reset token and logs the reset URL to the console
// (Email integration deferred to Phase 5)

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User, PasswordReset } from '@/models'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        apiError('Email is required'),
        { status: 400 }
      )
    }

    await connectDB()

    // Always return success (don't leak whether email exists)
    const successMessage = 'If an account with that email exists, a password reset link has been sent.'

    // 1. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal that the email doesn't exist
      return NextResponse.json(apiSuccess(null, successMessage))
    }

    // 2. Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id })

    // 3. Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = await bcrypt.hash(rawToken, 10)

    // 4. Store hashed token with 1-hour expiry
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await PasswordReset.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    })

    // 5. Build reset URL and log to console
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`

    console.log('\n========================================')
    console.log('🔑 PASSWORD RESET LINK (dev mode)')
    console.log('========================================')
    console.log(`User: ${user.name} (${user.email})`)
    console.log(`Link: ${resetUrl}`)
    console.log('Expires in: 1 hour')
    console.log('========================================\n')

    return NextResponse.json(apiSuccess(null, successMessage))

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Something went wrong'),
      { status: 500 }
    )
  }
}
