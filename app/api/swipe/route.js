import { load, save, publicProfile } from "@/lib/db";
export const dynamic = "force-dynamic";

// POST /api/swipe { profileId, action: "like" | "pass" } -> { match, profile? }
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const { profileId, action } = body || {};
  if (!["like", "pass"].includes(action)) return Response.json({ error: "action must be like or pass" }, { status: 400 });

  const db = load();
  const profile = db.profiles.find((p) => p.id === Number(profileId));
  if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

  // Idempotent: a repeated swipe never changes the outcome or re-triggers a match.
  if (db.swipes[profile.id]) return Response.json({ match: false, alreadySwiped: true });

  db.swipes[profile.id] = action;
  // Match only when the like is mutual. Reveal the profile only in that case.
  const match = action === "like" && profile.likesYou === true;
  if (match) db.matches.push({ profileId: profile.id, matchedAt: new Date().toISOString() });
  save(db);

  return Response.json(match ? { match: true, profile: publicProfile(profile) } : { match: false });
}
