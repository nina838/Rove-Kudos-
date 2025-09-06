import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, X, MessageSquarePlus } from "lucide-react";

// ---- FIREBASE CONFIG -------------------------------------------------
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

// ---- TIME HELPERS (Asia/Dubai) ----------------------------------------------
function nowDubai() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  }).formatToParts(now).reduce((acc, p) => (acc[p.type] = p.value, acc), {});
  const [d, m, y] = [parts.day, parts.month, parts.year].map(x => parseInt(x, 10));
  const [hh, mm, ss] = [parts.hour, parts.minute, parts.second].map(x => parseInt(x, 10));
  return { y, m, d, hh, mm, ss };
}
function dateKeyDubai() {
  const { y, m, d } = nowDubai();
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}
function isOpenNowDubai() {
  const { hh } = nowDubai();
  return hh >= 9 && hh < 21;
}

// ---- FIRESTORE OPS -----------------------------------------------------------
async function addKudo({ name, message, team }) {
  if (!isOpenNowDubai()) {
    const err = new Error("Kudos Wall is closed now. Please come back between 09:00–21:00 (Dubai).");
    err.code = "WALL_CLOSED";
    throw err;
  }
  const { db } = await ensureFirebase();
  const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
  return addDoc(collection(db, "kudos"), {
    name: name?.trim() || "Anon RoveStar",
    message: message.trim(),
    team: team?.trim() || null,
    createdAt: serverTimestamp()
  });
}

async function archiveAndClearKudosOncePerDay() {
  const already = localStorage.getItem("kudos_last_reset_date");
  const todayKey = dateKeyDubai();
  if (already === todayKey) return;

  const { db } = await ensureFirebase();
  const { collection, getDocs, writeBatch, doc, serverTimestamp } = await import("firebase/firestore");

  const srcCol = collection(db, "kudos");
  const snap = await getDocs(srcCol);
  if (snap.empty) {
    localStorage.setItem("kudos_last_reset_date", todayKey);
    return;
  }

  const docs = [];
  snap.forEach(d => docs.push({ id: d.id, data: d.data() }));

  const chunkSize = 400;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(({ id, data }) => {
      const archiveDoc = doc(db, `kudos_archive/${todayKey}/items/${id}`);
      batch.set(archiveDoc, { ...data, archivedAt: serverTimestamp(), archivedDateKey: todayKey });
      batch.delete(doc(db, "kudos", id));
    });
    await batch.commit();
  }
  localStorage.setItem("kudos_last_reset_date", todayKey);
}

async function loadArchive(dateKey) {
  const { db } = await ensureFirebase();
  const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
  const col = collection(db, `kudos_archive/${dateKey}/items`);
  try {
    const q = query(col, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const out = [];
    snap.forEach(d => out.push({ id: d.id, ...d.data() }));
    return out;
  } catch {
    const snap = await getDocs(col);
    const out = [];
    snap.forEach(d => out.push({ id: d.id, ...d.data() }));
    out.sort((a, b) => (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0));
    return out;
  }
}

// --- ADMIN one-click clear helpers (always available) ---
async function clearKudosNowNoArchive() {
  const { db } = await ensureFirebase();
  const { collection, getDocs, writeBatch, doc } = await import("firebase/firestore");
  const snap = await getDocs(collection(db, "kudos"));
  const ids = [];
  snap.forEach(d => ids.push(d.id));
  for (let i = 0; i < ids.length; i += 400) {
    const batch = writeBatch(db);
    ids.slice(i, i + 400).forEach(id => batch.delete(doc(db, "kudos", id)));
    await batch.commit();
  }
  alert("Cleared live kudos (no archive).");
}

async function archiveAndClearKudosNow() {
  const todayKey = dateKeyDubai();
  const { db } = await ensureFirebase();
  const { collection, getDocs, writeBatch, doc, serverTimestamp } = await import("firebase/firestore");
  const snap = await getDocs(collection(db, "kudos"));
  const docs = [];
  snap.forEach(d => docs.push({ id: d.id, data: d.data() }));
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    docs.slice(i, i + 400).forEach(({ id, data }) => {
      batch.set(doc(db, `kudos_archive/${todayKey}/items/${id}`), {
        ...data, archivedAt: serverTimestamp(), archivedDateKey: todayKey
      });
      batch.delete(doc(db, "kudos", id));
    });
    await batch.commit();
  }
  alert(`Archived ${docs.length} and cleared live kudos.`);
}

// ---- BRAND -------------------------------------------------------------------
const BRAND = { name: "Rove Kudos", primary: "#39C3C9", grey: "#E6E9EC", light: "#F9FBFC", accent: "#FFE574" };

// ---- UI ----------------------------------------------------------------------
function WallCard({ k }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: 20, borderRadius: 16, border: `1px solid ${BRAND.grey}`, background: "white" }}>
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

  const openNow = isOpenNowDubai();

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
      if (e?.code === "WALL_CLOSED") {
        alert("Kudos Wall is closed now. Please come back between 09:00–21:00 (Dubai).");
      } else {
        alert("Could not send. Try again.");
        console.error(e);
      }
    } finally { setSending(false); }
  }

  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 16 }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
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

        {!openNow && (
          <div style={{ background: "#FFF5F5", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 12, padding: "10px 12px", fontSize: 14, marginBottom: 10 }}>
            Kudos Wall is closed now. Posting hours are <strong>09:00–21:00</strong> (Asia/Dubai).
          </div>
        )}

        <form onSubmit={onSend} style={{ display: "grid", gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)"
                 style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 12, padding: "12px 14px" }} disabled={!openNow}/>
          <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Team / Department (optional)"
                 style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 12, padding: "12px 14px" }} disabled={!openNow}/>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your appreciation… (max 300 chars)"
                    rows={4} maxLength={300} style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 12, padding: "12px 14px" }} disabled={!openNow}/>
          <button type="submit" disabled={sending || !message.trim() || !openNow}
                  style={{ borderRadius: 14, padding: "12px 16px", color: "white", background: BRAND.primary, border: "none", fontWeight: 600, opacity: (!openNow || sending) ? 0.7 : 1 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Send size={16}/> {sending ? "Sending…" : (openNow ? "Send to Wall" : "Closed")}
            </span>
          </button>
          {ok && <div style={{ color: "#047857", fontSize: 13 }}>Sent! Your message will show on the wall.</div>}
        </form>
      </div>
    </div>
  );
}

// ---- Archive Modal -----------------------------------------------------------
function ArchiveModal({ open, onClose }) {
  const [dateKey, setDateKey] = useState(dateKeyDubai());
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [loadedKey, setLoadedKey] = useState("");

  async function fetchArchive(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await loadArchive(dateKey);
      setItems(data);
      setLoadedKey(dateKey);
    } catch (err) {
      alert("Could not load archive for that date.");
      console.error(err);
      setItems([]);
      setLoadedKey(dateKey);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) fetchArchive();
  }, [open]);

  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 16 }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 900, background: "white", borderRadius: 20, padding: 20, border: `1px solid ${BRAND.grey}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 28, width: 28, borderRadius: 10, background: BRAND.primary }} />
            <div style={{ fontWeight: 700 }}>Archive Viewer</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={fetchArchive} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <label style={{ fontSize: 14, color: "#334155" }}>Pick a date:</label>
          <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)}
                 style={{ border: `1px solid ${BRAND.grey}`, borderRadius: 10, padding: "8px 10px" }}/>
          <button type="submit" style={{ borderRadius: 10, padding: "8px 12px", color: "white", background: BRAND.primary, border: "none", fontWeight: 600 }}>
            {loading ? "Loading…" : "Load"}
          </button>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Stored at <code>{`kudos_archive/${loadedKey || dateKey}/items`}</code>
          </div>
        </form>

        <div style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>
          {loading ? "Fetching…" : `Found ${items.length} kudos`}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, maxHeight: "60vh", overflow: "auto", paddingRight: 4 }}>
          {items.map(k => <WallCard key={k.id} k={k} />)}
          {!loading && items.length === 0 && (
            <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${BRAND.grey}`, background: "#FAFAFA" }}>
              No archived kudos for that date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- MAIN APP -----------------------------------------------------------
export default function App() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [dateTime, setDateTime] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSeeYou, setShowSeeYou] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Subscribe to kudos live
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const { db } = await ensureFirebase();
      const { collection, onSnapshot, orderBy, limit, query } = await import("firebase/firestore");
      const q = query(collection(db, "kudos"), orderBy("createdAt", "desc"), limit(150));
      unsub = onSnapshot(q, (snap) => {
        const out = [];
        snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
        setItems(out);
      });
    })();
    return () => unsub();
  }, []);

  // Live date/time
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setDateTime(now.toLocaleString("en-GB", { timeZone: "Asia/Dubai", dateStyle: "full", timeStyle: "short" }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-archive & clear at 21:00 Dubai
  useEffect(() => {
    const check = async () => {
      const { hh } = nowDubai();
      if (hh >= 21) await archiveAndClearKudosOncePerDay();
    };
    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Welcome 09:00
  useEffect(() => {
    const showIfNineAM = () => {
      const { hh, mm } = nowDubai();
      const key = `kudos_welcome_${dateKeyDubai()}`;
      if (hh === 9 && mm < 5 && !localStorage.getItem(key)) {
        setShowWelcome(true);
        localStorage.setItem(key, "shown");
        setTimeout(() => setShowWelcome(false), 10000);
      }
    };
    showIfNineAM();
    const interval = setInterval(showIfNineAM, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // See you after 21:00
  useEffect(() => {
    const maybeShowGoodnight = () => {
      const { hh } = nowDubai();
      const key = `kudos_see_you_${dateKeyDubai()}`;
      if (hh >= 21 && !localStorage.getItem(key)) {
        setShowSeeYou(true);
        localStorage.setItem(key, "shown");
        setTimeout(() => setShowSeeYou(false), 10000);
      }
    };
    maybeShowGoodnight();
    const interval = setInterval(maybeShowGoodnight, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const openNow = isOpenNowDubai();
  const { hh } = nowDubai();
  const afterNinePM = hh >= 21;

  return (
    <div style={{ minHeight: "100vh", background: BRAND.light }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(6px)", background: "rgba(255,255,255,0.7)", borderBottom: `1px solid ${BRAND.grey}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 32, width: 32, borderRadius: 12, background: BRAND.primary }} />
            <h1 style={{ margin: 0, fontWeight: 600 }}>{BRAND.name} – Live Wall</h1>
          </div>
          {/* Right side actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles color={BRAND.primary} size={16}/> Real-time updates
            </div>
            <div style={{ color: "#64748b" }}>{dateTime}</div>

            {/* Archive */}
            <button
              onClick={() => setArchiveOpen(true)}
              style={{ borderRadius: 10, padding: "6px 10px", color: "#0f172a", background: "white", border: `1px solid ${BRAND.grey}`, fontWeight: 600 }}
            >
              Archive
            </button>

            {/* Admin buttons (always visible) */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={archiveAndClearKudosNow}
                style={{ borderRadius: 10, padding: "6px 10px", color: "white", background: "#0ea5e9", border: "none", fontWeight: 600 }}
                title="Archive today then clear"
              >
                Admin: Archive & Clear
              </button>
              <button
                onClick={clearKudosNowNoArchive}
                style={{ borderRadius: 10, padding: "6px 10px", color: "white", background: "#ef4444", border: "none", fontWeight: 600 }}
                title="Clear without archive"
              >
                Admin: Clear Only
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Open/Closed ribbon */}
      <div style={{ maxWidth: 1120, margin: "8px auto 0", padding: "0 16px" }}>
        {openNow ? (
          <div style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", borderRadius: 10, padding: "8px 12px", fontSize: 13 }}>
            Posting window is <strong>OPEN</strong> (09:00–21:00, Asia/Dubai).
          </div>
        ) : (
          <div style={{ background: "#FFF7ED", color: "#9A3412", border: "1px solid #FED7AA", borderRadius: 10, padding: "8px 12px", fontSize: 13 }}>
            {afterNinePM ? <>Posting window is <strong>CLOSED</strong>. 🌙 See you tomorrow at <strong>09:00</strong> (Asia/Dubai)!</>
                          : <>Posting window is <strong>CLOSED</strong>. Opens at <strong>09:00</strong> (Asia/Dubai).</>}
          </div>
        )}
      </div>

      {/* Welcome / See you banners */}
      {showWelcome && (
        <div style={{ maxWidth: 1120, margin: "8px auto 0", padding: "0 16px" }}>
          <div style={{ background: "#E0F2FE", color: "#075985", border: "1px solid #BAE6FD", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}>
            🌞 Good morning, Rovestars! The Kudos Wall is now open. Spread the appreciation!
          </div>
        </div>
      )}
      {showSeeYou && (
        <div style={{ maxWidth: 1120, margin: "8px auto 0", padding: "0 16px" }}>
          <div style={{ background: "#F1F5F9", color: "#0F172A", border: "1px solid #CBD5E1", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}>
            🌙 Wall closed for today. See you tomorrow at 09:00!
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {items.map((k) => (<WallCard key={k.id} k={k} />))}
        </div>
      </main>

      {/* FAB (hidden when closed) */}
      {isOpenNowDubai() && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed", right: 20, bottom: 20, zIndex: 50,
            background: BRAND.primary, border: "none", color: "white",
            borderRadius: 9999, padding: "14px 18px", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, boxShadow: "0 10px 24px rgba(57,195,201,0.35)",
            cursor: "pointer"
          }}
          aria-label="Send a Kudos"
        >
          <MessageSquarePlus size={18}/> Send a Kudos
        </button>
      )}

      <SendModal open={open} onClose={() => setOpen(false)} />
      <ArchiveModal open={archiveOpen} onClose={() => setArchiveOpen(false)} />
    </div>
  );
}
