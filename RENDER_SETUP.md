# Render Deployment Setup Instructions

## Current Issue
Render is using a cached Python configuration. The repository is now a pure Node.js/React project with no Python files, but Render's auto-detection doesn't re-run.

## Solution: Manual Configuration in Render Dashboard

### Step 1: Go to Your Render Service
1. Visit https://dashboard.render.com
2. Click on your "gamesite" service

### Step 2: Configure Service Settings
Click the **"Settings"** tab and update:

#### Environment
- **Language**: Change from `Python` to `Node.js`

#### Build Settings
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server.mjs`
- **Node.js Version**: `22.22.0` (should auto-detect from .node-version)

#### Environment Variables (if needed)
- Add `NODE_ENV=production`

### Step 3: Save and Redeploy
1. Click **"Save"**
2. Go to the **"Deployments"** tab
3. Click **"Deploy latest commit"** or **"Clear build cache and deploy"**

## File Structure Reference
Your project now has:
- ✅ `package.json` - Node.js dependencies
- ✅ `server.mjs` - Express server
- ✅ `Procfile` - Deployment configuration
- ✅ `runtime.txt` - Node.js runtime specification
- ✅ `.node-version` - Node version file
- ❌ `backend/` - NOT tracked in git (local only)
- ❌ `requirements.txt` - NOT at root

## What Happens After Deploying
1. Render clones your repo
2. Runs `npm install && npm run build`
3. Starts server with `node server.mjs`
4. Server listens on PORT (default 3000 or Render's assigned port)
5. Serves React app from `dist/` folder

## Testing Locally
```bash
npm run build      # Build the React app
npm start          # Run the server
# Open http://localhost:3000
```

## Backend (Local Development Only)
The backend runs locally on your machine:
```bash
npm run backend    # Starts FastAPI on port 8000
```

For now, the frontend and backend are separated:
- **Frontend**: Deployed on Render
- **Backend**: Runs locally for testing

---
**Status**: Frontend-ready for deployment. Backend can be deployed to a separate service later if needed.
