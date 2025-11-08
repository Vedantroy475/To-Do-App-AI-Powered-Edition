// src/components/SpeechRecognitionHandler.jsx
import React, { useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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
 
  const baseTextRef = useRef("");

  useEffect(() => {
    if (baseTextRef.current) {
      // Append transcript to base text with a space if base text exists
      const separator = baseTextRef.current.trim() ? " " : "";
      setCurrentValue(baseTextRef.current + separator + transcript);
    } else {
      setCurrentValue(transcript);
    }
  }, [transcript, setCurrentValue]);

  const startListening = () => {
    // Always preserve the current value as base text
    baseTextRef.current = currentValue;
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    // Don't clear baseTextRef here - keep it for potential resume
    // It will be reset when startListening is called again
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Sorry, your browser doesn't support speech recognition.</span>;
  }

  return children({
    listening,
    startListening,
    stopListening,
    resetTranscript,
    transcript, // Expose for debugging/logging in consumers
    browserSupportsSpeechRecognition // Already true here, but explicit
  });
}

export default SpeechRecognitionHandler;