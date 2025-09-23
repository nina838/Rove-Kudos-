// src/App.jsx
import React from "react";
import KudosPanel from "./components/KudosPanel.jsx";

function App() {
  // TODO: Replace with your real logged-in user id from your auth/session
  const currentUserId = "your-user-id";

  // TODO: Replace with your real kudos data (from your API/DB)
  // The example assumes your kudos have fields: toUserId, toUserName, createdAt
  const demoKudos = [
    { id: 1, toUserId: "your-user-id", toUserName: "You",   createdAt: "2025-02-03" },
    { id: 2, toUserId: "user-2",       toUserName: "Alex",  createdAt: "2025-02-15" },
    { id: 3, toUserId: "your-user-id", toUserName: "You",   createdAt: "2025-03-01" },
    { id: 4, toUserId: "user-2",       toUserName: "Alex",  createdAt: "2025-03-10" },
  ];

  return (
    <KudosPanel
      kudos={demoKudos}
      // ⬇️ map these to YOUR kudos fields
      getRecipient={(k) => k.toUserId}
      getRecipientName={(k) => k.toUserName}
      getCreatedAt={(k) => k.createdAt}

      currentUserId={currentUserId}

      // Optional: only your ID can even see the Unlock button
      allowedAdminIds={["your-user-id"]}

      // Optional: hook these to your backend
      onArchive={() => console.log("Archive (call your API)")}
      onDelete={() => console.log("Delete (call your API)")}
    />
  );
}

export default App;
