# Professional ERP Sidebar with Hover Dropdowns

A clean, professional React sidebar navigation component with hover dropdown panels, perfect for ERP/SaaS applications.

## ✨ Features

- **Hover Dropdown Panels** - Smooth dropdowns that appear on hover
- **Clean Architecture** - Separated concerns with reusable components
- **Smooth Animations** - Fade and slide transitions (0.3s ease)
- **React Router Integration** - Built-in NavLink support with active states
- **Responsive Design** - Collapsible sidebar for mobile
- **Professional Styling** - Modern ERP/SaaS aesthetic
- **No Inline Styles** - Pure CSS approach
- **Configurable Menus** - Easy dropdown configuration

## 📁 File Structure

```
src/
├── components/
│   ├── Sidebar.jsx              # New standalone component
│   └── SidebarExample.jsx       # Usage example
├── component/
│   └── designComponents/
│       └── sideBarComponent.jsx # Updated existing component
└── styles/
    └── sidebar.css              # All sidebar styles
```

## 🚀 Quick Start

### Option 1: Use the New Standalone Component

```jsx
import Sidebar from './components/Sidebar';
import './styles/sidebar.css';

function App() {
  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar isCollapsed={false} onLogout={handleLogout} />
      <main style={{ flex: 1, marginLeft: '240px' }}>
        {/* Your content */}
      </main>
    </div>
  );
}
```

### Option 2: Use the Updated Existing Component

```jsx
import Sidebar from './component/designComponents/sideBarComponent';

function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <Sidebar 
        isOpen={isOpen} 
        toggleSidebar={() => setIsOpen(!isOpen)} 
      />
      {/* Your content */}
    </div>
  );
}
```

## 🎨 Customization

### Adding New Dropdown Menus

Edit the `dropdownMenus` object in the sidebar component:

```jsx
const dropdownMenus = {
  products: {
    sections: [
      {
        title: 'Products',
        items: [
          { icon: <Package size={18} />, label: 'Products', path: '/products' },
          { icon: <DollarSign size={18} />, label: 'Price Levels', path: '/products/price-levels' },
        ],
      },
      {
        title: 'Settings',
        items: [
          { icon: <Grid size={18} />, label: 'Categories', path: '/products/categories' },
          { icon: <Tag size={18} />, label: 'Brands', path: '/products/brands' },
          // Add more items...
        ],
      },
    ],
  },
  // Add more dropdowns for other menu items
  finance: {
    sections: [
      {
        title: 'Finance',
        items: [
          { icon: <Wallet size={18} />, label: 'Dashboard', path: '/finance' },
          // Add more items...
        ],
      },
    ],
  },
};
```

### Modifying Styles

All styles are in `src/styles/sidebar.css`. Key CSS classes:

- `.erp-sidebar` - Main sidebar container
- `.sidebar-dropdown-panel` - Dropdown panel
- `.dropdown-grid` - Grid layout for sections
- `.dropdown-item-link` - Individual dropdown items
- `.sidebar-nav-link` - Main navigation links

### Color Customization

Change the primary color (default: #18b34a):

```css
/* In sidebar.css */
.sidebar-nav-link.active {
  background: #your-color;
}

.dropdown-item-link:hover {
  color: #your-color;
}
```

## 🎯 UX Features

### Hover Behavior
- **Immediate Show**: Dropdown appears instantly on hover
- **Delayed Hide**: 200ms delay before closing (prevents flickering)
- **Smooth Transitions**: Fade + slide animations
- **Panel Persistence**: Dropdown stays open while cursor is inside

### Animations
```css
@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
```

## 📱 Responsive Design

The sidebar automatically collapses on mobile devices:

```css
@media (max-width: 768px) {
  .erp-sidebar {
    width: 70px;
  }
  
  .sidebar-dropdown-panel {
    display: none;
  }
}
```

## 🔧 Props

### Sidebar Component (New)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isCollapsed` | boolean | `false` | Whether sidebar is collapsed |
| `onLogout` | function | - | Logout callback function |

### Sidebar Component (Existing)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | `true` | Whether sidebar is open |
| `toggleSidebar` | function | - | Toggle sidebar callback |

## 🎨 Design Tokens

```css
/* Colors */
--sidebar-bg: linear-gradient(180deg, #2b3143 0%, #1f2937 100%);
--sidebar-active: #18b34a;
--sidebar-text: #cbd5e1;
--dropdown-bg: white;

/* Spacing */
--sidebar-width: 240px;
--sidebar-collapsed-width: 70px;
--dropdown-panel-width: 480px;

/* Transitions */
--transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--hover-delay: 200ms;
```

## 💡 Best Practices

1. **Keep Dropdown Items Focused**: Don't overcrowd dropdowns with too many items
2. **Use Semantic Icons**: Choose icons that clearly represent the action
3. **Consistent Naming**: Use kebab-case for paths (`/products/price-levels`)
4. **Test Hover Behavior**: Ensure smooth transitions between sidebar and dropdown
5. **Mobile First**: Test collapsed state regularly

## 🐛 Troubleshooting

### Dropdown Flickering
Increase the hover delay:
```jsx
const timeout = setTimeout(() => {
  setHoveredItem(null);
}, 300); // Increase from 200ms
```

### Dropdown Not Showing
Check that:
1. CSS file is imported
2. Menu key matches dropdown config key
3. `isOpen` or `!isCollapsed` is true

### Styles Not Applied
Ensure correct import order:
```jsx
import './styles/sidebar.css'; // Import CSS last
```

## 📦 Dependencies

- React 17+
- React Router v6
- Lucide React (for icons)

## 🎯 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

MIT

## 🤝 Contributing

Feel free to customize and extend this component for your needs!

---

**Built with ❤️ for professional ERP applications**
