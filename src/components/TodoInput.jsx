// src/components/TodoInput.jsx
import React, {useState} from 'react';
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
function TodoInput({
  todo,
  setTodo,
  handleAdd,
  handleKeyDown,
  listening,
  startListening,
  stopListening,
  editingId,
  todoTextareaRef,
  browserSupportsSpeechRecognition,
  permissionState
}) {
  // Add state to track focus
  const [isFocused, setIsFocused] = useState(false);
  // Determine if textarea should be expanded
  const shouldExpand = isFocused || listening;
  // Prevent button click from blurring textarea immediately
  const handleMouseDownOnButton = (event) => {
    event.preventDefault();
  };
  // Microphone toggle handler with permission checks
  const handleMicToggle = async () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please use Chrome or Edge for the best experience.");
      return;
    }
    // Check permission state before starting
    if (permissionState === "denied") {
      alert("Microphone permission denied — open site settings to allow microphone.");
      return;
    }
    try {
      // Keep focus on textarea when starting to listen
      // This helps keep it expanded visually
      if (!listening && todoTextareaRef.current) {
        todoTextareaRef.current.focus(); // Explicitly focus before starting
      }
      // Toggle listening state
      if (listening) {
        stopListening();
      } else {
        await startListening();
        // No need to setIsFocused(true) here, onFocus handler does it
      }
    } catch (err) {
       // Fallback generic alert if something else fails
       alert("Could not start microphone.");
    }
  };
 
  return (
    <div className="flex flex-row gap-4 items-center mb-4 shrink-0">
      <textarea
        ref={todoTextareaRef}
        placeholder="Enter todo or use the microphone"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
        onKeyDown={handleKeyDown}
        // Add onFocus and onBlur handlers
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        // Conditionally add 'expanded' class
        className={`todo-textarea border border-gray-300 rounded-lg p-4 w-full focus:outline-none ${
          shouldExpand ? 'expanded' : '' // <-- ADD DYNAMIC CLASS
        }`}
      />
      {/* Buttons Column */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            // Also stop listening if Add button is clicked while listening
            if (listening) {
              stopListening();
            }
            handleAdd();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // Stop listening if user presses Enter on Add button while listening
              if (listening) {
                stopListening();
              }
              handleAdd();
            }
          }}
          onMouseDown={handleMouseDownOnButton} // <-- ADD onMouseDown
          disabled={!todo.trim()}
          title={editingId ? "Save Todo" : "Add Todo"}
          className="bg-violet-700 hover:bg-violet-800 transition-colors text-white font-bold h-16 w-16 rounded-full flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:bg-violet-400"
        >
          {editingId ? "Save" : "Add"}
        </button>
        {/* Microphone Button */}
        <button
          type="button"
          onClick={handleMicToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (listening) {
                stopListening();
              }
              handleAdd();
            }
          }}
          title={listening ? "Stop listening" : "Start listening"}
          className={`h-16 w-16 rounded-full flex items-center cursor-pointer justify-center shrink-0 transition-colors ${
            listening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-sky-500 hover:bg-sky-600'
          }`}
        >
          {listening
            ? <FaMicrophoneSlash className="text-white text-2xl" />
            : <FaMicrophone className="text-white text-2xl" />
          }
        </button>
      </div>
    </div>
  );
}
export default TodoInput;