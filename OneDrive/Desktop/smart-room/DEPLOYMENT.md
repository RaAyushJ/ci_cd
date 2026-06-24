# Deployment Guide - Smart Room Digital Twin

This guide explains how to deploy the Smart Room Digital Twin application for free.

## Project Structure

```
smart-room/
├── frontend/           # React + Vite (Deploys to Vercel/Netlify)
├── backend/            # Node.js + Express + Socket.io (Deploys to Railway/fly.io)
├── smart-room-twin/    # Full-stack version
└── package.json        # Root package
```

## Option 1: Frontend Only (Quickest)

**Best for:** Viewing the UI without backend services

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set Build Command: `npm run build`
   - Set Output Directory: `dist`
   - Deploy

3. **Your site is live!** 🎉

---

## Option 2: Full Stack Deployment (Recommended)

Deploy both frontend and backend for full functionality with real-time updates.

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Select your repository

3. **Configure Service**
   - Choose deploy from `/smart-room-twin/backend`
   - Add Environment Variables:
     - `PORT`: 5000
     - `NODE_ENV`: production
     - `FRONTEND_URL`: https://your-vercel-domain.vercel.app

4. **Deploy**
   - Railway will auto-deploy
   - Your backend URL: `https://your-service-name.up.railway.app`

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Select `/smart-room-twin/frontend` as root

2. **Set Environment Variables**
   - `VITE_API_URL`: https://your-service-name.up.railway.app
   - `VITE_SOCKET_URL`: https://your-service-name.up.railway.app

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy** 🚀

### Step 3: Update Backend CORS

Update your backend's `.env` file on Railway:
```
FRONTEND_URL=https://your-vercel-domain.vercel.app
PORT=5000
NODE_ENV=production
```

---

## Alternative: Deploy Both to Railway

If you prefer one platform:

1. Create main project for backend (as above)
2. Create second project for frontend
3. Link them via environment variables

---

## Environment Variables Checklist

### Frontend (`.env.production`)
```
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

### Backend (`.env`)
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

---

## Local Testing Before Deploy

```bash
# Terminal 1: Backend
cd smart-room-twin/backend
npm install
npm start

# Terminal 2: Frontend
cd smart-room-twin/frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Troubleshooting

### "Socket connection failed"
- Check backend URL in frontend `.env`
- Ensure backend is running
- Check CORS settings in backend

### "Cannot find module"
- Run `npm install` in both frontend and backend
- Clear node_modules and reinstall

### Build fails
- Check Node.js version: `node --version` (should be 16+)
- Delete package-lock.json and reinstall
- Check for syntax errors: `npm run lint`

---

## Post-Deployment

1. **Test your live site**
   - Check telemetry updates
   - Test fullscreen button
   - Upload a Luma AI link

2. **Enable HTTPS** (Usually automatic on Vercel/Railway)

3. **Monitor logs**
   - Vercel: Deployments tab
   - Railway: Project logs

---

## Free Tier Limitations

- **Vercel**: 100GB bandwidth/month
- **Railway**: $5/month free credits (usually enough)
- **Netlify**: 100GB bandwidth/month
- **fly.io**: $3/month free tier (shared CPU)

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://railway.app/docs
- Socket.io Production: https://socket.io/docs/v4/production/
