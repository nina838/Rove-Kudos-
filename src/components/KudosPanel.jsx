// src/components/KudosPanel.jsx
import React, { useMemo, useEffect, useState } from "react";

export default function KudosPanel({
  kudos,
  getContent,
  getCreatedAt,
}) {
  const THEME = {
    lightBlue: "#eef9ff",
    blue: "#2b7bd3",
    turquoise: "#40E0D0",
    slate: "#0f172a",
    grayMid: "#dfe8ef",
    textMuted: "#6b7280",
  };

  const styles = {
    section: { marginBottom: 12 },
    itemCard: {
      background: THEME.lightBlue,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      border: `1px solid ${THEME.grayMid}`,
      boxShadow: "0 6px 18px rgba(15,23,42,0.03)",
      transition: "transform 220ms ease, opacity 220ms ease",
      opacity: 1,
    },
    itemMessage: { fontSize: 15, color: THEME.slate, marginBottom: 8, lineHeight: 1.5 },
    itemTime: { fontSize: 13, color: THEME.textMuted },
    empty: { color: THEME.textMuted, fontSize: 14 },
  };

  // add a small local 'mount' flag to animate newly rendered items
  const [mountedIds, setMountedIds] = useState(() => (kudos || []).map(k => k.id));

  useEffect(() => {
    // when kudos change, mark any new ids and animate
    const ids = (kudos || []).map(k => k.id);
    const newIds = ids.filter(id => !mountedIds.includes(id));
    if (newIds.length > 0) {
      setMountedIds(prev => [...newIds, ...prev]);
      // remove old ids from mounted list after animation window (to keep array small)
      const t = setTimeout(() => {
        setMountedIds(ids);
      }, 600);
      return () => clearTimeout(t);
    } else {
      // keep mounted in sync
      setMountedIds(ids);
    }
  }, [kudos]);

  const items = Array.isArray(kudos) ? kudos : [];
  const sorted = useMemo(
    () => items.slice().sort((a, b) => new Date(getCreatedAt(b)) - new Date(getCreatedAt(a))),
    [items, getCreatedAt]
  );

  return (
    <div>
      <section style={styles.section}>
        {sorted.length === 0 ? (
          <div style={styles.empty}>No kudos yet. Be the first — your message will appear instantly.</div>
        ) : (
          sorted.map((k) => {
            // subtle mount animation styles
            const isNew = mountedIds.includes(k.id);
            const animStyle = isNew ? { transform: "translateY(0)", opacity: 1 } : { transform: "translateY(0)", opacity: 1 };
            return (
              <div
                key={k.id}
                style={{ ...styles.itemCard, ...animStyle }}
                aria-live="polite"
              >
                <div style={styles.itemMessage}>{getContent?.(k) ?? ""}</div>
                <div style={styles.itemTime}>{new Date(getCreatedAt(k)).toLocaleString()}</div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
