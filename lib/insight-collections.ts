import { Collection, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type CommentStatus = "pending" | "approved" | "spam";

export type InsightCommentDoc = {
  _id?: ObjectId;
  slug: string;
  name: string;
  email: string;
  body: string;
  status: CommentStatus;
  createdAt: Date;
  approvedAt?: Date;
  ipHash: string;
  ip: string;
  ua: string;
  geo: {
    country: string;
    region: string;
    city: string;
    lat: string;
    lon: string;
    isp: string;
  };
  sessionId?: string;
  eventsCount?: number;
};

export type InsightStatDoc = {
  _id?: ObjectId;
  slug: string;
  supports: number;
  views: number;
};

export type InsightPollVoteDoc = {
  _id?: ObjectId;
  slug: string;
  pollId: string;
  optionKey: string;
  count: number;
};

export async function insightCommentsCol(): Promise<Collection<InsightCommentDoc> | null> {
  const db = await getDb();
  return db ? db.collection<InsightCommentDoc>("insight_comments") : null;
}

export async function insightStatsCol(): Promise<Collection<InsightStatDoc> | null> {
  const db = await getDb();
  return db ? db.collection<InsightStatDoc>("insight_stats") : null;
}

export async function insightPollsCol(): Promise<Collection<InsightPollVoteDoc> | null> {
  const db = await getDb();
  return db ? db.collection<InsightPollVoteDoc>("insight_polls") : null;
}

let insightIndexesEnsured = false;
export async function ensureInsightIndexes(): Promise<void> {
  if (insightIndexesEnsured) return;
  const db = await getDb();
  if (!db) return;
  await db.collection("insight_comments").createIndex({ slug: 1, status: 1, createdAt: -1 });
  await db.collection("insight_comments").createIndex({ email: 1 });
  await db.collection("insight_comments").createIndex({ ipHash: 1, createdAt: -1 });
  await db.collection("insight_stats").createIndex({ slug: 1 }, { unique: true });
  await db.collection("insight_polls").createIndex({ slug: 1, pollId: 1, optionKey: 1 }, { unique: true });
  insightIndexesEnsured = true;
}
