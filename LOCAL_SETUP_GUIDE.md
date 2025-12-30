# Local Setup Guide

## Quick Start Options

### Option 1: Standalone HTML (Easiest - No Setup Required)

**Best for:** Quick demos, sharing, offline use

1. Double-click `start-standalone-mvp.bat`
2. Simple MVP opens in your browser
3. Works immediately, no servers needed

**Files:**
- `simple-mvp-standalone.html` - Create investments with ChatGPT
- `portfolio-standalone.html` - View portfolio dashboard
- `companies-standalone.html` - View company details

---

### Option 2: Full Local Development (Requires Setup)

**Best for:** Full functionality, database, API access

#### Prerequisites
- Node.js (v18 or higher) installed
- Git installed
- PostgreSQL database (optional, for full backend)

#### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../app-web
npm install
```

#### Step 2: Configure Environment

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rogue_portfolio"
OPENAI_API_KEY="your-openai-api-key"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET="your-bucket-name"
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

#### Step 3: Start Servers

**Option A: Use Batch File (Windows)**
```bash
start-simple-mvp.bat
```

**Option B: Manual Start**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd app-web
npm run dev
```

#### Step 4: Access Application

- Simple MVP: http://localhost:3000/simple-mvp
- Portfolio: http://localhost:3000
- Backend API: http://localhost:3001

---

## Troubleshooting

### "node_modules not found" Error

**Solution:**
```bash
cd backend
npm install

cd ../app-web
npm install
```

### "Port 3000/3001 already in use" Error

**Solution:**
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database Connection Error

**Solution:**
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in backend/.env
3. Run migrations:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

### "Cannot find module" Error

**Solution:**
```bash
# Clear cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../app-web
rm -rf node_modules package-lock.json
npm install
```

### Next.js Build Error

**Solution:**
```bash
cd app-web
rm -rf .next
npm run dev
```

### Batch File Doesn't Work

**Possible Causes:**
1. Not in correct directory
2. Node.js not installed
3. Dependencies not installed

**Solution:**
1. Open Command Prompt in project root
2. Run `node --version` to check Node.js
3. Run `npm --version` to check npm
4. Install dependencies if needed

---

## Development Workflow

### Making Changes

**Frontend (app-web):**
- Edit files in `src/`
- Changes auto-reload in browser
- Hot Module Replacement enabled

**Backend (backend):**
- Edit files in `src/`
- Server auto-restarts with tsx watch
- API changes reflect immediately

### Database Changes

```bash
cd backend

# Create migration
npx prisma migrate dev --name your_migration_name

# Generate Prisma Client
npx prisma generate

# Seed database
npm run seed
```

### Running Tests

```bash
# Backend tests (if available)
cd backend
npm test

# Frontend tests (if available)
cd app-web
npm test
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| OPENAI_API_KEY | Yes | OpenAI API key for ChatGPT |
| AWS_ACCESS_KEY_ID | No | AWS access key for S3 |
| AWS_SECRET_ACCESS_KEY | No | AWS secret key for S3 |
| AWS_REGION | No | AWS region (default: eu-west-1) |
| AWS_S3_BUCKET | No | S3 bucket name for documents |

### Frontend (.env.local)

| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_BACKEND_URL | Yes | Backend API URL |

---

## Common Issues and Solutions

### Issue: "Module not found: Can't resolve '@/components/...'"

**Solution:**
```bash
cd app-web
rm -rf .next node_modules
npm install
npm run dev
```

### Issue: "Prisma Client is not generated"

**Solution:**
```bash
cd backend
npx prisma generate
```

### Issue: "CORS error when calling API"

**Solution:**
Check backend CORS configuration in `src/index.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001']
}));
```

### Issue: "OpenAI API error"

**Solution:**
1. Check OPENAI_API_KEY in backend/.env
2. Verify API key is valid
3. Check OpenAI account has credits

### Issue: "S3 upload failed"

**Solution:**
1. Check AWS credentials in backend/.env
2. Verify S3 bucket exists
3. Check bucket permissions

---

## Performance Tips

### Backend
- Use `npm run build` for production builds
- Enable database connection pooling
- Use environment variables for configuration

### Frontend
- Use `npm run build` for production builds
- Enable Next.js image optimization
- Use dynamic imports for large components

---

## Production Deployment

See deployment guides:
- `RAILWAY_QUICK_START.md` - Railway deployment
- `RAILWAY_COMPLETE_DEPLOYMENT.md` - Detailed Railway guide
- `VERCEL_DEPLOYMENT.md` - Vercel deployment

---

## Getting Help

1. Check this guide first
2. Review error messages carefully
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. Open an issue on GitHub

---

## Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check running processes
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Clear npm cache
npm cache clean --force

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

---

## File Structure

```
rogue-portfolio-core/
├── backend/                 # Backend API server
│   ├── src/                # Source code
│   ├── prisma/             # Database schema
│   └── package.json        # Backend dependencies
├── app-web/                # Frontend Next.js app
│   ├── src/                # Source code
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
├── simple-mvp-standalone.html
├── portfolio-standalone.html
├── companies-standalone.html
├── start-simple-mvp.bat    # Start full development
└── start-standalone-mvp.bat # Start standalone HTML
```

---

## Next Steps

1. Try standalone HTML first (easiest)
2. Set up full development environment if needed
3. Configure database for full functionality
4. Deploy to Railway for production use
