import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI?.replace(/\n/g, '') || '';

if (!MONGODB_URI) {
  console.warn('MongoDB URI not configured. Please set MONGODB_URI in your environment variables.');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If MongoDB is not configured, throw an error
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI not configured. Please set MONGODB_URI in your environment variables.');
  }

  // If we already have a connection and it's ready, return it
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // If we have a pending connection, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      // Double-check the connection is ready
      if (cached.conn.connection.readyState === 1) {
        return cached.conn;
      }
    } catch (e) {
      cached.promise = null;
      throw e;
    }
  }

  // Create new connection
  const opts = {
    bufferCommands: true,
  };

  console.log('Connecting to MongoDB...');
  
  cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
    console.log('MongoDB connected successfully');
    return mongoose;
  });

  try {
    cached.conn = await cached.promise;
    
    // Ensure the connection is fully established
    if (cached.conn.connection.readyState !== 1) {
      throw new Error('Failed to establish database connection');
    }
    
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }
}

export default connectDB; 