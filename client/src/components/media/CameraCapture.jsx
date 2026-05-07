"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, RefreshCw, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CameraCapture = ({ onCapture, label, description }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsStarting(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please ensure you've granted permission.");
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPhoto(dataUrl);
      stopCamera();
    }
  };

  const reset = () => {
    setPhoto(null);
    startCamera();
  };

  const confirm = () => {
    onCapture(photo);
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
        <h3 className="text-[15px] font-bold text-ink-900">{label}</h3>
        <p className="text-[13px] text-ink-600">{description}</p>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
        {!photo ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {!stream && !isStarting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {error ? (
                  <>
                    <AlertCircle className="mb-3 h-10 w-10 text-red-500" />
                    <p className="mb-4 text-[14px] text-white">{error}</p>
                    <Button onClick={startCamera} variant="outline" className="text-white border-white hover:bg-white/10">
                      Try Again
                    </Button>
                  </>
                ) : (
                  <>
                    <Camera className="mb-3 h-10 w-10 text-white/50" />
                    <p className="mb-4 text-[14px] text-white">Camera is ready</p>
                    <Button onClick={startCamera} className="bg-white text-black hover:bg-white/90">
                      Open Camera
                    </Button>
                  </>
                )}
              </div>
            )}
            {stream && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  className="group flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 transition-all hover:bg-white/40 active:scale-95"
                >
                  <div className="h-12 w-12 rounded-full bg-white transition-all group-hover:scale-90" />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Image src={photo} className="object-cover" alt="Captured" fill sizes="100vw" unoptimized />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-4 backdrop-blur-sm">
              <Button
                variant="ghost"
                onClick={reset}
                className="text-white hover:bg-white/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Retake
              </Button>
              <Button
                onClick={confirm}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" /> Looks good
              </Button>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
