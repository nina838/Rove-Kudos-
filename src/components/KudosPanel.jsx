// src/components/KudosPanel.jsx
import React, { useMemo, useState, useEffect } from "react";

export default function KudosPanel({
  kudos,
  getContent,
  getCreatedAt,
  currentUserId,
  allowedAdminIds = ["rovester-admin"],
  onArchive,
  onDelete,
}) {
  const RO = {
    blue: "#003da5",
    green: "#00a859",
    slate: "#0f172a",
    gray2: "#f1f5f9",
    gray3: "#e6edf3",
    textSubtle: "#64748b",
    red: "#dc2626",
  };

  const S = {
    section: { marginBottom: 12 },
    card: { background: "#fff", borderRadius: 14, border: `1px solid ${RO.gray3}`, padding: 14, marginBottom: 10, boxShadow: "0 6px 18px rgba(15,23,42,0.03)" },
    message: { fontSize: 15, color: RO.slate, marginBottom: 8, lineHeight: 1.45 },
    timestamp: { fontSize: 13, color: RO.textSubtle },
    head: { marginTop: 0, color: RO.blue },
    subtle: { color: RO.textSubtle, fontSize: 14 },
    btn: (v) => {
      const base = { padding: "8px 12px", borderRadius: 12, border: "1px solid", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" };
      if (v === "danger") return { ...base, background: RO.red, color: "#fff", borderColor: RO.red };
      if (v === "secondary") return { ...base, background: RO.gray2, color: RO.slate, borderColor: RO.gray3 };
      return { ...base, background: RO.green, color: "#fff", borderColor: RO.green };
    }
  };

  // keep admin dataset flag (unused visually)
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
          <div style={S.subtle}>No kudos yet. Be the first to add one!</div>
        ) : (
          sorted.map(k => (
            <div key={k.id} style={S.card}>
              <div style={S.message}>{getContent?.(k) ?? ""}</div>
              <div style={S.timestamp}>
                {new Date(getCreatedAt(k)).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
