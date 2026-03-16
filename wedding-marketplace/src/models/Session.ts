// src/models/Session.ts
// Stores login sessions (so users stay logged in)
// Each session has a token stored in a cookie

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',          // References the User model
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

// Auto-delete expired sessions (MongoDB TTL index)
// MongoDB will automatically remove documents when expiresAt passes
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)