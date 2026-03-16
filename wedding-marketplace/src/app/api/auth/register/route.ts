// src/app/api/auth/register/route.ts
// POST /api/auth/register

import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/modules/auth/auth.schema'
import { registerUser } from '@/modules/auth/auth.service'
import { createSession } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json()

    // 2. Validate with Zod schema
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        apiError(validation.error.issues[0].message),
        { status: 400 }
      )
    }

    // 3. Call service to create user
    const user = await registerUser(validation.data)

    // 4. Auto-login: create session immediately after registration
    const token = await createSession(user.id)

    // 5. Build response with cookies
    const response = NextResponse.json(
      apiSuccess({ user }, 'Account created successfully'),
      { status: 201 }
    )

    // 6. Set session_token cookie (httpOnly, secure in production)
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    // 7. Set user_role cookie (readable by middleware for RBAC)
    response.cookies.set('user_role', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    })

    return response

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Registration failed'),
      { status: 400 }
    )
  }
}