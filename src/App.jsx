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
  input: { padding: "10px 12px", borderRadius: 12, border: "1px solid #d1d5db", minWidth: 200 },
  btn: { padding: "10px 16px", borderRadius: 12, border: "1px solid #00a859", background: "#00a859", color: "#fff", cursor: "pointer" },
  badge: { padding: "4px 10px", borderRadius: 999, fontSize: 12, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" },
};

function Wall() {
  const currentUserId = "guest";
  const allowedAdmins = ["rovester-"]; // add your id if you want to see Unlock

  const [kudos, setKudos] = useState([
    { id: 1, toUserId: "rovester-", toUserName: "Rovester ", createdAt: "2025-01-05" },
    { id: 2, toUserId: "alice",          toUserName: "Alice",          createdAt: "2025-02-11" },
    { id: 3, toUserId: "bob",            toUserName: "Bob",            createdAt: "2025-02-19" },
  ]);

  const [toUserId, setToUserId] = useState("");
  const [toUserName, setToUserName] = useState("");

  const hour = new Date().getHours(); // 09:00–21:00 open
  const isOpen = hour >= 9 && hour < 21;

  function addKudos(e) {
    e.preventDefault();
    if (!toUserId.trim() || !toUserName.trim()) { alert("Please fill both: Person ID and Person Name."); return; }
    const today = new Date().toISOString().slice(0, 10);
    setKudos(prev => [...prev, {
      id: prev.length ? Math.max(...prev.map(k => Number(k.id) || 0)) + 1 : 1,
      toUserId: toUserId.trim(),
      toUserName: toUserName.trim(),
      createdAt: today,
    }]);
    setToUserId(""); setToUserName("");
  }

  return (
    <>
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.head}>Rovester Kudos</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#475569" }}>
          <span style={S.badge}>Rove theme</span>
          <span>Write kudos for teammates. Tools are locked by passcode.</span>
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.head}>Write a Kudos</div>
        {isOpen ? (
          <>
            <form onSubmit={addKudos} style={{ ...S.row }}>
              <input style={S.input} placeholder="Person ID (e.g., alice123)" value={toUserId} onChange={(e) => setToUserId(e.target.value)} />
              <input style={S.input} placeholder="Person Name (e.g., Alice)" value={toUserName} onChange={(e) => setToUserName(e.target.value)} />
              <button style={S.btn} type="submit">Add Kudos</button>
            </form>
            <div style={{ color: "#64748b", marginTop: 8, fontSize: 13 }}>
              The entry uses <b>ID</b>, <b>Name</b>, and today’s <b>date</b>.
            </div>
          </>
        ) : (
          <div style={{ color: "#64748b" }}>Rovester Kudos is closed now. Open daily <b>09:00–21:00</b>.</div>
        )}
      </div>

      <div style={S.card}>
        <div style={S.head}>Kudos Wall</div>
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
                // pass the same or real kudos array from a store/api if you have one
                { id: 1, toUserId: "rovester-admin", toUserName: "Rovester Admin", createdAt: "2025-01-05" },
                { id: 2, toUserId: "alice",          toUserName: "Alice",          createdAt: "2025-02-11" },
                { id: 3, toUserId: "bob",            toUserName: "Bob",            createdAt: "2025-02-19" },
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
