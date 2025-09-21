import React from "react";
import KudosPanel from "./components/KudosPanel";

function App() {
  // TODO: Replace with your real signed-in user ID (from your auth/session)
  const currentUserId = "your-user-id";

  // TODO: Replace with your real kudos (from your API/DB)
  const demoKudos = [
    { id: 1, toUserId: "your-user-id", toUserName: "You",   createdAt: "2025-02-03" },
    { id: 2, toUserId: "user-2",       toUserName: "Alex",  createdAt: "2025-02-15" },
    { id: 3, toUserId: "your-user-id", toUserName: "You",   createdAt: "2025-03-01" },
    { id: 4, toUserId: "user-2",       toUserName: "Alex",  createdAt: "2025-03-10" },
  ];

  return (
    <KudosPanel
      kudos={demoKudos}
      getRecipient={(k) => k.toUserId}
      getRecipientName={(k) => k.toUserName}
      getCreatedAt={(k) => k.createdAt}
      currentUserId={currentUserId}

      // Optional: only show Unlock button to your ID
      allowedAdminIds={["your-user-id"]}

      // Optional: wire to your backend
      onArchive={() => console.log("Archive (call your API)")}
      onDelete={() => console.log("Delete (call your API)")}
    />
  );
}

export default App;

