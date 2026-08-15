import mongoose from 'mongoose';

let isConnected = false;

/**
 * Attempts to connect to MongoDB using Mongoose.
 * Falls back gracefully to local file storage if connection fails or is missing.
 */
export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/excel_analytics';
  
  console.log('Database connector: Attempting to connect to MongoDB...');
  try {
    // Set a short connection timeout so the server start isn't delayed if MongoDB is not installed
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000, 
    });
    isConnected = true;
    console.log(`[DATABASE] Successfully connected to MongoDB: ${mongoURI}`);
    return true;
  } catch (error) {
    console.warn(`\n[DATABASE WARNING] Could not connect to MongoDB server.`);
    console.warn(`Reason: ${error.message}`);
    console.warn(`[FALLBACK ACTIVATED] Falling back to file-based JSON storage (server/data/local_db.json).\n`);
    isConnected = false;
    return false;
  }
}

/**
 * Returns connection state.
 */
export function isMongoConnected() {
  return isConnected;
}
