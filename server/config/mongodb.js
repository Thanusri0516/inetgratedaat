import { MongoClient } from 'mongodb'
import { config } from './env.js'

const MONGODB_URI = config.mongodb.uri
const DATABASE_NAME = config.mongodb.database

let cachedClient = null
let cachedDb = null

/**
 * Connects to MongoDB Atlas
 * Reuses connection across calls (singleton pattern)
 */
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    // Connection options optimized for reliability
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
    })

    await client.connect()
    console.log('✓ Connected to MongoDB Atlas')

    const db = client.db(DATABASE_NAME)
    
    // Create indexes on first connection
    await initializeCollections(db)

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message)
    throw error
  }
}

/**
 * Initialize collections and indexes
 * Uses bucket pattern for time-series temperature data
 */
async function initializeCollections(db) {
  try {
    // Create temperature_buckets collection if not exists
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes('temperature_buckets')) {
      await db.createCollection('temperature_buckets', {
        timeseries: {
          timeField: 'timestamp',
          metaField: 'metadata',
          granularity: 'minutes', // Optimized for minute-level data
        },
      })
      console.log('✓ Created temperature_buckets collection')
    }

    // Create compound index for efficient queries
    const collection = db.collection('temperature_buckets')
    await collection.createIndex({ 'metadata.location': 1, timestamp: -1 })
    
    // Create TTL index to auto-delete data older than 90 days
    await collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 })
    
    console.log('✓ Indexes created successfully')
  } catch (error) {
    // Index already exists is not an error
    if (!error.message.includes('already exists')) {
      console.error('Warning during collection setup:', error.message)
    }
  }
}

/**
 * Get database instance
 */
export async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}

/**
 * Close MongoDB connection (call on app shutdown)
 */
export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.log('✓ MongoDB connection closed')
  }
}

/**
 * Health check for MongoDB connection
 */
export async function checkConnection() {
  try {
    const { client } = await connectToDatabase()
    await client.db('admin').command({ ping: 1 })
    return true
  } catch {
    return false
  }
}
