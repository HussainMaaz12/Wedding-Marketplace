// src/models/AuditLog.ts
// Tracks important actions for security and debugging
// "Who did what, when?"

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId
  action: string    // "VENDOR_APPROVED", "BOOKING_CANCELLED"
  entity: string    // "Vendor", "Booking"
  entityId?: string
  details?: Record<string, any>
  ipAddress?: string
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User' },
    action:    { type: String, required: true },
    entity:    { type: String, required: true },
    entityId:  String,
    details:   Schema.Types.Mixed,   // Flexible JSON field
    ipAddress: String,
  },
  { timestamps: true }
)

AuditLogSchema.index({ action: 1, createdAt: -1 })
AuditLogSchema.index({ userId: 1 })

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)