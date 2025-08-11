import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, X, MessageSquarePlus } from "lucide-react";

// ---- FIREBASE CONFIG (yours) -------------------------------------------------
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

function useKudos(limit = 150) {
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

// ---- BRAND -------------------------------------------------------------------
const BRAND = {
  name: "Rove Kudos",
  primary: "#39C3C9",
  grey: "#E6E9EC",
  light: "#F9FBFC",
  accent: "#FFE574"
};

function WallCard({ k }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: 20, borderRadius: 16, border: `1px solid ${BRAND.grey}`, background: "white" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ height: 28, width: 28, borderRadius: 10, background: BRAND.accent }} />
        <div style={{ fontWeight: 600 }}>{k.name || "Anon RoveStar"}</div>
        {k.team && <div style={{ fontSize: 12, color: "#64748b" }}>• {k.team}</div>}
      </div>
      <div style={{ color: "#0f172a", fontSize: 18, lineHeight: 1.35 }}>{k.message}</div>
    </motion.div>
  );
}

function SendModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);

  async function onSend(e) {
    e?.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await addKudo({ name, team, message });
      setOk(true);
      setMessage("");
      setTimeout(() => { setOk(false); onClose(); }, 1000);
    } catch (e) {
      alert("Could not send. Try again.");
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth: 560, background: "white", borderRadius: 20, padding: 20, border: `1px solid ${BRAND.grey}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 28, width: 28, borderRadius: 10, background: BRAND.primary }} />
            <div style={{ fontWeight: 700 }}>Send a Kudos</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSend} style={{ display: "grid", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 12, padding: "12px 14px" }}
          />
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Team / Department (optional)"
            style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 12, padding: "12px 14px" }}
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your appreciation… (max 300 chars)"
            rows={4}
            maxLength={300}
            style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 12, padding: "12px 14px" }}
          />
          <button
            disabled={sending || !message.trim()}
            style={{ borderRadius: 14, padding: "12px 16px", color: "white", background: BRAND.primary, border: "none", fontWeight: 600 }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Send size={16}/> {sending ? "Sending…" : "Send to Wall"}</span>
          </button>
          {ok && <div style={{ color: "#047857", fontSize: 13 }}>Sent! Your message will show on the wall.</div>}
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const items = useKudos(150);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: BRAND.light }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(6px)", background: "rgba(255,255,255,0.7)", borderBottom: `1px solid ${BRAND.grey}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 32, width: 32, borderRadius: 12, background: BRAND.primary }} />
            <h1 style={{ margin: 0, fontWeight: 600 }}>{BRAND.name} – Live Wall</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <Sparkles color={BRAND.primary} size={16}/> Real-time updates
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

      {/* Floating action button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", right: 20, bottom: 20, zIndex: 50,
          background: BRAND.primary, border: "none", color: "white",
          borderRadius: 9999, padding: "14px 18px", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, boxShadow: "0 10px 24px rgba(57,195,201,0.35)",
          cursor: "pointer"
        }}
      >
        <MessageSquarePlus size={18}/> Send a Kudos
      </button>

      <SendModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
