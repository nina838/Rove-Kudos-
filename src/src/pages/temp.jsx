// src/pages/Wall.jsx
import React from "react";
import KudosPanel from "../components/KudosPanel.jsx";

export default function Wall() {
  // For now, treat visitors as "guest" so they *don't* match your admin list.
  const currentUserId = "guest";

  // Only YOU go into allowedAdminIds. Replace "rovester-admin" with your own ID if you want.
  const allowedAdmins = ["rovester-admin"];

  // Example demo data
  const demoKudos = [
    { id: 1, toUserId: "rovester-admin", toUserName: "Rovester Admin", createdAt: "2025-01-05" },
    { id: 2, toUserId: "alice",          toUserName: "Alice",          createdAt: "2025-02-11" },
    { id: 3, toUserId: "bob",            toUserName: "Bob",            createdAt: "2025-02-19" }
  ];

  return (
    <div className="card">
      <div className="card-head">Rovester Kudos Wall</div>
      <div className="card-body">
        <KudosPanel
          kudos={demoKudos}
          getRecipient={(k) => k.toUserId}
          getRecipientName={(k) => k.toUserName}
          getCreatedAt={(k) => k.createdAt}
          currentUserId={currentUserId}
          allowedAdminIds={allowedAdmins}
          onArchive={() => alert("Archive requested")}
          onDelete={() => alert("Delete requested")}
        />
      </div>
    </div>
  );
}
Temp rename Wall.jsx.
