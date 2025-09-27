// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import KudosPanel from "./components/KudosPanel.jsx";
import Reports from "./pages/Reports.jsx";

const THEME = {
  turquoise: "#40E0D0",
  turquoiseDeep: "#2BB3A6",
  lightBlue: "#eef9ff",
  blue: "#2b7bd3",
  slate: "#0f172a",
  graySoft: "#f6f8fb",
  grayMid: "#dfe8ef",
  textMuted: "#6b7280",
};

const S = {
  page: { paddingTop: 22 },
  banner: {
    background: THEME.turquoise,
    borderRadius: 18,
    padding: 28,
    marginBottom: 18,
    color: "#fff",
    textAlign: "center",
    fontWeight: 800,
    fontSize: 30,
    boxShadow: "0 10px 30px rgba(11,72,64,0.08)",
  },
  writeCard: {
    background: THEME.turquoise,
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    color: "#fff",
    boxShadow: "0 10px 30px rgba(11,72,64,0.06)",
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  writeTitle: { fontWeight: 800, fontSize: 20, marginBottom: 4 },
  textarea: {
    padding: 14,
    borderRadius: 12,
    border: "none",
    minWidth: 420,
    minHeight: 100,
    resize: "vertical",
    fontSize: 15,
    color: "#05323a",
    background: "rgba(255,255,255,0.92)",
    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.03)",
  },
  addBox: { display: "flex", flexDirection: "column", gap: 12, minWidth: 160 },
  addBtn: {
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    background: THEME.turquoiseDeep,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 15,
    boxShadow: "0 8px 22px rgba(43,123,211,0.08)",
  },
  note: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
  wallContainer: {
    background: "#fff",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 10px 30px rgba(15,23,42,0.03)",
    border: `1px solid ${THEME.grayMid}`,
  },
  navBrand: { fontWeight: 800, color: THEME.slate },
  navBtn: { background: "transparent", color: THEME.blue, borderRadius: 12, padding: "8px 12px" },
};

function Wall() {
  // load cached kudos (persisted during the day)
  const [kudos, setKudos] = useState(() => {
    try {
      const raw = localStorage.getItem("kudos");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      // ensure it's an array
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (e) {
      return [];
    }
  });

  const [kudosText, setKudosText] = useState("");
  const currentUserId = "guest";
  const allowedAdmins = ["rovester-"];

  // save to localStorage whenever kudos changes
  useEffect(() => {
    try {
      localStorage.setItem("kudos", JSON.stringify(kudos));
    } catch (e) { /* ignore */ }
  }, [kudos]);

  // Auto-clear at 21:00 daily (clears state + localStorage)
  useEffect(() => {
    function checkAndClear() {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 21) {
        setKudos([]);
        try { localStorage.removeItem("kudos"); } catch (e) {}
      }
    }
    // run immediately and then every minute
    checkAndClear();
    const interval = setInterval(checkAndClear, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();
  const isOpen = hour >= 9 && hour < 21;

  function addKudos(e) {
    e.preventDefault();
    const text = (kudosText || "").trim();
    if (!text) {
      alert("Please write your kudos before submitting.");
      return;
    }
    const now = new Date();
    const iso = now.toISOString();
    const id = kudos.length ? Math.max(...kudos.map(k => Number(k.id) || 0)) + 1 : 1;
    // newest first
    const entry = { id, content: text, createdAt: iso };
    setKudos(prev => [entry, ...prev]);
    setKudosText("");
    // scroll to wall
    const wall = document.getElementById("kudos-wall");
    if (wall) wall.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div style={S.banner}>Kudos Live Wall</div>

      <div style={S.writeCard}>
        <div style={{ flex: 1, minWidth: 420 }}>
          <div style={S.writeTitle}>Write a Kudos</div>
          {isOpen ? (
            <textarea
              style={S.textarea}
              placeholder="Write your kudos (mention names or wins) — it will show on the wall with date & time."
              value={kudosText}
              onChange={(e) => setKudosText(e.target.value)}
            />
          ) : (
            <div style={{ ...S.textarea, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Kudos Live Wall is closed now. Open daily 09:00–21:00.
            </div>
          )}
        </div>

        <div style={S.addBox}>
          <button
            style={S.addBtn}
            type="button"
            onClick={addKudos}
            disabled={!isOpen}
            title={isOpen ? "Add Kudos" : "Closed until 09:00"}
          >
            Add Kudos
          </button>
          <div style={S.note}>Your kudos appears instantly on the wall with local date & time.</div>
        </div>
      </div>

      <div id="kudos-wall" style={S.wallContainer}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 12, color: THEME.slate }}>Kudos Wall</div>
        <KudosPanel
          kudos={kudos}
          getContent={(k) => k.content}
          getCreatedAt={(k) => k.createdAt}
          currentUserId={currentUserId}
          allowedAdminIds={allowedAdmins}
          onArchive={() => alert("Archive requested")}
          onDelete={() => alert("Delete requested")}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <>
      <nav className="nav" style={{ background: "#ffffffcc", borderBottom: "1px solid rgba(43,123,211,0.06)" }}>
        <div className="container nav-inner">
          <div className="brand" style={S.navBrand}>Rovester Kudos</div>
          <div className="spacer" />
          <Link to="/wall" className="btn" style={{ ...S.navBtn, background: "transparent" }}>Wall</Link>
          <Link to="/reports" className="btn-outline" style={{ marginLeft: 8 }}>Reports</Link>
        </div>
      </nav>

      <main className="container" style={S.page}>
        <Routes>
          <Route path="/" element={<Wall />} />
          <Route path="/wall" element={<Wall />} />
          <Route path="/reports" element={
            <Reports
              kudos={[
                { id: 1, content: "Rovester Admin kickoff", createdAt: "2025-01-05T10:30:00" },
              ]}
              getRecipient={(k) => k.toUserId}
              getRecipientName={(k) => k.toUserName}
              getCreatedAt={(k) => k.createdAt}
            />
          } />
          <Route path="*" element={<Navigate to="/wall" replace />} />
        </Routes>
      </main>
    </>
  );
}
