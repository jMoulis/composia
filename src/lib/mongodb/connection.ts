// lib/mongodb.ts
import { MongoClient, Db } from "mongodb";

declare global {
  // Prevent multiple instances in development
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In dev mode, use a global variable to preserve the client across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In prod, always create a new client
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

// Optionnel : accès direct à la base principale
const dbName = process.env.MONGODB_DB || "mydatabase";
export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}
