// src/components/KudosPanel.jsx
import React, { useMemo, useState, useEffect } from "react";

export default function KudosPanel({
  kudos,
  getRecipient,
  getRecipientName,
  getCreatedAt,
  currentUserId,
  allowedAdminIds = ["rovester-admin"],
  onArchive,
  onDelete,
}) {
  const PASSCODE = "12345";

  // --- Rove theme (adjust if you have exact brand codes) ---
  const RO = {
    blue: "var(--rove-blue, #003da5)",     // primary
    green: "var(--rove-green, #00a859)",   // accent
    slate: "#0f172a",
    gray1: "#f8fafc",
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
      const base = {
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid",
        cursor: "pointer",
        fontSize: 14,
        whiteSpace: "nowrap",
      };
      if (v === "danger") return { ...base, background: RO.red, color: "#fff", borderColor: RO.red };
      if (v === "secondary") return { ...base, background: RO.gray2, color: RO.slate, borderColor: RO.gray3 };
      if (v === "outline") return { ...base, background: "#fff", color: RO.slate, borderColor: RO.gray3 };
      if (v === "green") return { ...base, background: RO.green, color: "#fff", borderColor: RO.green };
      return { ...base, background: RO.blue, color: "#fff", borderColor: RO.blue };
    },
    subtle: { color: RO.textSubtle, fontSize: 14 },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 8, background: "#fff", borderRadius: 12, overflow: "hidden" },
    th: { textAlign: "left", borderBottom: `1px solid ${RO.gray3}`, padding: "10px 12px", background: RO.gray2 },
    td: { borderBottom: `1px solid ${RO.gray2}`, padding: "10px 12px" },
    card: { background: "#fff", borderRadius: 12, border: `1px solid ${RO.gray3}`, padding: 12, marginBottom: 8 },
    h3: { marginTop: 0, color: RO.blue },
  };

  // ensure page starts locked
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

  // ---------- Render kudos list ----------
  const items = Array.isArray(kudos) ? kudos : [];
  const sorted = useMemo(
    () => items.slice().sort((a, b) => new Date(getCreatedAt(b)) - new Date(getCreatedAt(a))),
    [items, getCreatedAt]
  );

  // ---------- Monthly report ----------
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [personQuery, setPersonQuery] = useState("");
  const people = useMemo(() => {
    const m = new Map();
    for (const k of items) {
      const id = getRecipient(k);
      if (id == null) continue;
      const name = getRecipientName?.(k) ?? String(id);
      if (!m.has(id)) m.set(id, name);
    }
    return Array.from(m, ([id, name]) => ({ id: String(id), name }));
  }, [items, getRecipient, getRecipientName]);

  const selectedPerson = useMemo(() => {
    if (!personQuery) return null;
    const exact = people.find(p => String(p.id) === personQuery.trim());
    if (exact) return exact;
    const q = personQuery.trim().toLowerCase();
    return people.find(p => p.name.toLowerCase().includes(q)) || null;
  }, [people, personQuery]);

  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [generatedRows, setGeneratedRows] = useState([]);
  const [generatedFor, setGeneratedFor] = useState({ month: selMonth, year: selYear, person: null });

  function withinSelectedMonth(dt) {
    return dt.getMonth() === Number(selMonth) && dt.getFullYear() === Number(selYear);
  }

  function generateMonthReport() {
    const rows = new Map();
    (items || []).forEach(k => {
      const dt = new Date(getCreatedAt(k));
      if (isNaN(dt)) return;
      if (!withinSelectedMonth(dt)) return;

      const pid = String(getRecipient(k));
      const pname = getRecipientName?.(k) ?? pid;
      if (selectedPerson && pid !== selectedPerson.id) return;

      if (!rows.has(pid)) rows.set(pid, { name: pname, count: 0 });
      rows.get(pid).count++;
    });

    const arr = Array.from(rows.values()).sort((a, b) => b.count - a.count);
    setGeneratedRows(arr);
    setGeneratedFor({ month: selMonth, year: selYear, person: selectedPerson?.name || null });
  }

  return (
    <div>
      {/* Unlock / Tools */}
      <section style={S.section}>
        <h3 style={S.h3}>Kudos Wall Tools</h3>

        {!canSeeUnlock && (
          <p style={S.subtle}>You don’t have access to Kudos tools.</p>
        )}

        {canSeeUnlock && !unlocked && (
          <button
            className="admin-only"
            style={S.btn("green")}
            onClick={() => { setPin(""); setPinErr(""); setShowPin(true); }}
          >
            Unlock Tools
          </button>
        )}

        {canSeeUnlock && unlocked && (
          <div className="admin-only" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={S.btn("secondary")} onClick={() => onArchive?.()}>Archive</button>
            <button style={S.btn("danger")} onClick={() => onDelete?.()}>Delete</button>
            <span style={S.subtle}>Tools unlocked.</span>
          </div>
        )}
      </section>

      {/* Passcode dialog */}
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
              <div style={{ color: RO.slate, fontWeight: 600 }}>
                {getRecipientName?.(k) ?? getRecipient(k)}
              </div>
              <div style={{ fontSize: 13, color: RO.textSubtle }}>
                {new Date(getCreatedAt(k)).toDateString()}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Monthly Report */}
      <section style={S.section}>
        <h3 style={S.h3}>Monthly Kudos Report</h3>

        <div style={{ ...S.row, marginBottom: 8 }}>
          <input
            placeholder="Filter by person (type name or paste ID)…"
            value={personQuery}
            onChange={(e) => setPersonQuery(e.target.value)}
            list="rovester-people"
            style={{ ...S.input, minWidth: 260 }}
          />
          <datalist id="rovester-people">
            {people.map(p => <option key={p.id} value={p.name} />)}
            {people.map(p => <option key={p.id + "-id"} value={p.id} />)}
          </datalist>

          <select value={selMonth} onChange={(e)=>setSelMonth(Number(e.target.value))} style={S.input}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>

          <input
            type="number"
            value={selYear}
            onChange={(e)=>setSelYear(Number(e.target.value))}
            style={{ ...S.input, width: 120 }}
          />

          <button style={S.btn()} onClick={generateMonthReport}>Generate</button>
        </div>

        {generatedRows.length ? (
          <table style={S.table}>
            <thead>
              <tr><th style={S.th}>Person</th><th style={S.th}>Kudos</th></tr>
            </thead>
            <tbody>
              {generatedRows.map((r, idx) => (
                <tr key={idx}>
                  <td style={S.td}>{r.name}</td>
                  <td style={S.td}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={S.subtle}>Pick a month/year (and optionally a person) then click Generate.</div>
        )}
      </section>
    </div>
  );
}
