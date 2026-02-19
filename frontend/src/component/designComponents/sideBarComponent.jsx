import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Warehouse,
  ShoppingCart, Users, Truck, Wallet, UserCog,
  BarChart2, Settings, LogOut, Zap,
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../../context/Context";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/",           label: "Home",      icon: <LayoutDashboard size={18} />, exact: true },
  { to: "/products",   label: "Products",  icon: <Package size={18} /> },
  { to: "/retail",     label: "Retail",    icon: <ShoppingBag size={18} /> },
  { to: "/stock",      label: "Stock",     icon: <Warehouse size={18} /> },
  { to: "/sales",      label: "Sales",     icon: <ShoppingCart size={18} /> },
  { to: "/customers",  label: "Customers", icon: <Users size={18} /> },
  { to: "/purchases",  label: "Purchases", icon: <Truck size={18} /> },
  { to: "/finance",    label: "Finance",   icon: <Wallet size={18} /> },
  { to: "/employees",  label: "Employees", icon: <UserCog size={18} /> },
  { to: "/reports",    label: "Reports",   icon: <BarChart2 size={18} /> },
  { to: "/system",     label: "System",    icon: <Settings size={18} /> },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Top brand area with toggle */}
      <div className="sidebar-header" onClick={toggleSidebar} style={{ cursor: "pointer" }}>
        <div className="header-logo" style={{ width: 32, height: 32, minWidth: 32, borderRadius: 6, fontSize: 15 }}>
          N
        </div>
        {isOpen && <span style={{ fontWeight: 700, fontSize: 14, color: "#111827", overflow: "hidden", whiteSpace: "nowrap" }}>Ngtech ERP</span>}
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, overflowY: "auto" }}>
        <ul className="menu-items" style={{ paddingTop: 8 }}>
          {navItems.map((item) => (
            <React.Fragment key={item.to}>
              <li style={{ padding: 0 }}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: isOpen ? 12 : 0,
                    justifyContent: isOpen ? "flex-start" : "center",
                    padding: "11px 16px",
                    textDecoration: "none",
                    color: isActive ? "#18b34a" : "#374151",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    transition: "background 0.15s",
                    width: "100%",
                    boxSizing: "border-box",
                  })}
                >
                  {item.icon}
                  {isOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
                </NavLink>
              </li>
              {item.label === "System" && isOpen && (
                <li style={{ padding: 0 }}>
                  <NavLink
                    to="/system/masters"
                    className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 16px 8px 44px",
                      textDecoration: "none",
                      color: isActive ? "#18b34a" : "#6b7280",
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                    })}
                  >
                    Masters
                  </NavLink>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </nav>

      {/* Powered by KiliMax */}
      {isOpen && (
        <div style={{ padding: "10px 16px", fontSize: 11, color: "#9ca3af", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={12} color="#18b34a" />
          Powered by KiliMax
        </div>
      )}

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center",
            gap: isOpen ? 12 : 0,
            justifyContent: isOpen ? "flex-start" : "center",
            padding: "12px 18px",
            background: "none", border: "none",
            cursor: "pointer", width: "100%",
            color: "#ef4444", fontSize: 13,
          }}
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

