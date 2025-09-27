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
    boxShadow: "0 6px 20px rgba(0,0,0,.05)",
    border: "1px solid #e2e8f0",
  },
  head: { fontWeight: 700, fontSize: 20, marginBottom: 8, color: "#007f89" },
  row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    minWidth: 260,
  },
  btn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid #40E0D0",
    background: "#40E0D0",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
};

function Wall() {
  const duckCSS = `
    @keyframes bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes wave {
      0% { transform: rotate(0deg); }
      20% { transform: rotate(12deg); }
      40% { transform: rotate(-8deg); }
      60% { transform: rotate(10deg); }
      80% { transform: rotate(-5deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes blink {
      0%, 95%, 100% { transform: scaleY(1); }
      97% { transform: scaleY(0.1); }
    }
    .duck-bob { animation: bob 3s ease-in-out infinite; }
    .duck-wave { transform-origin: 60% 60%; animation: wave 2.2s ease-in-out infinite; }
    .duck-eye { transform-origin: center; animation: blink 6s infinite; }
    .duck-speech {
      background: #fffbea;
      border: 1px solid #fde68a;
      padding: 8px 12px;
      border-radius: 12px;
      color: #a16207;
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      position: relative;
    }
    .duck-speech:after {
      content: "";
      position: absolute;
      left: -8px;
      top: 14px;
      border-width: 8px;
      border-style: solid;
      border-color: transparent #fffbea transparent transparent;
      filter: drop-shadow(-1px 0 0 #fde68a);
    }
  `;

  const greetings = [
    "🦆 Hi Rovester!",
    "Quack quack! Keep the kudos coming!",
    "🦆 Hello friend!",
    "You're awesome! 💛",
  ];
  const [greeting, setGreeting] = useState(greetings[0]);

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

    // random greeting after posting
    const randomGreet = greetings[Math.floor(Math.random() * greetings.length)];
    setGreeting(randomGreet);
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
      <style>{duckCSS}</style>

      {/* Turquoise Gradient Header */}
      <div
        style={{
          ...S.card,
          marginBottom: 16,
          background: "linear-gradient(135deg, #40E0D0, #20c1c8)",
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          border: "none",
        }}
      >
        <div style={{ ...S.head, color: "white" }}>Kudos Live Wall</div>
      </div>

      {/* Cute Duck */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#ffffff",
          borderRadius: 16,
          padding: "12px 16px",
          marginBottom: 16,
          boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}
      >
        <img
          className="duck-bob duck-wave"
          src="https://img.icons8.com/emoji/96/duck-emoji.png"
          alt="Duck"
          style={{ width: 56, height: 56 }}
        />
        <div className="duck-speech">{greeting}</div>
      </div>

      {/* Write Kudos */}
      <div style={{ ...S.card, marginBottom: 16, background: "#f5f7fa" }}>
        <div style={{ ...S.head, color: "#007f89" }}>Write a Kudos</div>
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

      {/* Kudos Wall */}
      <div style={S.card}>
        <div style={{ ...S.head, color: "#007f89" }}>Kudos Wall</div>
        <KudosPanel kudos={kudos} getContent={(k) => k.content} getCreatedAt={(k) => k.createdAt} />
      </div>
    </>
  );
}

export default function App() {
  return (
    <>
      <nav className="nav" style={{ background: "#40E0D0", color: "white" }}>
        <div className="container nav-inner">
          <div className="brand" style={{ color: "white", fontWeight: 800 }}>
            Rovester Kudos
          </div>
          <div className="spacer" />
          <Link to="/wall" className="btn" style={{ color: "#007f89", background: "white", borderRadius: 12, padding: "8px 12px" }}>
            Wall
          </Link>
          <Link to="/reports" className="btn" style={{ marginLeft: 8, color: "#007f89", background: "white", borderRadius: 12, padding: "8px 12px" }}>
            Reports
          </Link>
        </div>
      </nav>

      <main className="container" style={S.page}>
        <Routes>
          <Route path="/" element={<Wall />} />
          <Route path="/wall" element={<Wall />} />
          <Route path="/reports" element={<Reports getContent={(k) => k.content} getCreatedAt={(k) => k.createdAt} />} />
          <Route path="*" element={<Navigate to="/wall" replace />} />
        </Routes>
      </main>
    </>
  );
}
