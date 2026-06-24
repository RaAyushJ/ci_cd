/**
 * Decision Engine Service
 * Implements rule-based reasoning to generate real-time comfort and focus recommendations.
 */

/**
 * Evaluates telemetry data against comfort and focus rules.
 * @param {Object} telemetry The current live sensor readings.
 * @returns {Array} An array of active alert/recommendation objects.
 */
export function evaluateRules(telemetry) {
  const alerts = [];

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
