// src/App.jsx
import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import KudosPanel from "./components/KudosPanel.jsx"; // only this import

// --- Inline Wall page to avoid path issues ---
function Wall() {
  const currentUserId = "guest";               // visitors are not admins
  const allowedAdmins = ["rovester-admin"];    // only you can unlock

  const demoKudos = [
    { id: 1, toUserId: "rovester-admin", toUserName: "Rovester Admin", createdAt: "2025-01-05" },
    { id: 2, toUserId: "alice",          toUserName: "Alice",          createdAt: "2025-02-11" },
    { id: 3, toUserId: "bob",            toUserName: "Bob",            createdAt: "2025-02-19" },
  ];

  return (
    <div className="card">
      <div className="card-head">Rovester Kudos Wall</div>
      <div className="card-body">
        <KudosPanel
          kudos={demoKudos}
          getRecipient={(k) => k.toUserId}
          getRecipientName={(k) => k.toUserName}
          getCreatedAt={(k) => k.createdAt}
          currentUserId={currentUserId}
          allowedAdminIds={allowedAdmins}
          onArchive={() => alert("Archive requested")}
          onDelete={() => alert("Delete requested")}
        />
      </div>
    </div>
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
          Click “Open Rovester Wall” to use admin tools (passcode <b>12345</b>) and generate monthly reports.
        </p>
        <p><Link to="/wall" className="btn">Open Rovester Wall</Link></p>
      </div>
    </div>
  );
}
