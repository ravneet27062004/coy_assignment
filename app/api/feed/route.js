import { load, publicProfile } from "@/lib/db";
export const dynamic = "force-dynamic";

// GET /api/feed -> profiles not yet swiped on. `likesYou` is never exposed.
export async function GET() {
  const db = load();
  const feed = db.profiles.filter((p) => !db.swipes[p.id]).map(publicProfile);
  return Response.json({ profiles: feed });
}
