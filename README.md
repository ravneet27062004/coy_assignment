# Coy Discover

Swipe-based "Discover" tab built with Next.js (App Router) + JSON-file persistence.

## Run
```bash
npm install
npm run dev   # http://localhost:3000
```
Open in a mobile viewport (DevTools device mode) to drag cards; use the ✕ / ♥ buttons on desktop.
`POST /api/reset` restores the seed data for a fresh demo.

## API
| Route | Description |
|---|---|
| `GET /api/feed` | Profiles not yet swiped on (never includes who liked you) |
| `POST /api/swipe` `{profileId, action: "like"\|"pass"}` | Records swipe -> `{match, profile?}` |
| `GET /api/matches` | Mutual matches only |

## Design decisions (privacy first)
- `likesYou` lives only on the server and is stripped by `publicProfile()` before any response.
- A profile is revealed as a liker only through a mutual match (`POST /swipe` response or `GET /matches`).
- Seed order is shuffled once, so profiles that liked you are not clustered at the top of the feed (order cannot leak likes).
- Swipes are idempotent: a repeated swipe cannot change a pass into a like or re-trigger a match.
- Swiped profiles are filtered server-side, so they never reappear, even after reload.
- Demo: ~10 of 36 profiles have already liked you, so matches happen quickly.

## Tradeoffs / next steps
JSON file is fine for a demo (single user, sync writes); production would use Postgres with a `swipes(user_id, target_id, action)` unique constraint and a transaction for match creation, plus auth, rate limiting and undo.
