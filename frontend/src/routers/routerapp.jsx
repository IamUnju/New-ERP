import { Routes, BrowserRouter, Route } from "react-router-dom"
import LoginPage from "../pages/login"
import DefaultLayout from "../layouts/Default_layout"
import AuthLayout from "../layouts/auth_layout"
import { UserContextProvider } from "../context/Context"
import RoleBasedProtectedRoute from "../component/protectedRoute"
import NotFound from "../pages/notfound"
import Unauthorized from "../pages/unuthorized"
import Homepage from "../pages/home"
import Dashboard from "../pages/DashboadPage"
import RegisterForm from "../pages/register"
import ProductsPage from "../pages/products/ProductsPage"
import ProductsCreatePage from "../pages/products/ProductsCreatePage"
import CategoryManagementPage from "../pages/products/CategoryManagementPage"
import UsersPage from "../pages/users/UsersPage"
import SalesPage from "../pages/sales/SalesPage"
import CustomersPage from "../pages/customers/CustomersPage"
import PurchasesPage from "../pages/purchases/PurchasesPage"
import FinancePage from "../pages/finance/FinancePage"
import EmployeesPage from "../pages/employees/EmployeesPage"
import StockPage from "../pages/stock/StockPage"
import ReportsPage from "../pages/reports/ReportsPage"
import SystemPage from "../pages/system/SystemPage"
import MastersPage from "../pages/system/MastersPage"
import RetailPage from "../pages/retail/RetailPage"
import StoreOrdersPage from "../pages/retail/StoreOrdersPage"
import StoreReturnsPage from "../pages/retail/StoreReturnsPage"
import PaymentsPage from "../pages/retail/PaymentsPage"
import AdjustPaymentsPage from "../pages/retail/AdjustPaymentsPage"

const ALL = ["admin", "manager", "storekeeper", "sales", "accountant", "hr"]

function AppRouter() {
  return (
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Protected app routes wrapped in DefaultLayout */}
          <Route element={<DefaultLayout />}>
            <Route path="/" element={
              <RoleBasedProtectedRoute allowedrole={ALL}>
                <Dashboard />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/home" element={
              <RoleBasedProtectedRoute allowedrole={ALL}>
                <Homepage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/products" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "storekeeper"]}>
                <ProductsPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/products/new" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "storekeeper"]}>
                <ProductsCreatePage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/products/categories" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "storekeeper"]}>
                <CategoryManagementPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/users" element={
              <RoleBasedProtectedRoute allowedrole={["admin"]}>
                <UsersPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/sales" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "sales"]}>
                <SalesPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/retail" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "sales"]}>
                <RetailPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/retail/store-orders" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "sales"]}>
                <StoreOrdersPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/retail/store-returns" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "sales"]}>
                <StoreReturnsPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/retail/payments" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "sales"]}>
                <PaymentsPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/retail/adjust-payments" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "sales"]}>
                <AdjustPaymentsPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/stock" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "storekeeper"]}>
                <StockPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/customers" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "sales"]}>
                <CustomersPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/purchases" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "storekeeper"]}>
                <PurchasesPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/finance" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "accountant"]}>
                <FinancePage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/employees" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "hr"]}>
                <EmployeesPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/reports" element={
              <RoleBasedProtectedRoute allowedrole={["admin", "manager", "accountant"]}>
                <ReportsPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/system" element={
              <RoleBasedProtectedRoute allowedrole={["admin"]}>
                <SystemPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/system/masters" element={
              <RoleBasedProtectedRoute allowedrole={["admin"]}>
                <MastersPage />
              </RoleBasedProtectedRoute>
            } />
            <Route path="/register" element={
              <RoleBasedProtectedRoute allowedrole={["admin"]}>
                <RegisterForm />
              </RoleBasedProtectedRoute>
            } />
          </Route>

          {/* Auth routes wrapped in AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Utility routes */}
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  )
}
export default AppRouter

