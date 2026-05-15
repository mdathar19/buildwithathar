import { MongoClient, Db, Collection } from "mongodb";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "buildwithathar";

let clientPromise: Promise<MongoClient> | null = null;

export function getMongoPromise(): Promise<MongoClient> | null {
  if (!uri) return null;
  if (global.__mongoClientPromise) return global.__mongoClientPromise;
  if (!clientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    clientPromise = client.connect();
    if (process.env.NODE_ENV !== "production") {
      global.__mongoClientPromise = clientPromise;
    }
  }
  return clientPromise;
}

export async function getDb(): Promise<Db | null> {
  const p = getMongoPromise();
  if (!p) return null;
  const client = await p;
  return client.db(dbName);
}

export type SessionDoc = {
  sessionId: string;
  startedAt: Date;
  endedAt?: Date;
  emailSentAt?: Date;
  durationMs?: number;
  ip: string;
  ua: string;
  geo: {
    country: string;
    region: string;
    city: string;
    postal: string;
    lat: string;
    lon: string;
    timezone: string;
    isp: string;
    asn: string;
  };
  entryPath: string;
  referer: string;
  screen: string;
  eventCount: number;
  isBot: boolean;
};

export type EventDoc = {
  sessionId: string;
  ts: Date;
  type: string;
  target?: string;
  label?: string;
  path?: string;
  meta?: Record<string, unknown>;
};

export async function sessionsCol(): Promise<Collection<SessionDoc> | null> {
  const db = await getDb();
  return db ? db.collection<SessionDoc>("sessions") : null;
}

export async function eventsCol(): Promise<Collection<EventDoc> | null> {
  const db = await getDb();
  return db ? db.collection<EventDoc>("events") : null;
}

let indexesEnsured = false;
export async function ensureIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const db = await getDb();
  if (!db) return;
  await db.collection("sessions").createIndex({ sessionId: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ startedAt: -1 });
  await db.collection("sessions").createIndex({ isBot: 1 });
  await db.collection("events").createIndex({ sessionId: 1, ts: 1 });
  await db.collection("events").createIndex({ ts: -1 });
  indexesEnsured = true;
}
