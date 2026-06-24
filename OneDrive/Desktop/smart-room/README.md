<div align="center">

# 🏢 Smart Room Digital Twin Console

**High-fidelity 3D digital twin of workspace environment with real-time sensor feeds, decision engine alerts, and computer vision integration.**

</div>

## ✨ Features

- 🎨 **3D Gaussian Splatting** - Luma AI integration for immersive room visualization
- 📊 **Live Telemetry Dashboard** - Real-time temperature, humidity, air flow, noise level, camera FPS
- 🚨 **Decision Engine** - Rule-based alerts for comfort and focus disturbance
- 🤖 **ML Inference Blueprint** - YOLOv8 YOLO architecture specification for edge-based vision
- 🎯 **Spatial Tags** - Interactive sensors overlaid on 3D environment
- 🔌 **Socket.io Integration** - Real-time bidirectional communication
- 📱 **Responsive Design** - Modern, accessible UI with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Local Development

**Backend (Terminal 1)**
```bash
cd smart-room-twin/backend
npm install
npm start
```

**Frontend (Terminal 2)**
```bash
cd smart-room-twin/frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

### Environment Setup

Copy environment files:
```bash
cp .env.example .env
cp smart-room-twin/backend/.env.example smart-room-twin/backend/.env
cp smart-room-twin/frontend/.env.example smart-room-twin/frontend/.env
```

Update with your local URLs (defaults work for local dev)

## 📦 Project Structure

```
smart-room/
├── smart-room-twin/
│   ├── backend/
│   │   ├── server.js                 # Express + Socket.io server
│   │   ├── services/
│   │   │   ├── telemetry.js          # IoT sensor simulation
│   │   │   ├── decisionEngine.js     # Rule-based alerts
│   │   │   └── mlInference.js        # YOLO blueprint spec
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── 3D/              # Scene viewer, spatial tags
│       │   │   └── UI/              # Dashboard, alerts, uploader
│       │   ├── context/             # Socket.io context
│       │   └── services/            # Telemetry simulator
│       └── package.json
│
├── DEPLOYMENT.md                     # Full deployment guide
├── .env.example                      # Environment template
└── package.json                      # Root scripts
```

## 🎮 Usage

1. **View 3D Room** - Luma AI embedded viewer on the right
2. **Monitor Sensors** - Telemetry panel on the left
3. **Interact with Tags** - Click spatial icons to expand sensor details
4. **Fullscreen Mode** - Click maximize button for immersive view
5. **Change Room Link** - Update Luma AI embed URL via UI input

## 🔧 Technical Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS + custom styling
- Three.js (via Luma AI iframe)
- Socket.io Client
- Vite

### Backend
- Node.js + Express
- Socket.io (real-time communication)
- Multer (file uploads)
- CORS support

## 📡 Decision Engine Rules

| Rule | Condition | Action |
|------|-----------|--------|
| **Thermal Comfort** | Temp > 28°C AND Airflow < 1.0 m/s | Comfort Warning |
| **Acoustic Focus** | Noise Level > 75 dB | Disturbance Alert |

## 🌐 Deployment

**For full deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### Quick Deploy to Vercel (Frontend)
```bash
npm run build
git push
# Connect GitHub to Vercel for auto-deploy
```

### Quick Deploy to Railway (Full Stack)
- Backend: https://railway.app
- Frontend: https://vercel.com
- See DEPLOYMENT.md for detailed steps

## 🛠️ Development Scripts

```bash
# Root directory
npm run dev              # Run both frontend & backend locally
npm run build            # Build frontend + bundle backend
npm run lint             # TypeScript check

# Frontend
cd smart-room-twin/frontend
npm run dev              # Vite dev server
npm run build            # Build for production

# Backend
cd smart-room-twin/backend
npm start                # Start Node server
```

## 📚 Architecture

### Telemetry Pipeline
```
IoT Sensors → Simulation (Gaussian noise) → Decision Engine → Socket.io → Frontend
```

### ML Inference Blueprint
```
Camera Feed → Preprocessing → YOLOv8 Model → NMS → Detections → Telemetry
```

## 🤝 Contributing

This is a complete standalone project. Feel free to extend:
- Add real IoT sensor integration
- Implement actual YOLO model inference
- Add more decision rules
- Expand 3D visualization

## 📄 License

MIT

## 👨‍💻 Author

**Assignment Twin-3D-v2.0** - Smart Room Digital Twin Console

---

**Ready to deploy?** Start with [DEPLOYMENT.md](DEPLOYMENT.md) for free hosting options!
