// src/pages/Reports.jsx
import React, { useMemo, useState } from "react";

export default function Reports({ kudos, getRecipient, getRecipientName, getCreatedAt }) {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
  const [rows, setRows] = useState([]);

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

    setRows(Array.from(map.values()).sort((a, b) => b.count - a.count));
  }

  const S = {
    row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
    input: { padding: "10px 12px", borderRadius: 12, border: "1px solid #e2e8f0" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 8, background: "#fff", borderRadius: 12, overflow: "hidden" },
    th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "10px 12px", background: "#f1f5f9" },
    td: { borderBottom: "1px solid #f1f5f9", padding: "10px 12px" },
    h2: { marginTop: 0, color: "var(--rove-blue, #003da5)" },
    btn: { padding: "10px 14px", borderRadius: 12, border: "1px solid var(--rove-blue, #003da5)", background: "var(--rove-blue, #003da5)", color: "#fff", cursor: "pointer" },
  };

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="card" style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #e2e8f0" }}>
        <h2 style={S.h2}>Monthly Kudos Report</h2>

        <div style={{ ...S.row, marginBottom: 8 }}>
          <input
            placeholder="Filter by person name or ID…"
            value={personQuery}
            onChange={(e) => setPersonQuery(e.target.value)}
            list="report-people"
            style={{ ...S.input, minWidth: 260 }}
          />
          <datalist id="report-people">
            {people.map(p => <option key={p.id} value={p.name} />)}
            {people.map(p => <option key={p.id + "-id"} value={p.id} />)}
          </datalist>

          <select value={selMonth} onChange={(e)=>setSelMonth(Number(e.target.value))} style={S.input}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>

          <input type="number" value={selYear} onChange={(e)=>setSelYear(Number(e.target.value))} style={{ ...S.input, width: 120 }} />
          <button style={S.btn} onClick={generate}>Generate</button>
        </div>

        {rows.length ? (
          <table style={S.table}>
            <thead><tr><th style={S.th}>Person</th><th style={S.th}>Kudos</th></tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i}><td style={S.td}>{r.name}</td><td style={S.td}>{r.count}</td></tr>)}</tbody>
          </table>
        ) : (
          <div style={{ color: "#64748b" }}>Pick a month/year (and optionally a person) then click Generate.</div>
        )}
      </div>
    </div>
  );
}

