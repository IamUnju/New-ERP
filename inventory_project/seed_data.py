"""
Seed script: run with  python manage.py shell < seed_data.py
Creates:
  - Superuser admin@example.com / Admin@1234!
  - Roles: Admin, Manager, StoreKeeper, Sales
  - ScreenPermissions for every core API path
  - Admin role gets full access to all screens
"""
import os
import django

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
role_names = ["Admin", "Manager", "StoreKeeper", "Sales"]
roles = {}
for name in role_names:
    role, created = Role.objects.get_or_create(name=name)
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

# ── 5. Assign Admin role to the superuser ────────────────────────────────────
UserRole.objects.get_or_create(user=admin, role=admin_role)
print(f"Admin role assigned to {email}")

print("\nSeed complete.")
print("──────────────────────────────────────────────────────")
print(f"Login: {email}")
print(f"Password: {password}")
print("API swagger: http://localhost:8000/api/docs/")
print("──────────────────────────────────────────────────────")
