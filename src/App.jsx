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
    minWidth: 200,
  },
  btn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid #40E0D0",
    background: "#40E0D0",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
};

function Wall() {
  const currentUserId = "guest";
  const [kudos, setKudos] = useState([]);
  const [message, setMessage] = useState("");

  const hour = new Date().getHours();
  const isOpen = hour >= 9 && hour < 21;

  function addKudos(e) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    const now = new Date().toISOString();

    setKudos((prev) => [
      ...prev,
      {
        id: prev.length
          ? Math.max(...prev.map((k) => Number(k.id) || 0)) + 1
          : 1,
        content: text,
        createdAt: now,
      },
    ]);
    setMessage("");
  }

  // Auto clear at 21:00
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 21 && now.getMinutes() === 0) {
        setKudos([]);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Save kudos to localStorage so Reports can use them
  useEffect(() => {
    localStorage.setItem("kudos", JSON.stringify(kudos));
  }, [kudos]);

  return (
    <>
      {/* Turquoise banner */}
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

      <div style={S.card}>
        <KudosPanel
          kudos={kudos}
          getContent={(k) => k.content}
          getCreatedAt={(k) => k.createdAt}
          currentUserId={currentUserId}
          allowedAdminIds={["rovester-"]}
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
      <nav className="nav" style={{ background: "#40E0D0" }}>
        <div className="container nav-inner">
          <div className="brand" style={{ color: "white" }}>
            Rove Kudos
          </div>
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
                kudos={JSON.parse(localStorage.getItem("kudos") || "[]")}
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
