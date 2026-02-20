/**
 * Example usage of the Sidebar component
 * This shows how to integrate the professional ERP sidebar into your app
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './styles/sidebar.css';

// Example page components
const HomePage = () => <div style={{ padding: '40px' }}><h1>Home Page</h1></div>;
const ProductsPage = () => <div style={{ padding: '40px' }}><h1>Products Page</h1></div>;
const RetailPage = () => <div style={{ padding: '40px' }}><h1>Retail Page</h1></div>;
const StockPage = () => <div style={{ padding: '40px' }}><h1>Stock Page</h1></div>;
const SalesPage = () => <div style={{ padding: '40px' }}><h1>Sales Page</h1></div>;
const CustomersPage = () => <div style={{ padding: '40px' }}><h1>Customers Page</h1></div>;
const PurchasesPage = () => <div style={{ padding: '40px' }}><h1>Purchases Page</h1></div>;
const FinancePage = () => <div style={{ padding: '40px' }}><h1>Finance Page</h1></div>;
const EmployeesPage = () => <div style={{ padding: '40px' }}><h1>Employees Page</h1></div>;
const ReportsPage = () => <div style={{ padding: '40px' }}><h1>Reports Page</h1></div>;
const SystemPage = () => <div style={{ padding: '40px' }}><h1>System Page</h1></div>;

// Dropdown submenu pages
const PriceLevelsPage = () => <div style={{ padding: '40px' }}><h1>Price Levels</h1></div>;
const CategoriesPage = () => <div style={{ padding: '40px' }}><h1>Categories</h1></div>;
const BrandsPage = () => <div style={{ padding: '40px' }}><h1>Brands</h1></div>;

function App() {
  const handleLogout = () => {
    console.log('Logging out...');
    // Add your logout logic here
    // e.g., clear auth tokens, redirect to login, etc.
  };

  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6' }}>
        {/* Sidebar Navigation */}
        <Sidebar 
          isCollapsed={false} 
          onLogout={handleLogout} 
        />

        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
          marginLeft: '240px', // Match sidebar width
          overflowY: 'auto',
          transition: 'margin-left 0.3s ease'
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/price-levels" element={<PriceLevelsPage />} />
            <Route path="/products/categories" element={<CategoriesPage />} />
            <Route path="/products/brands" element={<BrandsPage />} />
            <Route path="/retail" element={<RetailPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/system" element={<SystemPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
