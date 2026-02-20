# Cascading Dropdown & Active Filtering Implementation

## Overview
This update implements system-wide cascading dropdowns and active record filtering for all relationships across the ERP system.

## Backend Changes

### 1. Database Models (is_active field added)
- **Category** (products app)
- **Supplier** (products app)  
- **Warehouse** (products app)
- **Department** (employees app)

**Existing models already have is_active:**
- Product
- Customer
- Account (finance)
- User

### 2. API Endpoints

#### Products App
```
GET /api/v1/categories/active/          - Active categories
GET /api/v1/main-categories/            - All main categories (parent=null)
GET /api/v1/main-categories/active/     - Active main categories only
GET /api/v1/subcategories/              - All subcategories (parent!=null)
GET /api/v1/subcategories/active/       - Active subcategories, ?parent=ID
GET /api/v1/suppliers/active/           - Active suppliers
GET /api/v1/warehouses/active/          - Active warehouses
```

#### Employees App
```
GET /api/v1/departments/active/         - Active departments
```

### 3. ViewSet Filters
All ViewSets now support `is_active` filtering:
- CategoryViewSet: `?is_active=true|false`
- SupplierViewSet: `?is_active=true` 
- WarehouseViewSet: `?is_active=true`
- DepartmentViewSet: `?is_active=true`

### 4. Migrations Applied
- `products.0004_add_is_active_to_related_models` - Added is_active to Category, Supplier, Warehouse
- `employees.0003_department_is_active` - Added is_active to Department

## Frontend Changes

### 1. API Methods (frontend/src/api/products.js)
```javascript
// Active records only
getActiveCategories()
getActiveMainCategories()
getActiveSubcategories(parentId)
getActiveSuppliers()
getActiveWarehouses()

// With filtering
getCategories(params)
getMainCategories(params)
getSubcategories(params)
```

### 2. Product Create Page Improvements
**File:** `frontend/src/pages/products/ProductsCreatePage.jsx`

**Cascading Category Dropdowns:**
1. User selects "Main Category" (from active main categories)
2. Subcategory dropdown becomes enabled
3. Subcategories are filtered by selected main category
4. Only active subcategories for that parent are shown

**Form Structure:**
```javascript
{
  main_category: "",  // Main category ID
  category: "",       // Subcategory ID (saved to backend)
  supplier: "",       // From active suppliers
  warehouse: "",      // From active warehouses
  // ... other fields
}
```

## Usage Examples

### Backend - Filter Active Records
```python
# Get only active main categories
Category.objects.filter(parent__isnull=True, is_active=True)

# Get active subcategories for a specific parent
Category.objects.filter(parent_id=5, is_active=True)

# Get active suppliers
Supplier.objects.filter(is_active=True)
```

### Frontend - Cascading Dropdowns
```jsx
// Load main categories on mount
useEffect(() => {
  getActiveMainCategories().then(res => {
    setMainCategories(res.data);
  });
}, []);

// Load subcategories when main category changes
useEffect(() => {
  if (form.main_category) {
    getActiveSubcategories(form.main_category).then(res => {
      setSubcategories(res.data);
    });
  } else {
    setSubcategories([]);
  }
}, [form.main_category]);
```

## Applying to Other Modules

### To add cascading dropdowns elsewhere:

1. **Check if parent model has is_active** - if not, add migration
2. **Add `/active/` endpoint in ViewSet**
3. **Create frontend API method** 
4. **In form component:**
   - Add state for main/parent dropdown
   - Add useEffect to watch parent changes
   - Load child records filtered by parent ID

### Example: Employees → Department (already has is_active)

**Backend:**
```python
# Already done! 
GET /api/v1/departments/active/
```

**Frontend (employees API):**
```javascript
export const getActiveDepartments = () => 
  api.get("/api/v1/departments/active/");
```

**In Employee Create Form:**
```jsx
const [departments, setDepartments] = useState([]);

useEffect(() => {
  getActiveDepartments().then(res => {
    setDepartments(res.data);
  });
}, []);

// Render
<select name="department" value={form.department}>
  <option value="">Select department</option>
  {departments.map(d => (
    <option key={d.id} value={d.id}>{d.name}</option>
  ))}
</select>
```

## Testing Checklist

- [ ] Product create shows only active main categories
- [ ] Selecting main category loads subcategories
- [ ] Changing main category clears and reloads subcategories
- [ ] Only active suppliers appear in dropdown
- [ ] Only active warehouses appear in dropdown
- [ ] Employee forms show only active departments
- [ ] Finance transactions show only active accounts
- [ ] Purchase orders show only active suppliers

## Next Steps

1. Apply same pattern to other create forms:
   - Customer Create
   - Employee Create
   - Purchase Order Create
   - Sales Order Create
   - Finance Transaction Create

2. Update list/edit modals to use active filters

3. Add "Mark as Inactive" toggle in master data screens

4. Add bulk activate/deactivate actions in admin lists

## API Documentation

### FilterSet Parameters
All endpoints support Django FilterSet:
```
?is_active=true          # Only active records
?is_active=false         # Only inactive records
?parent=5                # Only records with parent_id=5
?parent__isnull=true     # Only records without parent
```

### Response Format
```json
{
  "id": 1,
  "name": "Electronics",
  "description": "",
  "parent": null,
  "parent_name": null,
  "full_name": "Electronics",
  "is_main": true,
  "is_active": true,
  "created_at": "2025-01-15T10:30:00Z"
}
```
