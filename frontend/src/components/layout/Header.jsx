import { useAuth } from "../../context/AuthContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-title">Inventory Management</div>
      <div className="header-actions">
        <span className="header-user">{user?.username || "User"}</span>
        <button className="btn" onClick={logout} type="button">
          Sign out
        </button>
      </div>
    </header>
  );
}
