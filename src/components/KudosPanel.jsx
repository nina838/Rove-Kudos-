// src/components/KudosPanel.jsx
import React, { useMemo, useState } from "react";

/**
 * STRICT LOCK:
 * - Archive/Delete NEVER render unless unlocked via PIN 12345.
 * - "Unlock admin" button only shows if currentUserId matches allowedAdminIds.
 * - Debug line at the top helps verify state.
 */
export default function KudosPanel({
  kudos,
  getRecipient,
  getRecipientName,
  getCreatedAt,
  currentUserId,
  allowedAdminIds = [], // IMPORTANT: keep this a *fixed* list (do NOT pass currentUserId here)
  onArchive,
  onDelete,
}) {
  const S = {
    section: { marginBottom: 16 },
    row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
    input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db" },
    btn: (v) => {
      const b = { padding: "10px 14px", borderRadius: 12, border: "1px solid", cursor: "pointer", fontSize: 14, whiteSpace: "nowrap" };
      if (v === "danger") return { ...b, background: "#dc2626", color: "#fff", borderColor: "#dc2626" };
      if (v === "secondary") return { ...b, background: "#f3f4f6", color: "#111827", borderColor: "#e5e7eb" };
      if (v === "outline") return { ...b, background: "#fff", color: "#0f172a", borderColor: "#cbd5e1" };
      return { ...b, background: "#0f172a", color: "#fff", borderColor: "#0f172a" };
    },
    subtle: { color: "#64748b", fontSize: 14 },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 8 },
    th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "8px 12px" },
    td: { borderBottom: "1px solid #f3f4f6", padding: "8px 12px" }
  };

  // ---------- STRICT Admin lock (PIN = 12345) ----------
  const PASSCODE = "12345";
  const canSeeUnlock = (allowedAdminIds || []).map(String).includes(String(currentUserId));

  const [unlocked, setUnlocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");

  function handleConfirmPin() {
    if (pin !== PASSCODE) {
      setPinErr("Incorrect passcode");
      return;
    }
    setUnlocked(true);
    setShowPin(false);
    setPin("");
  }

  // ---------- Monthly report ----------
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

  const [generatedRows, setGeneratedRows] = useState([]);
  const [generatedFor, setGeneratedFor] = useState({ month: selMonth, year: selYear, person: null });

  function withinSelectedMonth(dt) {
    return dt.getMonth() === Number(selMonth) && dt.getFullYear() === Number(selYear);
  }

  function generateMonthReport() {
    const rows = new Map();
    (kudos || []).forEach(k => {
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

  function exportGeneratedCsv() {
    if (!generatedRows.length) return;
    const header = ["Person","Kudos"];
    const data = generatedRows.map(r => [r.name, r.count]);
    const lines = [header.join(","), ...data.map(r => r.join(","))].join("\n");
    const label = `${MONTHS[generatedFor.month]}-${generatedFor.year}${generatedFor.person ? "-" + generatedFor.person.replace(/\s+/g,"_") : ""}`;
    const url = URL.createObjectURL(new Blob([lines], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = `rovester_kudos_${label}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  // Optional: per-person all-months quick table
  const allMonthsForSelected = useMemo(() => {
    if (!selectedPerson) return [];
    const counts = Array(12).fill(0);
    for (const k of kudos || []) {
      if (String(getRecipient(k)) !== selectedPerson.id) continue;
      const dt = new Date(getCreatedAt(k));
      if (!isNaN(dt)) counts[dt.getMonth()]++;
    }
    return MONTHS.map((m, i) => ({ month: m, kudos: counts[i] }));
  }, [kudos, selectedPerson, getRecipient, getCreatedAt]);

  return (
    <div>
      {/* DEBUG: remove later if you want */}
      <div style={{ marginBottom: 8, fontSize: 12, color: "#64748b" }}>
        Debug — currentUserId: <b>{String(currentUserId)}</b> | allowed: <b>{String(canSeeUnlock)}</b> | unlocked: <b>{String(unlocked)}</b>
      </div>

      {/* Admin Controls (strict) */}
      <section style={S.section}>
        <h3 style={{ marginTop: 0 }}>Rovester Admin</h3>

        {!canSeeUnlock && (
          <p style={S.subtle}>You don’t have access to Rovester admin tools.</p>
        )}

        {canSeeUnlock && !unlocked && (
          <button style={S.btn("outline")} onClick={() => { setPin(""); setPinErr(""); setShowPin(true); }}>
            Unlock admin (passcode required)
          </button>
        )}

        {/* STRICT: Archive/Delete are NEVER rendered unless unlocked */}
        {canSeeUnlock && unlocked && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={S.btn("secondary")} onClick={() => onArchive?.()}>Archive</button>
            <button style={S.btn("danger")} onClick={() => onDelete?.()}>Delete</button>
            <span style={S.subtle}>Unlocked with passcode.</span>
          </div>
        )}
      </section>

      {/* Passcode Dialog */}
      {showPin && (
        <>
          <div onClick={() => setShowPin(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)" }} />
          <div
            style={{
              position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
              background: "#fff", width: "100%", maxWidth: 420, padding: 16, borderRadius: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,.15)"
            }}
          >
            <h3 style={{ marginTop: 0 }}>Enter Rovester admin passcode</h3>
            <p style={S.subtle}>Only users with the passcode can use admin actions.</p>
            <input
              type="password"
              placeholder="Passcode"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinErr(""); }}
              style={{ ...S.input, width: "100%" }}
            />
            {pinErr && <div style={{ color: "#b91c1c", fontSize: 13, marginTop: 6 }}>{pinErr}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button style={S.btn("outline")} onClick={() => setShowPin(false)}>Cancel</button>
              <button style={S.btn()} onClick={handleConfirmPin}>Confirm</button>
            </div>
          </div>
        </>
      )}

      {/* Monthly Report */}
      <section style={S.section}>
        <h3 style={{ marginTop: 0 }}>Rovester Monthly Kudos Report</h3>
        <ReportControls
          MONTHS={MONTHS}
          people={people}
          selMonth={selMonth}
          setSelMonth={setSelMonth}
          selYear={selYear}
          setSelYear={setSelYear}
          personQuery={personQuery}
          setPersonQuery={setPersonQuery}
          generatedRows={generatedRows}
          generatedFor={generatedFor}
          generateMonthReport={generateMonthReport}
          exportGeneratedCsv={exportGeneratedCsv}
          allMonthsForSelected={allMonthsForSelected}
          selectedPerson={selectedPerson}
          S={S}
        />
      </section>
    </div>
  );
}

function ReportControls(props) {
  const {
    MONTHS, people, selMonth, setSelMonth, selYear, setSelYear,
    personQuery, setPersonQuery, generatedRows, generatedFor,
    generateMonthReport, exportGeneratedCsv, allMonthsForSelected, selectedPerson, S
  } = props;

  return (
    <>
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

        <button style={S.btn()} onClick={generateMonthReport}>Generate</button>
        <button style={S.btn("outline")} onClick={exportGeneratedCsv} disabled={!generatedRows.length}>Export CSV</button>
      </div>

      {generatedRows.length ? (
        <>
          <div style={S.subtle}>
            Generated for <b>{MONTHS[generatedFor.month]} {generatedFor.year}</b>
            {generatedFor.person ? <> — Person: <b>{generatedFor.person}</b></> : null}
          </div>
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
        </>
      ) : (
        <div style={S.subtle}>Pick a month/year (and optionally a person) then click Generate.</div>
      )}

      {selectedPerson && (
        <>
          <div style={{ marginTop: 16, fontWeight: 600 }}>
            All months for {selectedPerson.name}
          </div>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Month</th><th style={S.th}>Kudos</th></tr></thead>
            <tbody>
              {allMonthsForSelected.map(r => (
                <tr key={r.month}><td style={S.td}>{r.month}</td><td style={S.td}>{r.kudos}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
