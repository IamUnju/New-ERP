import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Warehouse,
  ShoppingCart, Users, Truck, Wallet, UserCog,
  BarChart2, Settings, LogOut, Zap,
  ArrowRightLeft, ClipboardCheck, ArrowDownToLine, ArrowUpFromLine,
  Building2, TrendingUp, Scale, ListChecks, Hash, Layers,
  Calendar, AlertTriangle, RefreshCw, CheckCircle2, RotateCcw,
  FileText, FilePlus, Send, Undo2, FileCheck, Receipt, ClipboardList,
  DollarSign, TrendingDown, CreditCard, BadgeDollarSign, Repeat,
  Link2, UserCheck, UserPlus, MapPin, FileInput, Plus, Gift,
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../../context/Context";
import { useNavigate } from "react-router-dom";

/**
 * Dropdown menu configuration for hover panels
 * tabs: Array of tab names to show at the top
 * columns: Array of column arrays, each containing menu items
 */
const dropdownMenus = {
  stock: {
    tabs: ['Stock', 'Stock Analysis', 'Stock Valuation'],
    activeTab: 'Stock',
    columns: [
      // Column 1
      [
        { icon: <ArrowRightLeft size={18} />, label: 'Transfer Stock', path: '/stock/transfer' },
        { icon: <ClipboardCheck size={18} />, label: 'Stock Check', path: '/stock/check' },
        { icon: <ArrowDownToLine size={18} />, label: 'Stock In', path: '/stock/in' },
        { icon: <ArrowUpFromLine size={18} />, label: 'Stock Out', path: '/stock/out' },
        { icon: <Building2 size={18} />, label: 'Warehouses', path: '/stock/warehouses' },
      ],
      // Column 2
      [
        { icon: <BarChart2 size={18} />, label: 'Stock Summary', path: '/stock/summary' },
        { icon: <Scale size={18} />, label: 'Stock Balance', path: '/stock/balance' },
        { icon: <ListChecks size={18} />, label: 'Stock Balance Details', path: '/stock/balance-details' },
        { icon: <Hash size={18} />, label: 'Serial Number Details', path: '/stock/serial-numbers' },
        { icon: <Layers size={18} />, label: 'Batch Details', path: '/stock/batch-details' },
        { icon: <Calendar size={18} />, label: 'Stock Aging', path: '/stock/aging' },
        { icon: <AlertTriangle size={18} />, label: 'Low Stock', path: '/stock/low' },
      ],
      // Column 3
      [
        { icon: <TrendingUp size={18} />, label: 'Adjust Stock Value', path: '/stock/adjust-value' },
        { icon: <RefreshCw size={18} />, label: 'Stock Revaluation', path: '/stock/revaluation' },
        { icon: <CheckCircle2 size={18} />, label: 'Transaction Lock', path: '/stock/transaction-lock' },
      ],
    ],
  },
  products: {
    tabs: ['Products', 'Settings'],
    activeTab: 'Products',
    columns: [
      [
        { icon: <Package size={18} />, label: 'All Products', path: '/products' },
        { icon: <Package size={18} />, label: 'Add Product', path: '/products/new' },
        { icon: <Package size={18} />, label: 'Categories', path: '/products/categories' },
      ],
      [
        { icon: <Package size={18} />, label: 'Brands', path: '/products/brands' },
        { icon: <Package size={18} />, label: 'Units', path: '/products/units' },
        { icon: <Package size={18} />, label: 'Price Levels', path: '/products/price-levels' },
      ],
    ],
  },
  retail: {
    tabs: ['Retail', 'Promotion', 'Settings'],
    activeTab: 'Retail',
    columns: [
      // Retail Tab - Column 1: Orders & Returns
      [
        { icon: <ShoppingBag size={18} />, label: 'Store Orders', path: '/retail/store-orders' },
        { icon: <RotateCcw size={18} />, label: 'Store Returns', path: '/retail/store-returns' },
      ],
      // Retail Tab - Column 2: Payments
      [
        { icon: <DollarSign size={18} />, label: 'Payments', path: '/retail/payments', highlight: true },
        { icon: <RefreshCw size={18} />, label: 'Adjust Payments', path: '/retail/adjust-payments' },
      ],
      // Promotion Tab - Column 1
      [
        { icon: <Package size={18} />, label: 'Bundles', path: '/retail/bundles' },
        { icon: <Plus size={18} />, label: 'Add-ons', path: '/retail/addons' },
      ],
      // Promotion Tab - Column 2
      [
        { icon: <Gift size={18} />, label: 'Free Gift', path: '/retail/free-gift' },
        { icon: <TrendingDown size={18} />, label: 'Price Drop', path: '/retail/price-drop' },
      ],
      // Settings Tab - Column 1
      [
        { icon: <Building2 size={18} />, label: 'Stores', path: '/retail/stores' },
        { icon: <Package size={18} />, label: 'Store Products', path: '/retail/store-products' },
      ],
      // Settings Tab - Column 2
      [
        { icon: <TrendingUp size={18} />, label: 'Change Price', path: '/retail/change-price' },
        { icon: <Users size={18} />, label: 'Store Customers', path: '/retail/store-customers' },
      ],
    ],
  },
  sales: {
    tabs: ['Sales', 'Customers'],
    activeTab: 'Sales',
    columns: [
      [
        { icon: <FileText size={18} />, label: 'Quotations', path: '/sales/quotations' },
        { icon: <FilePlus size={18} />, label: 'Sales Orders', path: '/sales/orders', badge: 'Beta' },
        { icon: <Send size={18} />, label: 'Deliveries', path: '/sales/deliveries' },
        { icon: <Undo2 size={18} />, label: 'Sales Returns', path: '/sales/returns' },
        { icon: <FileCheck size={18} />, label: 'Invoices', path: '/sales/invoices' },
        { icon: <Receipt size={18} />, label: 'Credit Notes', path: '/sales/credit-notes' },
        { icon: <ClipboardList size={18} />, label: 'Picklists', path: '/sales/picklists' },
      ],
      [
        { icon: <Users size={18} />, label: 'Customers', path: '/customers' },
        { icon: <DollarSign size={18} />, label: 'Opening Balance', path: '/sales/opening-balance' },
      ],
    ],
  },
  customers: {
    tabs: ['Customer List', 'Field Visit'],
    activeTab: 'Customer List',
    columns: [
      [
        { icon: <UserCheck size={18} />, label: 'Store Customers', path: '/customers/store' },
        { icon: <UserPlus size={18} />, label: 'Wholesale Customers', path: '/customers/wholesale' },
      ],
      [
        { icon: <Settings size={18} />, label: 'Visit Settings', path: '/customers/visit-settings' },
        { icon: <MapPin size={18} />, label: 'Visit Record', path: '/customers/visit-record' },
      ],
    ],
  },
  purchases: {
    tabs: ['Purchases', 'Vendors'],
    activeTab: 'Purchases',
    columns: [
      [
        { icon: <FileInput size={18} />, label: 'Purchase Orders', path: '/purchases/orders', badge: 'Beta' },
        { icon: <ArrowDownToLine size={18} />, label: 'Receive Stock', path: '/purchases/receive' },
        { icon: <Undo2 size={18} />, label: 'Purchase Returns', path: '/purchases/returns' },
        { icon: <Receipt size={18} />, label: 'Bills', path: '/purchases/bills' },
        { icon: <FileText size={18} />, label: 'Vendor Credits', path: '/purchases/vendor-credits' },
        { icon: <RefreshCw size={18} />, label: 'Restock', path: '/purchases/restock' },
      ],
      [
        { icon: <Truck size={18} />, label: 'Vendors', path: '/purchases/vendors' },
        { icon: <DollarSign size={18} />, label: 'Opening Balance', path: '/purchases/opening-balance' },
      ],
    ],
  },
  finance: {
    tabs: ['Money In', 'Money Out', 'Fund', 'Settings'],
    activeTab: 'Money In',
    columns: [
      [
        { icon: <DollarSign size={18} />, label: 'Receive Payment', path: '/finance/receive-payment' },
        { icon: <TrendingUp size={18} />, label: 'Income', path: '/finance/income' },
        { icon: <TrendingUp size={18} />, label: 'Adjust Receivable', path: '/finance/adjust-receivable' },
        { icon: <TrendingDown size={18} />, label: 'Adjust Payable', path: '/finance/adjust-payable' },
        { icon: <ArrowRightLeft size={18} />, label: 'Transfer Money', path: '/finance/transfer-money' },
        { icon: <Link2 size={18} />, label: 'Match Transactions', path: '/finance/match-transactions' },
      ],
      [
        { icon: <CreditCard size={18} />, label: 'Pay Bills', path: '/finance/pay-bills' },
        { icon: <TrendingDown size={18} />, label: 'Expenses', path: '/finance/expenses' },
        { icon: <BadgeDollarSign size={18} />, label: 'Additional Charges', path: '/finance/additional-charges' },
        { icon: <Wallet size={18} />, label: 'Accounts', path: '/finance/accounts' },
        { icon: <CreditCard size={18} />, label: 'Pay Options', path: '/finance/pay-options' },
        { icon: <FileText size={18} />, label: 'Expense Types', path: '/finance/expense-types' },
        { icon: <FileText size={18} />, label: 'Income Types', path: '/finance/income-types' },
      ],
    ],
  },
};

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
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isClosing, setIsClosing] = useState(false);
  const dropdownPanelRef = useRef(null);
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  /**
   * Handle click outside dropdown panel - close with animation
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both sidebar and dropdown panel
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        dropdownPanelRef.current &&
        !dropdownPanelRef.current.contains(event.target)
      ) {
        // Start closing animation
        setIsClosing(true);
        // Wait for animation to complete before hiding
        setTimeout(() => {
          setHoveredItem(null);
          setIsClosing(false);
        }, 200);
      }
    };

    // Only add listener if dropdown is visible
    if (hoveredItem && dropdownMenus[hoveredItem]) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [hoveredItem]);

  /**
   * Handle mouse enter on menu item
   * Shows dropdown immediately
   */
  const handleMouseEnter = (menuKey, event) => {
    // Cancel any pending close timeout
    cancelCloseTimeout();
    
    // Get the position of the hovered element
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.top,
      left: rect.right + 8  // Add gap so panel appears next to collapsed sidebar
    });
    
    setHoveredItem(menuKey);
  };

  /**
   * Handle mouse leave from menu item
   * Only close if leaving both the item AND the dropdown
   */
  const handleMouseLeave = () => {
    // Don't immediately close - let the dropdown handle its own mouse leave
    // This will be managed by the dropdown panel's onMouseLeave
  };

  /**
   * Cancel the close timeout and keep dropdown open
   */
  const cancelCloseTimeout = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  /**
   * Handle mouse leave from dropdown panel
   * Closes dropdown when cursor leaves the panel
   */
  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredItem(null);
    }, 200); // Short delay to prevent accidental flickering
    setHoverTimeout(timeout);
  };

  const [activeTab, setActiveTab] = useState({});

  /**
   * Render dropdown panel for a menu item
   */
  const renderDropdown = (menuKey) => {
    const dropdownConfig = dropdownMenus[menuKey];
    if (!dropdownConfig) return null;

    // Get the display label (capitalize first letter)
    const menuLabel = menuKey.charAt(0).toUpperCase() + menuKey.slice(1);
    
    // Get active tab for this menu (defaults to first tab)
    const currentActiveTabIndex = activeTab[menuKey] ?? 0;
    
    // Get columns for current tab
    // Calculate columns per tab (total columns / number of tabs)
    const columnsPerTab = dropdownConfig.columns.length / dropdownConfig.tabs.length;
    const startCol = currentActiveTabIndex * columnsPerTab;
    const visibleColumns = dropdownConfig.columns.slice(startCol, startCol + columnsPerTab);
    
    // Flatten all items from visible columns into a single array
    const allItems = visibleColumns.reduce((acc, column) => [...acc, ...column], []);
    
    // Organize items into 3 rows
    const itemsPerRow = Math.ceil(allItems.length / 3);
    const rows = [];
    for (let i = 0; i < 3; i++) {
      rows.push(allItems.slice(i * itemsPerRow, (i + 1) * itemsPerRow));
    }

    return (
      <div 
        ref={dropdownPanelRef}
        className={`sidebar-dropdown-panel ${isClosing ? 'closing' : 'opening'}`}
        onMouseEnter={() => cancelCloseTimeout()}
        onMouseLeave={handleDropdownMouseLeave}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          background: 'white',
          minWidth: '380px',
          maxWidth: '420px',
          zIndex: 999999,
          pointerEvents: 'auto',
          userSelect: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header with menu label */}
        <div className="dropdown-header">
          <h3 className="dropdown-header-title">{menuLabel}</h3>
        </div>

        {/* Tabs */}
        {dropdownConfig.tabs && dropdownConfig.tabs.length > 0 && (
          <div className="dropdown-tabs">
            {dropdownConfig.tabs.map((tab, index) => (
              <button
                key={index}
                className={`dropdown-tab ${currentActiveTabIndex === index ? 'active' : ''}`}
                onClick={() => setActiveTab({ ...activeTab, [menuKey]: index })}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
        
        {/* Grid with rows */}
        <div className="dropdown-grid rows-layout">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="dropdown-row">
              {row.map((item, itemIndex) => (
                <NavLink
                  key={itemIndex}
                  to={item.path}
                  className={({ isActive }) =>
                    `dropdown-item-link ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`
                  }
                  onClick={() => {
                    // Close dropdown when clicking a link
                    setHoveredItem(null);
                  }}
                  style={{
                    cursor: 'pointer',
                    pointerEvents: 'auto'
                  }}
                >
                  <span className="dropdown-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="dropdown-item-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
    <aside ref={sidebarRef} className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <nav className="sidebar-nav" style={{ flex: 1, overflowY: isOpen ? "auto" : "visible", overflowX: "visible", position: 'relative' }}>
        <ul className="menu-items" style={{ paddingTop: isOpen ? 8 : 4, overflow: 'visible' }}>
          {navItems.map((item) => {
            const menuKey = item.label.toLowerCase();
            const hasDropdown = !!dropdownMenus[menuKey];
            
            return (
              <React.Fragment key={item.to}>
                <li 
                  style={{ padding: 0, position: 'relative', overflow: 'visible' }}
                  onMouseEnter={(e) => {
                    if (hasDropdown) {
                      handleMouseEnter(menuKey, e);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hasDropdown) {
                      handleMouseLeave();
                    }
                  }}
                >
                  <NavLink
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: isOpen ? 12 : 0,
                      justifyContent: isOpen ? "flex-start" : "center",
                      padding: isOpen ? "11px 16px" : "8px 16px",
                      textDecoration: "none",
                      color: isActive ? "#18b34a" : "#000000",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      transition: "all 0.15s",
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
                        color: isActive ? "#18b34a" : "#000000",
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 500,
                        fontWeight: isActive ? 600 : 400,
                      })}
                    >
                      Masters
                    </NavLink>
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ul>
      </nav>

      {/* */}
      {isOpen && (
        <div style={{ padding: "10px 16px", fontSize: 11, color: "#9ca3af", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={12} color="#18b34a" />
          Powered by NgTech
        </div>
      )}

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center",
            gap: isOpen ? 12 : 0,
            justifyContent: isOpen ? "flex-start" : "center",
            padding: isOpen ? "12px 18px" : "10px 18px",
            background: "none", border: "none",
            cursor: "pointer", width: "100%",
            color: "#ef4444", fontSize: 13,
            transition: "all 0.2s ease",
          }}
        >
          <LogOut size={isOpen ? 18 : 16} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
    
    {/* Render dropdown outside sidebar using fixed positioning */}
    {hoveredItem && dropdownMenus[hoveredItem] && renderDropdown(hoveredItem)}
    </>
  );
};

export default Sidebar;

