import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // 1. Get token safely (try Next.js cookies first, fallback to raw header if missing)
    let token = req.cookies.get('session_token')?.value

    if (!token) {
      const cookieHeader = req.headers.get('cookie') || ''
      const match = cookieHeader.match(/session_token=([^;]+)/)
      token = match ? match[1] : undefined
    }

    // 2. Delete from database if it exists
    if (token) {
      await deleteSession(token)
    }

    // 3. Prepare the success response
    const response = NextResponse.json(
      apiSuccess(null, 'Logged out successfully'),
      { status: 200 }
    )

    // 4. Clear both auth cookies completely
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    })

    response.cookies.set('user_role', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response

  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Logout failed'),
      { status: 500 }
    )
  }
}