import { Temperature } from './server/models/Temperature.js'

/**
 * Seed database with mock temperature data
 * Run with: node seed-data.js
 */
async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with mock data...')
    await Temperature.seedMockData()
    console.log('✓ Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to seed database:', error.message)
    process.exit(1)
  }
}

seedDatabase()
