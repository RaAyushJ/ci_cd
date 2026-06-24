import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Center } from "@react-three/drei";
import { useSocket } from "../../context/SocketContext";
import SplatLoader from "./SplatLoader";
import SpatialTags from "./SpatialTags";
import { Move3d, Info } from "lucide-react";

export default function SceneViewer() {
  const { activeSplat } = useSocket();

  return (
    <div className="w-full h-full relative border-4 border-black bg-white flex flex-col">
      {/* 3D Viewer Header Status */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <span className="font-mono text-[9px] font-black uppercase bg-black text-[#FFCBA4] border border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
          <Move3d className="w-3 h-3 text-[#FFCBA4]" />
          Interactive Digital Twin
        </span>
        <span className="font-mono text-[8px] font-bold bg-white text-black border border-black px-1.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Active Node: {activeSplat ? activeSplat.filename.substring(activeSplat.filename.indexOf("_") + 1) : "SmartRoom_Grid_Blueprint"}
        </span>
      </div>

      {/* Orbit Interaction Instructions Helper */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none font-mono text-[8px] font-bold bg-white/95 text-black border border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-w-[200px] leading-normal">
        <div className="font-black border-b border-black/10 pb-0.5 mb-1 text-[9px] uppercase">🕹️ 3D NAVIGATION</div>
        • LEFT CLICK + DRAG to Orbit<br />
        • RIGHT CLICK + DRAG to Pan<br />
        • SCROLL to Zoom / Scale
      </div>

      {/* Canvas Layer */}
      <div className="w-full flex-grow relative bg-[#FAFAFA]">
        <Canvas
          camera={{ position: [0, 4, 6], fov: 60 }}
          gl={{ antialias: true }}
        >
          {/* Ambient & directional light for point clouds/fallback meshes */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.0} />

          {/* Elegant Infinite Grid for Technical look */}
          <Grid
            position={[0, -1.0, 0]}
            args={[15, 15]}
            cellSize={0.5}
            cellThickness={0.8}
            cellColor="#DDD"
            sectionSize={2.5}
            sectionThickness={1.2}
            sectionColor="#AAA"
            fadeDistance={25}
            infiniteGrid
          />

          <Suspense fallback={null}>
            <Center>
              {activeSplat ? (
                /* Dynamic PLY Gaussian Splat / Point-cloud Loader */
                <SplatLoader url={activeSplat.url} />
              ) : (
                /* Beautiful wireframe structural workspace outline representing the smart room blueprint */
                <group position={[0, 0, 0]}>
                  {/* Laptop table outline */}
                  <mesh position={[0, -0.6, 0]}>
                    <boxGeometry args={[1.8, 0.8, 1.0]} />
                    <meshBasicMaterial color="#CCC" wireframe />
                  </mesh>
                  {/* Chair outline */}
                  <mesh position={[0, -0.7, 0.9]}>
                    <boxGeometry args={[0.5, 0.6, 0.5]} />
                    <meshBasicMaterial color="#DDD" wireframe />
                  </mesh>
                  {/* Left Window visual frame outline */}
                  <mesh position={[-3.0, 1, -1.5]}>
                    <boxGeometry args={[0.1, 1.5, 2.0]} />
                    <meshBasicMaterial color="#FFA07A" wireframe />
                  </mesh>
                  {/* Right Window visual frame outline */}
                  <mesh position={[3.0, 1, -1.5]}>
                    <boxGeometry args={[0.1, 1.5, 2.0]} />
                    <meshBasicMaterial color="#FFA07A" wireframe />
                  </mesh>
                  {/* Room perimeter outline */}
                  <mesh position={[0, 0.5, -0.5]}>
                    <boxGeometry args={[6.2, 3.2, 4.2]} />
                    <meshBasicMaterial color="#EEE" wireframe />
                  </mesh>
                </group>
              )}
            </Center>

            {/* Anchored spatial tags displaying IoT telemetry in 3D */}
            <SpatialTags />
          </Suspense>

          {/* Interactive controls */}
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={12}
          />
        </Canvas>

        {/* Empty state alert overlay inside Canvas if no PLY uploaded */}
        {!activeSplat && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
            <div className="max-w-xs bg-white/95 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col gap-2 pointer-events-auto">
              <div className="flex items-center gap-1 text-black font-mono font-bold text-xs justify-center uppercase">
                <Info className="w-4 h-4 shrink-0 text-[#FFCBA4]" />
                No Splat Active
              </div>
              <p className="font-sans text-[10.5px] text-gray-500 font-semibold leading-normal">
                Visualizing room grid wireframe. Drag and drop a <strong className="text-black font-bold">.ply</strong> reconstructed Gaussian Splat model in the manager below to overlay the real environment!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
