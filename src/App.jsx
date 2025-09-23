import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Wall from "./pages/Wall.jsx";

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
          {/* any unknown route -> wall */}
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
          Celebrate teammates on the Rovester Kudos Wall. Click “Open Rovester Wall” to view, unlock admin tools, and generate monthly reports.
        </p>
        <ul>
         {/* Admin controls (locked) */}
{canSeeUnlock ? (
  !adminUnlocked ? (
    <button
      onClick={() => { setPin(""); setPinErr(""); setShowPin(true); }}
      style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#fff" }}
    >
      Unlock admin
    </button>
  ) : (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        onClick={() => { /* your ARCHIVE handler here */ }}
        style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#f3f4f6" }}
      >
        Archive
      </button>
      <button
        onClick={() => { /* your DELETE handler here */ }}
        style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #dc2626", background: "#dc2626", color: "#fff" }}
      >
        Delete
      </button>
    </div>
  )
) : null}

          <li>Generate a monthly report for any month & year, optionally per person.</li>
          <li>Export CSV for quick sharing.</li>
        </ul>
        <p><Link to="/wall" className="btn">Open Rovester Wall</Link></p>
      </div>
    </div>
  );
}
