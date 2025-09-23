// src/pages/Wall.jsx
import React from "react";
import KudosPanel from "../components/KudosPanel.jsx";

export default function Wall() {
  // Replace this with the actual logged-in user id from your auth/session
  const currentUserId = "rovester-admin";

  // Example kudos data (replace with your DB or API data)
  const demoKudos = [
    { id: 1, toUserId: "rovester-admin", toUserName: "Rovester Admin", createdAt: "2025-01-05" },
    { id: 2, toUserId: "alice",          toUserName: "Alice",          createdAt: "2025-02-11" },
    { id: 3, toUserId: "bob",            toUserName: "Bob",            createdAt: "2025-02-19" },
    { id: 4, toUserId: "alice",          toUserName: "Alice",          createdAt: "2025-03-02" },
    { id: 5, toUserId: "rovester-admin", toUserName: "Rovester Admin", createdAt: "2025-04-09" },
    { id: 6, toUserId: "rovester-admin", toUserName: "Rovester Admin", createdAt: "2025-04-13" }
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
          allowedAdminIds={["rovester-admin"]} // only this ID sees Unlock button
          onArchive={() => alert("Archive requested (connect to your API).")}
          onDelete={() => alert("Delete requested (connect to your API).")}
        />
      </div>
    </div>
  );
}

