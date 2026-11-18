import { load, publicProfile } from "@/lib/db";
export const dynamic = "force-dynamic";

// GET /api/matches -> mutual matches only, newest first.
export async function GET() {
  const db = load();
  const matches = [...db.matches].reverse().map((m) => ({
    matchedAt: m.matchedAt,
    profile: publicProfile(db.profiles.find((p) => p.id === m.profileId)),
  }));
  return Response.json({ matches });
}
