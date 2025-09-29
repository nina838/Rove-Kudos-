// src/pages/Reports.jsx
import React, { useMemo, useState } from "react";

/**
 * Monthly report that works with kudos shaped as:
 *   { id, content, createdAt }
 * Props:
 *   - kudos?: array (optional)
 *   - getContent?: (k) => string
 *   - getCreatedAt?: (k) => string|Date
 */
export default function Reports({
  kudos: kudosProp = [],
  getContent = (k) => k.content,
  getCreatedAt = (k) => k.createdAt,
}) {
  // If no kudos were passed in, try localStorage so this page still works standalone
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

  const allKudos =
    (kudosProp && kudosProp.length ? kudosProp : kudosFromStorage) || [];

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [keyword, setKeyword] = useState("");
  const [rows, setRows] = useState([]);

  // NEW: quick add-to-archive inputs
  const [newKudo, setNewKudo] = useState("");
  const [flash, setFlash] = useState("");

  function withinSelectedMonth(dt) {
    return (
      dt.getMonth() === Number(selMonth) &&
      dt.getFullYear() === Number(selYear)
    );
  }

  function generate() {
    const lower = keyword.trim().toLowerCase();
    const filtered = [];

    for (const k of allKudos) {
      const dt = new Date(getCreatedAt(k));
      if (isNaN(dt)) continue;
      if (!withinSelectedMonth(dt)) continue;

      const text = (getContent?.(k) ?? k.content ?? k.message ?? "").toString();
      if (lower && !text.toLowerCase().includes(lower)) continue;

      filtered.push({
        id: k.id,
        text,
        when: dt,
      });
    }

    // Newest first
    filtered.sort((a, b) => b.when - a.when);
    setRows(filtered);
  }

  // NEW: save one kudo to localStorage and refresh current view
  function saveKudo() {
    const text = newKudo.trim();
    if (!text) return;

    const old = (() => {
      try {
        return JSON.parse(localStorage.getItem("kudos") || "[]");
      } catch {
        return [];
      }
    })();

    old.push({
      id: Date.now(),
      content: text,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem("kudos", JSON.stringify(old));
    setNewKudo("");
    setFlash("✅ Kudo saved!");
    setTimeout(() => setFlash(""), 1500);

    // If user is viewing the current month, this will show immediately
    generate();
  }

  const totalCount = rows.length;

  const S = {
    wrap: { paddingTop: 16 },
    card: {
      background: "#fff",
      borderRadius: 16,
      padding: 16,
      border: "1px solid #e2e8f0",
    },
    h2: { marginTop: 0, color: "var(--rove-blue, #003da5)" },
    row: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: 8,
    },
    input: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
    },
    btn: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid var(--rove-blue, #003da5)",
      background: "var(--rove-blue, #003da5)",
      color: "#fff",
      cursor: "pointer",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 14,
      marginTop: 10,
      background: "#fff",
      borderRadius: 12,
      overflow: "hidden",
    },
    th: {
      textAlign: "left",
      borderBottom: "1px solid #e5e7eb",
      padding: "10px 12px",
      background: "#f1f5f9",
    },
    td: {
      borderBottom: "1px solid #f1f5f9",
      padding: "10px 12px",
      verticalAlign: "top",
    },
    muted: { color: "#64748b" },
    kpi: { fontWeight: 800, fontSize: 16 },
  };

  return (
    <div className="container" style={S.wrap}>
      <div className="card" style={S.card}>
        <h2 style={S.h2}>Monthly Kudos Report</h2>

        {/* Controls to view a month */}
        <div style={S.row}>
          <select
            value={selMonth}
            onChange={(e) => setSelMonth(Number(e.target.value))}
            style={S.input}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={selYear}
            onChange={(e) => setSelYear(Number(e.target.value))}
            style={{ ...S.input, width: 120 }}
          />

          <input
            placeholder="Filter by keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ ...S.input, minWidth: 240 }}
          />

          <button style={S.btn} onClick={generate}>
            Generate
          </button>
        </div>

        {/* NEW: Quick add-to-archive (localStorage) */}
        <div style={{ ...S.row, marginTop: 12 }}>
          <input
            value={newKudo}
            onChange={(e) => setNewKudo(e.target.value)}
            placeholder="Write a kudo to save…"
            style={{ ...S.input, minWidth: 260 }}
          />
          <button style={S.btn} onClick={saveKudo}>
            Save kudo
          </button>
          {flash && <span style={{ color: "#16a34a" }}>{flash}</span>}
        </div>

        {rows.length ? (
          <>
            <div style={{ marginTop: 6 }}>
              <span style={S.kpi}>{totalCount}</span>{" "}
              <span style={S.muted}>
                kudos in {MONTHS[selMonth]} {selYear}
              </span>
            </div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th} width="56">
                    #
                  </th>
                  <th style={S.th}>Kudos</th>
                  <th style={S.th} width="220">
                    Date &amp; Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id ?? idx}>
                    <td style={S.td}>{idx + 1}</td>
                    <td style={S.td}>{r.text}</td>
                    <td style={S.td}>{r.when.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div style={{ ...S.muted, marginTop: 8 }}>
            Pick month/year (and optionally a keyword) then click <b>Generate</b>.
            {(!allKudos || allKudos.length === 0) && (
              <>
                {" "}
                No data found. Add some with the <b>Save kudo</b> box above.
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

