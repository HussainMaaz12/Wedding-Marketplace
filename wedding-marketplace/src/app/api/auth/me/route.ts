// src/app/api/auth/me/route.ts
// GET /api/auth/me — returns the current logged-in user

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req)

    if (!session) {
      return NextResponse.json(
        apiError('Not authenticated'),
        { status: 401 }
      )
    }

    return NextResponse.json(
      apiSuccess(session, 'Session active'),
      { status: 200 }
    )

  } catch (error: any) {
    return NextResponse.json(
      apiError('Failed to check session'),
      { status: 500 }
    )
  }
}
