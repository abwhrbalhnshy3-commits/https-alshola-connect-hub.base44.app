# AGENTS.md — Alshola Connect Hub

## Project Overview
Arabic-language social media platform (محور التواصل) built from scratch in this repo.

## Stack
- **Frontend**: React 18 + Vite 6 + TailwindCSS 3, served on port 5173 (mapped to host 3000)
- **Backend**: Express + Prisma ORM, served on port 4000 (internal only, proxied via Vite)
- **Database**: PostgreSQL 16
- **Auth**: JWT stored in localStorage, bcrypt password hashing

## Architecture
Single-origin setup: Vite dev server proxies `/api` requests to the Express backend. No CORS configuration needed in production since all requests go through the same origin.

## Development
```bash
docker compose -f docker-compose.base44.yml up -d --build
```

## Demo Account
- Email: demo@alshola.app
- Password: password123

## Key Details
- UI is in Arabic with RTL layout (`dir="rtl"`)
- Prisma uses `db push` (not migrations) for dev simplicity — schema changes apply on container restart
- Seed runs on every server startup but is idempotent (skips if posts already exist)
- Vite `allowedHosts: true` to accept the preview's external hostname
- JWT_SECRET is a fixed dev value in compose environment (not a user secret)
