import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { insightCommentsCol, type CommentStatus } from "@/lib/insight-collections";
import { checkAdminSecret, verifyCommentToken } from "@/lib/admin-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

type Action = "approve" | "spam";

export async function POST(req: NextRequest) {
  let body: { id?: string; token?: string; secret?: string; action?: Action } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const id = String(body.id || "").trim();
  const token = String(body.token || "").trim();
  const secret = String(body.secret || "");
  const action: Action = body.action === "spam" ? "spam" : "approve";

  if (!id || !token || !secret) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const v = verifyCommentToken(token);
  if (!v.ok || v.commentId !== id) {
    return NextResponse.json({ ok: false, error: "bad_token" }, { status: 401 });
  }

  if (!checkAdminSecret(secret)) {
    return NextResponse.json({ ok: false, error: "bad_secret" }, { status: 401 });
  }

  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_id" }, { status: 400 });
  }

  try {
    const col = await insightCommentsCol();
    if (!col) {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 200 });
    }
    const newStatus: CommentStatus = action === "approve" ? "approved" : "spam";
    const set: Record<string, unknown> = { status: newStatus };
    if (newStatus === "approved") set.approvedAt = new Date();
    const result = await col.findOneAndUpdate({ _id: oid }, { $set: set }, { returnDocument: "after" });
    if (!result) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    try {
      revalidatePath(`/insights/${result.slug}`);
    } catch {}

    return NextResponse.json({ ok: true, status: newStatus, slug: result.slug });
  } catch (err) {
    const e = err as Error;
    console.error("[admin/approve] failed:", e?.message);
    return NextResponse.json({ ok: false, error: "approve_failed", message: e?.message }, { status: 200 });
  }
}
