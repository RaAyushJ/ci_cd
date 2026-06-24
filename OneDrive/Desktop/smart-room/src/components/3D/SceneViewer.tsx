import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { io } from 'socket.io-client';

// Connect to your local backend server
const socket = io('http://localhost:5000'); 

// =====================================================================
// COMPONENT 1: TELEMETRY DASHBOARD (Left Sidebar)
// =====================================================================
function TelemetryDashboard() {
  return (
    <div className="bg-white border-4 border-black p-4 h-full flex flex-col gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-80">
        <div className="bg-gray-100 p-3 border-2 border-black text-xs flex-1">
          <span className="font-bold text-black block mb-2">EVENT LOG</span>
          <ul className="text-gray-600 space-y-2">
            <li>[12:00:01] System initialized.</li>
            <li>[12:00:05] Luma AI Environment loaded.</li>
            <li>[12:00:10] Sensors calibrated.</li>
            <li className="text-green-600 font-bold">[12:01:22] Door recognized.</li>
          </ul>
        </div>
    </div>
  );
}

// =====================================================================
// COMPONENT 2: SCENE VIEWER (Right Main Canvas)
// =====================================================================
function SceneViewer() {
  const [expandedTag, setExpandedTag] = useState(null);
  
  // DEFAULT SET TO YOUR ROOM!
  const [lumaEmbedUrl, setLumaEmbedUrl] = useState("https://lumalabs.ai/embed/e86b14f2-bcbe-4851-9f02-c85b2ffa221b?mode=sparkles&background=%23ffffff&color=%23000000&showTitle=false&loadBg=true&logoPosition=bottom-left&infoPosition=bottom-right&cinematicVideo=undefined&showMenu=false"); 
  
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // New states for custom inline prompt to bypass iframe restrictions
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [tempLink, setTempLink] = useState("");

  // Live Telemetry States
  const [temperature, setTemperature] = useState(24.5);
  const [airFlow, setAirFlow] = useState(2.1);
  const [doorState, setDoorState] = useState('CLOSED');
  const [noiseLevel, setNoiseLevel] = useState(45);
  const [cameraStatus, setCameraStatus] = useState('Active');

  useEffect(() => {
    const handleUpdate = (data: any) => {
      if (data.temp !== undefined) setTemperature(data.temp);
      if (data.wind !== undefined) setAirFlow(data.wind);
      if (data.door !== undefined) setDoorState(data.door);
      if (data.noise !== undefined) setNoiseLevel(data.noise);
      if (data.cam !== undefined) setCameraStatus(data.cam);
    };

    socket.on('environment_update', handleUpdate);
    return () => {
      socket.off('environment_update', handleUpdate);
    };
  }, []);
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    // Listen to fullscreen changes
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleTag = (tagName) => {
    setExpandedTag(expandedTag === tagName ? null : tagName);
  };

  // SAFE File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadError(null);
    setShowLinkInput(false);

    if (file) {
      // Graceful fallback to prevent WebGL crashing in browser
      setUploadError(`Local processing is disabled for safety. Please use the 'Change Room Link' button to securely load your Luma AI room.`);
    }
  };

  // Safe Link Handler (Replaces blocked browser prompt())
  const submitLumaLink = () => {
    if (tempLink && tempLink.includes("lumalabs.ai")) {
      let embedLink = tempLink;
      // Convert standard capture links to embed links automatically
      if (tempLink.includes('/capture/')) {
        embedLink = tempLink.replace('/capture/', '/embed/');
      }
      setUploadError(null);
      setLumaEmbedUrl(embedLink);
      setShowLinkInput(false);
      setTempLink(""); // Clear it after success
    } else if (tempLink) {
      setUploadError("Invalid Luma AI link. Please make sure it contains 'lumalabs.ai'.");
    }
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) {
      console.error("Container ref not available");
      return;
    }

    // Toggle CSS-based fullscreen
    setIsFullscreen(!isFullscreen);

    // Also try native fullscreen API for browsers that support it
    if (!isFullscreen) {
      try {
        const requestFullscreen = 
          elem.requestFullscreen ||
          (elem as any).webkitRequestFullscreen ||
          (elem as any).mozRequestFullScreen ||
          (elem as any).msRequestFullscreen;

        if (requestFullscreen) {
          requestFullscreen.call(elem).catch((err: any) => {
            console.log("Native fullscreen not available:", err);
          });
        }
      } catch (err) {
        console.log("Fullscreen request error:", err);
      }
    } else {
      try {
        const exitFullscreen =
          document.exitFullscreen ||
          (document as any).webkitExitFullscreen ||
          (document as any).mozCancelFullScreen ||
          (document as any).msExitFullscreen;

        if (exitFullscreen) {
          exitFullscreen.call(document).catch((err: any) => {
            console.log("Exit fullscreen error:", err);
          });
        }
      } catch (err) {
        console.log("Exit fullscreen error:", err);
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#0f172a] transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] w-screen h-screen' 
          : 'w-full h-full'
      }`}
    >
      {/* --- FULLSCREEN BUTTON --- */}
      <div className={`${isFullscreen ? 'fixed' : 'absolute'} top-4 right-4 ${isFullscreen ? 'z-[10000]' : 'z-50'} pointer-events-auto`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("Fullscreen button clicked");
            toggleFullscreen();
          }}
          className="bg-black text-white border-2 border-white rounded-lg p-3 shadow-lg hover:bg-zinc-800 active:bg-zinc-900 transition-all active:translate-y-[1px] flex items-center justify-center w-12 h-12 cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          type="button"
        >
          {isFullscreen ? (
            <Minimize2 size={24} />
          ) : (
            <Maximize2 size={24} />
          )}
        </button>
      </div>
      
      {/* --- SCENE RENDERING --- */}
      {lumaEmbedUrl ? (
        /* YOUR EXACT ROOM EMBEDDED */
        <div className="w-full h-full absolute inset-0 z-0 bg-white">
          <iframe 
            src={lumaEmbedUrl}
            frameBorder="0" 
            allowFullScreen 
            className="w-full h-full border-none object-cover"
          ></iframe>
        </div>
      ) : (
        /* Fallback if everything is cleared */
        <div className="w-full h-full absolute inset-0 z-0 flex items-center justify-center bg-gray-100 text-gray-500 font-bold">
           <p>No 3D Environment Loaded.</p>
        </div>
      )}

      {/* --- UI CONTROLS (Bottom Left) --- */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
        {uploadError && (
          <div className="bg-red-100 border-2 border-red-500 text-red-800 p-2 rounded-lg text-xs font-bold max-w-xs shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
            ❌ {uploadError}
          </div>
        )}

        <div className="flex gap-2">
          <input type="file" accept=".splat,.ply" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
          <button 
            onClick={() => { setShowLinkInput(false); fileInputRef.current.click(); }}
            className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm"
          >
            📁 Upload Local File
          </button>
          <button 
            onClick={() => { setUploadError(null); setShowLinkInput(!showLinkInput); }}
            className="bg-[#FFE5B4] hover:bg-[#FFCBA4] text-black font-bold py-2 px-4 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm"
          >
            🔗 Change Room Link
          </button>
        </div>

        {/* Custom Inline Modal for the Link (Bypasses iframe prompt block) */}
        {showLinkInput && (
          <div className="bg-white border-2 border-black p-3 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2 flex flex-col gap-2 w-full max-w-[320px]">
            <label className="text-xs font-bold text-black uppercase">Paste Luma AI Link:</label>
            <input 
              type="text" 
              value={tempLink}
              onChange={(e) => setTempLink(e.target.value)}
              placeholder="https://lumalabs.ai/..."
              className="border-2 border-black p-2 text-sm w-full outline-none focus:bg-gray-50 text-black"
            />
            <div className="flex gap-2 mt-1">
              <button 
                onClick={submitLumaLink}
                className="bg-black hover:bg-gray-800 text-white text-xs font-bold py-2 px-4 rounded border-2 border-black transition-colors flex-1"
              >
                Submit
              </button>
              <button 
                onClick={() => { setShowLinkInput(false); setTempLink(""); setUploadError(null); }}
                className="bg-gray-200 hover:bg-gray-300 text-black text-xs font-bold py-2 px-4 rounded border-2 border-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- FLOATING SPATIAL ICONS (Grouped in Top-Right Corner) --- */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
          
          <div onClick={() => toggleTag('temperature')} className={`cursor-pointer transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'temperature' ? 'bg-[#FFE5B4] w-48 h-24 rounded-lg p-3' : 'bg-white w-12 h-12 rounded-full hover:bg-[#FFCBA4]'}`}>
            {expandedTag === 'temperature' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1"><span className="font-bold text-xs uppercase">Temperature</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-xs font-bold hover:text-red-600">✖</button></div>
                <span className="text-2xl font-bold">{temperature.toFixed(1)} °C</span><span className="text-[10px] font-bold text-gray-600">Window 01</span>
              </div>
            ) : (<span className="text-xl">🌡️</span>)}
          </div>

          <div onClick={() => toggleTag('airflow')} className={`cursor-pointer transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'airflow' ? 'bg-[#FFE5B4] w-48 h-24 rounded-lg p-3' : 'bg-white w-12 h-12 rounded-full hover:bg-[#FFCBA4]'}`}>
            {expandedTag === 'airflow' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1"><span className="font-bold text-xs uppercase">Air Flow</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-xs font-bold hover:text-red-600">✖</button></div>
                <span className="text-2xl font-bold">{airFlow.toFixed(1)} m/s</span><span className="text-[10px] font-bold text-gray-600">Window 02</span>
              </div>
            ) : (<span className="text-xl">💨</span>)}
          </div>

          <div onClick={() => toggleTag('door')} className={`cursor-pointer transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'door' ? 'bg-white w-48 h-28 rounded-lg p-3' : 'bg-black w-12 h-12 rounded-full hover:bg-gray-800'}`}>
            {expandedTag === 'door' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1"><span className="font-bold text-xs uppercase text-black">Door Sensor</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-xs font-bold hover:text-red-600 text-black">✖</button></div>
                <span className={`text-2xl font-bold ${doorState === 'OPEN' ? 'text-red-600' : 'text-green-600'}`}>{doorState}</span><span className="text-[9px] font-bold text-gray-700">Target: doors.pt</span>
              </div>
            ) : (<span className="text-xl">🚪</span>)}
          </div>

          <div onClick={() => toggleTag('noise')} className={`cursor-pointer transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'noise' ? 'bg-[#FFE5B4] w-48 h-24 rounded-lg p-3' : 'bg-white w-12 h-12 rounded-full hover:bg-[#FFCBA4]'}`}>
            {expandedTag === 'noise' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1"><span className="font-bold text-xs uppercase">Noise Level</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-xs font-bold hover:text-red-600">✖</button></div>
                <span className="text-2xl font-bold">{noiseLevel} dB</span><span className="text-[10px] font-bold text-gray-600">Acoustic Sensor</span>
              </div>
            ) : (<span className="text-xl">🔊</span>)}
          </div>

          <div onClick={() => toggleTag('camera')} className={`cursor-pointer transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'camera' ? 'bg-white w-48 h-24 rounded-lg p-3' : 'bg-white w-12 h-12 rounded-full hover:bg-gray-200'}`}>
            {expandedTag === 'camera' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1"><span className="font-bold text-xs uppercase">Camera Status</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-xs font-bold hover:text-red-600">✖</button></div>
                <span className="text-xl font-bold text-[#FF9B54]">{cameraStatus}</span><span className="text-[10px] font-bold text-gray-600">Live Feed Status</span>
              </div>
            ) : (<span className="text-xl">📹</span>)}
          </div>

      </div>
    </div>
  );
}

// =====================================================================
// MAIN APP LAYOUT
// =====================================================================
export default function App() {
  return (
    <div className="min-h-screen bg-[#FFE5B4] p-4 font-mono flex flex-col gap-4">

      {/* --- MAIN CONTENT GRID --- */}
      <div className="flex-1 flex gap-4 h-[calc(100vh-160px)]">
        
        {/* Left: Telemetry Dashboard */}
        <div className="z-10 h-full overflow-y-auto hidden xl:block">
          <TelemetryDashboard />
        </div>

        {/* Center/Right: 3D Scene Viewer */}
        <div className="flex-1 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <SceneViewer />
        </div>
      </div>
    </div>
  );
}