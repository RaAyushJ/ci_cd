/**
 * Telemetry and Decision Engine Simulator for Frontend Sandbox
 * Replicates the exact behavior of telemetry.js and decisionEngine.js entirely in the browser.
 */

export interface Telemetry {
  temperature: number;
  humidity: number;
  airFlow: number;
  noiseLevel: number;
  cameraFps: number;
  cameraActive: boolean;
  timestamp: string;
}

export interface Alert {
  id: string;
  ruleType: string;
  severity: "warning" | "critical";
  title: string;
  message: string;
  triggeredAt: string;
  condition: string;
}

export interface YoloDetection {
  class: string;
  confidence: number;
  boundingBox: number[];
  metadata: {
    state?: string;
    activity?: string;
    posture?: string;
  };
}

export interface YoloResult {
  pipelineName: string;
  timestamp: string;
  status: string;
  fps: number;
  detections: YoloDetection[];
  summary: {
    occupants: number;
    windowStateLeft: "Open" | "Closed";
    windowStateRight: "Open" | "Closed";
    inferenceLatencyMs: number;
  };
}

// Box-Muller transform to generate Gaussian (normal) distributed random numbers
function gaussianRandom(mean: number, stddev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stddev + mean;
}

/**
 * Generates the next telemetry reading with realistic stochastics.
 */
export function generateNextTelemetry(current: Telemetry): Telemetry {
  // 1. Temperature: 20°C - 35°C (mean: 0, stddev: 0.15)
  const tempDiff = gaussianRandom(0, 0.15);
  const temperature = Math.min(35.0, Math.max(20.0, current.temperature + tempDiff));

  // 2. Humidity: 30% - 70% (mean: 0, stddev: 0.3)
  const humidDiff = gaussianRandom(0, 0.3);
  const humidity = Math.min(70.0, Math.max(30.0, current.humidity + humidDiff));

  // 3. Air Flow: 0.0 - 5.0 m/s (mean: 0, stddev: 0.08)
  const airDiff = gaussianRandom(0, 0.08);
  const airFlow = Math.min(5.0, Math.max(0.0, current.airFlow + airDiff));

  // 4. Noise Level: 30 dB - 90 dB (mean: 0, stddev: 1.2)
  const noiseDiff = gaussianRandom(0, 1.2);
  const noiseLevel = Math.min(90.0, Math.max(30.0, current.noiseLevel + noiseDiff));

  // 5. Camera FPS
  let cameraFps = current.cameraFps;
  if (current.cameraActive) {
    const fpsDiff = gaussianRandom(0, 0.4);
    cameraFps = Math.min(30.0, Math.max(24.0, current.cameraFps + fpsDiff));
  } else {
    cameraFps = 0.0;
  }

  // stochastic sudden warm gust of air or noise spike (adds interactive fun)
  let finalTemp = temperature;
  let finalAirFlow = airFlow;
  let finalNoiseLevel = noiseLevel;

  const rand = Math.random();
  if (rand < 0.02) {
    // Inject warm gust of air
    finalTemp = Math.min(35.0, temperature + 2.5);
    finalAirFlow = Math.max(0.2, airFlow - 0.5);
  } else if (rand > 0.98) {
    // Inject loud event
    finalNoiseLevel = Math.min(90.0, noiseLevel + 15.0);
  }

  return {
    temperature: finalTemp,
    humidity,
    airFlow: finalAirFlow,
    noiseLevel: finalNoiseLevel,
    cameraFps,
    cameraActive: current.cameraActive,
    timestamp: new Date().toISOString()
  };
}

/**
 * Evaluates telemetry data against the 2 rule-based reasoning constraints.
 */
export function evaluateRules(telemetry: Telemetry): Alert[] {
  const alerts: Alert[] = [];

  // Rule 1: Environmental Comfort
  // Rule: If Temperature > 28°C AND Air Flow < 1.0 m/s
  if (telemetry.temperature > 28.0 && telemetry.airFlow < 1.0) {
    alerts.push({
      id: "rule-1",
      ruleType: "Comfort & Airflow",
      severity: "warning",
      title: "Thermal Discomfort Detected",
      message: "Recommend opening windows or activating AC to increase airflow.",
      triggeredAt: new Date().toISOString(),
      condition: `Temperature (${telemetry.temperature.toFixed(1)}°C) > 28°C AND Airflow (${telemetry.airFlow.toFixed(2)} m/s) < 1.0 m/s`
    });
  }

  // Rule 2: Acoustic / Focus Disturbance
  // Rule: If Noise Level > 75 dB
  if (telemetry.noiseLevel > 75.0) {
    alerts.push({
      id: "rule-2",
      ruleType: "Acoustic Disturbance",
      severity: "critical",
      title: "High Noise Threshold Exceeded",
      message: "Recommend closing windows to block outside noise for optimal focus.",
      triggeredAt: new Date().toISOString(),
      condition: `Noise Level (${telemetry.noiseLevel.toFixed(1)} dB) > 75 dB`
    });
  }

  return alerts;
}

/**
 * Simulates YOLO machine learning inference pipeline results
 */
export function simulateYoloInference(telemetry: Telemetry): YoloResult {
  const bboxNoise = () => Math.random() * 0.02 - 0.01;
  const detectedObjects: YoloDetection[] = [];
  let occupants = 0;
  let windowStateLeft: "Open" | "Closed" = "Closed";
  let windowStateRight: "Open" | "Closed" = "Closed";

  if (telemetry.cameraActive) {
    occupants = 1;
    detectedObjects.push({
      class: "person",
      confidence: 0.94,
      boundingBox: [0.35 + bboxNoise(), 0.22 + bboxNoise(), 0.58 + bboxNoise(), 0.74 + bboxNoise()],
      metadata: { posture: "sitting", activity: "typing_at_laptop" }
    });

    detectedObjects.push({
      class: "laptop",
      confidence: 0.98,
      boundingBox: [0.48 + bboxNoise(), 0.38 + bboxNoise(), 0.65 + bboxNoise(), 0.60 + bboxNoise()],
      metadata: { state: "on" }
    });

    windowStateLeft = telemetry.airFlow > 1.8 ? "Open" : "Closed";
    windowStateRight = telemetry.airFlow > 1.8 ? "Open" : "Closed";

    detectedObjects.push({
      class: "window_left",
      confidence: 0.89,
      boundingBox: [0.10 + bboxNoise(), 0.05 + bboxNoise(), 0.80 + bboxNoise(), 0.28 + bboxNoise()],
      metadata: { state: windowStateLeft }
    });

    detectedObjects.push({
      class: "window_right",
      confidence: 0.88,
      boundingBox: [0.10 + bboxNoise(), 0.72 + bboxNoise(), 0.80 + bboxNoise(), 0.95 + bboxNoise()],
      metadata: { state: windowStateRight }
    });
  }

  return {
    pipelineName: "YOLOv8-SmartRoom-Core",
    timestamp: new Date().toISOString(),
    status: telemetry.cameraActive ? "ACTIVE_INFERENCE" : "CAMERA_OFFLINE",
    fps: telemetry.cameraFps,
    detections: detectedObjects,
    summary: {
      occupants,
      windowStateLeft,
      windowStateRight,
      inferenceLatencyMs: telemetry.cameraActive ? Math.floor(18 + Math.random() * 7) : 0
    }
  };
}
