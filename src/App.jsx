// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import KudosPanel from "./components/KudosPanel.jsx";
import Reports from "./pages/Reports.jsx";

const S = {
  page: { paddingTop: 16 },
  card: { background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,.06)", border: "1px solid #e2e8f0" },
  head: { fontWeight: 700, fontSize: 20, marginBottom: 8, color: "#0f172a" },
  row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  textarea: { padding: "12px", borderRadius: 12, border: "1px solid #d1d5db", minWidth: 400, minHeight: 80, resize: "vertical" },
  btn: { padding: "10px 16px", borderRadius: 12, border: "1px solid #00a859", background: "#00a859", color: "#fff", cursor: "pointer" },
  badge: { padding: "4px 10px", borderRadius: 999, fontSize: 12, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" },
  subtleText: { color: "#64748b", fontSize: 13, marginTop: 8 }
};

function Wall() {
  const currentUserId = "guest";
  const allowedAdmins = ["rovester-"]; // left as-is

  // kudos items now store content and createdAt (ISO string)
  const [kudos, setKudos] = useState([
    { id: 1, content: "Shoutout to the team for great Q1 delivery!", createdAt: "2025-01-05T10:30:00" },
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
  }

  return (
    <>
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 4 }}>Kudos Live Wall</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#475569" }}>
          <span style={S.badge}>Rove theme</span>
          <span>Write your kudos and it will appear live on the wall with date &amp; time.</span>
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.head}>Write a Kudos</div>
        {isOpen ? (
          <>
            <form onSubmit={addKudos} style={{ ...S.row }}>
              <textarea
                style={S.textarea}
                placeholder="Write your kudos..."
                value={kudosText}
                onChange={(e) => setKudosText(e.target.value)}
              />
              <button style={S.btn} type="submit">Add Kudos</button>
            </form>
            <div style={S.subtleText}>
              Your kudos will appear immediately on the wall with the current date &amp; time.
            </div>
          </>
        ) : (
          <div style={{ color: "#64748b" }}>Kudos Live Wall is closed now. Open daily <b>09:00–21:00</b>.</div>
        )}
      </div>

      <div style={S.card}>
        <div style={S.head}>Kudos Wall</div>
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
      <nav className="nav">
        <div className="container nav-inner">
          <div className="brand">Rovester Kudos</div>
          <div className="spacer" />
          <Link to="/wall" className="btn">Wall</Link>
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
