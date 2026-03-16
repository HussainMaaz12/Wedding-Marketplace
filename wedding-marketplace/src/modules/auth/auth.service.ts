// src/modules/auth/auth.service.ts
// Auth logic — now using Mongoose + MongoDB

import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/models'
import type { RegisterInput, LoginInput } from './auth.schema'

// ─────────────────────────────────────────────
// REGISTER USER
// ─────────────────────────────────────────────

export async function registerUser(input: RegisterInput) {
  await connectDB()
  const { name, email, phone, password, role } = input

  // 1. Check if email already exists
  const existingEmail = await User.findOne({ email: email.toLowerCase() })
  if (existingEmail) throw new Error('An account with this email already exists')

  // 2. Check if phone already exists
  const existingPhone = await User.findOne({ phone })
  if (existingPhone) throw new Error('An account with this phone number already exists')

  // 3. Hash password — NEVER store plain text
  const passwordHash = await bcrypt.hash(password, 12)

  // 4. Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role,
  })

  // Return only safe fields (no password)
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

// ─────────────────────────────────────────────
// LOGIN USER
// ─────────────────────────────────────────────

export async function loginUser(input: LoginInput) {
  await connectDB()
  const { email, password } = input

  // 1. Find user — must explicitly select passwordHash because select:false
  const user = await User
    .findOne({ email: email.toLowerCase() })
    .select('+passwordHash')     // ← This is how you get the hidden field

  if (!user) throw new Error('Invalid email or password')
  if (!user.isActive) throw new Error('Your account has been suspended. Contact support.')

  // 2. Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) throw new Error('Invalid email or password')

  // 3. Update last login
  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() })

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
  }
}

// ─────────────────────────────────────────────
// GET USER BY ID
// ─────────────────────────────────────────────

export async function getUserById(userId: string) {
  await connectDB()

  const user = await User
    .findById(userId)
    .select('-passwordHash')   // Exclude password

  if (!user || !user.isActive) return null

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
  }
}

// ─────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  await connectDB()

  const user = await User.findById(userId).select('+passwordHash')
  if (!user) throw new Error('User not found')

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) throw new Error('Current password is incorrect')

  const newHash = await bcrypt.hash(newPassword, 12)
  await User.findByIdAndUpdate(userId, { passwordHash: newHash })

  return { message: 'Password changed successfully' }
}