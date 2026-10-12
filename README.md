# Subscription Management Dashboard (MERN)

Track subscriptions and renewals: service, plan, amount, start date, renewal date.
Built with **MongoDB, Express.js, React (Vite) and Node.js**, with JWT authentication and role-based access.

## Features
- Register / login (passwords hashed with bcrypt, JWT sessions)
- Full CRUD on subscriptions (add, view, edit, cancel/reactivate, delete)
- Dashboard cards: total, active, monthly spend, yearly spend, renewing within 7 days, overdue
- Pie chart of monthly spend by service
- Search, status filter and sorting
- Renewal highlighting (due soon / overdue)
- Roles: **user** sees and manages only their own records; **admin** sees every user's records and has a User Management page (change roles, delete users)

## Project structure
```
subscription-dashboard/
├── server/
│   ├── models/       User.js, Subscription.js
│   ├── middleware/   auth.js  (JWT protect + adminOnly)
│   ├── routes/       auth.js, subscriptions.js, users.js
│   ├── server.js
│   ├── seed.js       (optional demo data)
│   └── .env.example
└── client/
    └── src/
        ├── pages/        AuthPage, Dashboard, Users
        ├── components/   Navbar, StatsCards, SpendChart, SubscriptionForm, SubscriptionTable
        ├── AuthContext.jsx, api.js, utils.js, App.jsx, main.jsx, index.css
```

## Setup

**Prerequisites:** Node.js 18+, and MongoDB (local install or a free MongoDB Atlas cluster).

1. Install everything
   ```bash
   npm run install:all
   ```
2. Configure the backend: edit `server/.env` (see `server/.env.example`)
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/subscriptions   # or your Atlas URI
   JWT_SECRET=use_a_long_random_string
   ADMIN_EMAIL=admin@example.com                        # registering with this email creates the admin
   ```
3. (Optional) load demo data
   ```bash
   npm run seed
   ```
   Creates `admin@example.com` and `demo@example.com`, both with password `password123`.
4. Run backend and frontend together
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - API: http://localhost:5000/api

You can also run them separately: `npm run server` and `npm run client`.

## REST API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create account |
| POST | `/api/auth/login` | public | Login, returns JWT |
| GET | `/api/auth/me` | logged in | Current user |
| GET | `/api/subscriptions` | logged in | List (own; admin: all). Query: `?status=active&search=net` |
| GET | `/api/subscriptions/:id` | logged in | One subscription |
| POST | `/api/subscriptions` | logged in | Create |
| PUT | `/api/subscriptions/:id` | owner / admin | Update |
| DELETE | `/api/subscriptions/:id` | owner / admin | Delete |
| GET | `/api/users` | admin | List users with subscription counts |
| PUT | `/api/users/:id/role` | admin | Change role |
| DELETE | `/api/users/:id` | admin | Delete user and their subscriptions |

Send the token as `Authorization: Bearer <token>`.

## Data model

**Subscription:** `user (ref), service, plan, amount, billingCycle (monthly|yearly), startDate, renewalDate, status (active|cancelled)`
**User:** `name, email (unique), password (hashed), role (user|admin)`

## Deployment (optional)
- Database: MongoDB Atlas
- Backend: Render / Railway. Set `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `CLIENT_URL`
- Frontend: Vercel / Netlify. Set `VITE_API_URL=https://<your-api-host>/api`, build with `npm run build`

## Security notes
- Never commit `.env` (it is in `.gitignore`); change `JWT_SECRET` before deploying.
- Admin role is granted only to the email in `ADMIN_EMAIL`, or by an existing admin.
