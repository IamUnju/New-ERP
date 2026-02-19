import React, { useContext } from "react";
import { UserContext } from "../context/Context";
import { Link } from "react-router-dom";

const Homepage = () => {
  const { user, roles } = useContext(UserContext);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#111827" }}>
        Welcome back, {user?.username || "User"} 👋
      </h2>
      <p style={{ color: "#6b7280", marginBottom: 28 }}>Here's a quick overview of your system.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        <Link to="/products" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, cursor: "pointer" }}>
            <h3 style={{ margin: "0 0 6px", color: "#111827" }}>📦 Products</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>Manage inventory items</p>
          </div>
        </Link>
        <Link to="/sales" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, cursor: "pointer" }}>
            <h3 style={{ margin: "0 0 6px", color: "#111827" }}>🛒 Sales</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>View order history</p>
          </div>
        </Link>
        {roles?.includes("admin") && (
          <Link to="/users" style={{ textDecoration: "none" }}>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, cursor: "pointer" }}>
              <h3 style={{ margin: "0 0 6px", color: "#111827" }}>👥 Users</h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>Manage system users</p>
            </div>
          </Link>
        )}
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, cursor: "pointer" }}>
            <h3 style={{ margin: "0 0 6px", color: "#111827" }}>📊 Dashboard</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>Analytics &amp; reports</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
export default Homepage;