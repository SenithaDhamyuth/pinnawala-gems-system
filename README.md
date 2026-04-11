# Pinnawala Gems Inventory Management Module

Standalone full-stack inventory module for a gemstone marketplace group project.  
This version includes demo Admin and Seller login, seller inventory CRUD, admin monitoring, search/filter flows, MongoDB seeding, and a professional light-themed React UI.

## Demo Accounts

- Admin
  - Email: `admin@gmail.com`
  - Password: `admin123`
- Seller
  - Email: `seller@gmail.com`
  - Password: `seller123`

These values are now driven by the environment files, so you can change them in:

- [backend/.env](/c:/Users/Shasoo/Desktop/Gem-Inventory/pinnawala-gems-system/backend/.env)
- [frontend/.env](/c:/Users/Shasoo/Desktop/Gem-Inventory/pinnawala-gems-system/frontend/.env)

## Tech Stack

- Frontend: React + Vite + React Router + Axios
- Backend: FastAPI
- Database: MongoDB

## MongoDB Compass Connection

Use this connection string in MongoDB Compass:

```text
mongodb://localhost:27017/pinnawala_gems
```

If you want to keep the default database name from the backend config, use:

- Host: `localhost`
- Port: `27017`
- Database name: `pinnawala_gems`

## Backend Setup

1. Open a terminal in [`backend`](/c:/Users/Shasoo/Desktop/Gem-Inventory/pinnawala-gems-system/backend)
2. Create a `.env` file from [`backend/.env.example`](/c:/Users/Shasoo/Desktop/Gem-Inventory/pinnawala-gems-system/backend/.env.example)
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Seed demo users and inventory:

```bash
python seed_inventory.py
```

5. Start the API:

```bash
uvicorn main:app --reload --port 8000
```

Backend base URL:

```text
http://127.0.0.1:8000
```

## Frontend Setup

1. Open a terminal in [`frontend`](/c:/Users/Shasoo/Desktop/Gem-Inventory/pinnawala-gems-system/frontend)
2. Create a `.env` file from [`frontend/.env.example`](/c:/Users/Shasoo/Desktop/Gem-Inventory/pinnawala-gems-system/frontend/.env.example)
3. Install dependencies:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173/inventory
```

## Main Features

### Seller

- Demo seller login
- Seller dashboard with summary cards
- Add, edit, view, archive, delete gemstone listings
- Status updates: `active`, `sold`, `archived`, `unavailable`, `in_auction`
- Search and filter by gem name, category, status, listing type, and price range
- Image preview and multi-image support using stored image data URLs

### Admin

- Demo admin login
- Admin dashboard with inventory statistics
- View all seller inventory records
- Filter by gemstone fields, seller name, seller ID, status, listing type, and price range
- Delete invalid records

## API Summary

### Authentication

- `POST /api/auth/login`
- `GET /api/auth/me`

### Seller Inventory

- `POST /api/inventory`
- `GET /api/inventory/my-items`
- `GET /api/inventory/{id}`
- `PUT /api/inventory/{id}`
- `PATCH /api/inventory/{id}/archive`
- `PATCH /api/inventory/{id}/status`
- `DELETE /api/inventory/{id}`

### Admin

- `GET /api/admin/inventory`
- `GET /api/admin/inventory/{id}`
- `DELETE /api/admin/inventory/{id}`
- `GET /api/admin/dashboard/stats`

## Notes

- Only verified sellers are allowed into the inventory module.
- There is no per-gemstone approval workflow in this module.
- The existing AI prediction route is still present, but its image-processing dependencies are treated as optional so the inventory module can run independently.
- Demo data is seeded into MongoDB on startup if missing.

## Verification Completed

- Backend Python compilation completed successfully
- Frontend production build completed successfully
- MongoDB local connection check succeeded
- Demo seed executed successfully
- API smoke test passed for:
  - Seller login
  - Seller inventory fetch
  - Admin dashboard stats fetch
