// src/lib/auth.ts
// Server-side session management using MongoDB

import { connectDB } from './db'
import { Session, User } from '@/models'
import type { SessionUser } from '@/types'
import { NextRequest } from 'next/server'

// ─────────────────────────────────────────────
// GET SERVER SESSION
// Reads the session token from cookies/headers and returns user
// ─────────────────────────────────────────────

export async function getServerSession(req: NextRequest): Promise<SessionUser | null> {
  try {
    await connectDB()

    // 1. Safely read token from header OR Next.js built-in cookies
    const authHeader = req.headers.get('authorization')
    const token =
      authHeader?.replace('Bearer ', '') ||
      req.cookies.get('session_token')?.value

    if (!token) return null

    // 2. Find session in DB
    const session = await Session.findOne({ token }).populate({
      path: 'userId',
      model: User,
      select: '-passwordHash',
    })

    if (!session) return null

    // 3. Check expiration
    if (new Date() > session.expiresAt) {
      await Session.deleteOne({ token })
      return null
    }

    const user = session.userId as any

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      vendorId: user.role === 'VENDOR' ? user._id.toString() : null, // Crucial for vendor logic
    }
  } catch (err) {
    console.error("Session Error:", err)
    return null
  }
}

// ─────────────────────────────────────────────
// CREATE SESSION (after login)
// ─────────────────────────────────────────────

export async function createSession(userId: string) {
  await connectDB()

  // Remove old sessions for this user
  await Session.deleteMany({ userId })

  // Create new token
  const token = crypto.randomUUID() + '-' + crypto.randomUUID()

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

  await Session.create({ userId, token, expiresAt })

  return token
}

// ─────────────────────────────────────────────
// DELETE SESSION (logout)
// ─────────────────────────────────────────────

export async function deleteSession(token: string) {
  await connectDB()
  await Session.deleteOne({ token })
}

// ─────────────────────────────────────────────
// ROLE GUARDS
// ─────────────────────────────────────────────

export function requireAuth(session: SessionUser | null) {
  if (!session) throw new Error('Authentication required')
}

export function requireRole(session: SessionUser | null, role: string) {
  if (!session) throw new Error('Authentication required')
  if (session.role !== role) throw new Error(`Access denied. ${role} role required.`)
}