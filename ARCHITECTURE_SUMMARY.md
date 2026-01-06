# Project Rogue - Architecture Summary (Simple Language)
**Date:** December 31, 2025

---

## What We Have Today (AS-IS)

### The Big Picture

Your system has **3 main parts** that work together:

1. **Frontend** (The website users see)
   - Built with Next.js (a modern web framework)
   - Shows forms, buttons, and results
   - Runs on Railway at port 3000

2. **Backend** (The brain)
   - Built with Express.js (a server framework)
   - Handles all the logic and data
   - Talks to the database
   - Runs on Railway at port 3001

3. **Agent Worker** (The helper)
   - Processes documents in the background
   - Uses OpenAI (ChatGPT) to analyze files
   - Runs continuously on Railway

### How It Works Now

```
User → Fills Form → Frontend → Backend → Database
                    ↓
                 Uploads File → S3 Storage
                    ↓
                 Starts Review → Agent Worker → OpenAI → Results
```

### What's Working

✅ Investment creation form
✅ Document upload
✅ Agent review with ChatGPT
✅ Storing results in database
✅ Portfolio dashboard (locally)

### What's Not Working

❌ Backend returning errors on Railway
❌ Database connection issues
❌ Main dashboard not loading
❌ Agent worker uses inefficient polling

---

## What We Need (TO-BE)

### The Better Architecture

```
User → Frontend → API Gateway → Database
                    ↓
                 Job Queue → Agent Worker → OpenAI
                    ↓
                 S3 Storage
                    ↓
                 Search Layer
```

### Key Improvements

1. **Fix the Backend** - Make it stable and reliable
2. **Add a Job Queue** - Instead of polling, use a proper queue system
3. **Make Agent Idempotent** - Don't process the same document twice
4. **Extract Facts** - Store structured data (founders, revenue, etc.)
5. **Add Search** - Find investments and facts easily
6. **Track Sources** - Know where each fact came from (which document, which page)

---

## The Gap (What's Missing)

| What's Missing | Why It Matters | How Hard to Fix |
|----------------|----------------|-----------------|
| Backend stability | Can't use the system if it's broken | Easy |
| Job queue | Polling is slow and inefficient | Medium |
| Idempotency | Wastes money processing same docs twice | Medium |
| Structured facts | Can't search or analyze data properly | Hard |
| Search layer | Can't find what you need | Medium |
| Source tracking | Can't verify where data came from | Easy |

---

## The Plan (Next 10 Days)

### Week 1: Fix What's Broken

**Days 1-2: Make It Work**
- Fix database connection
- Fix backend errors
- Test everything works end-to-end

**Days 3-4: Make It Better**
- Add better error messages
- Add loading states
- Test with real documents

### Week 2: Add Missing Features

**Days 5-6: Add Job Queue**
- Set up Redis (queue system)
- Replace polling with queue
- Add retry logic

**Days 7-8: Make Agent Smarter**
- Add idempotency (don't repeat work)
- Extract structured facts
- Track sources

**Days 9-10: Add Search**
- Add search to database
- Create search API
- Add search to website

---

## Next 7 Days (Action List)

### Day 1: Fix Database
- Recreate database on Railway
- Check all settings are correct
- Test connection

### Day 2: Fix Backend
- Fix all 500 errors
- Test all API endpoints
- Verify healthcheck works

### Day 3: Fix Frontend
- Add better error messages
- Add loading states
- Test error scenarios

### Day 4: Test Everything
- Test complete flow
- Test with multiple documents
- Fix any bugs

### Day 5: Add Queue
- Set up Redis
- Install queue software
- Update code to use queue

### Day 6: Test Queue
- Test job processing
- Test retry logic
- Monitor performance

### Day 7: Make Agent Idempotent
- Add fact extraction
- Add duplicate checking
- Test with same documents

---

## Simple Diagrams

### Current System (AS-IS)

```
┌─────────┐
│  User   │
└────┬────┘
     │
     ▼
┌─────────────┐
│  Frontend   │ (Next.js website)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Backend    │ (Express server)
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐   ┌─────────────┐
│ Database │   │ Agent Worker│ (Polls every 5 sec)
└──────────┘   └──────┬──────┘
                      │
                      ▼
                 ┌─────────┐
                 │ OpenAI  │
                 └─────────┘
```

### Target System (TO-BE)

```
┌─────────┐
│  User   │
└────┬────┘
     │
     ▼
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ Database │   │   Queue  │   │  Search  │
└──────────┘   └────┬─────┘   └──────────┘
                    │
                    ▼
              ┌─────────────┐
              │ Agent Worker│ (Consumes from queue)
              └──────┬──────┘
                     │
                     ▼
                ┌─────────┐
                │ OpenAI  │
                └─────────┘
```

---

## Questions I Need Answered

1. **Storage:** Are you using AWS S3, or should we use Railway's built-in storage?
2. **OpenAI:** Is your OpenAI API key working?
3. **Database:** Should we recreate the database to fix the issues?
4. **Search:** What do you want to search? Company names? Document content?
5. **Timeline:** Do you need everything in 7 days, or can we take 10 days?

---

## What You Should Do Now

### Option 1: Quick Fix (2-3 days)
- Fix database connection
- Fix backend errors
- Get basic system working

### Option 2: Full Fix (7-10 days)
- Fix everything above
- Add job queue
- Add idempotency
- Add search

### Option 3: Use Simple MVP (Works Now)
- The simple MVP page already works
- URL: `https://rogue-portfolio-core-production.up.railway.app/simple-mvp`
- No changes needed

---

## My Recommendation

**Start with Option 1 (Quick Fix)** - Get the basic system working in 2-3 days, then decide if you need the extra features.

**Why?**
- You'll have a working system quickly
- You can test it with real users
- You can decide what's actually needed
- You can always add more features later

---

## Summary

| Item | Status | Action |
|------|--------|--------|
| Frontend | ✅ Working | No changes needed |
| Backend | ❌ Broken | Fix database connection |
| Database | ❌ Issues | Recreate and fix |
| Agent Worker | ⚠️ Works but slow | Add queue system |
| Search | ❌ Missing | Add later |
| Idempotency | ❌ Missing | Add later |

**Next Step:** Fix the database connection and backend errors (Days 1-2).

---

**Need help?** Just ask! I can walk you through each step.
