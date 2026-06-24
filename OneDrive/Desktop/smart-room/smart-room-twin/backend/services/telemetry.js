/**
 * Telemetry Service
 * Generates simulated live IoT sensor data with realistic Gaussian noise.
 */

// Box-Muller transform to generate Gaussian (normal) distributed random numbers
function gaussianRandom(mean, stddev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stddev + mean;
}

// Current state of our 5 simulated IoT streams
let currentTelemetry = {
  temperature: 24.5,    // Target range: 20.0°C - 35.0°C
  humidity: 50.0,       // Target range: 30% - 70%
  airFlow: 1.2,         // Target range: 0.0 - 5.0 m/s
  noiseLevel: 55.0,     // Target range: 30 dB - 90 dB
  cameraFps: 27.0,      // Simulated Live Camera FPS: 24 - 30 FPS
  cameraActive: true    // Simulated Camera State
};

/**
 * Updates telemetry data by adding small Gaussian fluctuations.
 * Clamps values to maintain realistic boundaries.
 */
export function generateNextTelemetry() {
  // 1. Temperature: 20°C - 35°C (mean: 0, stddev: 0.15)
  let tempDiff = gaussianRandom(0, 0.15);
  currentTelemetry.temperature = Math.min(35.0, Math.max(20.0, currentTelemetry.temperature + tempDiff));

  // 2. Humidity: 30% - 70% (mean: 0, stddev: 0.3)
  let humidDiff = gaussianRandom(0, 0.3);
  currentTelemetry.humidity = Math.min(70.0, Math.max(30.0, currentTelemetry.humidity + humidDiff));

  // 3. Air Flow: 0.0 - 5.0 m/s (mean: 0, stddev: 0.08)
  let airDiff = gaussianRandom(0, 0.08);
  currentTelemetry.airFlow = Math.min(5.0, Math.max(0.0, currentTelemetry.airFlow + airDiff));

  // 4. Noise Level: 30 dB - 90 dB (mean: 0, stddev: 1.2)
  let noiseDiff = gaussianRandom(0, 1.2);
  currentTelemetry.noiseLevel = Math.min(90.0, Math.max(30.0, currentTelemetry.noiseLevel + noiseDiff));

  // 5. Camera Status: Active toggles occasionally, FPS fluctuates between 24 and 30 FPS
  if (currentTelemetry.cameraActive) {
    let fpsDiff = gaussianRandom(0, 0.4);
    currentTelemetry.cameraFps = Math.min(30.0, Math.max(24.0, currentTelemetry.cameraFps + fpsDiff));
  } else {
    currentTelemetry.cameraFps = 0.0;
  }

  // To make the telemetry occasionally violate rules for user interactive testing,
  // we add a tiny random walk bias towards hot temperatures or high noise
  const rand = Math.random();
  if (rand < 0.02) {
    // Inject a warm gust of air (heats up and slows airflow)
    currentTelemetry.temperature = Math.min(35.0, currentTelemetry.temperature + 2.5);
    currentTelemetry.airFlow = Math.max(0.2, currentTelemetry.airFlow - 0.5);
  } else if (rand > 0.98) {
    // Inject a sudden high noise event (e.g., siren outside window)
    currentTelemetry.noiseLevel = Math.min(90.0, currentTelemetry.noiseLevel + 15.0);
  }

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
  if (state !== undefined) {
    currentTelemetry.cameraActive = !!state;
  } else {
    currentTelemetry.cameraActive = !currentTelemetry.cameraActive;
  }
  currentTelemetry.cameraFps = currentTelemetry.cameraActive ? 27.0 : 0.0;
  return currentTelemetry;
}
