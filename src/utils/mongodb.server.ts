import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

let cachedClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  // TEMPORARY: Disable all caching for testing
  // TODO: Re-enable caching for production
  const freshClient = new MongoClient(uri, {
    maxPoolSize: 1,
    minPoolSize: 0,
    maxIdleTimeMS: 1000,
  });
  await freshClient.connect();
  console.log('🔄 Fresh MongoDB connection (no cache)');
  return freshClient;
  
  // Original cached version (commented out):
  // if (cachedClient) {
  //   return cachedClient;
  // }
  // 
  // cachedClient = new MongoClient(uri);
  // await cachedClient.connect();
  // 
  // console.log('✅ Connected to MongoDB');
  // 
  // return cachedClient;
}

export async function closeMongoClient(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    console.log('❌ MongoDB connection closed');
  }
}

