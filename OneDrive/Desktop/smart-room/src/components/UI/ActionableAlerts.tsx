import React, { useState } from "react";
import { useTwin } from "../../context/TwinContext";
import { ShieldAlert, CheckCircle, EyeOff, Cpu, Loader2 } from "lucide-react";

export default function ActionableAlerts() {
  const { alerts, telemetry, mlResult, isScanningMl, triggerForceMlScan } = useTwin();
  const [autoScan] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Rule-Based Decision Engine Section */}
      <div className="flex flex-col gap-4">
        <h3 className="font-mono text-sm font-black uppercase tracking-wider border-b-4 border-black pb-2 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-black" />
          Decision Engine (2 Rules)
        </h3>

        {alerts.length === 0 ? (
          <div className="border-4 border-black p-5 bg-white text-black flex flex-col items-center justify-center text-center gap-2">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <p className="font-mono text-xs font-bold uppercase">All Parameters Optimal</p>
            <p className="font-sans text-xs text-gray-500 font-medium">
              The environmental comfort and acoustic thresholds are within perfect parameters. Try sliding parameters up on the left dashboard to trigger active warnings!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="border-4 border-black p-4 bg-black text-[#FFCBA4] flex flex-col gap-2 shadow-[4px_4px_0px_0px_rgba(255,203,164,1)]"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[9px] font-black uppercase border border-[#FFCBA4] px-1.5 py-0.5 bg-zinc-900">
                    {alert.ruleType}
                  </span>
                  <span className="font-mono text-[9px] opacity-65 font-bold">
                    {new Date(alert.triggeredAt).toLocaleTimeString()}
                  </span>
                </div>
                
                <h4 className="font-mono text-xs font-black uppercase tracking-tight text-white mt-1">
                  ⚠️ {alert.title}
                </h4>
                
                <p className="font-sans text-xs font-semibold leading-relaxed text-zinc-100">
                  {alert.message}
                </p>

                <div className="mt-2 pt-2 border-t border-zinc-800 font-mono text-[10px] text-zinc-400 font-semibold leading-normal">
                  <span className="text-[#FFCBA4] font-black">TRIGGER CONDITIONS:</span>
                  <br />
                  {alert.condition}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Future YOLO ML Inference Section (Feature C) */}
      <div className="flex flex-col gap-4 border-4 border-black bg-[#FFF0E5] p-4">
        <div className="flex justify-between items-center border-b-2 border-black pb-2">
          <h3 className="font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-black" />
            YOLO ML Vision Module
          </h3>
          <span className="font-mono text-[9px] font-bold px-1 py-0.5 border border-black bg-white">
            FUTURE SCOPE
          </span>
        </div>

        {!telemetry?.cameraActive ? (
          <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-black text-center gap-2">
            <EyeOff className="w-6 h-6 text-gray-400" />
            <p className="font-mono text-[10px] font-bold uppercase text-gray-500">
              Camera Offline
            </p>
            <p className="font-sans text-[10px] text-gray-400">
              Turn the CCTV feed on to engage the computer vision pipeline simulator.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] font-bold text-gray-600">
                AUTO-SCANNING FEED
              </span>

              <button
                onClick={triggerForceMlScan}
                disabled={isScanningMl}
                className="font-mono text-[9px] font-black uppercase border-2 border-black bg-white text-black px-2 py-1 hover:bg-black hover:text-white transition-all active:translate-y-0.5 disabled:opacity-50"
              >
                {isScanningMl ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    RUNNING...
                  </span>
                ) : (
                  "FORCE SCAN"
                )}
              </button>
            </div>

            {mlResult && (
              <div className="flex flex-col gap-2 bg-white border-2 border-black p-3 font-mono text-[10px]">
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5 mb-1 text-gray-500 font-bold">
                  <span>MODEL: {mlResult.pipelineName}</span>
                  <span>{mlResult.summary.inferenceLatencyMs}ms</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center mb-2">
                  <div className="border border-black p-1 bg-[#FFF0E5]">
                    <span className="block text-[8px] uppercase tracking-wide opacity-60">Human Count</span>
                    <span className="text-sm font-black text-black">
                      {mlResult.summary.occupants} Person
                    </span>
                  </div>
                  <div className="border border-black p-1 bg-[#FFE5B4]">
                    <span className="block text-[8px] uppercase tracking-wide opacity-60">Window Status</span>
                    <span className="text-sm font-black text-black">
                      {mlResult.summary.windowStateLeft}
                    </span>
                  </div>
                </div>

                <span className="font-black text-[9px] uppercase border-b border-black pb-0.5 mb-1">
                  YOLO Object Detections
                </span>
                
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {mlResult.detections.map((det, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-1 border border-gray-200">
                      <div>
                        <span className="font-bold uppercase text-black text-[9px]">{det.class}</span>
                        <span className="text-[8px] text-gray-400 ml-1.5">
                          [{(det.confidence * 100).toFixed(0)}%]
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-gray-500 bg-gray-100 px-1 border border-gray-300">
                        {det.metadata.state || det.metadata.activity || "detected"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border-2 border-dashed border-black p-2.5 rounded-none font-sans text-[10px] text-gray-600 leading-relaxed font-medium">
              <span className="font-mono font-black text-black uppercase text-[9px] block mb-1">
                🔬 AI Integration Architecture
              </span>
              Our YOLO classifier segments the feed. Real-time bounding coordinates map coordinates to 3D.
              <a
                href="#ml-architecture"
                className="text-black font-bold underline hover:opacity-80 block mt-1 font-mono text-[9px]"
              >
                View full mlInference.js blueprint →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
