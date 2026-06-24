import React from "react";
import { useSocket } from "../../context/SocketContext";
import { Thermometer, Droplets, Wind, Volume2, Video, Power, RefreshCw } from "lucide-react";

export default function TelemetryDashboard() {
  const { telemetry, isConnected, toggleCameraState } = useSocket();

  if (!telemetry) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-4 border-black bg-[#FFF0E5] p-6 rounded-none text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-black mb-3" />
        <p className="font-mono text-sm text-black font-semibold">Connecting to IoT Stream...</p>
      </div>
    );
  }

  // Helper to determine indicator bar percentage
  const getPercentage = (val, min, max) => {
    const pct = ((val - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, pct));
  };

  const sensors = [
    {
      title: "Temperature",
      value: `${telemetry.temperature.toFixed(1)}°C`,
      icon: <Thermometer className="w-5 h-5 text-black" />,
      min: 20.0,
      max: 35.0,
      current: telemetry.temperature,
      color: "bg-[#FFCBA4]",
      id: "sensor-temp"
    },
    {
      title: "Humidity",
      value: `${telemetry.humidity.toFixed(1)}%`,
      icon: <Droplets className="w-5 h-5 text-black" />,
      min: 30.0,
      max: 70.0,
      current: telemetry.humidity,
      color: "bg-[#FFE5B4]",
      id: "sensor-humidity"
    },
    {
      title: "Air Flow",
      value: `${telemetry.airFlow.toFixed(2)} m/s`,
      icon: <Wind className="w-5 h-5 text-black" />,
      min: 0.0,
      max: 5.0,
      current: telemetry.airFlow,
      color: "bg-[#FFD1A9]",
      id: "sensor-airflow"
    },
    {
      title: "Noise Level",
      value: `${telemetry.noiseLevel.toFixed(1)} dB`,
      icon: <Volume2 className="w-5 h-5 text-black" />,
      min: 30.0,
      max: 90.0,
      current: telemetry.noiseLevel,
      color: telemetry.noiseLevel > 75 ? "bg-black text-white" : "bg-[#FFF0E5]",
      id: "sensor-noise"
    }
  ];

  return (
    <div id="telemetry-dashboard" className="flex flex-col gap-5">
      {/* Connection Header */}
      <div className="flex items-center justify-between border-4 border-black bg-white p-3 rounded-none">
        <div className="flex items-center gap-2">
          <div className={`w-3.5 h-3.5 rounded-full border-2 border-black ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Telemetry Stream: {isConnected ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>
        <span className="font-mono text-[10px] text-gray-500 font-semibold">
          REFRESH: 1s
        </span>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
        {sensors.map((sensor) => {
          const pct = getPercentage(sensor.current, sensor.min, sensor.max);
          const isHighNoise = sensor.title === "Noise Level" && sensor.current > 75;
          
          return (
            <div
              key={sensor.id}
              id={sensor.id}
              className={`border-4 border-black p-4 flex flex-col gap-3 transition-all duration-300 ${
                isHighNoise ? "bg-black text-[#FFCBA4]" : "bg-white text-black"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 border-2 border-black ${isHighNoise ? "bg-[#FFCBA4]" : "bg-[#FFF0E5]"}`}>
                    {sensor.icon}
                  </div>
                  <span className="font-mono font-bold text-xs uppercase tracking-wider">{sensor.title}</span>
                </div>
                <span className="font-mono text-lg font-black">{sensor.value}</span>
              </div>

              {/* Progress bar container */}
              <div className={`w-full h-4 border-2 border-black overflow-hidden ${isHighNoise ? "bg-zinc-800" : "bg-gray-100"}`}>
                <div
                  className={`h-full border-r-2 border-black transition-all duration-1000 ${
                    isHighNoise ? "bg-[#FFCBA4]" : sensor.color
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between font-mono text-[9px] font-bold opacity-60">
                <span>MIN: {sensor.min}</span>
                <span>MAX: {sensor.max}</span>
              </div>
            </div>
          );
        })}

        {/* Live Camera Feed Status Panel (IoT Stream 5) */}
        <div
          id="sensor-camera"
          className="border-4 border-black p-4 bg-white text-black flex flex-col gap-3"
        >
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
              <span className={`font-mono text-xs font-bold px-1.5 py-0.5 border-2 border-black ${
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
            onClick={toggleCameraState}
            id="toggle-camera-btn"
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
