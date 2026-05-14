# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GPRO Dashboard for "Blue Dragons Racing" — a Next.js 14 app (App Router) that visualizes racing data from the GPRO (Grand Prix Racing Online) game. It reads live race/pilot/vehicle data from a MySQL GPRO database and displays it through charts and tables.

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npx prisma studio # Browse auth database
npx prisma db push # Sync schema changes
npx prisma generate # Regenerate Prisma client
npm run db:seed   # tsx --require dotenv/config scripts/safe-seed.ts
```

## Architecture

### Two-Database Setup

The app connects to two separate databases:

1. **Auth DB (PostgreSQL)** — `DATABASE_URL` — managed via Prisma with NextAuth PrismaAdapter. Handles user sessions, accounts, users table.
2. **GPRO DB (MySQL)** — `GPRO_DATABASE_URL` — raw SQL via `mysql2` pool. Read-only source of all racing data (pilots, races, standings, vehicles). Never mutated by the app.

The helper `queryGpro<T>(sql, params)` in `lib/gpro-db.ts` is the sole entry point for all GPRO data queries. All API routes call this function.

### API Layer (`app/api/gpro/`)

Each route queries the MySQL GPRO database directly and returns JSON. Routes use `export const dynamic = 'force-dynamic'` to prevent caching. Key routes:

- `dashboard-summary` — pilot + car + user + latest race info
- `race-detail` — full race breakdown (laps, pit stops, setup, weather)
- `pilot-evolution` — pilot stats over time
- `vehicle` — car parts levels and wear
- `standings`, `races`, `tracks`, `seasons`, `users`

GPRO database columns often store JSON as strings (`jsonstr`) and HTML-encoded text — parse accordingly.

### Client-Side Data Fetching Pattern

All dashboard pages are client components (`"use client"`) using `useEffect` + `useState` + `fetch()` directly. Neither React Query nor SWR is used despite being installed.

```tsx
useEffect(() => {
  if (!idm) return;
  setLoading(true);
  fetch(`/api/gpro/dashboard-summary?idm=${idm}`)
    .then(r => r.json())
    .then(d => setSummary(d))
    .finally(() => setLoading(false));
}, [idm]);
```

### Global State

The selected user (`idm`) and season are passed via URL params or component props — there is no Zustand/Jotai store in use despite both being installed. Authentication state comes from `useSession()` (NextAuth).

### Authentication

NextAuth v4 with CredentialsProvider (email + bcrypt password). The session extends to include `role` and `gproIdm` (the GPRO user ID used to scope all data queries). Types are in `types/next-auth.d.ts`. Config is in `lib/auth-options.ts`.

### UI & Styling

- **Tailwind CSS** with CSS variable color tokens (light/dark via `.dark` class)
- **shadcn/ui** components in `components/ui/` — add new ones with `npx shadcn-ui@latest add <component>`
- **Recharts** for all charts (`components/charts/`)
- **Radix UI** for accessible primitives
- **Lucide React** for icons
- Font stack: DM Sans (body), Plus Jakarta Sans (display), JetBrains Mono (mono)
- Full design tokens and component usage are documented in `STYLE_GUIDE.md`

### Routing Structure

```
app/
  page.tsx              → redirects to /dashboard
  dashboard/
    layout.tsx          → sidebar + top bar shell
    page.tsx            → overview
    pilot/              → pilot stats
    races/[season]/[race]/ → race detail (dynamic)
    standings/
    tracks/
    vehicle/
    _components/        → page-specific client components
```

## Required Environment Variables

```
DATABASE_URL=          # PostgreSQL for NextAuth (prisma)
GPRO_DATABASE_URL=     # MySQL for GPRO racing data
NEXTAUTH_SECRET=       # JWT signing secret
NEXTAUTH_URL=          # e.g. http://localhost:3000
```
