// src/models/Category.ts
// Vendor categories: Wedding Photography, Catering, etc.

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string   // URL-friendly: "wedding-photography"
  icon?: string  // Emoji: "📸"
  description?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },
    icon:        { type: String },
    description: { type: String },
    isActive:    { type: Boolean, default: true },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)