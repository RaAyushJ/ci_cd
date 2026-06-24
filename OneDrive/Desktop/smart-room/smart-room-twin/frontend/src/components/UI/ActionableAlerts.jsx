import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Connect to your local backend server
const socket = io('http://localhost:5000'); 

// =====================================================================
// COMPONENT 1: TELEMETRY DASHBOARD (Left Sidebar)
// =====================================================================
function TelemetryDashboard({ isScanning, setIsScanning }) {
  return (
    <div className="bg-white border-4 border-black p-3 h-full flex flex-col gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-64 md:w-72">
        {/* UPDATED YOLO MODULE WITH SCAN BUTTON */}
        <div className="bg-[#FFE5B4] p-2 border-2 border-black text-xs flex flex-col gap-2">
          <button 
            onClick={() => setIsScanning(!isScanning)}
            className={`w-full py-1.5 px-2 border-2 border-black font-bold uppercase text-[10px] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none
              ${isScanning ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-black text-white hover:bg-gray-800'}`}
          >
            {isScanning ? "Stop Scan" : "Force Scan"}
          </button>
        </div>

        <div className="bg-gray-100 p-2 border-2 border-black text-xs flex-1">
          <span className="font-bold text-black block mb-2">EVENT LOG</span>
          <ul className="text-gray-600 space-y-2 text-[10px]">
            <li>[12:00:01] System initialized.</li>
            <li>[12:00:05] Luma AI Environment loaded.</li>
            <li>[12:00:10] Sensors calibrated.</li>
            {isScanning && (
              <li className="text-red-600 font-bold animate-pulse">[12:01:22] YOLO Active: Targets Identified.</li>
            )}
          </ul>
        </div>
    </div>
  );
}

// =====================================================================
// COMPONENT 2: SCENE VIEWER (Right Main Canvas)
// =====================================================================
function SceneViewer({ isScanning }) {
  const [expandedTag, setExpandedTag] = useState(null);
  
  // DEFAULT SET TO YOUR ROOM!
  const [lumaEmbedUrl, setLumaEmbedUrl] = useState("https://lumalabs.ai/embed/e86b14f2-bcbe-4851-9f02-c85b2ffa221b?mode=sparkles&background=%23ffffff&color=%23000000&showTitle=false&loadBg=true&logoPosition=bottom-left&infoPosition=bottom-right&cinematicVideo=undefined&showMenu=false"); 
  
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

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
    socket.on('environment_update', (data) => {
      if (data.temp !== undefined) setTemperature(data.temp);
      if (data.wind !== undefined) setAirFlow(data.wind);
      if (data.door !== undefined) setDoorState(data.door);
      if (data.noise !== undefined) setNoiseLevel(data.noise);
      if (data.cam !== undefined) setCameraStatus(data.cam);
    });
    return () => socket.off('environment_update');
  }, []);

  const toggleTag = (tagName) => {
    setExpandedTag(expandedTag === tagName ? null : tagName);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadError(null);
    setShowLinkInput(false);
    if (file) {
      setUploadError(`Local processing disabled. Use 'Change Room Link' to load your Luma AI room.`);
    }
  };

  const submitLumaLink = () => {
    if (tempLink && tempLink.includes("lumalabs.ai")) {
      let embedLink = tempLink;
      if (tempLink.includes('/capture/')) {
        embedLink = tempLink.replace('/capture/', '/embed/');
      }
      setUploadError(null);
      setLumaEmbedUrl(embedLink);
      setShowLinkInput(false);
      setTempLink("");
    } else if (tempLink) {
      setUploadError("Invalid Luma AI link. Must contain 'lumalabs.ai'.");
    }
  };

  return (
    <div className="w-full h-full relative z-0 overflow-hidden bg-white">
      
      {/* --- SCENE RENDERING --- */}
      {lumaEmbedUrl ? (
        <div className="w-full h-full absolute inset-0 z-0 bg-white">
          <iframe 
            src={lumaEmbedUrl}
            frameBorder="0" 
            allowFullScreen 
            className="w-full h-full border-none object-cover"
          ></iframe>
        </div>
      ) : (
        <div className="w-full h-full absolute inset-0 z-0 flex items-center justify-center bg-gray-100 text-gray-500 font-bold">
           <p>No 3D Environment Loaded.</p>
        </div>
      )}

      {/* --- MOCK YOLO BOUNDING BOXES (VISIBLE WHEN SCANNING) --- */}
      {isScanning && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Animated Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] opacity-70 animate-[ping_3s_ease-in-out_infinite]"></div>
          
          {/* Door Bounding Box */}
          <div className="absolute top-[20%] left-[45%] w-[18%] h-[60%] border-[3px] border-green-500 bg-green-500/10 flex flex-col justify-start overflow-visible animate-pulse">
            <span className="bg-green-500 text-black text-[10px] md:text-xs font-bold px-1 py-0.5 self-start whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              door 0.94
            </span>
          </div>

          {/* Window/Cabinet Bounding Box */}
          <div className="absolute top-[15%] left-[80%] w-[18%] h-[75%] border-[3px] border-[#FF9B54] bg-[#FF9B54]/10 flex flex-col justify-start overflow-visible animate-pulse delay-75">
            <span className="bg-[#FF9B54] text-black text-[10px] md:text-xs font-bold px-1 py-0.5 self-start whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              cabinet 0.88
            </span>
          </div>

          {/* Table Bounding Box */}
          <div className="absolute top-[75%] left-[55%] w-[25%] h-[25%] border-[3px] border-blue-500 bg-blue-500/10 flex flex-col justify-start overflow-visible animate-pulse delay-150">
            <span className="bg-blue-500 text-white text-[10px] md:text-xs font-bold px-1 py-0.5 self-start whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              table 0.91
            </span>
          </div>
        </div>
      )}

      {/* --- UI CONTROLS (Bottom Left) --- */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
        {uploadError && (
          <div className="bg-red-100 border-2 border-red-500 text-red-800 p-2 rounded text-[10px] font-bold max-w-[250px] shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
            ❌ {uploadError}
          </div>
        )}

        <div className="flex gap-2">
          <input type="file" accept=".splat,.ply" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
          <button 
            onClick={() => { setShowLinkInput(false); fileInputRef.current.click(); }}
            className="bg-white hover:bg-gray-200 text-black font-bold py-1.5 px-3 border-2 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors text-[10px] md:text-xs"
          >
            📁 Upload Local
          </button>
          <button 
            onClick={() => { setUploadError(null); setShowLinkInput(!showLinkInput); }}
            className="bg-[#FFE5B4] hover:bg-[#FFCBA4] text-black font-bold py-1.5 px-3 border-2 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors text-[10px] md:text-xs"
          >
            🔗 Room Link
          </button>
        </div>

        {showLinkInput && (
          <div className="bg-white border-2 border-black p-2 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-1 flex flex-col gap-2 w-[250px]">
            <label className="text-[10px] font-bold text-black uppercase">Paste Luma Link:</label>
            <input 
              type="text" 
              value={tempLink}
              onChange={(e) => setTempLink(e.target.value)}
              placeholder="https://lumalabs.ai/..."
              className="border-2 border-black p-1 text-[10px] w-full outline-none focus:bg-gray-50 text-black"
            />
            <div className="flex gap-2">
              <button onClick={submitLumaLink} className="bg-black hover:bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded border-2 border-black transition-colors flex-1">Submit</button>
              <button onClick={() => { setShowLinkInput(false); setTempLink(""); setUploadError(null); }} className="bg-gray-200 hover:bg-gray-300 text-black text-[10px] font-bold py-1 px-2 rounded border-2 border-black transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* --- FLOATING SPATIAL ICONS (Right Side) --- */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
          
          <div onClick={() => toggleTag('temperature')} className={`cursor-pointer transition-all duration-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'temperature' ? 'bg-[#FFE5B4] w-40 h-20 rounded p-2' : 'bg-white w-10 h-10 rounded-full hover:bg-[#FFCBA4]'}`}>
            {expandedTag === 'temperature' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-0.5 mb-1"><span className="font-bold text-[10px] uppercase">Temperature</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-[10px] font-bold hover:text-red-600">✖</button></div>
                <span className="text-xl font-bold">{temperature.toFixed(1)}°C</span><span className="text-[8px] font-bold text-gray-600 uppercase">Window 01</span>
              </div>
            ) : (<span className="text-sm">🌡️</span>)}
          </div>

          <div onClick={() => toggleTag('airflow')} className={`cursor-pointer transition-all duration-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'airflow' ? 'bg-[#FFE5B4] w-40 h-20 rounded p-2' : 'bg-white w-10 h-10 rounded-full hover:bg-[#FFCBA4]'}`}>
            {expandedTag === 'airflow' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-0.5 mb-1"><span className="font-bold text-[10px] uppercase">Air Flow</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-[10px] font-bold hover:text-red-600">✖</button></div>
                <span className="text-xl font-bold">{airFlow.toFixed(1)} m/s</span><span className="text-[8px] font-bold text-gray-600 uppercase">Window 02</span>
              </div>
            ) : (<span className="text-sm">💨</span>)}
          </div>

          <div onClick={() => toggleTag('door')} className={`cursor-pointer transition-all duration-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'door' ? 'bg-white w-40 h-20 rounded p-2' : 'bg-black w-10 h-10 rounded-full hover:bg-gray-800'}`}>
            {expandedTag === 'door' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-0.5 mb-1"><span className="font-bold text-[10px] uppercase">Door Sensor</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-[10px] font-bold hover:text-red-600">✖</button></div>
                <span className={`text-lg font-bold ${doorState === 'OPEN' ? 'text-red-500' : 'text-green-500'}`}>{doorState}</span><span className="text-[8px] font-bold text-gray-400 uppercase">YOLO Target</span>
              </div>
            ) : (<span className="text-sm">🚪</span>)}
          </div>

          <div onClick={() => toggleTag('noise')} className={`cursor-pointer transition-all duration-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'noise' ? 'bg-[#FFE5B4] w-40 h-20 rounded p-2' : 'bg-white w-10 h-10 rounded-full hover:bg-[#FFCBA4]'}`}>
            {expandedTag === 'noise' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-0.5 mb-1"><span className="font-bold text-[10px] uppercase">Noise Level</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-[10px] font-bold hover:text-red-600">✖</button></div>
                <span className="text-xl font-bold">{noiseLevel} dB</span><span className="text-[8px] font-bold text-gray-600 uppercase">Acoustic</span>
              </div>
            ) : (<span className="text-sm">🔊</span>)}
          </div>

          <div onClick={() => toggleTag('camera')} className={`cursor-pointer transition-all duration-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center overflow-hidden self-end ${expandedTag === 'camera' ? 'bg-white w-40 h-20 rounded p-2' : 'bg-white w-10 h-10 rounded-full hover:bg-gray-200'}`}>
            {expandedTag === 'camera' ? (
              <div className="flex flex-col text-black w-full h-full">
                <div className="flex justify-between items-center border-b-2 border-black pb-0.5 mb-1"><span className="font-bold text-[10px] uppercase">Camera</span><button onClick={(e) => { e.stopPropagation(); setExpandedTag(null); }} className="text-[10px] font-bold hover:text-red-600">✖</button></div>
                <span className="text-lg font-bold text-[#FF9B54]">{cameraStatus}</span><span className="text-[8px] font-bold text-gray-600 uppercase">Live Feed</span>
              </div>
            ) : (<span className="text-sm">📹</span>)}
          </div>

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
    <div className="min-h-screen bg-[#FFE5B4] p-3 md:p-4 font-mono flex flex-col gap-3 md:gap-4">
      
      {/* --- HEADER (Optimized for space) --- */}
      <div className="bg-white border-4 border-black p-3 md:p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
        <div>
          <div className="flex gap-2 mb-1.5">
            <span className="bg-[#FFCBA4] text-black text-[10px] font-bold px-2 py-0.5 border border-black uppercase">Twin-3D-v2.0</span>
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 border border-black uppercase">Rubric Complete</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-widest mb-0.5">Living Room Digital Twin</h1>
          <p className="text-[10px] md:text-xs text-gray-600 max-w-2xl leading-tight">
            High-fidelity workspace. Combines Gaussian Splats, telemetry, and a mock YOLO pipeline.
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="flex-1 flex gap-3 md:gap-4 h-[calc(100vh-140px)]">
        
        {/* Left: Telemetry Dashboard (Narrower width so 3D View gets more space) */}
        <div className="z-10 h-full overflow-y-auto hidden md:block">
          <TelemetryDashboard isScanning={isScanning} setIsScanning={setIsScanning} />
        </div>

        {/* Center/Right: 3D Scene Viewer */}
        <div className="flex-1 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <SceneViewer isScanning={isScanning} />
        </div>
        
      </div>
    </div>
  );
}