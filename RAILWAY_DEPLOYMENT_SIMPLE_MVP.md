# Railway Deployment Guide - Simple MVP

This guide will help you deploy the Simple MVP to Railway without requiring AWS.

## Prerequisites

- GitHub account with your code pushed
- Railway account (free tier available)
- OpenAI API key (you already have: `sk-G5T31_rHNu5Xnh8_1ZWfJw`)

---

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)

---

## Step 2: Create PostgreSQL Database

1. In Railway, click "New Project"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create a database and provide a `DATABASE_URL`

**Copy the DATABASE_URL** - you'll need it later.

---

## Step 3: Deploy Backend

1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repo: `PIMPEY/rogue-portfolio-core`
3. Click "Add Variables" and set:
   - `OPENAI_API_KEY` = `sk-G5T31_rHNu5Xnh8_1ZWfJw`
   - `DATABASE_URL` = (paste from Step 2)
4. Set the root directory to: `backend`
5. Click "Deploy"

**Wait for deployment to complete** (2-3 minutes)

**Copy the Backend URL** - it will look like:
```
https://project-rogue-backend-production.up.railway.app
```

---

## Step 4: Deploy Frontend

1. Click "New Project" → "Deploy from GitHub repo"
2. Select the same repo: `PIMPEY/rogue-portfolio-core`
3. Click "Add Variables" and set:
   - `NEXT_PUBLIC_BACKEND_URL` = (paste backend URL from Step 3)
4. Set the root directory to: `app-web`
5. Click "Deploy"

**Wait for deployment to complete** (2-3 minutes)

**Copy the Frontend URL** - it will look like:
```
https://project-rogue-app-web-production.up.railway.app
```

---

## Step 5: Access Your Live App

1. Open your browser
2. Go to: `https://project-rogue-app-web-production.up.railway.app/simple-mvp`
3. You should see the Simple MVP page!

---

## Step 6: Test the Deployment

1. **Create a test investment:**
   - Fill in the form
   - Upload a document
   - Click "Analyze with ChatGPT"

2. **Check the logs:**
   - Go to Railway dashboard
   - Click on your backend service
   - View logs to see if ChatGPT is working

---

## Troubleshooting

### "OpenAI API key not configured"
- Make sure you added `OPENAI_API_KEY` to backend environment variables
- Check the key is correct: `sk-G5T31_rHNu5Xnh8_1ZWfJw`

### "Database connection failed"
- Make sure you added `DATABASE_URL` to backend environment variables
- Check the PostgreSQL database is running in Railway

### "Backend not available"
- Check backend service is deployed and running
- View backend logs for errors
- Make sure `NEXT_PUBLIC_BACKEND_URL` is set correctly in frontend

### "Build failed"
- Check the build logs in Railway
- Make sure all dependencies are in `package.json`
- Try redeploying by clicking "Redeploy" button

---

## Environment Variables Summary

### Backend Variables:
```
OPENAI_API_KEY=sk-G5T31_rHNu5Xnh8_1ZWfJw
DATABASE_URL=postgresql://user:pass@host:port/database
```

### Frontend Variables:
```
NEXT_PUBLIC_BACKEND_URL=https://project-rogue-backend-production.up.railway.app
```

---

## Railway URLs (After Deployment)

- **Frontend:** `https://project-rogue-app-web-production.up.railway.app`
- **Backend:** `https://project-rogue-backend-production.up.railway.app`
- **Simple MVP:** `https://project-rogue-app-web-production.up.railway.app/simple-mvp`

---

## Cost

Railway free tier includes:
- $5/month free credit
- 512MB RAM per service
- Shared CPU
- 1GB database storage

This should be sufficient for development and testing.

---

## Next Steps

After successful deployment:

1. **Test all features:**
   - Create investments
   - Upload documents
   - Analyze with ChatGPT
   - View dashboard

2. **Monitor usage:**
   - Check Railway dashboard for logs
   - Monitor OpenAI API usage
   - Track database storage

3. **Customize:**
   - Update branding
   - Add more fields
   - Improve UI

---

## Rollback to Local (If Needed)

If Railway doesn't work, you can always run locally:

1. Open terminal
2. Run: `start-simple-mvp.bat`
3. Go to: `http://localhost:3000/simple-mvp`

Everything works the same way!

---

## Support

If you encounter issues:

1. Check Railway logs
2. Check this guide
3. Go back to local hosting (it's working great!)
