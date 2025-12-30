# Vercel Deployment Guide

## Why Vercel?

✅ **Native Next.js Support** - Created by the Next.js team
✅ **Zero Configuration** - Automatic detection and setup
✅ **Free Tier** - Generous free plan for personal projects
✅ **Fast Deployments** - Optimized build process
✅ **Global CDN** - Automatic edge deployment
✅ **Preview Deployments** - Test changes before merging

## Quick Deploy (5 minutes)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)

### Step 2: Deploy from GitHub
1. Click "Add New Project"
2. Select `PIMPEY/rogue-portfolio-core` from your GitHub repos
3. Vercel will auto-detect the `app-web` folder
4. Click "Deploy"

### Step 3: Add Database
Vercel doesn't include a database, so you have options:

#### Option A: Vercel Postgres (Recommended)
1. In your Vercel project, go to "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Vercel will automatically set `DATABASE_URL`

#### Option B: Supabase (Free)
1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string
6. In Vercel project → Settings → Environment Variables
7. Add `DATABASE_URL` with the connection string

#### Option C: Neon (Free)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Add to Vercel environment variables

### Step 4: Redeploy
1. Go to "Deployments" tab
2. Click "Redeploy"
3. Vercel will run migrations automatically

### Step 5: Access Your App
Vercel will provide a URL like `https://your-app.vercel.app`

## Environment Variables

In Vercel project → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:port/database
```

## Database Migrations

Vercel will automatically run migrations on deployment. The `vercel.json` config handles this.

## Manual Migration (if needed)

In Vercel project → Deployments → Click on deployment → "Build Output":

```bash
npx prisma migrate deploy
```

## Seed Database (Optional)

To add sample data:

1. Go to Vercel project → Deployments
2. Click on latest deployment → "Build Output"
3. Run: `npm run seed`

## Custom Domain (Optional)

1. Go to "Domains" tab
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

### Build Fails
- Check "Build Output" for error messages
- Ensure `DATABASE_URL` is set correctly
- Check Prisma schema is valid

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure database allows Vercel IPs

### Migrations Failed
- Check migration files are committed to git
- Verify database schema matches migrations
- Try running `npx prisma migrate deploy` manually

## Comparison: Vercel vs Railway

| Feature | Vercel | Railway |
|---------|--------|---------|
| Next.js Support | ✅ Native | ⚠️ Generic |
| Database Included | ❌ No | ✅ Yes |
| Free Tier | ✅ Yes | ✅ Yes |
| Setup Time | 5 min | 15 min |
| Deploy Speed | Fast | Medium |
| Preview Deployments | ✅ Yes | ❌ No |
| Custom Domains | ✅ Free | ✅ Free |
| Edge Functions | ✅ Yes | ❌ No |

## Cost

### Vercel
- **Free:** 100GB bandwidth, 6,000 minutes build time
- **Pro:** $20/month (unlimited bandwidth, priority support)

### Database (Vercel Postgres)
- **Free:** 512MB RAM, 3GB storage
- **Pro:** $20/month (1GB RAM, 8GB storage)

### Total Cost
- **Free Tier:** $0/month
- **Pro Tier:** $40/month (Vercel + Postgres)

## Next Steps

1. Deploy to Vercel (5 minutes)
2. Add Vercel Postgres database
3. Redeploy with migrations
4. Access your app at `https://your-app.vercel.app`

**That's it!** Vercel is much simpler and more reliable for Next.js apps.
