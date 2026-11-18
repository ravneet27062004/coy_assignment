"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const THRESHOLD = 110;

function Card({ p, onSwipe, apiRef }) {
  const el = useRef(null);
  const start = useRef(null);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const fling = useCallback((dir) => {
    if (leaving) return;
    setLeaving(true);
    setDx(dir * 700);
    setTimeout(() => onSwipe(dir > 0 ? "like" : "pass"), 260);
  }, [leaving, onSwipe]);

  useEffect(() => { apiRef.current = fling; }, [fling, apiRef]);

  const down = (e) => { if (!leaving) { start.current = e.clientX; el.current.setPointerCapture(e.pointerId); } };
  const move = (e) => { if (start.current !== null) setDx(e.clientX - start.current); };
  const up = () => {
    if (start.current === null) return;
    start.current = null;
    if (Math.abs(dx) > THRESHOLD) fling(dx > 0 ? 1 : -1); else setDx(0);
  };

  const dragging = start.current !== null;
  const style = {
    transform: `translateX(${dx}px) rotate(${dx / 18}deg)`,
    transition: dragging ? "none" : "transform .26s ease-out",
  };
  return (
    <div ref={el} className="card" style={style} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <img src={p.photo} alt={`${p.name}, ${p.age}`} draggable={false} />
      <div className="stamp l" style={{ opacity: Math.min(Math.max(dx / THRESHOLD, 0), 1) }}>LIKE</div>
      <div className="stamp p" style={{ opacity: Math.min(Math.max(-dx / THRESHOLD, 0), 1) }}>PASS</div>
      <div className="info">
        <h2>{p.name}, {p.age}</h2>
        <p>{p.place}</p>
        <p>{p.bio}</p>
        <div className="tags">{p.interests.map((i) => <span key={i}>{i}</span>)}</div>
      </div>
    </div>
  );
}

function Swipe({ onMatch }) {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState("");
  const flingRef = useRef(null);

  const load = useCallback(() => {
    setFeed(null);
    fetch("/api/feed").then((r) => r.json()).then((d) => setFeed(d.profiles)).catch(() => setError("Could not load profiles."));
  }, []);
  useEffect(load, [load]);

  const handleSwipe = async (action) => {
    const p = feed[0];
    setFeed((f) => f.slice(1)); // the card is gone; server also records it so it never returns
    try {
      const res = await fetch("/api/swipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId: p.id, action }) });
      const d = await res.json();
      if (d.match) onMatch(d.profile);
    } catch { setError("Swipe failed to save. Reload to retry."); }
  };

  if (error) return <div className="empty"><h2>Something broke</h2><p>{error}</p><button className="btn" onClick={() => { setError(""); load(); }}>Try again</button></div>;
  if (!feed) return <div className="empty"><p>Finding people near you…</p></div>;
  if (feed.length === 0) return (
    <div className="empty">
      <h2>You’re all caught up</h2>
      <p>No new profiles right now. Check your matches, or come back later.</p>
      <button className="btn" onClick={load}>Refresh</button>
    </div>
  );
  return (
    <>
      <div className="stage">
        {feed[1] && <div className="card back"><img src={feed[1].photo} alt="" /></div>}
        <Card key={feed[0].id} p={feed[0]} onSwipe={handleSwipe} apiRef={flingRef} />
      </div>
      <div className="actions">
        <button className="round" aria-label="Pass" onClick={() => flingRef.current?.(-1)}>✕</button>
        <button className="round like" aria-label="Like" onClick={() => flingRef.current?.(1)}>♥</button>
      </div>
    </>
  );
}

function Matches({ refreshKey }) {
  const [matches, setMatches] = useState(null);
  useEffect(() => { fetch("/api/matches").then((r) => r.json()).then((d) => setMatches(d.matches)); }, [refreshKey]);
  if (!matches) return <div className="empty"><p>Loading…</p></div>;
  if (!matches.length) return <div className="empty"><h2>No matches yet</h2><p>When you and someone else both like each other, they show up here.</p></div>;
  return (
    <div className="grid">
      {matches.map(({ profile: p }) => (
        <div className="mcard" key={p.id}>
          <img src={p.photo} alt={p.name} />
          <div><b>{p.name}, {p.age}</b><small>{p.place}</small></div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("discover");
  const [view, setView] = useState("swipe");
  const [matched, setMatched] = useState(null);
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo" aria-label="coy">coy<i className="dot" /></span>
        <button className="gear" aria-label="Settings">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </header>
      <main className="screen">
        {tab === "home" ? null : (
          <>
            <div className="sub">
              <button aria-pressed={view === "swipe"} onClick={() => setView("swipe")}>Swipe</button>
              <button aria-pressed={view === "matches"} onClick={() => setView("matches")}>Matches</button>
            </div>
            {view === "swipe" ? <Swipe onMatch={(p) => { setMatched(p); setCount((c) => c + 1); }} /> : <Matches refreshKey={count} />}
          </>
        )}
      </main>
      <nav className="tabbar" role="tablist">
        <button role="tab" aria-selected={tab === "home"} onClick={() => setTab("home")}>Home</button>
        <button role="tab" aria-selected={tab === "discover"} onClick={() => setTab("discover")}>Discover</button>
      </nav>
      {matched && (
        <div className="overlay" role="dialog" aria-label="It’s a match">
          <h1>It’s a match!</h1>
          <img src={matched.photo} alt={matched.name} />
          <p>You and {matched.name} liked each other.</p>
          <button className="btn" style={{ background: "#fff", color: "#1d1440" }} onClick={() => { setMatched(null); setView("matches"); }}>See matches</button>
          <button className="btn" onClick={() => setMatched(null)}>Keep swiping</button>
        </div>
      )}
    </div>
  );
}
