// src/components/AddOns.jsx
import React, { useMemo, useState, useEffect } from "react";

/** AdminLock
 * Wrap your existing Admin UI inside <AdminLock ...> ... </AdminLock>
 * Props:
 *  - currentUserId: string (who is visiting)
 *  - allowedAdminIds: string[] (who can see Unlock)
 *  - passcode: string (default "12345")
 *  - children: your existing admin buttons (Archive/Delete/etc)
 */
export function AdminLock({
  currentUserId,
  allowedAdminIds = [],
  passcode = "12345",
  children,
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  const canSeeUnlock = (allowedAdminIds || [])
    .map(String)
    .includes(String(currentUserId));

  useEffect(() => {
    // belt & suspenders: hide anything with .admin-only unless unlocked
    document.body.dataset.adminUnlocked = unlocked ? "true" : "false";
    return () => { delete document.body.dataset.adminUnlocked; };
  }, [unlocked]);

  function confirm() {
    if (pin === String(passcode)) {
      setUnlocked(true);
      setShowPin(false);
      setPin("");
      setErr("");
    } else {
      setErr("Incorrect passcode");
    }
  }

  return (
    <>
      {/* Unlock button (only for allowed admins) */}
      {canSeeUnlock && !unlocked && (
        <button
          className="admin-only"
          onClick={() => { setShowPin(true); setPin(""); setErr(""); }}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}
        >
          Unlock admin
        </button>
      )}

      {/* Render your admin UI only when unlocked */}
      {canSeeUnlock && unlocked ? (
        <div className="admin-only">
          {children}
        </div>
      ) : null}

      {/* Passcode modal */}
      {showPin && (
        <>
          <div onClick={() => setShowPin(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)" }} />
          <div style={{
            position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
            background: "#fff", width: "100%", maxWidth: 420, padding: 16, borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,.15)"
          }}>
            <h3 style={{ marginTop: 0 }}>Enter admin passcode</h3>
            <p style={{ color: "#64748b", fontSize: 14 }}>Only users with the passcode can use admin actions.</p>
            <input
              type="password"
              placeholder="Passcode"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setErr(""); }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" }}
            />
            {err && <div style={{ color: "#b91c1c", fontSize: 13, marginTop: 6 }}>{err}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowPin(false)} style={{ padding: "8px 12px", borderRadius: 10 }}>Cancel</button>
              <button onClick={confirm} style={{ padding: "8px 12px", borderRadius: 10, background: "#000", color: "#fff" }}>Confirm</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/** MonthlyReport
 * Drop this where you want the report UI to appear.
 * Props:
 *  - kudos: array of your kudos items
 *  - getRecipient(k): returns person id (e.g., k.toUserId)
 *  - getRecipientName(k): returns display name (e.g., k.toUserName)
 *  - getCreatedAt(k): returns date string or Date (e.g., k.createdAt)
 */
export function MonthlyReport({
  kudos,
  getRecipient,
  getRecipientName,
  getCreatedAt
}) {
  const S = {
    row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
    input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" },
    btn: { padding: "10px 14px", borderRadius: 12, border: "1px solid #0f172a", background: "#0f172a", color: "#fff", cursor: "pointer" },
    btnOutline: { padding: "10px 14px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" },
    subtle: { color: "#64748b", fontSize: 14 },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 8 },
    th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "8px 12px" },
    td: { borderBottom: "1px solid #f3f4f6", padding: "8px 12px" }
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Build people list from kudos
  const people = useMemo(() => {
    const m = new Map();
    for (const k of kudos || []) {
      const id = getRecipient(k);
      if (id == null) continue;
      const name = getRecipientName?.(k) ?? String(id);
      if (!m.has(id)) m.set(id, name);
    }
    return Array.from(m, ([id, name]) => ({ id: String(id), name }));
  }, [kudos, getRecipient, getRecipientName]);

  const [personQuery, setPersonQuery] = useState("");
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ month: selMonth, year: selYear, person: null });

  const selectedPerson = useMemo(() => {
    if (!personQuery) return null;
    const exact = people.find(p => String(p.id) === personQuery.trim());
    if (exact) return exact;
    const q = personQuery.trim().toLowerCase();
    return people.find(p => p.name.toLowerCase().includes(q)) || null;
  }, [people, personQuery]);

  function withinSelectedMonth(dt) {
    return dt.getMonth() === Number(selMonth) && dt.getFullYear() === Number(selYear);
  }

  function generate() {
    const map = new Map();
    (kudos || []).forEach(k => {
      const dt = new Date(getCreatedAt(k));
      if (isNaN(dt)) return;
      if (!withinSelectedMonth(dt)) return;

      const pid = String(getRecipient(k));
      const pname = getRecipientName?.(k) ?? pid;
      if (selectedPerson && pid !== selectedPerson.id) return;

      if (!map.has(pid)) map.set(pid, { name: pname, count: 0 });
      map.get(pid).count++;
    });

    const arr = Array.from(map.values()).sort((a, b) => b.count - a.count);
    setRows(arr);
    setMeta({ month: selMonth, year: selYear, person: selectedPerson?.name || null });
  }

  function exportCsv() {
    if (!rows.length) return;
    const header = ["Person","Kudos"];
    const data = rows.map(r => [r.name, r.count]);
    const lines = [header.join(","), ...data.map(r => r.join(","))].join("\n");
    const label = `${MONTHS[meta.month]}-${meta.year}${meta.person ? "-" + meta.person.replace(/\s+/g,"_") : ""}`;
    const url = URL.createObjectURL(new Blob([lines], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = `rovester_kudos_${label}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Monthly Kudos Report</h3>
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
          style={{ ...S.input, width: 110 }}
        />

        <button style={S.btn} onClick={generate}>Generate</button>
        <button style={S.btnOutline} onClick={exportCsv} disabled={!rows.length}>Export CSV</button>
      </div>

      {rows.length ? (
        <>
          <div style={S.subtle}>
            Generated for <b>{MONTHS[meta.month]} {meta.year}</b>
            {meta.person ? <> — Person: <b>{meta.person}</b></> : null}
          </div>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Person</th><th style={S.th}>Kudos</th></tr></thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}><td style={S.td}>{r.name}</td><td style={S.td}>{r.count}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div style={S.subtle}>Pick a month/year (and optionally a person) then click Generate.</div>
      )}
    </div>
  );
}
<style>
  .admin-only { display: none !important; }
  body[data-admin-unlocked="true"] .admin-only { display: inline-flex !important; }
</style>

