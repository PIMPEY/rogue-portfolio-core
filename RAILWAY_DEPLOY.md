# Railway Deployment Guide

## Required Environment Variables

### Backend Service - MINIMUM (Required)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Backend Service - OPTIONAL (Add as needed)
```
# AI Document Review (optional)
OPENAI_API_KEY=sk-...

# API Authentication (optional)
API_TOKEN=your-secret-token

# S3 Document Storage (optional)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

### Frontend Service
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
PORT=3000
NODE_ENV=production
```

## Railway Service Configuration

### Backend
- **Root Directory**: `/backend`
- **Build Command**: Auto-detected (npm run build)
- **Start Command**: Auto-detected (npm start - includes migrations)
- **Healthcheck**: `/health`

### Frontend
- **Root Directory**: `/app-web`
- **Build Command**: Auto-detected (npm run build)
- **Start Command**: Auto-detected (npm start)
- **Healthcheck**: `/`

## Deployment Steps

1. **Create Railway Project**
   - Connect GitHub repo
   - Create two services from same repo

2. **Configure Backend Service**
   - Set root directory to `/backend`
   - Add all environment variables
   - Deploy

3. **Configure Frontend Service**
   - Set root directory to `/app-web`
   - Add environment variables (use backend URL)
   - Deploy

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is set correctly
- Check Prisma migrations exist in `/backend/prisma/migrations`
- View logs: Look for migration errors
- Test locally: `npm run migrate:deploy && npm start`

### Frontend won't build
- Ensure Node 20+ is being used
- Check NEXT_PUBLIC_API_URL is set
- Build locally to test: `npm run build`

### Database Connection Issues
- Ensure DATABASE_URL includes `?sslmode=require` for Railway Postgres
- Test connection with `npx prisma db pull`

## Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npx prisma migrate dev
npm run dev

# Frontend
cd app-web
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```
