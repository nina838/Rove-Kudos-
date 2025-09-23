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
          <li>Admin / Archive / Delete are protected by a passcode (<b>12345</b>).</li>
          <li>Generate a monthly report for any month & year, optionally per person.</li>
          <li>Export CSV for quick sharing.</li>
        </ul>
        <p><Link to="/wall" className="btn">Open Rovester Wall</Link></p>
      </div>
    </div>
  );
}
