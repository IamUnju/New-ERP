import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const menu = [
  { label: "Dashboard", path: "/dashboard", permission: { path: "/api/reports/", action: "view" } },
  { label: "Products", path: "/products", permission: { path: "/api/products/", action: "view" } },
  { label: "Users", path: "/users", permission: { path: "/api/users/", action: "view" } },
  { label: "Sales", path: "/sales", permission: { path: "/api/orders/", action: "view" } }
];

export default function Sidebar() {
  const { hasPermission } = useAuth();
  const visibleMenu = menu.filter((item) => !item.permission || hasPermission(item.permission.path, item.permission.action));

  return (
    <aside className="sidebar">
      <div className="brand">Inventory OS</div>
      <nav className="menu">
        {visibleMenu.map((item) => (
          <NavLink key={item.path} to={item.path} className="menu-link">
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
