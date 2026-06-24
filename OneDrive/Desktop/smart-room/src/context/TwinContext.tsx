import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Telemetry, Alert, YoloResult, generateNextTelemetry, evaluateRules, simulateYoloInference } from "../services/telemetrySimulator";
import { BufferGeometry } from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

interface TwinContextProps {
  telemetry: Telemetry;
  alerts: Alert[];
  activeSplat: { filename: string; url: string; size: string; geometry: BufferGeometry | null } | null;
  splatsList: Array<{ filename: string; size: string; geometry: BufferGeometry; uploadedAt: string }>;
  isScanningMl: boolean;
  mlResult: YoloResult | null;
  toggleCamera: () => void;
  setTelemetryParams: (params: Partial<Telemetry>) => void;
  addUploadedSplat: (filename: string, size: string, geometry: BufferGeometry) => void;
  setActiveSplatIndex: (idx: number | null) => void;
  triggerForceMlScan: () => void;
}

const TwinContext = createContext<TwinContextProps | null>(null);

export function useTwin() {
  const context = useContext(TwinContext);
  if (!context) throw new Error("useTwin must be used within a TwinProvider");
  return context;
}

export function TwinProvider({ children }: { children: React.ReactNode }) {
  // Initial Telemetry state
  const [telemetry, setTelemetry] = useState<Telemetry>({
    temperature: 24.5,
    humidity: 52.0,
    airFlow: 1.2,
    noiseLevel: 55.0,
    cameraFps: 27.5,
    cameraActive: true,
    timestamp: new Date().toISOString()
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [splatsList, setSplatsList] = useState<Array<{ filename: string; size: string; geometry: BufferGeometry; uploadedAt: string }>>([]);
  const [activeSplatIndex, setActiveSplatIndex] = useState<number | null>(null);
  const [mlResult, setMlResult] = useState<YoloResult | null>(null);
  const [isScanningMl, setIsScanningMl] = useState(false);

  // 1-second simulation timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        const next = generateNextTelemetry(prev);
        // Automatically evaluate rules
        const activeAlerts = evaluateRules(next);
        setAlerts(activeAlerts);
        
        // Update YOLO ML simulator on active camera stream
        if (next.cameraActive) {
          setMlResult(simulateYoloInference(next));
        } else {
          setMlResult(null);
        }
        
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleCamera = () => {
    setTelemetry((prev) => {
      const active = !prev.cameraActive;
      const next = {
        ...prev,
        cameraActive: active,
        cameraFps: active ? 27.5 : 0.0
      };
      const activeAlerts = evaluateRules(next);
      setAlerts(activeAlerts);
      return next;
    });
  };

  const setTelemetryParams = (params: Partial<Telemetry>) => {
    setTelemetry((prev) => {
      const next = { ...prev, ...params };
      const activeAlerts = evaluateRules(next);
      setAlerts(activeAlerts);
      return next;
    });
  };

  const addUploadedSplat = (filename: string, size: string, geometry: BufferGeometry) => {
    const newSplat = {
      filename,
      size,
      geometry,
      uploadedAt: new Date().toLocaleTimeString()
    };
    setSplatsList((prev) => [newSplat, ...prev]);
    setActiveSplatIndex(0); // auto-select newly uploaded
  };

  // Try to automatically load room_splash.ply from static files if uploaded to the project
  useEffect(() => {
    const autoLoadDefaultSplat = async () => {
      try {
        const response = await fetch("/room_splash.ply");
        if (response.ok) {
          const contents = await response.arrayBuffer();
          const loader = new PLYLoader();
          const geometry = loader.parse(contents);
          
          const sizeKb = (contents.byteLength / 1024).toFixed(0);
          const sizeStr = parseFloat(sizeKb) > 1024 
            ? `${(parseFloat(sizeKb) / 1024).toFixed(1)} MB` 
            : `${sizeKb} KB`;

          addUploadedSplat("room_splash.ply", sizeStr, geometry);
          console.log("Successfully auto-loaded room_splash.ply from public files!");
        }
      } catch (err) {
        console.log("Default room_splash.ply is not present yet in public folder. Ready for drag & drop or custom upload.");
      }
    };
    autoLoadDefaultSplat();
  }, []);

  const triggerForceMlScan = () => {
    setIsScanningMl(true);
    setTimeout(() => {
      setMlResult(simulateYoloInference(telemetry));
      setIsScanningMl(false);
    }, 800);
  };

  const activeSplat = activeSplatIndex !== null && splatsList[activeSplatIndex]
    ? {
        filename: splatsList[activeSplatIndex].filename,
        url: "",
        size: splatsList[activeSplatIndex].size,
        geometry: splatsList[activeSplatIndex].geometry
      }
    : null;

  return (
    <TwinContext.Provider
      value={{
        telemetry,
        alerts,
        activeSplat,
        splatsList,
        isScanningMl,
        mlResult,
        toggleCamera,
        setTelemetryParams,
        addUploadedSplat,
        setActiveSplatIndex,
        triggerForceMlScan
      }}
    >
      {children}
    </TwinContext.Provider>
  );
}
