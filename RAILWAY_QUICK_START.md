# Railway Quick Start - Simple MVP

## What You Need

✅ GitHub repo: `PIMPEY/rogue-portfolio-core` (already pushed!)
✅ OpenAI API key: `sk-G5T31_rHNu5Xnh8_1ZWfJw`
✅ Railway account (free)

---

## 5 Steps to Go Live

### 1. Create Database
- Railway → New Project → Database → PostgreSQL
- Copy `DATABASE_URL`

### 2. Deploy Backend
- Railway → New Project → Deploy from GitHub
- Select: `PIMPEY/rogue-portfolio-core`
- Root directory: `backend`
- Variables:
  - `OPENAI_API_KEY` = `sk-G5T31_rHNu5Xnh8_1ZWfJw`
  - `DATABASE_URL` = (paste from step 1)
- Click Deploy
- Copy backend URL

### 3. Deploy Frontend
- Railway → New Project → Deploy from GitHub
- Select: `PIMPEY/rogue-portfolio-core`
- Root directory: `app-web`
- Variables:
  - `NEXT_PUBLIC_BACKEND_URL` = (paste backend URL)
- Click Deploy

### 4. Access Your App
- Go to: `https://project-rogue-app-web-production.up.railway.app/simple-mvp`

### 5. Test It!
- Create an investment
- Upload a document
- Click "Analyze with ChatGPT"

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://project-rogue-app-web-production.up.railway.app` |
| Backend | `https://project-rogue-backend-production.up.railway.app` |
| Simple MVP | `https://project-rogue-app-web-production.up.railway.app/simple-mvp` |

---

## If It Doesn't Work

No problem! Just run locally:

```bash
start-simple-mvp.bat
```

Then go to: `http://localhost:3000/simple-mvp`

---

## Need Help?

See full guide: `RAILWAY_DEPLOYMENT_SIMPLE_MVP.md`
