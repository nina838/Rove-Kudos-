import React, { useState } from "react";

export default function AddKudo() {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  function addKudo(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const old = JSON.parse(localStorage.getItem("kudos") || "[]");
    old.push({
      id: Date.now(),
      content: text.trim(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("kudos", JSON.stringify(old));
    setText("");
    setMessage("✅ Kudo saved!");
    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12, marginBottom: 16 }}>
      <form onSubmit={addKudo} style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a kudo..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: 0,
            background: "#003da5",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </form>
      {message && <div style={{ marginTop: 8, color: "#16a34a" }}>{message}</div>}
    </div>
  );
}

