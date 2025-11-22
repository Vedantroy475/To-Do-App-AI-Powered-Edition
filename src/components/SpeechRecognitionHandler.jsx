// src/components/SpeechRecognitionHandler.jsx
import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
/**
 * Robust SpeechRecognition handler:
 * - Prompts getUserMedia before starting the SpeechRecognition to ensure permission prompt
 * - Guards against start/listen exceptions and cleans up on unmount
 * - Exposes permissionState and lastError via render-prop for UI feedback
 */
function SpeechRecognitionHandler({
  currentValue,
  setCurrentValue,
  isEditing,
  children
}) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  const [permissionState, setPermissionState] = useState("unknown"); // 'unknown'|'granted'|'denied'|'prompt'|'unavailable'
  const [lastError, setLastError] = useState(null);
  const mediaStreamRef = useRef(null);
  const baseTextRef = useRef("");
  // Keep transcript synced into parent
  useEffect(() => {
    if (baseTextRef.current) {
      const sep = baseTextRef.current.trim() ? " " : "";
      setCurrentValue(baseTextRef.current + sep + transcript);
    } else {
      setCurrentValue(transcript);
    }
  }, [transcript, setCurrentValue]);
  // Best-effort permissions query
  useEffect(() => {
    if (!navigator.permissions) {
      setPermissionState("unknown");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const p = await navigator.permissions.query({ name: "microphone" });
        if (!cancelled) setPermissionState(p.state);
        const handler = () => { if (!cancelled) setPermissionState(p.state); };
        p.addEventListener?.("change", handler);
        // cleanup
        return () => p.removeEventListener?.("change", handler);
      } catch (err) {
        if (!cancelled) setPermissionState("unknown");
      }
    })();
    return () => { cancelled = true; };
  }, []);
  // Request mic permission (prompts user) and close stream immediately after prompt
  const requestMicrophonePermission = async () => {
    setLastError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setLastError("getUserMedia not available");
      setPermissionState("unavailable");
      throw new Error("getUserMedia not available");
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = s;
      setPermissionState("granted");
      // Immediately stop the tracks (we only requested to prompt permission)
      s.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      return true;
    } catch (err) {
      setLastError(err.message || String(err));
      setPermissionState("denied");
      throw err;
    }
  };
  // Enhanced startListening that ensures permission and guards errors
  const startListening = async (options = { continuous: true, interimResults: true, language: "en-US" }) => {
    setLastError(null);
    if (!browserSupportsSpeechRecognition) {
      const msg = "SpeechRecognition API not supported in this browser. Use Chrome desktop.";
      setLastError(msg);
      return;
    }
    // If permission is not 'granted', try to prompt
    try {
      if (permissionState !== "granted") {
        await requestMicrophonePermission();
      }
    } catch (err) {
      return;
    }
    // Reset transcript and preserve base text
    baseTextRef.current = currentValue || "";
    resetTranscript();
    // Defensive start: wrap in try/catch and attempt abort on failure
    try {
      SpeechRecognition.startListening(options);
    } catch (err) {
      setLastError(err.message || String(err));
      try {
        // try a safe abort/stop sequence
        SpeechRecognition.stopListening();
        SpeechRecognition.abort?.();
      } catch (e) {
        /* ignore */
      }
    }
  };
  const stopListening = () => {
    try {
      SpeechRecognition.stopListening();
      // react-speech-recognition exposes abort in some builds; guard it
      if (typeof SpeechRecognition.abort === "function") {
        SpeechRecognition.abort();
      }
    } catch (err) {
      setLastError(err.message || String(err));
    }
  };
  // cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        SpeechRecognition.stopListening();
        SpeechRecognition.abort?.();
      } catch (err) {
        /* ignore */
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);
  // Expose debug info via render-prop
  const debug = {
    permissionState,
    browserSupportsSpeechRecognition,
    listening,
    transcript,
    lastError
  };
  // Always call children so UI can render fallback messaging
  return children({
    listening,
    startListening,
    stopListening,
    resetTranscript,
    transcript,
    browserSupportsSpeechRecognition,
    permissionState,
    lastError,
    debug
  });
}
export default SpeechRecognitionHandler;