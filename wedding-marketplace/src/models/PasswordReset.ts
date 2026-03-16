// src/models/PasswordReset.ts
// Stores password reset tokens (one-time use, expires in 1 hour)

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId
  tokenHash: string   // Hashed token — never store plain
  expiresAt: Date
  usedAt?: Date       // Set when token is used
  createdAt: Date
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// Auto-delete expired tokens (TTL index)
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PasswordReset: Model<IPasswordReset> =
  mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema)
