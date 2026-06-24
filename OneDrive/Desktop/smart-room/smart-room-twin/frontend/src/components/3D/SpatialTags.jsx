import React from "react";
import { Html } from "@react-three/drei";
import { useSocket } from "../../context/SocketContext";
import { Laptop, Wind, Thermometer, Droplets, Volume2, Video } from "lucide-react";

export default function SpatialTags() {
  const { telemetry } = useSocket();

  if (!telemetry) return null;

  // Let's draw some faint visual helper spheres for the sensor node anchors in the 3D room
  // position coords: Laptop [0, 0, 0], Left Window [-3, 1, -1.5], Right Window [3, 1, -1.5]
  return (
    <group>
      {/* LAPTOP NODE ANCHOR AND HTML OVERLAY */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#FFCBA4" wireframe />
        
        <Html distanceFactor={8} position={[0, 0.4, 0]} center>
          <div className="w-52 border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1.5 select-none font-mono text-[10px]">
            <div className="flex items-center gap-1.5 border-b border-black pb-1 mb-1 font-black uppercase text-black text-[9px]">
              <Laptop className="w-3.5 h-3.5" />
              Laptop Workspace
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold uppercase">CCTV FEED:</span>
              <span className={`px-1 font-black border border-black ${telemetry.cameraActive ? "bg-[#FFCBA4] text-black" : "bg-black text-white"}`}>
                {telemetry.cameraActive ? "ACTIVE" : "OFFLINE"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold uppercase">NOISE LEVEL:</span>
              <span className={`font-black ${telemetry.noiseLevel > 75 ? "text-red-600 animate-pulse" : "text-black"}`}>
                {telemetry.noiseLevel.toFixed(1)} dB
              </span>
            </div>

            {telemetry.cameraActive && (
              <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold">
                <span>SIMULATED RATE:</span>
                <span>{telemetry.cameraFps.toFixed(1)} FPS</span>
              </div>
            )}
          </div>
        </Html>
      </mesh>

      {/* LEFT WINDOW NODE ANCHOR AND HTML OVERLAY */}
      <mesh position={[-3, 1, -1.5]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#FFE5B4" wireframe />

        <Html distanceFactor={8} position={[0, 0.4, 0]} center>
          <div className="w-56 border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1.5 select-none font-mono text-[10px]">
            <div className="flex items-center gap-1.5 border-b border-black pb-1 mb-1 font-black uppercase text-black text-[9px]">
              <Wind className="w-3.5 h-3.5" />
              North Window Node
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold uppercase flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> TEMP:
              </span>
              <span className="font-black text-black">
                {telemetry.temperature.toFixed(1)}°C
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold uppercase flex items-center gap-1">
                <Droplets className="w-3 h-3" /> HUMIDITY:
              </span>
              <span className="font-black text-black">
                {telemetry.humidity.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-1 mt-1">
              <span className="text-gray-500 font-bold uppercase flex items-center gap-1">
                <Wind className="w-3 h-3" /> AIRFLOW:
              </span>
              <span className={`font-black ${telemetry.airFlow < 1.0 ? "text-amber-600 font-black" : "text-black"}`}>
                {telemetry.airFlow.toFixed(2)} m/s
              </span>
            </div>
          </div>
        </Html>
      </mesh>

      {/* RIGHT WINDOW NODE ANCHOR AND HTML OVERLAY */}
      <mesh position={[3, 1, -1.5]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#FFD1A9" wireframe />

        <Html distanceFactor={8} position={[0, 0.4, 0]} center>
          <div className="w-56 border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1.5 select-none font-mono text-[10px]">
            <div className="flex items-center gap-1.5 border-b border-black pb-1 mb-1 font-black uppercase text-black text-[9px]">
              <Wind className="w-3.5 h-3.5" />
              East Window Node
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold uppercase flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> TEMP:
              </span>
              <span className="font-black text-black">
                {telemetry.temperature.toFixed(1)}°C
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold uppercase flex items-center gap-1">
                <Droplets className="w-3 h-3" /> HUMIDITY:
              </span>
              <span className="font-black text-black">
                {telemetry.humidity.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-1 mt-1">
              <span className="text-gray-500 font-bold uppercase flex items-center gap-1">
                <Wind className="w-3 h-3" /> AIRFLOW:
              </span>
              <span className={`font-black ${telemetry.airFlow < 1.0 ? "text-amber-600 font-black" : "text-black"}`}>
                {telemetry.airFlow.toFixed(2)} m/s
              </span>
            </div>
          </div>
        </Html>
      </mesh>
    </group>
  );
}
