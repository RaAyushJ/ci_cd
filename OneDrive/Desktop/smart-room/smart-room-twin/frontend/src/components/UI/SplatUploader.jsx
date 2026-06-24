import React, { useState, useRef } from "react";
import { Upload, FileCode, CheckCircle, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { useSocket } from "../../context/SocketContext";

export default function SplatUploader() {
  const { refreshSplatsList, selectActiveSplat, splatsList, activeSplat } = useSocket();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  // Drag handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  // Validate file type
  const validateAndUpload = (file) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".ply" && ext !== ".splat") {
      setStatusMsg({
        type: "error",
        text: "Invalid file type. Please upload a .ply Gaussian Splat reconstruction file."
      });
      return;
    }
    
    // Upload file
    uploadFile(file);
  };

  // Modern XMLHTTPRequest to track real file upload progress
  const uploadFile = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setStatusMsg({ type: "info", text: "Initializing transfer..." });

    const formData = new FormData();
    formData.append("splatFile", file);

    const xhr = new XMLHttpRequest();
    
    // Listen for progress events
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percentComplete);
        setStatusMsg({ type: "info", text: `Uploading: ${percentComplete}%` });
      }
    });

    // Handle complete / success
    xhr.onload = () => {
      setIsUploading(false);
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && response.success) {
          setStatusMsg({
            type: "success",
            text: "3D Splat uploaded and processed successfully!"
          });
          
          // Refresh list of files in context
          refreshSplatsList();
          
          // Automatically set as active splat
          if (response.file) {
            selectActiveSplat({
              filename: response.file.filename,
              url: response.file.path,
              uploadedAt: new Date().toISOString(),
              size: response.file.size
            });
          }
        } else {
          setStatusMsg({
            type: "error",
            text: response.error || "File upload failed on backend."
          });
        }
      } catch (err) {
        setStatusMsg({ type: "error", text: "Failed to parse server response." });
      }
    };

    // Handle errors
    xhr.onerror = () => {
      setIsUploading(false);
      setStatusMsg({
        type: "error",
        text: "Network error occurred during transmission."
      });
    };

    xhr.open("POST", "/api/upload-splat");
    xhr.send(formData);
  };

  return (
    <div id="splat-uploader" className="flex flex-col gap-5 border-4 border-black p-5 bg-white text-black">
      <div className="flex justify-between items-center border-b-2 border-black pb-2">
        <h3 className="font-mono text-sm font-black uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-5 h-5 text-black" />
          Splat Reconstruction Manager
        </h3>
        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 border border-black bg-[#FFCBA4]">
          {splatsList.length} PLY FILES
        </span>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current.click()}
        className={`border-4 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-black bg-[#FFCBA4]"
            : "border-black/30 bg-gray-50 hover:bg-[#FFF0E5] hover:border-black"
        } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".ply,.splat"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <RefreshCw className="w-8 h-8 animate-spin text-black" />
            <div className="w-full h-3 border-2 border-black bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="font-mono text-xs font-black uppercase">
              STREAMING BYTES... {uploadProgress}%
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 border-2 border-black bg-white rounded-none mb-1">
              <Upload className="w-6 h-6 text-black" />
            </div>
            <p className="font-mono text-xs font-black uppercase">
              Drag & Drop .ply File
            </p>
            <p className="font-sans text-[10px] text-gray-500 font-semibold max-w-xs leading-relaxed">
              Upload a standard 3D point cloud reconstruction or Gaussian Splat `.ply` file to load.
            </p>
          </div>
        )}
      </div>

      {/* Status Alert Box */}
      {statusMsg.text && (
        <div
          className={`border-2 border-black p-3 font-mono text-[11px] font-bold flex items-start gap-2 ${
            statusMsg.type === "success"
              ? "bg-green-50 text-green-900 border-green-500"
              : statusMsg.type === "error"
              ? "bg-red-50 text-red-900 border-red-500"
              : "bg-[#FFF0E5]"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Library of Uploaded Files */}
      {splatsList.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-wide border-b border-black/10 pb-1 mb-1">
            Available Models
          </span>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            {splatsList.map((splat) => {
              const isActive = activeSplat?.filename === splat.filename;
              const sizeMB = (splat.size / (1024 * 1024)).toFixed(2);
              return (
                <div
                  key={splat.filename}
                  onClick={() => selectActiveSplat(splat)}
                  className={`border-2 p-2.5 flex items-center justify-between cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "border-black bg-black text-[#FFCBA4]"
                      : "border-black/20 hover:border-black bg-gray-50 hover:bg-[#FFF0E5]"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <FileCode className={`w-4 h-4 shrink-0 ${isActive ? "text-[#FFCBA4]" : "text-gray-500"}`} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-mono text-[10px] font-bold truncate leading-tight">
                        {splat.filename.substring(splat.filename.indexOf("_") + 1)}
                      </span>
                      <span className={`font-sans text-[9px] font-semibold ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                        Uploaded: {new Date(splat.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] font-black border border-current px-1 shrink-0">
                    {sizeMB} MB
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
