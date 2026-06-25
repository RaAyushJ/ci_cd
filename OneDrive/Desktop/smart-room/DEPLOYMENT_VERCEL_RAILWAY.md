# Deployment Guide: Vercel + Railway

This guide walks you through deploying the Smart Room application on **Vercel** (frontend) and **Railway** (backend).

## Prerequisites

- GitHub repository with your code pushed
- Vercel account (free at [vercel.com](https://vercel.com))
- Railway account (free at [railway.app](https://railway.app))

---

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will automatically detect the project

### 1.2 Configure Railway Service

1. In the Railway dashboard, click on your project
2. Go to the **"Variables"** tab and set:

   ```
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   ```

   *(You'll update `FRONTEND_URL` after deploying Vercel)*

3. Click **"Deploy"** - Railway will build and deploy automatically

### 1.3 Get Your Railway URL

1. Go to the **"Settings"** tab
2. Copy the **Domain** (e.g., `https://smart-room-backend.up.railway.app`)
3. Note this for Step 2

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"** → **"Import Git Repository"**
3. Select your repository
4. Configure as follows:

   - **Framework Preset**: Vite
   - **Root Directory**: `.` (or leave default)
   - **Build Command**: `cd smart-room-twin/frontend && npm install && npm run build`
   - **Output Directory**: `smart-room-twin/frontend/dist`
   - **Install Command**: `npm install`

### 2.2 Add Environment Variables

In the Vercel project settings, go to **Environment Variables** and add:

```
VITE_API_URL=https://your-railway-backend-url.up.railway.app
VITE_SOCKET_URL=https://your-railway-backend-url.up.railway.app
```

*Replace with your actual Railway domain from Step 1.3*

### 2.3 Deploy

Click **"Deploy"** - Vercel will build and deploy your frontend.

### 2.4 Get Your Vercel URL

After deployment completes, copy your Vercel domain (e.g., `https://smart-room.vercel.app`)

---

## Step 3: Update Backend CORS

1. Go back to Railway dashboard
2. Open your project and click **"Variables"**
3. Update `FRONTEND_URL` with your Vercel domain:

   ```
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   ```

4. Railway will auto-redeploy with the new settings

---

## Step 4: Test Your Deployment

1. Open your Vercel URL in a browser
2. Check browser console (F12) - should see no CORS errors
3. WebSocket connection should establish to your Railway backend
4. Verify real-time features work (telemetry, alerts, etc.)

---

## Troubleshooting

### CORS Errors in Browser Console

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Verify `FRONTEND_URL` is set correctly on Railway
2. Ensure it includes `https://` and the full domain
3. Redeploy Railway after updating

### WebSocket Connection Fails

**Problem**: `WebSocket connection to wss://... failed`

**Solution**:
1. Check that `VITE_SOCKET_URL` matches your Railway domain
2. Make sure Railway backend is running (check Railway logs)
3. Verify no firewall issues

### Build Fails on Vercel

**Problem**: `Command failed`

**Solution**:
1. Check the build logs in Vercel dashboard
2. Ensure `smart-room-twin/frontend/package.json` exists
3. Verify all dependencies are listed

### Build Fails on Railway

**Problem**: Node modules installation fails

**Solution**:
1. Check Railway logs for error details
2. Ensure all dependencies in `smart-room-twin/backend/package.json` exist
3. Try redeploying by pushing a new commit

---

## Quick Reference: URLs After Deployment

- **Vercel Frontend**: `https://your-project.vercel.app`
- **Railway Backend**: `https://your-project-backend.up.railway.app`
- **WebSocket**: `https://your-project-backend.up.railway.app`

---

## Updating After Deployment

### Frontend Updates (Vercel)

1. Push changes to GitHub
2. Vercel auto-deploys on `main` branch push
3. Or manually redeploy from Vercel dashboard

### Backend Updates (Railway)

1. Push changes to GitHub
2. Railway auto-deploys on `main` branch push
3. Or manually redeploy from Railway dashboard

---

## Environment Variables Summary

### Railway (Backend)
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### Vercel (Frontend)
```
VITE_API_URL=https://your-railway-domain.up.railway.app
VITE_SOCKET_URL=https://your-railway-domain.up.railway.app
```

---

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
