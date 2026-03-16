// scripts/seed-categories.ts
// Run with: npx tsx scripts/seed-categories.ts
// Seeds the database with default vendor categories

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding_marketplace'

const DEFAULT_CATEGORIES = [
  { name: 'Wedding Photography', slug: 'wedding-photography', icon: '📸', sortOrder: 1 },
  { name: 'Wedding Videography', slug: 'wedding-videography', icon: '🎥', sortOrder: 2 },
  { name: 'Catering', slug: 'catering', icon: '🍽️', sortOrder: 3 },
  { name: 'Decoration & Florist', slug: 'decoration-florist', icon: '💐', sortOrder: 4 },
  { name: 'Makeup Artist', slug: 'makeup-artist', icon: '💄', sortOrder: 5 },
  { name: 'Mehendi Artist', slug: 'mehendi-artist', icon: '🌿', sortOrder: 6 },
  { name: 'Wedding Band / DJ', slug: 'band-dj', icon: '🎶', sortOrder: 7 },
  { name: 'Wedding Venue', slug: 'wedding-venue', icon: '🏛️', sortOrder: 8 },
  { name: 'Wedding Planner', slug: 'wedding-planner', icon: '📋', sortOrder: 9 },
  { name: 'Invitation Cards', slug: 'invitation-cards', icon: '💌', sortOrder: 10 },
]

async function seed() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected!\n')

    const db = mongoose.connection.db!
    const collection = db.collection('categories')

    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await collection.findOne({ slug: cat.slug })
      if (exists) {
        console.log(`  ⏭ ${cat.icon} ${cat.name} (already exists)`)
      } else {
        await collection.insertOne({
          ...cat,
          description: '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        console.log(`  ✅ ${cat.icon} ${cat.name}`)
      }
    }

    console.log('\n✅ Category seed complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()
