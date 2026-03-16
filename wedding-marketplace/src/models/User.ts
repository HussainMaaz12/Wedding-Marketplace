// src/models/User.ts
// User model — stores customers, vendors, and admins
// Role field decides what they can do in the system

import mongoose, { Schema, Document, Model } from 'mongoose'

// TypeScript interface for a User document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  phone: string
  passwordHash: string
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'
  avatar?: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,         // MongoDB will create an index on this
      lowercase: true,      // Always store as lowercase
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,        // NEVER return password in queries by default
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'VENDOR', 'ADMIN'],
      default: 'CUSTOMER',
    },
    avatar: String,
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified:  { type: Boolean, default: false },
    isActive:         { type: Boolean, default: true  },
    lastLoginAt: Date,
  },
  {
    timestamps: true, // Auto-adds createdAt and updatedAt fields
  }
)

// Prevent duplicate model error in Next.js hot-reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)