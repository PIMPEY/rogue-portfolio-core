# Deployment Guide

## Deployment Path: Nixpacks-Only

We use **Nixpacks** for Railway deployment. No committed Dockerfile is used.

### Single Source of Truth

- **Build Config:** `nixpacks.toml` (root) and `railway.json` (root)
- **App Root:** `app-web/` directory
- **Package Manager:** npm

## Build Process

### Build Command
```bash
cd app-web && npm ci && npx prisma generate && npm run build
```

**Steps:**
1. `npm ci` - Install dependencies from package-lock.json (clean, reproducible)
2. `npx prisma generate` - Generate Prisma Client types
3. `npm run build` - Build Next.js application

**Critical:** Build phase does NOT require `DATABASE_URL`. Prisma Client generation only needs the schema file.

### Start Command
```bash
cd app-web && npm run start
```

Which executes:
```bash
prisma migrate deploy && next start -p $PORT
```

**Steps:**
1. `prisma migrate deploy` - Run pending migrations
2. `next start -p $PORT` - Start Next.js server

**Critical:** Runtime phase requires `DATABASE_URL` to be set.

## Required Environment Variables

### Production (Railway)
- `DATABASE_URL` - PostgreSQL connection string (set by Railway when connecting database service)
- `PORT` - Port for Next.js server (default: 3000, set by Railway)
- `NODE_ENV` - Set to "production" (set by Nixpacks config)

### Local Development
- `DATABASE_URL` - Optional, defaults to `file:./dev.db` via prisma.config.ts fallback
- `PORT` - Optional, defaults to 3000

## Database Strategy

### Local Development (SQLite)
- **Provider:** SQLite
- **Schema:** `prisma/schema.prisma` (default)
- **DATABASE_URL:** `file:./dev.db` (via prisma.config.ts fallback)
- **Persistence:** Local filesystem

### Production (Railway - PostgreSQL)
- **Provider:** PostgreSQL
- **Schema:** `prisma/schema.prisma.railway` (copy to schema.prisma before deploy)
- **DATABASE_URL:** Railway PostgreSQL connection string (runtime variable)
- **Persistence:** Railway managed PostgreSQL service

**Important:** Before deploying to Railway, copy `schema.prisma.railway` to `schema.prisma`:
```bash
cp prisma/schema.prisma.railway prisma/schema.prisma
```

## Migration Strategy

### Local Development
```bash
npx prisma migrate dev -n migration_name
```

### Production (Railway)
Migrations run automatically at startup via `prisma migrate deploy` in the start script. No manual intervention required.

### Migration Files
All migrations must be committed to git in `prisma/migrations/`. Railway will apply them in order at startup.

## Dependency Management

### Production Dependencies
- `@prisma/client` - Prisma Client runtime
- `next` - Next.js framework
- `react` - React library
- `react-dom` - React DOM renderer
- `recharts` - Charting library

### Development Dependencies
- `prisma` - Prisma CLI (for migrations and client generation)
- `dotenv` - Environment variable loading (for local dev only)
- `typescript` - TypeScript compiler
- `@types/*` - TypeScript type definitions
- `eslint` - Linting
- `tailwindcss` - CSS framework

**Note:** `dotenv` is installed as devDependency for local development. Prisma config does NOT import dotenv in production builds - it relies on Railway's environment variable injection.

## Architecture Decisions

### Why Nixpacks-Only?
1. **Simplicity:** Single configuration file (`nixpacks.toml`)
2. **No Dockerfile Maintenance:** Nixpacks generates optimized Dockerfile
3. **Railway Native:** Railway uses Nixpacks by default
4. **Deterministic:** Same build process across environments

### Why Migrations at Runtime?
1. **Build Isolation:** Build phase should not require database credentials
2. **Deterministic Builds:** Same build artifact works across environments
3. **Zero-Downtime:** Migrations run when app starts, not during image build
4. **Security:** Database secrets not exposed during build process

### Why npm ci Instead of npm install?
1. **Reproducible:** Uses exact versions from package-lock.json
2. **Faster:** Skips package resolution steps
3. **Clean:** Removes existing node_modules before install
4. **CI Best Practice:** Standard for production builds

### Why Separate Schema Files?
1. **Provider Differences:** SQLite and PostgreSQL have different syntax
2. **Local Development:** SQLite is simpler for local dev (no external DB required)
3. **Production:** PostgreSQL is more robust for production workloads
4. **Clear Separation:** Explicit environment-specific configuration

## Troubleshooting

### Build Fails with P1012 (DATABASE_URL not found)
**Cause:** Running `prisma migrate deploy` during build phase.
**Fix:** Ensure migrations only run in start script, not build.

### Build Fails with "Cannot find module 'dotenv/config'"
**Cause:** Prisma config importing dotenv but dotenv not installed.
**Fix:** dotenv is now in devDependencies. Prisma config no longer imports dotenv in production.

### App Starts But Database Errors
**Cause:** DATABASE_URL not set or incorrect.
**Fix:** Verify Railway PostgreSQL service is connected and DATABASE_URL variable is set.

### Schema Mismatch
**Cause:** Using SQLite schema with PostgreSQL or vice versa.
**Fix:** Ensure correct schema file is copied to `schema.prisma` before deployment.

### Build Shows "package not found and will be installed"
**Cause:** Prisma not installed as devDependency.
**Fix:** Prisma is now in devDependencies. Use `npm ci` for clean installs.

## Deployment Checklist

Before deploying to Railway:

- [ ] Copy `prisma/schema.prisma.railway` to `prisma/schema.prisma`
- [ ] Verify all migrations are committed to git
- [ ] Ensure Railway PostgreSQL service is connected
- [ ] Verify `DATABASE_URL` is set in Railway variables
- [ ] Run `npm run build` locally to verify build succeeds
- [ ] Push changes to main branch
- [ ] Monitor Railway build logs for errors

## Quick Reference

### Local Development
```bash
npm run dev
```

### Local Build Test
```bash
npm run build
```

### Create Migration
```bash
npx prisma migrate dev -n migration_name
```

### Reset Local Database
```bash
npx prisma migrate reset --force
```

### Seed Local Database
```bash
npm run seed
```

### Railway Deploy
```bash
git push origin main
```

Railway will automatically build and deploy on push to main branch.
