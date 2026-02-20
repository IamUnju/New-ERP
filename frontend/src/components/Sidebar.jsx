import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Warehouse,
  ShoppingCart,
  Users,
  Truck,
  Wallet,
  UserCog,
  BarChart2,
  Settings,
  LogOut,
  Zap,
  DollarSign,
  Grid,
  Tag,
  FileText,
  Box,
  TrendingUp,
} from 'lucide-react';
import '../styles/sidebar.css';

/**
 * Dropdown menu configuration
 * Each menu item can have a dropdown with sections
 */
const dropdownMenus = {
  products: {
    sections: [
      {
        title: 'Products',
        items: [
          { icon: Package, label: 'Products', path: '/products' },
          { icon: DollarSign, label: 'Price Levels', path: '/products/price-levels' },
        ],
      },
      {
        title: 'Settings',
        items: [
          { icon: Grid, label: 'Categories', path: '/products/categories' },
          { icon: Tag, label: 'Brands', path: '/products/brands' },
          { icon: FileText, label: 'Specification', path: '/products/specifications' },
          { icon: Box, label: 'Unit of Measure', path: '/products/units' },
          { icon: TrendingUp, label: 'Opening Stock', path: '/products/opening-stock' },
        ],
      },
    ],
  },
  // Add more dropdown configurations as needed
  retail: {
    sections: [
      {
        title: 'Retail Operations',
        items: [
          { icon: ShoppingBag, label: 'Store Orders', path: '/retail/orders' },
          { icon: Users, label: 'Store Customers', path: '/retail/customers' },
        ],
      },
    ],
  },
};

/**
 * Main navigation items
 */
const navigationItems = [
  { id: 'home', label: 'Home', icon: LayoutDashboard, path: '/', exact: true },
  { id: 'products', label: 'Products', icon: Package, path: '/products', hasDropdown: true },
  { id: 'retail', label: 'Retail', icon: ShoppingBag, path: '/retail', hasDropdown: true },
  { id: 'stock', label: 'Stock', icon: Warehouse, path: '/stock' },
  { id: 'sales', label: 'Sales', icon: ShoppingCart, path: '/sales' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/customers' },
  { id: 'purchases', label: 'Purchases', icon: Truck, path: '/purchases' },
  { id: 'finance', label: 'Finance', icon: Wallet, path: '/finance' },
  { id: 'employees', label: 'Employees', icon: UserCog, path: '/employees' },
  { id: 'reports', label: 'Reports', icon: BarChart2, path: '/reports' },
  { id: 'system', label: 'System', icon: Settings, path: '/system' },
];

/**
 * Dropdown Panel Component
 * Renders the hover dropdown with sections and items
 */
const DropdownPanel = ({ menuId }) => {
  const dropdownConfig = dropdownMenus[menuId];
  
  if (!dropdownConfig) return null;

  return (
    <div className="sidebar-dropdown-panel">
      <div className={`dropdown-grid ${dropdownConfig.sections.length === 1 ? 'single-column' : ''}`}>
        {dropdownConfig.sections.map((section, index) => (
          <div key={index} className="dropdown-section">
            <div className="dropdown-section-title">{section.title}</div>
            <ul className="dropdown-items">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <li key={itemIndex}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `dropdown-item-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <span className="dropdown-item-icon">
                        <Icon size={18} />
                      </span>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Sidebar Component
 * Professional ERP-style navigation with hover dropdowns
 */
const Sidebar = ({ isCollapsed = false, onLogout }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  /**
   * Handle mouse enter on menu item
   * Shows dropdown immediately
   */
  const handleMouseEnter = (itemId) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredItem(itemId);
  };

  /**
   * Handle mouse leave from menu item
   * Adds small delay before closing dropdown (200ms)
   * This prevents flickering when moving between item and dropdown
   */
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredItem(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  return (
    <aside className={`erp-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">N</div>
        <span className="sidebar-logo-text">Ngtech ERP</span>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu">
        <ul className="sidebar-nav-list">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredItem === item.id;
            
            return (
              <li
                key={item.id}
                className="sidebar-nav-item"
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
              >
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="sidebar-nav-icon">
                    <Icon size={20} />
                  </span>
                  <span className="sidebar-nav-text">{item.label}</span>
                </NavLink>

                {/* Render dropdown panel if item has dropdown and is being hovered */}
                {item.hasDropdown && !isCollapsed && (
                  <DropdownPanel menuId={item.id} />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-powered">
          <Zap size={14} className="sidebar-footer-icon" />
          <span>Powered by NgTech</span>
        </div>
        
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
