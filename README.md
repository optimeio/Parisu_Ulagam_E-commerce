# Parisu Ulagam

A MERN application inspired by the provided luxury jewelry and woodcraft landing page image.

## Structure

- `frontend/` — React + Vite frontend
- `backend/` — Express + Node + MongoDB backend

## Run locally

1. Install dependencies
   - `cd frontend && npm install`
   - `cd backend && npm install`
2. Start backend
   - `cd backend && npm run dev`
3. Start frontend
   - `cd frontend && npm run dev`

## Notes

- The frontend is built as a responsive landing experience with hero, product categories, and product cards.
- The backend exposes a simple `GET /api/products` API and supports MongoDB via `MONGO_URI`.

## MongoDB Atlas (Project: Parisu Ulagam)

Add your MongoDB connection details to `backend/.env` (example already in `backend/.env.example`). The project expects the following variables:

- `MONGO_URI` — an Atlas SRV connection string (recommended), e.g. `mongodb+srv://Parisu:Ulagam@cluster0.oz8nygs.mongodb.net/?appName=Cluster0`
- `STANDARD_MONGO_URI` — optional standard connection string example
- `DB_NAME` — database name, default `Parisu_Ulagam`
- `ADMIN_EMAIL` — admin portal email, default `**********@gmail.com`
- `ADMIN_PASSWORD` — admin portal password, default `***********`

To seed the database with initial products run:

```
cd backend
npm run seed
```

This will connect using `MONGO_URI` and populate a `products` collection with sample items used by the frontend.

## App Credentials

The backend also supports the following application metadata variables in `backend/.env`:

- `APP_NAME` — application name, e.g. `Parisu Ulagam`
- `APP_PASSWORD` — application password
- `SUPPORT_EMAIL` — support contact email

These values are available to the server for any future authentication or email features.

The backend also exposes an admin login endpoint:

- `POST /api/admin/login`
- JSON body: `{ "email": "**********@gmail.com", "password": "********" }`
- Returns success when credentials match `ADMIN_EMAIL` and `ADMIN_PASSWORD`
