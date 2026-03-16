// src/app/api/auth/reset-password/route.ts
// POST /api/auth/reset-password
// Validates the token and updates the user's password

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User, PasswordReset, Session } from '@/models'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { token, email, newPassword } = await req.json()

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        apiError('Token, email, and new password are required'),
        { status: 400 }
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        apiError('Password must be at least 8 characters'),
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        apiError('Password must contain at least one uppercase letter'),
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        apiError('Password must contain at least one number'),
        { status: 400 }
      )
    }

    await connectDB()

    // 1. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        apiError('Invalid or expired reset link'),
        { status: 400 }
      )
    }

    // 2. Find the reset token for this user
    const resetRecord = await PasswordReset.findOne({
      userId: user._id,
      usedAt: null,               // Not already used
      expiresAt: { $gt: new Date() }, // Not expired
    })

    if (!resetRecord) {
      return NextResponse.json(
        apiError('Invalid or expired reset link. Please request a new one.'),
        { status: 400 }
      )
    }

    // 3. Verify the token matches
    const isValidToken = await bcrypt.compare(token, resetRecord.tokenHash)
    if (!isValidToken) {
      return NextResponse.json(
        apiError('Invalid or expired reset link'),
        { status: 400 }
      )
    }

    // 4. Hash new password and update user
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await User.findByIdAndUpdate(user._id, { passwordHash })

    // 5. Mark token as used
    await PasswordReset.findByIdAndUpdate(resetRecord._id, { usedAt: new Date() })

    // 6. Invalidate all existing sessions (force re-login everywhere)
    await Session.deleteMany({ userId: user._id })

    return NextResponse.json(
      apiSuccess(null, 'Password reset successful. Please login with your new password.')
    )

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Password reset failed'),
      { status: 500 }
    )
  }
}
