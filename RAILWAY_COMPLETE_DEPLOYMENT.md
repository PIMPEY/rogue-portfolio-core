# Complete Railway Deployment Guide

## Goal: Get Simple MVP working on Railway for third parties

---

## Current Issues

❌ Backend: Migration errors (ghost migration)
❌ Frontend: Simple MVP showing 404
❌ Dashboard: 500 errors

---

## Solution: Clean Slate Deployment

We'll recreate everything from scratch to ensure it works perfectly.

---

## Step 1: Clean Up Railway Services

### Delete All Existing Services

1. Go to Railway dashboard
2. For each service (backend, frontend, database):
   - Click on the service
   - Click **Settings**
   - Click **Delete Service**
   - Confirm deletion

**Why?** This gives us a clean start with no migration issues.

---

## Step 2: Create PostgreSQL Database

1. Click **New Project** → **Database** → **PostgreSQL**
2. Railway will create the database
3. Wait for it to be ready (green status)

**Copy the DATABASE_URL** - you'll need it later.

---

## Step 3: Deploy Backend

### Create Backend Service

1. Click **New Project** → **Deploy from GitHub repo**
2. Select: `PIMPEY/rogue-portfolio-core`
3. Set **Root Directory** to: `backend`
4. Click **Add Variables** and add:
   ```
   OPENAI_API_KEY = sk-G5T31_rHNu5Xnh8_1ZWfJw
   DATABASE_URL = (paste from Step 2)
   ```
5. Click **Deploy**

### Wait for Deployment

- Build: 2-3 minutes
- Migrations will run automatically
- Server will start

### Verify Backend

1. Click on the backend service
2. Copy the URL (e.g., `https://project-rogue-backend-production.up.railway.app`)
3. Test health endpoint: `https://your-backend-url/health`
4. Should return: `{"status":"ok",...}`

**Save this URL** - you'll need it for the frontend.

---

## Step 4: Deploy Frontend

### Create Frontend Service

1. Click **New Project** → **Deploy from GitHub repo**
2. Select: `PIMPEY/rogue-portfolio-core`
3. Set **Root Directory** to: `app-web`
4. Click **Add Variables** and add:
   ```
   NEXT_PUBLIC_BACKEND_URL = (paste backend URL from Step 3)
   ```
5. Click **Deploy**

### Wait for Deployment

- Build: 2-3 minutes
- Next.js will build all pages
- Server will start

### Verify Frontend

1. Click on the frontend service
2. Copy the URL (e.g., `https://project-rogue-app-web-production.up.railway.app`)
3. Test: `https://your-frontend-url/`
4. Should load the dashboard

---

## Step 5: Test Simple MVP

### Access Simple MVP

Go to: `https://your-frontend-url/simple-mvp`

**If it shows 404:**

The frontend didn't build the latest code. Redeploy:

1. Go to frontend service
2. Click **Redeploy**
3. Wait 2-3 minutes
4. Try again

### Test Functionality

1. Fill in the form:
   - Company Name: "Test Company"
   - Sector: "SaaS"
   - Stage: "Seed"
   - Committed Capital: "500000"

2. Upload a document (any PDF/DOC/TXT)

3. Click "Analyze with ChatGPT"

4. Should see analysis results!

---

## Step 6: Share with Third Parties

### URLs to Share

**Simple MVP (Main):**
```
https://your-frontend-url/simple-mvp
```

**Dashboard:**
```
https://your-frontend-url/
```

**Backend API:**
```
https://your-backend-url/
```

### What Third Parties Can Do

✅ Create investments
✅ Upload documents
✅ Analyze with ChatGPT
✅ View analysis results
✅ No setup required!

---

## Step 7: Monitor Usage

### Check Railway Dashboard

1. Go to Railway dashboard
2. Click on each service
3. View:
   - **Metrics**: CPU, memory, usage
   - **Logs**: Errors, requests
   - **Deployments**: Build history

### Check OpenAI Usage

1. Go to https://platform.openai.com/usage
2. Monitor API calls and costs

---

## Troubleshooting

### Backend Shows 500 Error

**Check:**
1. Is DATABASE_URL set correctly?
2. Is PostgreSQL running?
3. Check backend logs for errors

**Fix:**
- Recreate PostgreSQL database
- Update DATABASE_URL
- Redeploy backend

### Frontend Shows 404 for Simple MVP

**Check:**
1. Did frontend build successfully?
2. Check build logs for errors

**Fix:**
- Redeploy frontend
- Wait for build to complete
- Clear browser cache

### ChatGPT Analysis Fails

**Check:**
1. Is OPENAI_API_KEY set?
2. Is the key valid?
3. Check backend logs

**Fix:**
- Verify API key is correct
- Check OpenAI account has credits
- Redeploy backend

---

## Environment Variables Summary

### Backend:
```
OPENAI_API_KEY = sk-G5T31_rHNu5Xnh8_1ZWfJw
DATABASE_URL = (Railway provides automatically)
```

### Frontend:
```
NEXT_PUBLIC_BACKEND_URL = https://your-backend-url.railway.app
```

---

## Cost Estimate

Railway Free Tier:
- $5/month free credit
- 512MB RAM per service
- Shared CPU
- 1GB database storage

**Should be sufficient for:**
- 10-20 concurrent users
- 100-500 analyses per month
- Small to medium usage

---

## Scaling Up

If you need more capacity:

1. **Upgrade Railway Plan**
   - More RAM
   - More CPU
   - More storage

2. **Add Caching**
   - Redis for faster responses
   - Reduce OpenAI API calls

3. **Optimize Database**
   - Add indexes
   - Clean up old data

---

## Security Notes

### What's Exposed

✅ Frontend URL (public)
✅ Backend API (public)
❌ Database (private, Railway only)
❌ Environment variables (private)

### Best Practices

1. **Never commit API keys** to GitHub
2. **Use Railway's secrets** for sensitive data
3. **Monitor usage** regularly
4. **Set up alerts** for errors

---

## Next Steps

### After Deployment

1. ✅ Test all features
2. ✅ Share URLs with users
3. ✅ Monitor usage
4. ✅ Collect feedback

### Future Enhancements

1. Add user authentication
2. Add payment processing
3. Add more analysis features
4. Improve UI/UX

---

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://your-frontend-url.railway.app` | Main app |
| Simple MVP | `https://your-frontend-url.railway.app/simple-mvp` | Investment creation |
| Backend | `https://your-backend-url.railway.app` | API server |
| Database | (private) | PostgreSQL |

---

## Support

If you encounter issues:

1. Check Railway logs
2. Check this guide
3. Check `RAILWAY_MIGRATION_FIX.md`
4. Check `RAILWAY_DEBUG.md`

---

## Summary

✅ **Delete all existing Railway services**
✅ **Create fresh PostgreSQL database**
✅ **Deploy backend with correct variables**
✅ **Deploy frontend with backend URL**
✅ **Test Simple MVP**
✅ **Share URLs with third parties**

**Estimated time:** 15-20 minutes

**Result:** Fully working Simple MVP on Railway! 🚀
