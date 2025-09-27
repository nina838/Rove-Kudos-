// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import KudosPanel from "./components/KudosPanel.jsx";
import Reports from "./pages/Reports.jsx";

const S = {
  page: { paddingTop: 16 },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.06)",
    border: "1px solid #e2e8f0",
  },
  head: { fontWeight: 700, fontSize: 20, marginBottom: 8, color: "#0f172a" },
  row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    minWidth: 260,
  },
  btn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid #00a859",
    background: "#00a859",
    color: "#fff",
    cursor: "pointer",
  },
};

function Wall() {
  const [kudos, setKudos] = useState(() => {
    try {
      const raw = localStorage.getItem("kudos");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [message, setMessage] = useState("");
  const hour = new Date().getHours();
  const isOpen = hour >= 9 && hour < 21;

  function saveToStorage(next) {
    try {
      localStorage.setItem("kudos", JSON.stringify(next));
    } catch {}
  }

  function addKudos(e) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    const now = new Date().toISOString();
    const id = kudos.length
      ? Math.max(...kudos.map((k) => Number(k.id) || 0)) + 1
      : 1;
    const entry = { id, content: text, createdAt: now };
    const next = [entry, ...kudos];
    setKudos(next);
    saveToStorage(next);
    setMessage("");
  }

  // Auto clear at 21:00
  useEffect(() => {
    const checkAndClear = () => {
      const now = new Date();
      if (now.getHours() >= 21) {
        setKudos([]);
        try {
          localStorage.removeItem("kudos");
        } catch {}
      }
    };
    checkAndClear();
    const t = setInterval(checkAndClear, 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* Elegant gradient header */}
      <div
        style={{
          ...S.card,
          marginBottom: 16,
          background: "linear-gradient(135deg, #40E0D0, #00BFFF)",
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          border: "none",
        }}
      >
        <div style={{ ...S.head, color: "white" }}>Kudos Live Wall</div>
      </div>

      {/* Write a Kudos */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.head}>Write a Kudos</div>
        {isOpen ? (
          <form onSubmit={addKudos} style={{ ...S.row }}>
            <input
              style={S.input}
              placeholder="Write your kudos..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button style={S.btn} type="submit">
              Add Kudos
            </button>
          </form>
        ) : (
          <div style={{ color: "#64748b" }}>
            Kudos Live Wall is closed now. Open daily <b>09:00–21:00</b>.
          </div>
        )}
      </div>

      {/* Wall */}
      <div style={S.card}>
        <div style={S.head}>Kudos Wall</div>
        <KudosPanel
          kudos={kudos}
          getContent={(k) => k.content}
          getCreatedAt={(k) => k.createdAt}
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
          <Link to="/wall" className="btn">
            Wall
          </Link>
          <Link to="/reports" className="btn" style={{ marginLeft: 8 }}>
            Reports
          </Link>
        </div>
      </nav>

      <main className="container" style={S.page}>
        <Routes>
          <Route path="/" element={<Wall />} />
          <Route path="/wall" element={<Wall />} />
          <Route
            path="/reports"
            element={
              <Reports
                getContent={(k) => k.content}
                getCreatedAt={(k) => k.createdAt}
              />
            }
          />
          <Route path="*" element={<Navigate to="/wall" replace />} />
        </Routes>
      </main>
    </>
  );
}
