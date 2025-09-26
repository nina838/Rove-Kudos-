// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import KudosPanel from "./components/KudosPanel.jsx";
import Reports from "./pages/Reports.jsx";

const RO = {
  blue: "#003da5",      // primary blue accent
  green: "#00a859",     // rove brand green (primary action)
  slate: "#0f172a",
  gray1: "#f8fafc",
  gray2: "#f1f5f9",
  gray3: "#e6edf3",
  subtle: "#64748b",
};

const S = {
  page: { paddingTop: 20 },
  headerCard: {
    background: "linear-gradient(90deg, rgba(0,61,165,0.04), rgba(0,168,89,0.03))",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 8px 30px rgba(15,23,42,0.04)",
    border: `1px solid ${RO.gray3}`,
    marginBottom: 18,
  },
  title: { fontWeight: 800, fontSize: 30, color: RO.slate, marginBottom: 6 },
  tagline: { color: RO.subtle, fontSize: 15, display: "flex", gap: 10, alignItems: "center" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 999,
    background: "#f0f9f4",
    color: RO.green,
    border: `1px solid rgba(0,168,89,0.12)`,
    fontWeight: 600,
    fontSize: 13
  },

  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
    border: `1px solid ${RO.gray3}`,
    marginBottom: 18,
  },

  formRow: { display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" },
  textarea: {
    padding: 14,
    borderRadius: 14,
    border: `1px solid ${RO.gray3}`,
    minWidth: 420,
    minHeight: 90,
    resize: "vertical",
    fontSize: 15,
    color: RO.slate,
    boxShadow: "inset 0 1px 0 rgba(16,24,40,0.02)"
  },
  btn: {
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid transparent",
    background: RO.green,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 6px 18px rgba(0,168,89,0.14)"
  },
  smallNote: { color: RO.subtle, fontSize: 13, marginTop: 10 },

  wallHead: { fontWeight: 700, fontSize: 20, marginBottom: 12, color: RO.slate },
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
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map(k => Number(k.id) || 0)) + 1 : 1,
        content: text,
        createdAt: now,
      }
    ]);
    setKudosText("");
    // small UX: scroll to top of wall (optional)
    const wall = document.getElementById("kudos-wall");
    if (wall) wall.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div style={S.headerCard}>
        <div style={S.title}>Kudos Live Wall</div>
        <div style={S.tagline}>
          <div style={S.badge}>Rove</div>
          <div>Write your kudos and it will appear live on the wall with date &amp; time.</div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontWeight: 800, fontSize: 20, color: RO.slate, marginBottom: 12 }}>Write a Kudos</div>

        {isOpen ? (
          <>
            <form onSubmit={addKudos} style={S.formRow}>
              <textarea
                style={S.textarea}
                placeholder="Write your kudos... (be specific — mention names or wins)"
                value={kudosText}
                onChange={(e) => setKudosText(e.target.value)}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button style={S.btn} type="submit">Add Kudos</button>
                <div style={S.smallNote}>Your kudos publishes immediately to the wall with a timestamp.</div>
              </div>
            </form>
          </>
        ) : (
          <div style={{ color: RO.subtle }}>Kudos Live Wall is closed now. Open daily <b>09:00–21:00</b>.</div>
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
      <nav className="nav" style={{ background: "#ffffffcc", borderBottom: "1px solid #eef2f7" }}>
        <div className="container nav-inner">
          <div className="brand" style={{ fontWeight: 800, color: RO.slate }}>Rovester Kudos</div>
          <div className="spacer" />
          <Link to="/wall" className="btn" style={{ background: RO.green, color: "#fff", borderRadius: 12, padding: "8px 12px" }}>Wall</Link>
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
