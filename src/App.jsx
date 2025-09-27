// src/pages/Reports.jsx
import React, { useMemo, useState } from "react";

/**
 * Monthly report that works with kudos shaped as:
 *   { id, content, createdAt }
 * It infers recipient(s) from @mentions in the content, e.g. "@alice great job".
 * - Multiple @mentions in one kudos are each counted once for that entry.
 * - If no @mention, the kudos is attributed to "Unattributed".
 *
 * Props (all optional):
 *   - kudos?: array
 *   - getContent?: (k) => string
 *   - getCreatedAt?: (k) => string|Date
 */
export default function Reports({
  kudos: kudosProp = [],
  getContent = (k) => k.content,
  getCreatedAt = (k) => k.createdAt,
}) {
  // Fallback to localStorage if no props provided
  const kudosFromStorage = useMemo(() => {
    try {
      const raw = localStorage.getItem("kudos");
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, []);

  const allKudos = (kudosProp && kudosProp.length ? kudosProp : kudosFromStorage) || [];

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [personFilter, setPersonFilter] = useState(""); // optional filter by person

  // Extract @mentions from text. Returns array of strings without '@'
  function extractMentions(text = "") {
    const out = new Set();
    // match @word (letters, digits, underscore, dot, hyphen). Case-insensitive.
    const re = /@([A-Za-z0-9._-]+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const name = m[1].trim();
      if (name) out.add(name);
    }
    if (out.size === 0) {
      out.add("Unattributed");
    }
    return Array.from(out);
  }

  function ymd(d) {
    // YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function withinSelectedMonth(dt) {
    return dt.getMonth() === Number(selMonth) && dt.getFullYear() === Number(selYear);
  }

  // Build report when user clicks Generate
  const [summaryRows, setSummaryRows] = useState([]); // [{ person, total }]
  const [dailyRows, setDailyRows] = useState([]);     // [{ date, person, count }]

  function generate() {
    const summaryMap = new Map(); // person -> total
    const dayMap = new Map();     // `${date}::${person}` -> count

    for (const k of allKudos) {
      const dt = new Date(getCreatedAt(k));
      if (isNaN(dt)) continue;
      if (!withinSelectedMonth(dt)) continue;

      const text = (getContent?.(k) ?? k.content ?? "").toString();
      const mentions = extractMentions(text);
      const dateKey = ymd(dt);

      for (const personRaw of mentions) {
        const person = personRaw; // keep as-is (case-sensitive display)
        if (personFilter && person.toLowerCase() !== personFilter.trim().toLowerCase()) {
          continue;
        }

        // summary
        summaryMap.set(person, (summaryMap.get(person) || 0) + 1);

        // per day
        const key = `${dateKey}::${person}`;
        dayMap.set(key, (dayMap.get(key) || 0) + 1);
      }
    }

    // Build rows
    const sRows = Array.from(summaryMap, ([person, total]) => ({ person, total }))
      .sort((a, b) => b.total - a.total || a.person.localeCompare(b.person));

    const dRows = Array.from(dayMap, ([key, count]) => {
      const [date, person] = key.split("::");
      return { date, person, count };
    }).sort((a, b) => {
      // sort by date desc, then person asc
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return a.person.localeCompare(b.person);
    });

    setSummaryRows(sRows);
    setDailyRows(dRows);
  }

  // Simple styles
  const S = {
    wrap: { paddingTop: 16 },
    card: { background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #e2e8f0", boxShadow: "0 6px 20px rgba(0,0,0,.05)" },
    h2: { marginTop: 0, color: "#007f89" },
    row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 },
    input: { padding: "10px 12px", borderRadius: 12, border: "1px solid #cbd5e1" },
    btn: { padding: "10px 14px", borderRadius: 12, border: "1px solid #40E0D0", background: "#40E0D0", color: "#fff", cursor: "pointer", fontWeight: 600 },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 8, background: "#fff", borderRadius: 12, overflow: "hidden" },
    th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "10px 12px", background: "#f5f7fa" },
    td: { borderBottom: "1px solid #f1f5f9", padding: "10px 12px", verticalAlign: "top" },
    muted: { color: "#64748b" },
    kpiRow: { marginTop: 6, marginBottom: 8 },
  };

  // Autocomplete options: collect distinct persons from all kudos for convenience
  const allPersons = useMemo(() => {
    const set = new Set();
    for (const k of allKudos) {
      const text = (getContent?.(k) ?? k.content ?? "").toString();
      extractMentions(text).forEach(p => set.add(p));
    }
    return Array.from(set).sort();
  }, [allKudos]);

  return (
    <div className="container" style={S.wrap}>
      <div className="card" style={S.card}>
        <h2 style={S.h2}>Monthly Kudos Report</h2>

        <div style={S.row}>
          <select value={selMonth} onChange={(e)=>setSelMonth(Number(e.target.value))} style={S.input}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>

          <input
            type="number"
            value={selYear}
            onChange={(e)=>setSelYear(Number(e.target.value))}
            style={{ ...S.input, width: 110 }}
          />

          <input
            list="persons"
            placeholder="Filter by @person (optional)…"
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            style={{ ...S.input, minWidth: 220 }}
          />
          <datalist id="persons">
            {allPersons.map(p => <option key={p} value={p} />)}
          </datalist>

          <button style={S.btn} onClick={generate}>Generate</button>
        </div>

        {/* Summary */}
        {summaryRows.length > 0 ? (
          <>
            <div style={S.kpiRow}>
              <span style={{ fontWeight: 700 }}>{summaryRows.reduce((a, b) => a + b.total, 0)}</span>{" "}
              <span style={S.muted}>kudos in {MONTHS[selMonth]} {selYear}</span>
            </div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Person</th>
                  <th style={S.th} width="120">Total</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((r) => (
                  <tr key={r.person}>
                    <td style={S.td}>@{r.person}</td>
                    <td style={S.td}>{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div style={{ ...S.muted, marginTop: 8 }}>
            Pick month/year (and optional @person) then click <b>Generate</b>.
          </div>
        )}

        {/* Daily breakdown */}
        {dailyRows.length > 0 && (
          <>
            <h3 style={{ marginTop: 18, marginBottom: 6, color: "#007f89" }}>Daily Breakdown</h3>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th} width="140">Date</th>
                  <th style={S.th}>Person</th>
                  <th style={S.th} width="120">Kudos</th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map((r, idx) => (
                  <tr key={idx}>
                    <td style={S.td}>{r.date}</td>
                    <td style={S.td}>@{r.person}</td>
                    <td style={S.td}>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div style={{ ...S.muted, marginTop: 10 }}>
          <b>How it works:</b> add @mentions in your kudos (e.g., <code>@alice</code>).  
          Each kudos counts one for every mentioned person. If no @mention is found, it’s grouped under <i>Unattributed</i>.
        </div>
      </div>
    </div>
  );
}
