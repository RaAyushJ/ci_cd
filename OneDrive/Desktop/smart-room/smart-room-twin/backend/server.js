import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

import { generateNextTelemetry, getLatestTelemetry, toggleCamera } from "./services/telemetry.js";
import { evaluateRules } from "./services/decisionEngine.js";
import { runYoloInference } from "./services/mlInference.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// 1. UPDATED CORS: Explicitly allow your Vercel frontend URL
const allowedOrigins = [
  'https://smart-home-frontend.vercel.app', // Update with your actual Vercel URL
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// 2. Socket.io with updated CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// --- API ENDPOINTS ---
app.get("/api/telemetry", (req, res) => res.json(getLatestTelemetry()));

app.post("/api/camera/toggle", (req, res) => {
  const { state } = req.body;
  const updated = toggleCamera(state);
  io.emit("telemetry", updated);
  res.json({ success: true, telemetry: updated });
});

app.get("/api/ml-inference", async (req, res) => {
  try {
    const inferenceResult = await runYoloInference(null);
    res.json(inferenceResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... (Keep your existing Multer upload and /api/splats endpoints here) ...

// --- SOCKET EMITTER ---
io.on("connection", (socket) => {
  console.log(`[Socket] Client connected`);
  socket.emit("telemetry", getLatestTelemetry());
  socket.emit("alerts", evaluateRules(getLatestTelemetry()));
});

setInterval(() => {
  const telemetryData = generateNextTelemetry();
  io.emit("telemetry", telemetryData);
  io.emit("alerts", evaluateRules(telemetryData));
}, 1000);

// 3. REMOVED initializeViteOrStatic - just start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend API running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});
