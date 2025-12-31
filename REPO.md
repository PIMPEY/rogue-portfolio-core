# Rogue Portfolio Core

Full-stack portfolio application with backend API and frontend Next.js app.

## Structure

```
/backend          - Express backend (root dir deployment)
/app-web          - Next.js frontend (root dir deployment)
```

## Current Status (2025-12-31)

**Backend:** ✅ Live and running on Railway
- Express API on port 8080
- Prisma 6.x with PostgreSQL
- Root directory: `/backend`

**Frontend:** ✅ Build tested and ready to deploy
- Next.js 15.5.9 with React 19
- Prisma 6.19.1 integrated
- Root directory: `/app-web`
- Build: 21 routes, 0 errors

**Branch:** `frontend-root-directory-config`

## Deployment

Both services use **root directory configuration** in Railway:
- Backend: Set root dir to `/backend`
- Frontend: Set root dir to `/app-web`

No Nixpacks config needed - Railway auto-detects package.json and builds correctly.

## Tech Stack

**Backend:**
- Express.js
- Prisma 6.x
- PostgreSQL
- Node 20.x

**Frontend:**
- Next.js 15.5.9
- React 19.0.0
- Prisma Client 6.19.1
- TypeScript 5.7.3
- Tailwind CSS 4.x

## AI Assistant Rules

**❌ DO NOT create .md documentation files unless explicitly requested**

This includes: guides, summaries, change logs, status files, deployment docs, debug files, etc.

**✅ DO: Make code changes, fix bugs, implement features**

Keep responses in chat, not in documentation files.
