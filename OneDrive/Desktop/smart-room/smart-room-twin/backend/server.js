import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import services
import { generateNextTelemetry, getLatestTelemetry, toggleCamera } from "./services/telemetry.js";
import { evaluateRules } from "./services/decisionEngine.js";
import { runYoloInference } from "./services/mlInference.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration - allow frontend domains
const corsOrigins = NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'http://localhost:3000']
  : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'];

// Enable CORS and JSON parsing
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

// Initialize Socket.io with production-ready CORS
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Paths setup
const uploadsDir = path.join(__dirname, "uploads");
const distDir = path.join(__dirname, "..", "frontend", "dist");

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// MULTER SETUP: Accept .ply and .splat files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Sanitize and append timestamp to prevent name collision
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `${Date.now()}_${cleanName}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".ply" || ext === ".splat") {
      cb(null, true);
    } else {
      cb(new Error("Only .ply and .splat Gaussian Splatting files are allowed."));
    }
  },
  limits: {
    fileSize: 150 * 1024 * 1024 // 150 MB file limit
  }
});

// --- API ENDPOINTS ---

// 1. Get latest simulated telemetry
app.get("/api/telemetry", (req, res) => {
  res.json(getLatestTelemetry());
});

// 2. Toggle camera state
app.post("/api/camera/toggle", (req, res) => {
  const { state } = req.body;
  const updated = toggleCamera(state);
  // Broadcast updated camera status immediately
  io.emit("telemetry", updated);
  res.json({ success: true, telemetry: updated });
});

// 3. Get simulated live ML inference results
app.get("/api/ml-inference", async (req, res) => {
  try {
    const inferenceResult = await runYoloInference(null);
    res.json(inferenceResult);
  } catch (error) {
    res.status(500).json({ error: "Failed to compile ML inference: " + error.message });
  }
});

// 4. File Upload endpoint for .ply / .splat Gaussian Splat
app.post("/api/upload-splat", upload.single("splatFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file was uploaded." });
  }

  res.json({
    success: true,
    message: "Gaussian Splat reconstruction file uploaded successfully.",
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size
    }
  });
});

// 5. List all uploaded splats
app.get("/api/splats", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const splats = files
      .filter(file => file !== ".gitkeep" && (file.endsWith(".ply") || file.endsWith(".splat")))
      .map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `/uploads/${file}`,
          uploadedAt: stats.mtime.toISOString(),
          size: stats.size
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); // Show latest first

    res.json({ success: true, splats });
  } catch (error) {
    res.status(500).json({ error: "Failed to list splat reconstructions: " + error.message });
  }
});

// --- REAL-TIME TELEMETRY EMITTER ---

// Active clients counter
let connectedClients = 0;

// Socket.io connection logic
io.on("connection", (socket) => {
  connectedClients++;
  console.log(`[Socket] Client connected. Active: ${connectedClients}`);

  // Send initial telemetry immediately
  const initialData = getLatestTelemetry();
  socket.emit("telemetry", initialData);

  // Evaluate and emit active alerts immediately
  const activeAlerts = evaluateRules(initialData);
  socket.emit("alerts", activeAlerts);

  socket.on("disconnect", () => {
    connectedClients--;
    console.log(`[Socket] Client disconnected. Active: ${connectedClients}`);
  });
});

// Setup 1 second telemetry simulation loop
setInterval(() => {
  const telemetryData = generateNextTelemetry();
  const activeAlerts = evaluateRules(telemetryData);

  // Stream data and evaluated alerts to all clients
  io.emit("telemetry", telemetryData);
  io.emit("alerts", activeAlerts);
}, 1000);

// --- INTEGRATION: VITE MIDDLEWARE (DEV) OR STATIC SERVING (PROD) ---

async function initializeViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    // Import Vite programmatically to spin up Dev Server as middleware
    console.log("[Server] Running in DEVELOPMENT mode. Mounting Vite Dev Middleware...");
    const { createServer: createViteServer } = await import("vite");
    
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(__dirname, "..", "frontend")
    });

    app.use(vite.middlewares);
  } else {
    console.log("[Server] Running in PRODUCTION mode. Serving pre-compiled static assets...");
    // Serve production static assets
    app.use(express.static(distDir));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  // Start Server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`========================================`);
    console.log(`🚀 Smart Room Twin Server Running!`);
    console.log(`🔗 Address: http://localhost:${PORT}`);
    console.log(`📂 Uploads directory: ${uploadsDir}`);
    console.log(`========================================`);
  });
}

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer Error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

initializeViteOrStatic();
