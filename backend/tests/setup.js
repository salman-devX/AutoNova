import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let replSet;

/**
 * Appointment/inventory/invoice logic relies on multi-document transactions,
 * which require a replica set (a lone standalone mongod will reject
 * `session.withTransaction`). MongoMemoryReplSet spins up a real single-node
 * replica set for tests, so this suite exercises the exact same code path
 * that runs against MongoDB Atlas in production.
 */
export async function setupTestDB() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
}

export async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await replSet.stop();
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
