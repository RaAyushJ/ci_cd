import React, { useState, useEffect } from "react";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { Html } from "@react-three/drei";
import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

export default function SplatLoader({ url }) {
  const [geometry, setGeometry] = useState(null);
  const [loadingState, setLoadingState] = useState({ status: "idle", progress: 0, error: "" });

  useEffect(() => {
    if (!url) return;

    setLoadingState({ status: "loading", progress: 0, error: "" });
    setGeometry(null);

    const loader = new PLYLoader();
    
    // Asynchronous load with standard XHR handlers for robustness
    loader.load(
      url,
      (geometry) => {
        // Center the geometry automatically and calculate bounding sphere for proper camera placement
        geometry.computeVertexNormals();
        geometry.center();
        
        setGeometry(geometry);
        setLoadingState({ status: "success", progress: 100, error: "" });
        console.log(`[SplatLoader] Successfully loaded PLY: ${url}`);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingState({ status: "loading", progress: percent, error: "" });
        }
      },
      (err) => {
        console.error("[SplatLoader] Failed to load PLY model:", err);
        setLoadingState({
          status: "error",
          progress: 0,
          error: "Failed to parse PLY data. Ensure it is a valid 3D point-cloud or Gaussian Splat reconstruction."
        });
      }
    );

    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [url]);

  if (loadingState.status === "loading") {
    return (
      <Html center>
        <div className="flex flex-col items-center gap-2 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-48 font-mono text-[11px] font-bold select-none text-black">
          <RefreshCw className="w-5 h-5 animate-spin text-black" />
          <span>PARSING SPATIAL DATA...</span>
          <span className="text-xs font-black">{loadingState.progress}%</span>
        </div>
      </Html>
    );
  }

  if (loadingState.status === "error") {
    return (
      <Html center>
        <div className="flex flex-col items-center gap-2 border-2 border-red-500 bg-red-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xs text-center font-mono text-[10px] font-bold text-red-900 select-none">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>PARSING FAILURE</span>
          <p className="font-sans text-[10px] text-red-700 mt-1 leading-normal">{loadingState.error}</p>
        </div>
      </Html>
    );
  }

  if (!geometry) return null;

  // Render the point cloud using an elegant Points object
  return (
    <points geometry={geometry} scale={[1, 1, 1]} position={[0, 0, 0]}>
      <pointsMaterial
        size={0.06}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.9}
      />
    </points>
  );
}
