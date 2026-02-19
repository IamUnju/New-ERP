import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import DashboardPage from "../pages/dashboard/DashboardPage.jsx";
import ProductsPage from "../pages/products/ProductsPage.jsx";
import UsersPage from "../pages/users/UsersPage.jsx";
import SalesPage from "../pages/sales/SalesPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute permission={{ path: "/api/reports/", action: "view" }}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute permission={{ path: "/api/products/", action: "view" }}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute permission={{ path: "/api/users/", action: "view" }}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute permission={{ path: "/api/orders/", action: "view" }}>
              <SalesPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
