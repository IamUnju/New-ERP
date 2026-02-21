"""
Seed script: run with  python manage.py shell < seed_data.py
Creates:
  - Superuser admin@example.com / Admin@1234!
    - Roles: Admin, Manager, StoreKeeper, Sales, Accountant, HR
  - ScreenPermissions for every core API path
  - Admin role gets full access to all screens
"""
import os
import django
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "inventory_project.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import Role, ScreenPermission, RolePermission, UserRole

User = get_user_model()

# ── 1. Superuser ─────────────────────────────────────────────────────────────
email = "admin@example.com"
password = "Admin@1234!"
if not User.objects.filter(email=email).exists():
    admin = User.objects.create_superuser(email=email, username="admin", password=password)
    print(f"Created superuser {email}")
else:
    admin = User.objects.get(email=email)
    print(f"Superuser {email} already exists")

# ── 2. Roles ──────────────────────────────────────────────────────────────────
role_names = ["Admin", "Manager", "StoreKeeper", "Sales", "Accountant", "HR"]
roles = {}
for name in role_names:
    role, created = Role.objects.get_or_create(
        name=name,
        defaults={
            "description": name,
            "remarks": "",
            "effective_from": timezone.now(),
            "effective_to": timezone.now() + timezone.timedelta(days=365 * 5),
            "is_active": True,
        },
    )
    roles[name] = role
    if created:
        print(f"Created role {name}")

# ── 3. Screen permissions (path keys the frontend + RBAC check uses) ──────────
screens_data = [
    ("/api/users/",            "User Management"),
    ("/api/roles/",            "Role Management"),
    ("/api/screens/",          "Screen Permission Management"),
    ("/api/role-permissions/", "Role Permission Assignment"),
    ("/api/products/",         "Products"),
    ("/api/categories/",       "Categories"),
    ("/api/suppliers/",        "Suppliers"),
    ("/api/warehouses/",       "Warehouses"),
    ("/api/stock-movements/",  "Stock Movements"),
    ("/api/orders/",           "Orders / Sales"),
    ("/api/reports/",          "Reports & Dashboard"),
]

frontend_screens_data = [
    ("/", "Dashboard"),
    ("/home", "Home"),
    ("/products", "Products"),
    ("/products/new", "Add Product"),
    ("/products/categories", "Categories"),
    ("/users", "Users"),
    ("/sales", "Sales"),
    ("/retail", "Retail"),
    ("/retail/store-orders", "Store Orders"),
    ("/retail/store-returns", "Store Returns"),
    ("/retail/payments", "Payments"),
    ("/retail/adjust-payments", "Adjust Payments"),
    ("/stock", "Stock"),
    ("/customers", "Customers"),
    ("/purchases", "Purchases"),
    ("/finance", "Finance"),
    ("/employees", "Employees"),
    ("/reports", "Reports"),
    ("/system", "System"),
    ("/system/masters", "System Masters"),
    ("/system/roles-permissions", "Roles & Permissions"),
    ("/register", "User Registration"),
]

screens_data.extend(frontend_screens_data)

screens = {}
for path, description in screens_data:
    sp, created = ScreenPermission.objects.get_or_create(path=path, defaults={"description": description})
    screens[path] = sp
    if created:
        print(f"Created screen {path}")

# ── 4. Admin role → full CRUD on every screen ─────────────────────────────────
admin_role = roles["Admin"]
all_actions = ["view", "create", "update", "delete"]
for sp in screens.values():
    rp, created = RolePermission.objects.get_or_create(role=admin_role, screen=sp, defaults={"actions": all_actions})
    if not created:
        rp.actions = all_actions
        rp.save()

admin_frontend_actions = ["view"]
for path, _ in frontend_screens_data:
    sp = screens[path]
    rp, created = RolePermission.objects.get_or_create(role=admin_role, screen=sp, defaults={"actions": admin_frontend_actions})
    if not created:
        rp.actions = admin_frontend_actions
        rp.save()

# Manager: view + create + update on inventory, view-only on users/reports
manager_role = roles["Manager"]
manager_permissions = {
    "/api/users/":            ["view"],
    "/api/roles/":            ["view"],
    "/api/screens/":          ["view"],
    "/api/role-permissions/": ["view"],
    "/api/products/":         ["view", "create", "update"],
    "/api/categories/":       ["view", "create", "update"],
    "/api/suppliers/":        ["view", "create", "update"],
    "/api/warehouses/":       ["view", "create", "update"],
    "/api/stock-movements/":  ["view", "create"],
    "/api/orders/":           ["view", "create"],
    "/api/reports/":          ["view"],
}
for path, actions in manager_permissions.items():
    sp = screens[path]
    rp, created = RolePermission.objects.get_or_create(role=manager_role, screen=sp, defaults={"actions": actions})
    if not created:
        rp.actions = actions
        rp.save()

manager_frontend = [
    "/", "/home", "/products", "/products/new", "/products/categories",
    "/sales", "/retail", "/retail/store-orders", "/retail/store-returns",
    "/retail/payments", "/retail/adjust-payments", "/stock", "/customers",
    "/purchases", "/finance", "/reports",
]
for path in manager_frontend:
    sp = screens[path]
    rp, created = RolePermission.objects.get_or_create(role=manager_role, screen=sp, defaults={"actions": ["view"]})
    if not created:
        rp.actions = ["view"]
        rp.save()

# StoreKeeper: inventory only
store_role = roles["StoreKeeper"]
store_permissions = {
    "/api/products/":        ["view", "create", "update"],
    "/api/categories/":      ["view"],
    "/api/suppliers/":       ["view"],
    "/api/warehouses/":      ["view"],
    "/api/stock-movements/": ["view", "create"],
    "/api/reports/":         ["view"],
}
for path, actions in store_permissions.items():
    sp = screens[path]
    rp, created = RolePermission.objects.get_or_create(role=store_role, screen=sp, defaults={"actions": actions})
    if not created:
        rp.actions = actions
        rp.save()

store_frontend = [
    "/", "/home", "/products", "/products/new", "/products/categories",
    "/stock", "/purchases",
]
for path in store_frontend:
    sp = screens[path]
    rp, created = RolePermission.objects.get_or_create(role=store_role, screen=sp, defaults={"actions": ["view"]})
    if not created:
        rp.actions = ["view"]
        rp.save()

# Sales: orders only
sales_role = roles["Sales"]
sales_permissions = {
    "/api/orders/":   ["view", "create"],
    "/api/products/": ["view"],
    "/api/reports/":  ["view"],
}
for path, actions in sales_permissions.items():
    sp = screens[path]
    rp, created = RolePermission.objects.get_or_create(role=sales_role, screen=sp, defaults={"actions": actions})
    if not created:
        rp.actions = actions
        rp.save()

sales_frontend = [
    "/", "/home", "/sales", "/retail", "/retail/store-orders",
    "/retail/store-returns", "/retail/payments", "/retail/adjust-payments",
    "/customers",
]
for path in sales_frontend:
    sp = screens[path]
    rp, created = RolePermission.objects.get_or_create(role=sales_role, screen=sp, defaults={"actions": ["view"]})
    if not created:
        rp.actions = ["view"]
        rp.save()

# Accountant: finance + reports
accountant_role = roles["Accountant"]
accountant_frontend = ["/", "/home", "/finance", "/reports"]
for path in accountant_frontend:
    sp = screens[path]
    rp, created = RolePermission.objects.get_or_create(role=accountant_role, screen=sp, defaults={"actions": ["view"]})
    if not created:
        rp.actions = ["view"]
        rp.save()

# HR: employees
hr_role = roles["HR"]
hr_frontend = ["/", "/home", "/employees"]
for path in hr_frontend:
    sp = screens[path]
    rp, created = RolePermission.objects.get_or_create(role=hr_role, screen=sp, defaults={"actions": ["view"]})
    if not created:
        rp.actions = ["view"]
        rp.save()

# ── 5. Assign Admin role to the superuser ────────────────────────────────────
UserRole.objects.get_or_create(user=admin, role=admin_role)
print(f"Admin role assigned to {email}")

print("\nSeed complete.")
print("──────────────────────────────────────────────────────")
print(f"Login: {email}")
print(f"Password: {password}")
print("API swagger: http://localhost:8000/api/docs/")
print("──────────────────────────────────────────────────────")
