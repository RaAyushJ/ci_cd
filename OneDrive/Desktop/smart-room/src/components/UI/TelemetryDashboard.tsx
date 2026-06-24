import React from "react";
import { useTwin } from "../../context/TwinContext";
import { Thermometer, Droplets, Wind, Volume2, Video, Power } from "lucide-react";

export default function TelemetryDashboard() {
  const { telemetry, toggleCamera, setTelemetryParams } = useTwin();

  if (!telemetry) return null;

  // Helper to determine indicator bar percentage
  const getPercentage = (val: number, min: number, max: number) => {
    const pct = ((val - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, pct));
  };

  const handleSliderChange = (key: "temperature" | "noiseLevel" | "airFlow" | "humidity", val: number) => {
    setTelemetryParams({ [key]: val });
  };

  const sensors = [
    {
      title: "Temperature",
      field: "temperature" as const,
      value: `${telemetry.temperature.toFixed(1)}°C`,
      icon: <Thermometer className="w-5 h-5 text-black" />,
      min: 20.0,
      max: 35.0,
      current: telemetry.temperature,
      color: "bg-[#FFCBA4]"
    },
    {
      title: "Humidity",
      field: "humidity" as const,
      value: `${telemetry.humidity.toFixed(1)}%`,
      icon: <Droplets className="w-5 h-5 text-black" />,
      min: 30.0,
      max: 70.0,
      current: telemetry.humidity,
      color: "bg-[#FFE5B4]"
    },
    {
      title: "Air Flow",
      field: "airFlow" as const,
      value: `${telemetry.airFlow.toFixed(2)} m/s`,
      icon: <Wind className="w-5 h-5 text-black" />,
      min: 0.0,
      max: 5.0,
      current: telemetry.airFlow,
      color: "bg-[#FFD1A9]"
    },
    {
      title: "Noise Level",
      field: "noiseLevel" as const,
      value: `${telemetry.noiseLevel.toFixed(1)} dB`,
      icon: <Volume2 className="w-5 h-5 text-black" />,
      min: 30.0,
      max: 90.0,
      current: telemetry.noiseLevel,
      color: "bg-black text-white"
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Stream status info header */}
      <div className="flex items-center justify-between border-4 border-black bg-white p-3 rounded-none">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-black bg-green-500 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Telemetry Stream: ACTIVE
          </span>
        </div>
        <span className="font-mono text-[10px] text-gray-500 font-semibold">
          REFRESH: 1s
        </span>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 gap-4">
        {sensors.map((sensor) => {
          const pct = getPercentage(sensor.current, sensor.min, sensor.max);
          const isRuleTriggered =
            (sensor.title === "Temperature" && telemetry.temperature > 28 && telemetry.airFlow < 1.0) ||
            (sensor.title === "Air Flow" && telemetry.temperature > 28 && telemetry.airFlow < 1.0) ||
            (sensor.title === "Noise Level" && telemetry.noiseLevel > 75);

          return (
            <div
              key={sensor.field}
              className={`border-4 border-black p-4 flex flex-col gap-3 transition-all duration-300 ${
                isRuleTriggered ? "bg-black text-[#FFCBA4]" : "bg-white text-black"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 border-2 border-black ${isRuleTriggered ? "bg-[#FFCBA4]" : "bg-[#FFF0E5]"}`}>
                    {sensor.icon}
                  </div>
                  <span className="font-mono font-bold text-xs uppercase tracking-wider">{sensor.title}</span>
                </div>
                <span className="font-mono text-base font-black">{sensor.value}</span>
              </div>

              {/* Slider for live parameter tuning */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-mono text-[8px] opacity-75">
                  <span>TUNE LIVE SENSOR</span>
                  <span>{sensor.current.toFixed(1)} / {sensor.max}</span>
                </div>
                <input
                  type="range"
                  min={sensor.min}
                  max={sensor.max}
                  step={sensor.field === "airFlow" ? 0.05 : 0.5}
                  value={sensor.current}
                  onChange={(e) => handleSliderChange(sensor.field, parseFloat(e.target.value))}
                  className="w-full accent-black bg-gray-200 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Progress bar visual container */}
              <div className={`w-full h-3 border-2 border-black overflow-hidden ${isRuleTriggered ? "bg-zinc-800" : "bg-gray-100"}`}>
                <div
                  className={`h-full border-r-2 border-black transition-all duration-300 ${
                    isRuleTriggered ? "bg-[#FFCBA4]" : sensor.color
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between font-mono text-[8px] font-bold opacity-60">
                <span>MIN: {sensor.min}</span>
                <span>MAX: {sensor.max}</span>
              </div>
            </div>
          );
        })}

        {/* Live Camera Feed Status Panel (IoT Stream 5) */}
        <div className="border-4 border-black p-4 bg-white text-black flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 border-2 border-black bg-[#FFF0E5]">
                <Video className="w-5 h-5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-bold text-xs uppercase tracking-wider">CCTV FEED</span>
                <span className="font-mono text-[9px] text-gray-500 font-bold">
                  {telemetry.cameraActive ? "SIMULATING FRAME TRANSFERS" : "FEED SHUTDOWN"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 border-2 border-black ${
                telemetry.cameraActive ? "bg-[#FFCBA4] text-black" : "bg-black text-white"
              }`}>
                {telemetry.cameraActive ? "ACTIVE" : "OFFLINE"}
              </span>
              <span className="font-mono text-xs font-black mt-1">
                {telemetry.cameraFps.toFixed(1)} FPS
              </span>
            </div>
          </div>

          <button
            onClick={toggleCamera}
            className={`w-full flex items-center justify-center gap-2 border-4 border-black py-2.5 font-mono text-xs font-black uppercase tracking-wider transition-all duration-200 active:translate-y-0.5 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              telemetry.cameraActive
                ? "bg-black text-white hover:bg-zinc-800"
                : "bg-[#FFCBA4] text-black hover:bg-[#ffbba0]"
            }`}
          >
            <Power className="w-4 h-4" />
            {telemetry.cameraActive ? "Turn Camera Off" : "Turn Camera On"}
          </button>
        </div>
      </div>
    </div>
  );
}
