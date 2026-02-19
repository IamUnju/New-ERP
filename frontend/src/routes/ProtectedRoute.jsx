import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, permission }) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission.path, permission.action)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
