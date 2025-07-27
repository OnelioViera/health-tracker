import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_atlas_connection_string') {
  console.warn('MongoDB URI not configured. Using mock data for now.');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If MongoDB is not configured, return a mock connection
  if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_atlas_connection_string') {
    console.log('Using mock database connection');
    return { connection: { readyState: 1 } };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 