import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activeSplat, setActiveSplat] = useState(null);
  const [splatsList, setSplatsList] = useState([]);
  const [isLoadingSplats, setIsLoadingSplats] = useState(false);
  const socketRef = useRef(null);

  // Function to fetch splats from the database
  const fetchSplatsList = async () => {
    setIsLoadingSplats(true);
    try {
      const res = await fetch("/api/splats");
      const data = await res.json();
      if (data.success) {
        setSplatsList(data.splats);
        // Default active splat is the latest uploaded one, if available
        if (data.splats.length > 0 && !activeSplat) {
          setActiveSplat(data.splats[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching splats list:", err);
    } finally {
      setIsLoadingSplats(false);
    }
  };

  useEffect(() => {
    // Connect to the Socket.io backend on the same host (Vite proxies or Node serves)
    // Using relative connection, which is robust for both dev and prod in AI Studio!
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("[SocketContext] Connected to digital twin telemetry socket.");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("[SocketContext] Telemetry socket disconnected.");
    });

    socket.on("telemetry", (data) => {
      setTelemetry(data);
    });

    socket.on("alerts", (data) => {
      setAlerts(data);
    });

    // Initial fetch of uploads
    fetchSplatsList();

    return () => {
      socket.disconnect();
    };
  }, []);

  // API wrappers
  const toggleCameraState = async () => {
    try {
      const targetState = telemetry ? !telemetry.cameraActive : true;
      const res = await fetch("/api/camera/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: targetState })
      });
      const data = await res.json();
      if (data.success) {
        setTelemetry(data.telemetry);
      }
    } catch (err) {
      console.error("Error toggling camera state:", err);
    }
  };

  const selectActiveSplat = (splat) => {
    setActiveSplat(splat);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        telemetry,
        alerts,
        activeSplat,
        splatsList,
        isLoadingSplats,
        refreshSplatsList: fetchSplatsList,
        toggleCameraState,
        selectActiveSplat
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
