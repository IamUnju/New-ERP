import React from "react";
import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-wrapper">
        <div className="auth-brand">
          <div className="header-logo" style={{ width: 48, height: 48, fontSize: 22, margin: "0 auto 12px" }}>S</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>Inventory System</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Manage your inventory efficiently</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
