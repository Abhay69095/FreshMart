import mongoose, { Schema } from 'mongoose';
import { db } from './dbStore.js';

// Schemas with flexible options allowing both custom fields and _id as string
const GenericSchema = new Schema(
  {
    _id: { type: String, required: true },
  },
  { strict: false, timestamps: true, versionKey: false }
);

export const MongoModels = {
  users: mongoose.models.User || mongoose.model('User', GenericSchema, 'users'),
  products: mongoose.models.Product || mongoose.model('Product', GenericSchema, 'products'),
  categories: mongoose.models.Category || mongoose.model('Category', GenericSchema, 'categories'),
  orders: mongoose.models.Order || mongoose.model('Order', GenericSchema, 'orders'),
  stores: mongoose.models.Store || mongoose.model('Store', GenericSchema, 'stores'),
  reviews: mongoose.models.Review || mongoose.model('Review', GenericSchema, 'reviews'),
};

let isConnected = false;
let isSyncing = false;
let lastError: string | null = null;
let lastErrorType: 'AUTH_FAILED' | 'IP_NOT_WHITELISTED' | 'OTHER' | null = null;

export const isMongoConnected = () => isConnected;
export const getLastError = () => lastError;
export const getLastErrorType = () => lastErrorType;

export function getMongoDbUsername(): string {
  try {
    const uri = process.env.MONGODB_URI || '';
    const match = uri.match(/mongodb(?:\+srv)?:\/\/([^:]+):/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

/**
 * Initialize MongoDB connection and auto-seed if empty
 */
export async function initMongoConnection(uri: string): Promise<boolean> {
  try {
    const maskedUri = uri.replace(/:([^:@]{3})[^:@]*@/, ':***@');
    console.log(`[MongoDB] Checking connection to Atlas cluster (${maskedUri})...`);

    await mongoose.connect(uri, {
      dbName: 'freshmart',
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    lastError = null;
    lastErrorType = null;
    console.log('[MongoDB] Successfully connected to MongoDB Atlas (database: "freshmart").');

    // Automatically sync initial seed data to MongoDB if MongoDB is empty
    await syncToMongoDBIfEmpty();

    return true;
  } catch (error: any) {
    isConnected = false;
    lastError = error.message;

    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      lastErrorType = 'AUTH_FAILED';
      const username = getMongoDbUsername();
      console.log(`[MongoDB] Notice: Authentication failed for user "${username}". Verify the database user credentials in MongoDB Atlas under Security -> Database Access. Using embedded local document store.`);
    } else if (error.message.includes('whitelisted') || error.message.includes('Could not connect to any servers')) {
      lastErrorType = 'IP_NOT_WHITELISTED';
      console.log('[MongoDB] Notice: Connection blocked by IP whitelist. Add 0.0.0.0/0 under MongoDB Atlas -> Security -> Network Access. Using embedded local document store.');
    } else {
      lastErrorType = 'OTHER';
      console.log('[MongoDB] Notice: Atlas connection inactive (' + error.message + '). Using embedded local document store.');
    }
    return false;
  }
}

/**
 * Check if MongoDB collections are empty, and if so, push all data from the local store
 */
export async function syncToMongoDBIfEmpty() {
  if (!isConnected || isSyncing) return;
  isSyncing = true;

  try {
    const collections = ['users', 'products', 'categories', 'orders', 'stores', 'reviews'] as const;

    for (const collName of collections) {
      const Model = MongoModels[collName];
      const count = await Model.countDocuments();

      if (count === 0) {
        const localItems = db.getCollection(collName);
        if (localItems && localItems.length > 0) {
          console.log(`[MongoDB] Migrating ${localItems.length} items to MongoDB collection "${collName}"...`);
          await Model.insertMany(localItems, { ordered: false });
          console.log(`[MongoDB] ✅ Migrated "${collName}" successfully to MongoDB Atlas.`);
        }
      } else {
        // If MongoDB already has data, load any newer records into dbStore so they stay synchronized
        const mongoItems = await Model.find({}).lean();
        if (mongoItems && mongoItems.length > 0) {
          const localItems = db.getCollection(collName);
          if (localItems.length === 0 || mongoItems.length > localItems.length) {
            console.log(`[MongoDB] Synced ${mongoItems.length} items from MongoDB collection "${collName}" into local cache.`);
            // Update local memory
            (db as any).data[collName] = mongoItems;
            db.save();
          }
        }
      }
    }
  } catch (err: any) {
    console.error('[MongoDB] Error during initial synchronization:', err.message);
  } finally {
    isSyncing = false;
  }
}

/**
 * Synchronize a single create/update operation to MongoDB in real-time
 */
export async function syncUpsertToMongo(collectionName: keyof typeof MongoModels, doc: any) {
  if (!isConnected || !doc || !doc._id) return;
  try {
    const Model = MongoModels[collectionName];
    if (!Model) return;
    await Model.findByIdAndUpdate(doc._id, doc, { upsert: true, new: true });
  } catch (err: any) {
    console.error(`[MongoDB] Error syncing upsert to "${collectionName}":`, err.message);
  }
}

/**
 * Synchronize a delete operation to MongoDB in real-time
 */
export async function syncDeleteToMongo(collectionName: keyof typeof MongoModels, id: string) {
  if (!isConnected || !id) return;
  try {
    const Model = MongoModels[collectionName];
    if (!Model) return;
    await Model.findByIdAndDelete(id);
  } catch (err: any) {
    console.error(`[MongoDB] Error syncing delete to "${collectionName}":`, err.message);
  }
}

/**
 * Force-sync all data from local JSON database into MongoDB Atlas immediately
 */
export async function forcePushLocalToMongoDB(): Promise<{ success: boolean; message: string; counts: Record<string, number> }> {
  if (!isConnected && process.env.MONGODB_URI) {
    await initMongoConnection(process.env.MONGODB_URI);
  }

  if (!isConnected) {
    if (lastErrorType === 'AUTH_FAILED') {
      const username = getMongoDbUsername();
      return {
        success: false,
        message: `MongoDB Atlas Authentication Failed: Username "${username}" or password does not match in your Atlas cluster. Please go to MongoDB Atlas -> Security -> Database Access and verify or reset the user password.`,
        counts: {}
      };
    }
    return {
      success: false,
      message: 'MongoDB is not currently connected. Please ensure MongoDB Atlas IP whitelist is set to 0.0.0.0/0 under Security -> Network Access.',
      counts: {}
    };
  }

  const collections = ['users', 'products', 'categories', 'orders', 'stores', 'reviews'] as const;
  const counts: Record<string, number> = {};

  for (const collName of collections) {
    const Model = MongoModels[collName];
    const localItems = db.getCollection(collName);
    
    // Bulk upsert each record
    for (const item of localItems) {
      await Model.findByIdAndUpdate(item._id, item, { upsert: true });
    }
    counts[collName] = await Model.countDocuments();
  }

  return {
    success: true,
    message: 'All collections successfully synchronized to MongoDB Atlas database "freshmart".',
    counts
  };
}
