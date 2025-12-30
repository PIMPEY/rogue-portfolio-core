# Railway Deployment Guide

## Local Development (SQLite)

For local development, the app uses SQLite by default:

```bash
npm run dev
```

The `prisma/schema.prisma` file is configured for SQLite with:
- `provider = "sqlite"`
- `DATABASE_URL = "file:./dev.db"`

## Railway Deployment (PostgreSQL)

For Railway deployment, the app uses PostgreSQL:

### 1. Setup Schema for Railway

Before deploying to Railway, switch to PostgreSQL schema:

```bash
# On Windows (PowerShell)
Copy-Item prisma\schema.prisma.railway prisma\schema.prisma

# On Linux/Mac
cp prisma/schema.prisma.railway prisma/schema.prisma
```

### 2. Deploy to Railway

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `PIMPEY/rogue-portfolio-core`
4. Railway will auto-detect the `app-web` folder
5. Click "Deploy"

### 3. Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "PostgreSQL"
3. Railway will create a database instance

### 4. Connect Database to App

1. Click on your Next.js service
2. Go to "Variables" tab
3. Find `DATABASE_URL` variable
4. Click the database service → "Connect" → Copy connection string
5. Paste into `DATABASE_URL` variable in your app

### 5. Run Migrations

Railway will automatically run migrations on deployment. The `railway.json` config handles this.

### 6. Seed Database (Optional)

To add sample data:

1. Go to your app service → "Console" tab
2. Run: `npm run seed`

### 7. Access Your App

Railway will provide a URL like `https://your-app.railway.app`

## Switching Back to Local Development

After deploying to Railway, switch back to SQLite for local development:

```bash
# On Windows (PowerShell)
Copy-Item prisma\schema.prisma.local prisma\schema.prisma

# On Linux/Mac
cp prisma/schema.prisma.local prisma/schema.prisma

# Regenerate Prisma Client
npx prisma generate

# Reset database if needed
npx prisma migrate reset --force
```

## Environment Variables

### Local (.env)
```
DATABASE_URL="file:./dev.db"
```

### Railway
Railway automatically sets `DATABASE_URL` when you connect the PostgreSQL service.

## Troubleshooting

### "URL must start with postgresql://"
This means you're trying to use PostgreSQL schema with SQLite database. Switch to the correct schema file.

### "Unique constraint failed"
Run `npx prisma migrate reset --force` to reset the database.

### Build fails on Railway
Check that:
1. `prisma/schema.prisma` has `provider = "postgresql"`
2. `DATABASE_URL` is set correctly in Railway variables
3. All migrations are committed to git
