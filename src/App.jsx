import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, PartyPopper, Sparkles } from "lucide-react";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDTK-DcGqXM1aall7n75suzk_uTCcHIQc",
  authDomain: "rove-kudos.firebaseapp.com",
  projectId: "rove-kudos",
  storageBucket: "rove-kudos.firebasestorage.app",
  messagingSenderId: "711748176095",
  appId: "1:711748176095:web:0a4f52a178e9478fbd816a"
};

let _fb;
let _fs;
async function ensureFirebase() {
  if (_fb && _fs) return { firebase: _fb, db: _fs };
  const { initializeApp } = await import("firebase/app");
  const { getFirestore } = await import("firebase/firestore");
  const app = initializeApp(FIREBASE_CONFIG);
  const db = getFirestore(app);
  _fb = app; _fs = db;
  return { firebase: app, db };
}

async function addKudo({ name, message, team }) {
  const { db } = await ensureFirebase();
  const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
  return addDoc(collection(db, "kudos"), {
    name: name?.trim() || "Anon RoveStar",
    message: message.trim(),
    team: team?.trim() || null,
    createdAt: serverTimestamp()
  });
}

function useKudos(limit = 200) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const { db } = await ensureFirebase();
      const { collection, onSnapshot, orderBy, limit: lim, query } = await import("firebase/firestore");
      const q = query(collection(db, "kudos"), orderBy("createdAt", "desc"), lim(limit));
      unsub = onSnapshot(q, (snap) => {
        const out = [];
        snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
        setItems(out);
      });
    })();
    return () => unsub();
  }, [limit]);
  return items;
}

const BRAND = {
  name: "Rove Kudos",
  primary: "#39C3C9",
  grey: "#E6E9EC",
  light: "#F9FBFC",
  accent: "#FFE574"
};

const brandShadow = (c) => ({ boxShadow: `0 10px 30px -12px ${c}66` });

function SubmitPage() {
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSend(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await addKudo({ name, team, message });
      setDone(true);
      setMessage("");
    } catch (err) {
      alert("Could not send. Please try again.");
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: BRAND.light, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 640, background: "white", borderRadius: 24, padding: 24, border: `1px solid ${BRAND.grey}`, ...brandShadow(BRAND.primary) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ height: 40, width: 40, borderRadius: 16, background: BRAND.primary }} />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{BRAND.name} – Share Appreciation</h1>
        </div>
        <p style={{ color: "#475569", fontSize: 14, marginTop: 0, marginBottom: 16 }}>Your message will appear on the live wall instantly ✨</p>

        <form onSubmit={onSend} style={{ display: "grid", gap: 12 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 12, padding: "12px 16px", outline: "none" }} />
          <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Team / Department (optional)" style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 12, padding: "12px 16px", outline: "none" }} />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your appreciation…" rows={4} maxLength={300} style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 12, padding: "12px 16px", outline: "none" }} />
          <button disabled={sending || !message.trim()} style={{ borderRadius: 16, padding: "12px 16px", color: "white", background: BRAND.primary, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 600 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Send size={16}/> {sending ? "Sending…" : "Send to Wall"}</span>
          </button>
        </form>

        {done && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, color: "#047857" }}>
            <PartyPopper size={16}/> Thanks! It should show up on the screen now.
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 12, color: "#64748b" }}>
          Tip: save this link as a QR code so colleagues can open it quickly.
        </div>
      </div>
    </div>
  );
}

function WallCard({ k }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 20, borderRadius: 16, border: `1px solid ${BRAND.grey}`, background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ height: 32, width: 32, borderRadius: 12, background: BRAND.accent }} />
        <div style={{ fontWeight: 600 }}>{k.name || "Anon RoveStar"}</div>
        {k.team && <div style={{ fontSize: 12, color: "#64748b" }}>• {k.team}</div>}
      </div>
      <div style={{ color: "#0f172a", fontSize: 18 }}>{k.message}</div>
    </motion.div>
  );
}

function Confetti({ triggerKey }) {
  const [bursts, setBursts] = useState([]);
  useEffect(() => {
    if (!triggerKey) return;
    const id = Math.random().toString(36).slice(2);
    setBursts((b) => [...b, id]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1500);
    return () => clearTimeout(t);
  }, [triggerKey]);
  return (
    <div style={{ pointerEvents: "none", position: "fixed", inset: 0, overflow: "hidden" }}>
      {bursts.map((id) => (
        <motion.div key={id} initial={{ y: 0, opacity: 1 }} animate={{ y: -200, opacity: 0 }} transition={{ duration: 1.4 }} style={{ position: "absolute", left: "50%", top: "50%", fontSize: 32 }}>
          🎉
        </motion.div>
      ))}
    </div>
  );
}

function WallPage() {
  const items = useKudos(150);
  const newestKey = items[0]?.id;

  return (
    <div style={{ minHeight: "100vh", background: BRAND.light }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(6px)", background: "rgba(255,255,255,0.7)", borderBottom: `1px solid ${BRAND.grey}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 32, width: 32, borderRadius: 12, background: BRAND.primary }} />
            <h1 style={{ margin: 0, fontWeight: 600 }}>{BRAND.name} – Live Wall</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <Sparkles color={BRAND.primary} size={16}/> Real‑time updates
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {items.map((k) => (
            <WallCard key={k.id} k={k} />
          ))}
        </div>
      </main>

      <Confetti triggerKey={newestKey} />

      <footer style={{ padding: 16, textAlign: "center", fontSize: 12, color: "#64748b" }}>
        Scan QR to post: your-domain/submit • Display this page: your-domain/wall
      </footer>
    </div>
  );
}

function usePath() {
  const [p, setP] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setP(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return p.replace(/\/$/, "");
}

export default function App() {
  const path = usePath();
  if (path === "/submit") return <SubmitPage/>;
  return <WallPage/>;
}
