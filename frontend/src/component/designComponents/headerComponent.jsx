import React, { useState } from "react";
import { Menu, Search, Bell, Plus, Settings, Grid3x3 } from "lucide-react";
import UserProfile from "../profile";

const Header = ({ onMenuClick, companyName = "Ngtech" }) => {
  const [search, setSearch] = useState("");

  return (
    <header className="header">
      {/* LEFT — menu toggle + brand */}
      <div className="header-left">
        <button
          onClick={onMenuClick}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}
        >
          <Menu size={20} color="#9ca3af" />
        </button>
        <div className="header-logo">N</div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", letterSpacing: "0.3px" }}>
          {companyName}
        </span>
      </div>

      {/* CENTER — search bar */}
      <div className="search-container" style={{ flex: 1, maxWidth: 420, margin: "0 24px" }}>
        <Search className="search-icon" size={15} />
        <input
          type="text"
          placeholder="Enter the page name or access path"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* RIGHT — actions + profile */}
      <div className="header-right">
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#18b34a", color: "#fff",
            border: "none", borderRadius: 6,
            padding: "6px 14px", fontWeight: 600, fontSize: 13,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <Plus size={15} /> New
        </button>

        <Bell size={18} color="#9ca3af" style={{ cursor: "pointer" }} />
        <Grid3x3 size={18} color="#9ca3af" style={{ cursor: "pointer" }} />
        <Settings size={18} color="#9ca3af" style={{ cursor: "pointer" }} />
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
