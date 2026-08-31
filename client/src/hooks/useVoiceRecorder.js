"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const preferredMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  return [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ].find(type => MediaRecorder.isTypeSupported?.(type)) || "";
};

export function useVoiceRecorder() {
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const cancelledRef = useRef(false);
  const timerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");

  const release = useCallback(() => {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(() => release, [release]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported in this browser.");
      return false;
    }
    setError("");
    cancelledRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = preferredMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = event => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setStatus("recording");
      timerRef.current = window.setInterval(() => setSeconds(value => value + 1), 1000);
      return true;
    } catch {
      release();
      setStatus("idle");
      setError("Microphone access was denied. You can type your search instead.");
      return false;
    }
  }, [release]);

  const stop = useCallback(() => new Promise(resolve => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      resolve(null);
      return;
    }
    recorder.onstop = () => {
      const type = recorder.mimeType?.split(";")[0] || "audio/webm";
      const blob = cancelledRef.current
        ? null
        : new File(chunksRef.current, `marketplace-search.${type.includes("ogg") ? "ogg" : type.includes("mp4") ? "m4a" : "webm"}`, { type });
      release();
      chunksRef.current = [];
      setStatus("idle");
      resolve(blob);
    };
    recorder.stop();
  }), [release]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
    else release();
    setStatus("idle");
    setSeconds(0);
  }, [release]);

  return {
    status,
    seconds,
    error,
    isRecording: status === "recording",
    start,
    stop,
    cancel,
  };
}
