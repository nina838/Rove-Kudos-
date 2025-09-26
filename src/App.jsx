// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import KudosPanel from "./components/KudosPanel.jsx";
import Reports from "./pages/Reports.jsx";

const THEME = {
  lightBlue: "#e8f2ff",   // very light blue background / card tint
  blue: "#2b7bd3",        // primary blue accent
  turquoise: "#2bcab3",   // turquoise / primary action
  slate: "#0f172a",       // dark slate text
  graySoft: "#f6f8fb",    // pale grey page bg
  grayMid: "#dfe8ef",     // card border / soft element
  textMuted: "#6b7280",   // muted grey text
};

const S = {
  page: { paddingTop: 22 },
  headerCard: {
    background: `linear-gradient(90deg, ${THEME.lightBlue}, rgba(43,123,211,0.03))`,
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 12px 40px rgba(15,23,42,0.04)",
    border: `1px solid ${THEME.grayMid}`,
    marginBottom: 20,
  },
  title: { fontWeight: 800, fontSize: 32, color: THEME.slate, marginBottom: 8 },
  taglineRow: { display: "flex", gap: 12, alignItems: "center", color: THEME.textMuted },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 14px",
    borderRadius: 999,
    background: "#ffffff",
    color: THEME.blue,
    border: `1px solid rgba(43,123,211,0.08)`,
    fontWeight: 700,
    fontSize: 13,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)"
  },

  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15,23,42,0.03)",
    border: `1px solid ${THEME.grayMid}`,
    marginBottom: 18,
  },

  formRow: { display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" },
  textarea: {
    padding: 14,
    borderRadius: 14,
    border: `1px solid ${THEME.grayMid}`,
    minWidth: 440,
    minHeight: 100,
    resize: "vertical",
    fontSize: 15,
    color: THEME.slate,
    background: "#fcfeff",
    boxShadow: "inset 0 1px 0 rgba(16,24,40,0.02)"
  },
  btn: {
    padding: "12px 20px",
    borderRadius: 14,
    border: "1px solid transparent",
    background: THEME.turquoise,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 15,
    boxShadow: "0 8px 22px rgba(43,123,211,0.08)"
  },
  smallNote: { color: THEME.textMuted, fontSize: 13, marginTop: 10 },

  wallHead: { fontWeight: 800, fontSize: 20, marginBottom: 12, color: THEME.slate },
  navBrand: { fontWeight: 800, color: THEME.slate },
  navBtn: { background: "transparent", color: THEME.blue, borderRadius: 12, padding: "8px 12px", border: `1px solid rgba(43,123,211,0.08)` }
};

function Wall() {
  const currentUserId = "guest";
  const allowedAdmins = ["rovester-"];

  const [kudos, setKudos] = useState([
    { id: 1, content: "Shoutout for excellent Q1 delivery!", createdAt: "2025-01-05T10:30:00" },
    { id: 2, content: "Alice helped unblock the release — awesome work!", createdAt: "2025-02-11T14:12:00" },
    { id: 3, content: "Bob's design improvements look great.", createdAt: "2025-02-19T09:45:00" },
  ]);

  const [kudosText, setKudosText] = useState("");

  const hour = new Date().getHours(); // 09:00–21:00 open
  const isOpen = hour >= 9 && hour < 21;

  function addKudos(e) {
    e.preventDefault();
    const text = (kudosText || "").trim();
    if (!text) { alert("Please write your kudos before submitting."); return; }
    const now = new Date().toISOString();
    setKudos(prev => [
      {
        id: prev.length ? Math.max(...prev.map(k => Number(k.id) || 0)) + 1 : 1,
        content: text,
        createdAt: now,
      },
      ...prev,
    ]);
    setKudosText("");
    // scroll to wall top
    const wall = document.getElementById("kudos-wall");
    if (wall) wall.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div style={S.headerCard}>
        <div style={S.title}>Kudos Live Wall</div>
        <div style={S.taglineRow}>
          <div style={S.badge}>Rove</div>
          <div style={{ color: THEME.textMuted }}>
            Share quick kudos — they publish instantly with a timestamp. Light, calm, and elegant.
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontWeight: 800, fontSize: 20, color: THEME.slate, marginBottom: 12 }}>Write a Kudos</div>

        {isOpen ? (
          <>
            <form onSubmit={addKudos} style={S.formRow}>
              <textarea
                style={S.textarea}
                placeholder="Write your kudos... (e.g., 'Thanks Sam for pairing on the fix — shipping faster because of you')"
                value={kudosText}
                onChange={(e) => setKudosText(e.target.value)}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button style={S.btn} type="submit">Add Kudos</button>
                <div style={S.smallNote}>Publishes immediately to the wall with local date &amp; time.</div>
              </div>
            </form>
          </>
        ) : (
          <div style={{ color: THEME.textMuted }}>Kudos Live Wall is closed now. Open daily <b>09:00–21:00</b>.</div>
        )}
      </div>

      <div id="kudos-wall" style={S.card}>
        <div style={S.wallHead}>Kudos Wall</div>
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
          <Link to="/wall" className="btn" style={{ ...S.navBtn, background: "transparent", color: THEME.blue }}>Wall</Link>
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
                { id: 2, content: "Alice did great work", createdAt: "2025-02-11T14:12:00" },
                { id: 3, content: "Bob's help was invaluable", createdAt: "2025-02-19T09:45:00" },
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
