// src/components/KudosPanel.jsx
import React, { useMemo, useEffect } from "react";

export default function KudosPanel({
  kudos,
  getContent,
  getCreatedAt,
  currentUserId,
  allowedAdminIds = ["rovester-admin"],
  onArchive,
  onDelete,
}) {
  const THEME = {
    blue: "#2b7bd3",
    turquoise: "#2bcab3",
    slate: "#0f172a",
    graySoft: "#f6f8fb",
    grayMid: "#dfe8ef",
    textMuted: "#6b7280",
  };

  const S = {
    section: { marginBottom: 12 },
    card: { background: "#fff", borderRadius: 14, border: `1px solid ${THEME.grayMid}`, padding: 14, marginBottom: 12, boxShadow: "0 8px 22px rgba(15,23,42,0.03)" },
    message: { fontSize: 15, color: THEME.slate, marginBottom: 8, lineHeight: 1.5 },
    timestamp: { fontSize: 13, color: THEME.textMuted },
    subtle: { color: THEME.textMuted, fontSize: 14 },
    head: { marginTop: 0, color: THEME.blue },
    adminRow: { display: "flex", gap: 8, alignItems: "center" }
  };

  // keep dataset for admin flow compatibility
  useEffect(() => {
    document.body.dataset.adminUnlocked = "false";
    return () => { delete document.body.dataset.adminUnlocked; };
  }, []);

  const items = Array.isArray(kudos) ? kudos : [];
  const sorted = useMemo(
    () => items.slice().sort((a, b) => new Date(getCreatedAt(b)) - new Date(getCreatedAt(a))),
    [items, getCreatedAt]
  );

  return (
    <div>
      <section style={S.section}>
        {sorted.length === 0 ? (
          <div style={S.subtle}>No kudos yet. Be the first to add one — it will appear instantly.</div>
        ) : (
          sorted.map(k => (
            <div key={k.id} style={S.card}>
              <div style={S.message}>{getContent?.(k) ?? ""}</div>
              <div style={S.timestamp}>{new Date(getCreatedAt(k)).toLocaleString()}</div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
