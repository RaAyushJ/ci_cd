/**
 * Telemetry Service
 * Generates simulated live IoT sensor data with realistic Gaussian noise
 * and added health status monitoring.
 */

// Box-Muller transform for Gaussian distributed random numbers
function gaussianRandom(mean, stddev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stddev + mean;
}

// Current state of our simulated IoT streams
let currentTelemetry = {
  temperature: 24.5,
  humidity: 50.0,
  airFlow: 1.2,
  noiseLevel: 55.0,
  cameraFps: 27.0,
  cameraActive: true,
  status: 'online' // New field: Helps UI show status indicators
};

export function generateNextTelemetry() {
  // 1. Temperature: 20°C - 35°C
  currentTelemetry.temperature = Math.min(35.0, Math.max(20.0, currentTelemetry.temperature + gaussianRandom(0, 0.15)));

  // 2. Humidity: 30% - 70%
  currentTelemetry.humidity = Math.min(70.0, Math.max(30.0, currentTelemetry.humidity + gaussianRandom(0, 0.3)));

  // 3. Air Flow: 0.0 - 5.0 m/s
  currentTelemetry.airFlow = Math.min(5.0, Math.max(0.0, currentTelemetry.airFlow + gaussianRandom(0, 0.08)));

  // 4. Noise Level: 30 dB - 90 dB
  currentTelemetry.noiseLevel = Math.min(90.0, Math.max(30.0, currentTelemetry.noiseLevel + gaussianRandom(0, 1.2)));

  // 5. Camera Status & FPS
  if (currentTelemetry.cameraActive) {
    currentTelemetry.cameraFps = Math.min(30.0, Math.max(24.0, currentTelemetry.cameraFps + gaussianRandom(0, 0.4)));
  } else {
    currentTelemetry.cameraFps = 0.0;
  }

  // 6. Inject anomalies
  const rand = Math.random();
  if (rand < 0.02) {
    currentTelemetry.temperature += 2.5;
  } else if (rand > 0.98) {
    currentTelemetry.noiseLevel += 15.0;
  }

  // 7. Random "Sensor Offline" simulation (2% chance)
  currentTelemetry.status = Math.random() < 0.02 ? 'offline' : 'online';

  return {
    ...currentTelemetry,
    timestamp: new Date().toISOString()
  };
}

export function getLatestTelemetry() {
  return {
    ...currentTelemetry,
    timestamp: new Date().toISOString()
  };
}

export function toggleCamera(state) {
  currentTelemetry.cameraActive = state !== undefined ? !!state : !currentTelemetry.cameraActive;
  currentTelemetry.cameraFps = currentTelemetry.cameraActive ? 27.0 : 0.0;
  return getLatestTelemetry();
}
