# Infrastructure & Deployment Architecture

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

**Note:** The project maintains separate schema files for local and production environments. Before deploying to Railway, copy `schema.prisma.railway` to `schema.prisma`.

## Build vs Runtime Responsibilities

### Build Phase (No Database Required)
1. `npm install` - Install dependencies
2. `npx prisma generate` - Generate Prisma Client types
3. `npm run build` - Build Next.js application

**Critical:** Build phase does NOT require `DATABASE_URL`. Prisma Client generation only needs the schema file, not a database connection.

### Runtime Phase (Database Required)
1. `npx prisma migrate deploy` - Run pending migrations
2. `next start -p $PORT` - Start Next.js server

**Critical:** Runtime phase requires `DATABASE_URL` to be set. Migrations run at startup when the database is available.

## Deployment Configuration

### Railway (Nixpacks)
- **Build Command:** `cd app-web && npm install && npx prisma generate && npm run build`
- **Start Command:** `cd app-web && npm run start`
- **Health Check:** `/api/health`

### Package.json Scripts
```json
{
  "build": "prisma generate && next build",
  "start": "prisma migrate deploy && next start -p $PORT",
  "postinstall": "prisma generate"
}
```

## Environment Variables

### Required for Production (Railway)
- `DATABASE_URL` - PostgreSQL connection string (set by Railway when connecting database service)
- `PORT` - Port for Next.js server (default: 3000, set by Railway)

### Optional
- `NODE_ENV` - Environment mode (production/development)

## Migration Strategy

### Local Development
```bash
npx prisma migrate dev -n migration_name
```

### Production (Railway)
Migrations run automatically at startup via `prisma migrate deploy` in the start script. No manual intervention required.

### Migration Files
All migrations must be committed to git in `prisma/migrations/`. Railway will apply them in order at startup.

## Troubleshooting

### Build Fails with P1012 (DATABASE_URL not found)
**Cause:** Running `prisma migrate deploy` during build phase.
**Fix:** Ensure migrations only run in start script, not build.

### App Starts But Database Errors
**Cause:** DATABASE_URL not set or incorrect.
**Fix:** Verify Railway PostgreSQL service is connected and DATABASE_URL variable is set.

### Schema Mismatch
**Cause:** Using SQLite schema with PostgreSQL or vice versa.
**Fix:** Ensure correct schema file is copied to `schema.prisma` before deployment.

## Architecture Decisions

### Why Migrations at Runtime?
1. **Build Isolation:** Build phase should not require database credentials
2. **Deterministic Builds:** Same build artifact works across environments
3. **Zero-Downtime:** Migrations run when app starts, not during image build
4. **Security:** Database secrets not exposed during build process

### Why Separate Schema Files?
1. **Provider Differences:** SQLite and PostgreSQL have different syntax
2. **Local Development:** SQLite is simpler for local dev (no external DB required)
3. **Production:** PostgreSQL is more robust for production workloads
4. **Clear Separation:** Explicit environment-specific configuration

### Why Prisma Config with Fallback?
The `prisma.config.ts` provides a fallback DATABASE_URL for local development:
```typescript
url: process.env["DATABASE_URL"] || "file:./dev.db"
```

This allows local dev to work without setting DATABASE_URL explicitly, while production uses the Railway-provided variable.
