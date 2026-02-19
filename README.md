# Inventory Management System

Production-ready inventory management system with Django + DRF backend and React (Vite) frontend.

## Backend Setup

1. Create a virtual environment and install dependencies:

   ```bash
   cd inventory_project
   python -m venv .venv
   .venv\\Scripts\\activate
   pip install -r requirements.txt
   ```

2. Configure PostgreSQL environment variables:

   ```bash
   set POSTGRES_DB=inventory_db
   set POSTGRES_USER=postgres
   set POSTGRES_PASSWORD=postgres
   set POSTGRES_HOST=localhost
   set POSTGRES_PORT=5432
   ```

3. Run migrations and create a superuser:

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. Start the API server:

   ```bash
   python manage.py runserver
   ```

API base URL: `http://localhost:8000/api/v1/`

Swagger docs: `http://localhost:8000/api/docs/`

## Frontend Setup

1. Install dependencies and start Vite:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Optional: set the API base URL in `frontend/.env`:

   ```bash
   VITE_API_BASE_URL=http://localhost:8000
   ```

## Example Auth Profile Response

```json
{
  "user_id": 1,
  "username": "admin",
  "roles": ["Admin"],
  "permissions": {
    "/api/products/": ["view", "create", "update", "delete"],
    "/api/orders/": ["view", "create"],
    "/api/reports/": ["view"],
    "/api/users/": ["view", "create", "update", "delete"]
  }
}
```

## Key Endpoints

- `POST /api/v1/auth/token/` - JWT login
- `GET /api/v1/users/me/` - current user profile + permissions
- `GET /api/v1/products/` - products
- `GET /api/v1/orders/` - sales orders
- `GET /api/v1/reports/dashboard/` - dashboard analytics

## RBAC Notes

- Create `ScreenPermission` entries using paths like `/api/products/`, `/api/orders/`, and `/api/reports/`.
- Assign actions per role via `RolePermission` with actions `view`, `create`, `update`, `delete`.
- The permission resolver uses prefix matching, so `/api/reports/` covers `/api/reports/dashboard/`.
