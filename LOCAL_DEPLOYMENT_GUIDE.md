# Local Deployment Guide

## Quick Start (3 Commands)

```bash
# 1. Check system status
check-status.bat

# 2. Start all servers
start-all.bat

# 3. Stop all servers (when done)
stop-all.bat
```

That's it! Your local development environment is ready.

---

## Deployment Files

### Core Files
- **`start-all.bat`** - Start backend + frontend servers
- **`stop-all.bat`** - Stop all running servers
- **`restart-all.bat`** - Restart all servers
- **`check-status.bat`** - Check system status and dependencies

### Standalone Files
- **`start-standalone-mvp.bat`** - Open standalone HTML (no servers needed)

---

## What Happens When You Run `start-all.bat`

### Step 1: System Check
- ✅ Verifies Node.js is installed
- ✅ Verifies npm is installed
- ✅ Shows version numbers

### Step 2: Dependency Check
- ✅ Checks if backend dependencies are installed
- ✅ Installs them if missing
- ✅ Checks if frontend dependencies are installed
- ✅ Installs them if missing

### Step 3: Port Check
- ✅ Checks if port 3001 is available (backend)
- ✅ Checks if port 3000 is available (frontend)
- ✅ Frees ports if in use

### Step 4: Server Start
- ✅ Starts backend server on port 3001
- ✅ Starts frontend server on port 3000
- ✅ Opens browser to portfolio dashboard

---

## Access URLs

### Development Servers
- **Simple MVP**: http://localhost:3000/simple-mvp
- **Portfolio**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Standalone HTML (No Servers)
- **Simple MVP**: `simple-mvp-standalone.html`
- **Portfolio**: `portfolio-standalone.html`
- **Companies**: `companies-standalone.html`

---

## Common Workflows

### Daily Development
```bash
# Morning: Start servers
start-all.bat

# Work on code...

# Evening: Stop servers
stop-all.bat
```

### Quick Check
```bash
# Check if everything is ready
check-status.bat
```

### Restart After Changes
```bash
# Restart both servers
restart-all.bat
```

### Share with Others
```bash
# Option 1: Share standalone HTML (easiest)
start-standalone-mvp.bat

# Option 2: Share development URL
# Tell them to go to http://localhost:3000
# (Only works on your local network)
```

---

## Troubleshooting

### "Node.js is not installed"
**Solution**: Install Node.js from https://nodejs.org/

### "Port 3000/3001 already in use"
**Solution**: Run `stop-all.bat` first, then `start-all.bat`

### "Dependencies not installed"
**Solution**: Run `start-all.bat` - it will auto-install dependencies

### "Servers won't start"
**Solution**:
1. Run `check-status.bat` to diagnose
2. Check the terminal windows for error messages
3. Try `stop-all.bat` then `start-all.bat`

### "Can't access localhost:3000"
**Solution**:
1. Wait 10-15 seconds for servers to start
2. Check if both terminal windows are open
3. Look for "Ready" message in frontend terminal

### "Changes not showing"
**Solution**:
1. Frontend changes auto-reload (Next.js)
2. Backend changes auto-restart (tsx watch)
3. If not working, run `restart-all.bat`

---

## Advanced Usage

### Start Only Backend
```bash
cd backend
npm run dev
```

### Start Only Frontend
```bash
cd app-web
npm run dev
```

### Clean Install (Fresh Start)
```bash
# Stop servers
stop-all.bat

# Remove dependencies
rmdir /s /q backend\node_modules
rmdir /s /q app-web\node_modules

# Reinstall
start-all.bat
```

### Check Logs
- **Backend logs**: Look at "Backend Server" terminal window
- **Frontend logs**: Look at "Frontend Server" terminal window
- **Browser logs**: Press F12, go to Console tab

---

## System Requirements

### Minimum
- **OS**: Windows 10/11
- **RAM**: 4GB
- **Disk**: 2GB free space
- **Node.js**: v18 or higher

### Recommended
- **OS**: Windows 11
- **RAM**: 8GB+
- **Disk**: 5GB free space
- **Node.js**: v20 LTS

---

## File Structure

```
rogue-portfolio-core/
├── start-all.bat              # Start all servers
├── stop-all.bat               # Stop all servers
├── restart-all.bat            # Restart all servers
├── check-status.bat           # Check system status
├── start-standalone-mvp.bat   # Open standalone HTML
├── backend/                   # Backend server
│   ├── src/                   # Source code
│   ├── node_modules/          # Dependencies
│   └── package.json           # Backend config
├── app-web/                   # Frontend server
│   ├── src/                   # Source code
│   ├── node_modules/          # Dependencies
│   └── package.json           # Frontend config
├── simple-mvp-standalone.html
├── portfolio-standalone.html
└── companies-standalone.html
```

---

## Performance Tips

### Faster Startup
- Keep terminal windows open (don't close them)
- Use `restart-all.bat` instead of stop/start
- Don't run `check-status.bat` every time

### Better Performance
- Close unused browser tabs
- Use Chrome or Edge (best performance)
- Disable browser extensions when developing

### Memory Management
- Stop servers when not in use
- Restart servers daily if developing all day
- Close terminal windows when done

---

## Security Notes

### Local Development Only
- These servers are for local development only
- Not secure for production use
- Don't expose ports to the internet

### Environment Variables
- `.env` files are optional for local dev
- Don't commit `.env` files to git
- Use `.env.example` as template

---

## Next Steps

1. **Run `check-status.bat`** - Verify system is ready
2. **Run `start-all.bat`** - Start development servers
3. **Open http://localhost:3000** - Start using the app
4. **Read the code** - Understand how it works
5. **Make changes** - Start developing

---

## Getting Help

1. Run `check-status.bat` for diagnostics
2. Check terminal windows for error messages
3. Review this guide's troubleshooting section
4. Open an issue on GitHub

---

## Summary

**You need only 3 commands:**
```bash
check-status.bat  # Check if ready
start-all.bat     # Start servers
stop-all.bat      # Stop servers
```

**That's it!** Everything else is handled automatically.
