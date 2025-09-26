// src/components/KudosPanel.jsx
import React, { useMemo, useState, useEffect } from "react";

export default function KudosPanel({
  kudos,
  getContent,     // now expects content accessor
  getCreatedAt,   // ISO timestamp string
  currentUserId,
  allowedAdminIds = ["rovester-admin"],
  onArchive,
  onDelete,
}) {
  const PASSCODE = "12345";

  // Brand colors (optional: set in :root vars via index.css)
  const RO = {
    blue: "var(--rove-blue, #003da5)",
    green: "var(--rove-green, #00a859)",
    slate: "#0f172a",
    gray2: "#f1f5f9",
    gray3: "#e2e8f0",
    textSubtle: "#64748b",
    red: "#dc2626",
  };

  const S = {
    section: { marginBottom: 16 },
    row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
    input: { padding: "10px 12px", borderRadius: 12, border: `1px solid ${RO.gray3}`, background: "#fff" },
    btn: (v) => {
      const base = { padding: "10px 14px", borderRadius: 12, border: "1px solid", cursor: "pointer", fontSize: 14, whiteSpace: "nowrap" };
      if (v === "danger") return { ...base, background: RO.red, color: "#fff", borderColor: RO.red };
      if (v === "secondary") return { ...base, background: RO.gray2, color: RO.slate, borderColor: RO.gray3 };
      if (v === "outline") return { ...base, background: "#fff", color: RO.slate, borderColor: RO.gray3 };
      if (v === "green") return { ...base, background: RO.green, color: "#fff", borderColor: RO.green };
      return { ...base, background: RO.blue, color: "#fff", borderColor: RO.blue };
    },
    subtle: { color: RO.textSubtle, fontSize: 14 },
    card: { background: "#fff", borderRadius: 12, border: `1px solid ${RO.gray3}`, padding: 12, marginBottom: 8 },
    h3: { marginTop: 0, color: RO.blue },
    message: { fontSize: 15, color: RO.slate, marginBottom: 6 },
    timestamp: { fontSize: 13, color: RO.textSubtle }
  };

  // Start locked (keep dataset usage in case admin flow re-added)
  useEffect(() => {
    document.body.dataset.adminUnlocked = "false";
    return () => { delete document.body.dataset.adminUnlocked; };
  }, []);

  const canSeeUnlock = (allowedAdminIds || []).map(String).includes(String(currentUserId));
  const [unlocked, setUnlocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");

  function handleConfirmPin() {
    if (pin !== PASSCODE) { setPinErr("Incorrect passcode"); return; }
    setUnlocked(true);
    document.body.dataset.adminUnlocked = "true";
    setShowPin(false);
    setPin("");
  }

  const items = Array.isArray(kudos) ? kudos : [];
  const sorted = useMemo(
    () => items.slice().sort((a, b) => new Date(getCreatedAt(b)) - new Date(getCreatedAt(a))),
    [items, getCreatedAt]
  );

  return (
    <div>
      {/* (Kudos Tools UI intentionally left out) */}

      {/* Passcode dialog (kept in case you want admin tools later) */}
      {showPin && (
        <>
          <div onClick={() => setShowPin(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)" }} />
          <div
            style={{
              position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
              background: "#fff", width: "100%", maxWidth: 420, padding: 16, borderRadius: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,.15)", border: `1px solid ${RO.gray3}`
            }}
          >
            <h3 style={{ marginTop: 0, color: RO.blue }}>Enter passcode</h3>
            <p style={S.subtle}>Only users with the passcode can use these tools.</p>
            <input
              type="password"
              placeholder="Passcode"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinErr(""); }}
              style={{ ...S.input, width: "100%" }}
            />
            {pinErr && <div style={{ color: RO.red, fontSize: 13, marginTop: 6 }}>{pinErr}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button style={S.btn("outline")} onClick={() => setShowPin(false)}>Cancel</button>
              <button style={S.btn()} onClick={handleConfirmPin}>Confirm</button>
            </div>
          </div>
        </>
      )}

      {/* Kudos list */}
      <section style={S.section}>
        <h3 style={S.h3}>Recent Kudos</h3>
        {sorted.length === 0 ? (
          <div style={S.subtle}>No kudos yet. Add some above.</div>
        ) : (
          sorted.map(k => (
            <div key={k.id} style={S.card}>
              <div style={S.message}>
                {getContent?.(k) ?? ""}
              </div>
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
