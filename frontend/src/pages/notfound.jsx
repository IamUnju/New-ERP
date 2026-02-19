import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center", background: "#f9fafb" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>404</h1>
      <p style={{ fontSize: 18, color: "#6b7280", marginBottom: 28 }}>Page not found</p>
      <button
        onClick={() => navigate("/")}
        style={{ padding: "10px 24px", background: "#2563eb", color: "white", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}
export default NotFound;