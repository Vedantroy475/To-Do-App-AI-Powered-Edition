// src/pages/AiAssistantPage.jsx
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Mic, MicOff } from "lucide-react";
import SpeechRecognitionHandler from "../components/SpeechRecognitionHandler";
import { callOpenRouterAPI } from "../utils/api";
function AiAssistantPage() {
  const [aiConversation, setAiConversation] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiConversation, isAiLoading]);
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [aiPrompt]);
  const handleAiSubmit = async (e) => {
    if (e) e.preventDefault();
    const currentPrompt = aiPrompt.trim();
    if (!currentPrompt || isAiLoading) return;
    // Append user message locally
    const userMessage = { role: "user", content: currentPrompt };
    setAiConversation((prev) => [...prev, userMessage]);
    setAiPrompt("");
    setIsAiLoading(true);
    try {
      const response = await callOpenRouterAPI(currentPrompt);
      const aiMessage = { role: "assistant", content: response || "Sorry, I couldn't get a response." };
      setAiConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { role: "assistant", content: "Sorry, an error occurred while contacting the AI." };
      setAiConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };
  const handleAiKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAiSubmit();
    }
  };
  return (
    <div className="flex flex-col flex-1 bg-custom-bg md:rounded-l-xl overflow-hidden h-[calc(100dvh-4rem)] md:h-auto max-h-screen">
      <header className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[#111618] dark:text-white text-2xl font-bold leading-tight tracking-[-0.033em]">
              AI Assistant
            </p>
            <p className="text-[#617c89] dark:text-gray-400 text-sm font-normal leading-normal">
              Your personal productivity assistant
            </p>
          </div>
        </div>
      </header>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 h-80 bg-gray-100 dark:bg-gray-800">
        {aiConversation.length === 0 && !isAiLoading ? (
          <div className="empty-chat text-gray-700 dark:text-gray-300 max-w-md mx-auto">
            <p className="text-center">Ask me about your todos! I can:</p>
            <ul className="text-sm mt-2 list-disc list-inside">
              <li>Summarize long todos</li>
              <li>Search through your notes</li>
              <li>Improve grammar and writing</li>
              <li>Answer questions about your data</li>
            </ul>
          </div>
        ) : (
          aiConversation.map((msg, index) => (
            <div
              key={index}
              className={`p-3 my-3 rounded-lg max-w-[50%] prose prose-sm ${
                msg.role === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 self-start mr-auto"
              }`}
            >
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                  )
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))
        )}
        {isAiLoading && (
          <div className="ai-message p-2 my-1 bg-gray-300 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
            Thinking...
          </div>
        )}
      </div>
      <SpeechRecognitionHandler currentValue={aiPrompt} setCurrentValue={setAiPrompt} isEditing={false}>
        {({
          listening,
          startListening,
          stopListening,
          browserSupportsSpeechRecognition,
          permissionState,
          lastError
        }) => {
          // toggle microphone handler
          const handleMicToggle = async () => {
            if (!browserSupportsSpeechRecognition) return;
            // Check permission state before starting
            if (permissionState === "denied") {
              alert("Microphone permission denied — open site settings to allow microphone.");
              return;
            }
            try {
              if (listening) {
                stopListening();
              } else {
                await startListening();
              }
            } catch (err) {
               // Fallback generic alert if something else fails
               alert("Could not start microphone.");
            }
          };
          return (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <form onSubmit={handleAiSubmit} className="relative">
                <textarea
                  ref={textareaRef}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={handleAiKeyDown}
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-3 pr-28 pl-10 text-sm focus:ring-primary focus:border-primary dark:text-white resize-none border-transparent focus:border-primary overflow-hidden"
                  placeholder="Ask something, or use the mic..."
                  rows="1"
                  disabled={isAiLoading || listening}
                />
                {/* Microphone Button - Positioned at bottom-2 to align with text row */}
                <div className="absolute bottom-4 left-0 flex items-center pl-3 z-10">
                  {browserSupportsSpeechRecognition ? (
                    <button
                      type="button"
                      onClick={handleMicToggle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAiSubmit();
                        }
                      }}
                      disabled={isAiLoading}
                      className={`hover:text-primary disabled:opacity-50 ${listening ? "text-red-500 animate-pulse" : "text-[#617c89] dark:text-gray-400"}`}
                      title={listening ? "Stop listening" : "Start listening"}
                    >
                      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                  ) : (
                    <button type="button" disabled className="text-gray-400 cursor-not-allowed" title="Speech recognition not supported">
                      <MicOff className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {/* Send Button - Positioned at bottom-3 to align with text row */}
                <div className="absolute bottom-3 right-0 flex items-center pr-3 z-10">
                  <button
                    type="submit"
                    disabled={!aiPrompt.trim() || isAiLoading || listening}
                    className="flex min-w-[70px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-8 px-4 bg-blue-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate">Send</span>
                  </button>
                </div>
              </form>
            </div>
          );
        }}
      </SpeechRecognitionHandler>
    </div>
  );
}
export default AiAssistantPage;