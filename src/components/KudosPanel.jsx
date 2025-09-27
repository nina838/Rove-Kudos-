// src/components/KudosPanel.jsx
import React, { useMemo } from "react";

export default function KudosPanel({
  kudos,
  getContent,      // function: (k) => string
  getCreatedAt,    // function: (k) => ISO string/date
}) {
  const THEME = {
    lightBlue: "#eef9ff",
    slate: "#0f172a",
    grayMid: "#dfe8ef",
    textMuted: "#6b7280",
  };

  const S = {
    section: { marginBottom: 12 },
    card: {
      background: THEME.lightBlue,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      border: `1px solid ${THEME.grayMid}`,
      boxShadow: "0 6px 18px rgba(15,23,42,0.03)",
    },
    msg: { fontSize: 15, color: THEME.slate, marginBottom: 8, lineHeight: 1.5 },
    time: { fontSize: 13, color: THEME.textMuted },
    empty: { color: THEME.textMuted, fontSize: 14 },
  };

  const items = Array.isArray(kudos) ? kudos : [];
  const sorted = useMemo(
    () => items.slice().sort((a, b) => new Date(getCreatedAt(b)) - new Date(getCreatedAt(a))),
    [items, getCreatedAt]
  );

  return (
    <div>
      <section style={S.section}>
        {sorted.length === 0 ? (
          <div style={S.empty}>No kudos yet. Be the first — your message will appear instantly.</div>
        ) : (
          sorted.map((k) => {
            const text =
              (typeof getContent === "function" ? getContent(k) : undefined) ??
              k.content ??
              k.message ??
              "";
            return (
              <div key={k.id} style={S.card}>
                <div style={S.msg}>{text}</div>
                <div style={S.time}>{new Date(getCreatedAt(k)).toLocaleString()}</div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
