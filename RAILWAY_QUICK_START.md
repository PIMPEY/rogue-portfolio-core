# Quick Start: Deploy to Railway in 15 Minutes

## Goal: Get Simple MVP working on Railway for third parties

---

## What You Need

✅ GitHub repo: `PIMPEY/rogue-portfolio-core`
✅ OpenAI API key: `sk-G5T31_rHNu5Xnh8_1ZWfJw`
✅ Railway account (free)

---

## 5 Steps to Go Live

### Step 1: Clean Up (2 minutes)

1. Go to Railway dashboard
2. **Delete** all existing services (backend, frontend, database)
3. This gives us a fresh start

### Step 2: Create Database (2 minutes)

1. Click **New Project** → **Database** → **PostgreSQL**
2. Wait for it to be ready (green status)
3. **Copy** the `DATABASE_URL`

### Step 3: Deploy Backend (5 minutes)

1. Click **New Project** → **Deploy from GitHub**
2. Select: `PIMPEY/rogue-portfolio-core`
3. **Root Directory:** `backend`
4. **Add Variables:**
   - `OPENAI_API_KEY` = `sk-G5T31_rHNu5Xnh8_1ZWfJw`
   - `DATABASE_URL` = (paste from Step 2)
5. Click **Deploy**
6. Wait 2-3 minutes
7. **Copy** the backend URL

### Step 4: Deploy Frontend (5 minutes)

1. Click **New Project** → **Deploy from GitHub**
2. Select: `PIMPEY/rogue-portfolio-core`
3. **Root Directory:** `app-web`
4. **Add Variables:**
   - `NEXT_PUBLIC_BACKEND_URL` = (paste backend URL from Step 3)
5. Click **Deploy**
6. Wait 2-3 minutes
7. **Copy** the frontend URL

### Step 5: Test & Share (1 minute)

1. Go to: `https://your-frontend-url/simple-mvp`
2. Test creating an investment
3. **Share the URL** with third parties!

---

## URLs After Deployment

| What | URL |
|------|-----|
| Simple MVP | `https://your-frontend-url.railway.app/simple-mvp` |
| Dashboard | `https://your-frontend-url.railway.app` |
| Backend API | `https://your-backend-url.railway.app` |

---

## What Third Parties Can Do

✅ Create investments
✅ Upload documents
✅ Analyze with ChatGPT
✅ View results
✅ No setup required!

---

## Cost

**Free tier includes:**
- $5/month credit
- Enough for 10-20 users
- 100-500 analyses per month

---

## If Something Goes Wrong

### Backend fails:
- Check DATABASE_URL is correct
- Check PostgreSQL is running
- Redeploy backend

### Frontend shows 404:
- Redeploy frontend
- Wait for build to complete
- Clear browser cache

### ChatGPT fails:
- Check OPENAI_API_KEY is correct
- Check OpenAI account has credits
- Check backend logs

---

## Need More Help?

See detailed guides:
- `RAILWAY_COMPLETE_DEPLOYMENT.md` - Full deployment guide
- `RAILWAY_MIGRATION_FIX.md` - Migration issues
- `RAILWAY_DEBUG.md` - Debugging tips

---

## Summary

✅ **Delete old services**
✅ **Create database**
✅ **Deploy backend**
✅ **Deploy frontend**
✅ **Test & share**

**Time:** 15 minutes
**Result:** Working Simple MVP on Railway! 🚀
