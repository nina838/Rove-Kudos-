// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import KudosPanel from "./components/KudosPanel.jsx";

// --- Rove theme helpers (inline styles) ---
const S = {
  card: { background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,.06)" },
  head: { fontWeight: 700, fontSize: 20, marginBottom: 8, color: "#0f172a" },
  row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  input: { padding: "10px 12px", borderRadius: 12, border: "1px solid #d1d5db", minWidth: 200 },
  btn: { padding: "10px 16px", borderRadius: 12, border: "1px solid #0ea5e9", background: "#0ea5e9", color: "#fff", cursor: "pointer" },
  badge: { padding: "4px 10px", borderRadius: 999, fontSize: 12, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" },
};

// --- A simple in-page "Write Kudos" form + Wall ---
function Wall() {
  // Treat visitors as non-admins by default
  const currentUserId = "guest";
  const allowedAdmins = ["rovester-admin"]; // put YOUR id here if you want unlock button visible to you

  // Initial demo kudos; replace with your real data if you have it
  const [kudos, setKudos] = useState([
    { id: 1, toUserId: "rovester-admin", toUserName: "Rovester Admin", createdAt: "2025-01-05" },
    { id: 2, toUserId: "alice",          toUserName: "Alice",          createdAt: "2025-02-11" },
    { id: 3, toUserId: "bob",            toUserName: "Bob",            createdAt: "2025-02-19" },
  ]);

  // Simple "write kudos" fields (kept minimal to match your existing data shape)
  const [toUserId, setToUserId] = useState("");
  const [toUserName, setToUserName] = useState("");

  function addKudos(e) {
    e.preventDefault();
    if (!toUserId.trim() || !toUserName.trim()) {
      alert("Please fill both: Person ID and Person Name.");
      return;
    }
    const nowISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    setKudos(prev => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map(k => Number(k.id) || 0)) + 1 : 1,
        toUserId: toUserId.trim(),
        toUserName: toUserName.trim(),
        createdAt: nowISO,
      }
    ]);
    setToUserId("");
    setToUserName("");
  }

  return (
    <>
      {/* Rove header card */}
      <div style={{ ...S.card, marginBottom: 16, border: "1px solid #e2e8f0" }}>
        <div style={S.head}>Rovester Kudos</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#475569" }}>
          <span style={S.badge}>Rove theme</span>
          <span>Write kudos for teammates and view monthly reports.</span>
        </div>
      </div>

      {/* Write Kudos */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.head}>Write a Kudos</div>
        <form onSubmit={addKudos} style={{ ...S.row }}>
          <input
            style={S.input}
            placeholder="Person ID (e.g., alice123)"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
          />
          <input
            style={S.input}
            placeholder="Person Name (e.g., Alice)"
            value={toUserName}
            onChange={(e) => setToUserName(e.target.value)}
          />
          <button style={S.btn} type="submit">Add Kudos</button>
        </form>
        <div style={{ color: "#64748b", marginTop: 8, fontSize: 13 }}>
          Tip: Only the <b>date</b>, <b>name</b>, and <b>id</b> are stored for the monthly report.
        </div>
      </div>

      {/* Wall + Admin lock + Monthly report live inside KudosPanel */}
      <div style={S.card}>
        <div style={S.head}>Rovester Kudos Wall</div>
        <KudosPanel
          kudos={kudos}
          getRecipient={(k) => k.toUserId}
          getRecipientName={(k) => k.toUserName}
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
          <Link to="/" className="btn-outline">Home</Link>
          <Link to="/wall" className="btn">Open Rovester Wall</Link>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wall" element={<Wall />} />
          <Route path="*" element={<Navigate to="/wall" replace />} />
        </Routes>
      </main>
    </>
  );
}

function Home() {
  return (
    <div className="card">
      <div className="card-head">Welcome to Rovester</div>
      <div className="card-body">
        <p className="muted">
          Click “Open Rovester Wall” to write kudos, unlock admin tools (passcode <b>12345</b>),
          and generate monthly reports.
        </p>
        <p><Link to="/wall" className="btn">Open Rovester Wall</Link></p>
      </div>
    </div>
  );
}
restore kudos wall + add write form

