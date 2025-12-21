import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('Please add MONGODB_URI to environment variables');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Reuse client in development (hot reload safe)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
