// src/App.jsx

import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import KudosPanel from "./components/KudosPanel.jsx";
import Reports from "./pages/Reports.jsx";

// Firebase imports for real-time functionality
import { KUDOS_REF } from './firebase.js'; 
import { onValue, push } from 'firebase/database'; 


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

// Wall component now receives kudos state and push function
function Wall({ kudos }) { 
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
    "🐥 Hi Rovester!",
    "Quack quack! Keep the kudos coming!",
    "🐥 Hello friend!",
    "You're awesome! 💛",
  ];
  const [greeting, setGreeting] = useState(greetings[0]);
  const [message, setMessage] = useState("");
  const hour = new Date().getHours();
  const isOpen = hour >= 9 && hour < 21;

  function addKudos(e) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    const now = new Date().toISOString();
    
    const entry = { content: text, createdAt: now };

    push(KUDOS_REF, entry) // Writes data to Firebase
      .then(() => {
        setMessage(""); 
        const randomGreet = greetings[Math.floor(Math.random() * greetings.length)];
        setGreeting(randomGreet);
      })
      .catch((error) => {
        console.error("Failed to write kudos:", error);
      });
  }

  // Reverse the array for display (newest first)
  const reversedKudos = kudos.slice().reverse();

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

      {/* Cute Full Yellow Duck */}
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
          src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f425.png"
          alt="Rove Duck"
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
        <KudosPanel kudos={reversedKudos} getContent={(k) => k.content} getCreatedAt={(k) => k.createdAt} />
      </div>
    </>
  );
}

// App component handles the main Firebase connection and state management
export default function App() {
  const [kudos, setKudos] = useState([]);

  useEffect(() => {
    // Start listening for changes on the 'kudos' path in Firebase
    const unsubscribe = onValue(KUDOS_REF, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the Firebase object into a flat array
        const kudosArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setKudos(kudosArray); 
      } else {
        setKudos([]);
      }
    });

    // 🛑 CRITICAL CHANGE: The auto-clear interval is completely removed.
    // The Live Wall will now always show all kudos loaded from Firebase.
    
    // Cleanup function: stop listening to Firebase
    return () => {
      unsubscribe(); 
    };
  }, []); 


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
          {/* Pass kudos state down to both Wall and Reports */}
          <Route path="/" element={<Wall kudos={kudos} />} />
          <Route path="/wall" element={<Wall kudos={kudos} />} />
          <Route 
            path="/reports" 
            element={<Reports kudos={kudos} getContent={(k) => k.content} getCreatedAt={(k) => k.createdAt} />} 
          />
          <Route path="*" element={<Navigate to="/wall" replace />} />
        </Routes>
      </main>
    </>
  );
}
