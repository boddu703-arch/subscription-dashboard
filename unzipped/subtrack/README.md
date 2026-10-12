# SubTrack – MERN Subscription Management Dashboard

Track services, plans, amounts, start dates and renewals. JWT auth with `user` and `admin` roles.

## Run
```
# 1. Backend
cd server && cp .env.example .env && npm install && npm run dev     # http://localhost:5000
# 2. Frontend
cd client && npm install && npm run dev                              # http://localhost:5173
```
Requires MongoDB running locally (or set MONGO_URI to Atlas).
Register with the email set as ADMIN_EMAIL in `.env` to get the **admin** role.

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/subscriptions?status=&q= | user (own) / admin (all) |
| GET | /api/subscriptions/stats | user / admin |
| POST | /api/subscriptions | user |
| PUT | /api/subscriptions/:id | owner / admin |
| PATCH | /api/subscriptions/:id/renew | owner / admin (moves renewal date forward one cycle) |
| DELETE | /api/subscriptions/:id | owner / admin |
| GET | /api/users | admin |
| DELETE | /api/users/:id | admin |
