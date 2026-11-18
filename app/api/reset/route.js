import { reset } from "@/lib/db";
export const dynamic = "force-dynamic";
// POST /api/reset -> demo helper, restores seed data.
export async function POST() { reset(); return Response.json({ ok: true }); }
