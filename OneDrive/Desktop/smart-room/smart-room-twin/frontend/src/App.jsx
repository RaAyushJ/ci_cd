import React, { useState, useRef } from 'react';

// =====================================================================
// SCENE VIEWER (Full Width with Fullscreen Toggle)
// =====================================================================
function SceneViewer({ isScanning, setIsScanning }) {
  const [lumaEmbedUrl] = useState("https://lumalabs.ai/embed/e86b14f2-bcbe-4851-9f02-c85b2ffa221b?mode=sparkles&background=%23ffffff&color=%23000000&showTitle=false&loadBg=true&logoPosition=bottom-left&infoPosition=bottom-right&cinematicVideo=undefined&showMenu=false"); 
  const containerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullScreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative z-0 bg-white">
      {/* --- SCENE RENDERING --- */}
      <iframe 
        src={lumaEmbedUrl}
        frameBorder="0" 
        allowFullScreen 
        className="w-full h-full border-none"
      ></iframe>

      {/* --- MOCK YOLO BOUNDING BOXES (VISIBLE WHEN SCANNING) --- */}
      {isScanning && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] opacity-70 animate-[ping_3s_ease-in-out_infinite]"></div>
          
          <div className="absolute top-[20%] left-[45%] w-[18%] h-[60%] border-[3px] border-green-500 bg-green-500/10 flex flex-col justify-start">
            <span className="bg-green-500 text-black text-xs font-bold px-1 py-0.5 self-start">door 0.94</span>
          </div>

          <div className="absolute top-[15%] left-[80%] w-[18%] h-[75%] border-[3px] border-[#FF9B54] bg-[#FF9B54]/10 flex flex-col justify-start">
            <span className="bg-[#FF9B54] text-black text-xs font-bold px-1 py-0.5 self-start">cabinet 0.88</span>
          </div>
        </div>
      )}

      {/* --- UI CONTROLS --- */}
      <div className="absolute bottom-6 left-6 z-20 flex gap-3">
        <button 
          onClick={() => setIsScanning(!isScanning)}
          className={`font-bold py-2 px-6 border-2 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors 
            ${isScanning ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-gray-100'}`}
        >
          {isScanning ? "STOP SCANNING" : "FORCE SCAN"}
        </button>

        <button 
          onClick={toggleFullScreen}
          className="bg-black text-white font-bold py-2 px-6 border-2 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800 transition-colors"
        >
          {isFullScreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// MAIN APP LAYOUT
// =====================================================================
export default function App() {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden">
      <SceneViewer isScanning={isScanning} setIsScanning={setIsScanning} />
    </div>
  );
}