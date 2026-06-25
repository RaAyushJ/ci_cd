# Deployment Checklist: Vercel + Railway

## Pre-Deployment

- [ ] Ensure all code is committed and pushed to GitHub
- [ ] Your GitHub repo is public or you have access to connect it
- [ ] You have Vercel account (free signup at vercel.com)
- [ ] You have Railway account (free signup at railway.app)

## Deploy Backend to Railway (Step 1)

- [ ] Go to [railway.app](https://railway.app) and create new project
- [ ] Select "Deploy from GitHub repo"
- [ ] Select your repository
- [ ] Railway auto-detects the project configuration
- [ ] In Variables tab, set:
  - [ ] `PORT=5000`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL=` (leave blank for now)
- [ ] Click Deploy
- [ ] Wait for build to complete (~2-5 minutes)
- [ ] Copy your Railway domain from Settings tab
  - Format: `https://your-project.up.railway.app`
  - **Save this URL - you'll need it in Step 2**

## Deploy Frontend to Vercel (Step 2)

- [ ] Go to [vercel.com](https://vercel.com) and create new project
- [ ] Select "Import Git Repository"
- [ ] Select your repository
- [ ] Configure Build Settings:
  - [ ] **Framework**: Vite
  - [ ] **Build Command**: `cd smart-room-twin/frontend && npm install && npm run build`
  - [ ] **Output Directory**: `smart-room-twin/frontend/dist`
  - [ ] **Install Command**: `npm install`
- [ ] In Environment Variables, add:
  - [ ] `VITE_API_URL=` (paste your Railway URL from Step 1)
  - [ ] `VITE_SOCKET_URL=` (paste your Railway URL from Step 1)
- [ ] Click Deploy
- [ ] Wait for build to complete (~2-5 minutes)
- [ ] Copy your Vercel domain from dashboard
  - Format: `https://your-project.vercel.app`
  - **Save this URL - you'll need it in Step 3**

## Update Backend CORS (Step 3)

- [ ] Go back to Railway dashboard
- [ ] Open your backend project
- [ ] Go to Variables tab
- [ ] Update `FRONTEND_URL` with your Vercel domain
  - `FRONTEND_URL=https://your-project.vercel.app` (paste from Step 2)
- [ ] Save - Railway auto-redeploys

## Testing

- [ ] Open your Vercel URL in browser
- [ ] Press F12 to open developer console
- [ ] Check Console tab - should be no CORS errors
- [ ] Check Network tab - WebSocket connection should show as "101" (Switching Protocols)
- [ ] Test your application features
- [ ] Check for real-time updates from backend

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error in console | Check `FRONTEND_URL` on Railway matches your Vercel domain |
| WebSocket fails | Verify `VITE_API_URL` and `VITE_SOCKET_URL` match Railway domain |
| Vercel build fails | Check build logs; ensure `smart-room-twin/frontend/` folder exists |
| Railway build fails | Check logs; verify dependencies in `package.json` |
| App loads but features don't work | Clear browser cache (Ctrl+Shift+Delete) and reload |

## After Deployment

- **Updates**: Just push to GitHub, both platforms auto-redeploy
- **Environment variables**: Update on each platform's dashboard if needed
- **Logs**: Check platform dashboards for debugging

---

## URLs Reference Template

After successful deployment, fill in these URLs:

```
Frontend (Vercel):   https://________________
Backend (Railway):   https://________________
WebSocket (Railway): https://________________
```
