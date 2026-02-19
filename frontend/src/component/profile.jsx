import React, { useState, useRef, useEffect, useContext } from "react";
import { User, ChevronDown, LogOut, Settings } from "lucide-react";
import { UserContext } from "../context/Context";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="user-menu" ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="user-menu-btn"
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: "none", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer" }}
      >
        <User size={18} />
        <span style={{ fontSize: "14px", fontWeight: 500 }}>{user?.username || "User"}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "110%", background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: "160px", zIndex: 100 }}>
          <ul style={{ listStyle: "none", margin: 0, padding: "4px 0" }}>
            <li>
              <button style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#374151" }}>
                <Settings size={14} /> Settings
              </button>
            </li>
            <li style={{ borderTop: "1px solid #e5e7eb" }}>
              <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#ef4444" }}>
                <LogOut size={14} /> Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
