import dotenv from 'dotenv';
import { db } from '../data/dbStore.js';
import { seedDatabaseIfEmpty } from '../data/seedData.js';
import { initMongoConnection, isMongoConnected } from '../data/mongoBridge.js';

dotenv.config();

export const connectDB = async () => {
  try {
    // 1. Ensure local dataset is ready
    await seedDatabaseIfEmpty();

    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      // Connect to MongoDB asynchronously so server starts listening instantly
      (async () => {
        const connected = await initMongoConnection(mongoUri);
        if (!connected) {
          // If the issue is bad credentials, do not repeatedly bombard MongoDB Atlas with invalid auth attempts
          const { getLastErrorType } = await import('../data/mongoBridge.js');
          if (getLastErrorType() === 'AUTH_FAILED') {
            console.log('[MongoDB] Standing by on embedded storage. Update Database Access user credentials in Atlas or Admin panel when ready.');
            return;
          }

          // If network access / IP issue, retry a few times in background
          let attempts = 0;
          const maxAttempts = 6;
          const intervalId = setInterval(async () => {
            attempts++;
            if (isMongoConnected() || attempts >= maxAttempts) {
              clearInterval(intervalId);
              return;
            }
            const ok = await initMongoConnection(mongoUri);
            if (ok) {
              console.log('[MongoDB] Connected successfully! Data synchronized.');
              clearInterval(intervalId);
            }
          }, 30000);
        }
      })();
    } else {
      console.log('[Database] Using embedded JSON document storage (zero-configuration local database).');
    }

    console.log('[Database] Ready with full product catalog, categories, demo users, and orders.');
  } catch (error) {
    console.error('[Database] Initialization error:', error);
  }
};
