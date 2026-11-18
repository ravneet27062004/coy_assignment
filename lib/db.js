import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "db.json");
const NAMES = ["Aanya","Kabir","Meera","Rohan","Isha","Arjun","Naina","Vihaan","Diya","Aditya","Tara","Reyansh","Anika","Kian","Saanvi","Dev","Riya","Ishaan","Myra","Neil","Kiara","Samar","Zoya","Yash","Pooja","Rahul","Sneha","Aarav","Tanya","Veer","Ritika","Karan","Aisha","Manav","Simran","Parth"];
const PLACES = ["Delhi University","IIT Delhi","Rohtak","Gurugram","Ashoka University","Chandigarh","Jaipur","BITS Pilani","Pune","Bengaluru","Mumbai","Christ University"];
const BIOS = ["Chai over coffee, always.","Will beat you at Mario Kart.","Weekend trekker, weekday overthinker.","Looking for someone to split fries with.","Plant parent of 12 (survivors: 4).","Film nerd. Ask me about Satyajit Ray.","Cricket on the terrace, music on loop.","Professional napper, amateur cook.","Ask me about my playlist.","Bad at texting, great in person."];
const INTERESTS = ["Music","Travel","Football","Cricket","Movies","Gaming","Reading","Cooking","Photography","Trekking","Dance","Coding","Art","Fitness","Anime","Podcasts"];

// Deterministic PRNG so seed data is reproducible.
function rng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }

function seed() {
  const r = rng(42);
  const pick = (a) => a[Math.floor(r() * a.length)];
  let profiles = NAMES.map((name, i) => ({
    id: i + 1,
    name,
    age: 19 + Math.floor(r() * 10),
    photo: `https://picsum.photos/seed/coy${i + 1}/600/800`,
    bio: pick(BIOS),
    place: pick(PLACES),
    interests: [...INTERESTS].sort(() => r() - 0.5).slice(0, 3 + Math.floor(r() * 2)),
    // PRIVATE: never leaves the server unless a match happens.
    likesYou: i < 10,
  }));
  // Shuffle once so profiles that like you are NOT clustered at the top of the feed
  // (feed order must not leak who liked you).
  profiles = profiles.map((p) => [r(), p]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  return { profiles, swipes: {}, matches: [] };
}

export function load() {
  if (!fs.existsSync(FILE)) save(seed());
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
export function save(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}
export function reset() { const d = seed(); save(d); return d; }

// Strip private fields before anything is sent to the client.
export function publicProfile({ likesYou, ...rest }) { return rest; }
