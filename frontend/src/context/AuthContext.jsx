import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const response = await api.get("/api/v1/users/me/");
    setUser({ id: response.data.user_id, username: response.data.username, roles: response.data.roles });
    setPermissions(response.data.permissions || {});
  };

  const login = async (email, password) => {
    const response = await api.post("/api/v1/auth/token/", { email, password });
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    await fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setPermissions({});
  };

  const hasPermission = (path, action) => {
    const allowed = permissions[path] || [];
    return allowed.includes(action);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProfile().finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({ user, permissions, login, logout, hasPermission, loading }), [user, permissions, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
