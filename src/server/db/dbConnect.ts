import mongoose, { Mongoose } from "mongoose";

export const DB_URL = process.env.MONGODB_URI;

if (!DB_URL) {
  throw new Error(
    "Please define the DB_URL environment variable inside .env*.local",
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(DB_URL, opts).then((mongoose) => {
      mongoose.set("debug", process.env.NODE_ENV === "development");

      // Define global mongoose getter to convert ObjectId to string
      mongoose.set('toObject', {
        transform: (doc, ret) => {
          if (ret._id && typeof ret._id === 'object' && ret._id.toString) {
            ret._id = ret._id.toString();
          }
          // Convert arrays of ObjectIds to arrays of strings
          for (const key in ret) {
            if (Array.isArray(ret[key]) && ret[key].length > 0 && ret[key][0] instanceof mongoose.Types.ObjectId) {
              ret[key] = ret[key].map((id: mongoose.Types.ObjectId) => id.toString());
            }
          }
          return ret;
        }
      });

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

export default dbConnect;
