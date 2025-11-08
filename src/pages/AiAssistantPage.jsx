// src/pages/AiAssistantPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Mic, MicOff, Send, Sparkles } from 'lucide-react';
import SpeechRecognitionHandler from '../components/SpeechRecognitionHandler';
import { callOpenRouterAPI } from '../utils/api';

function AiAssistantPage() {
  const [aiConversation, setAiConversation] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null); // Added ref for textarea auto-resize

  // Effect to scroll chat window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiConversation, isAiLoading]); // Also trigger scroll when loading starts

  // Effect for textarea auto-resize (basic implementation)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [aiPrompt]);

  // Handle AI prompt submission
  const handleAiSubmit = async (e) => {
    if (e) e.preventDefault();
    const currentPrompt = aiPrompt.trim();
    if (!currentPrompt || isAiLoading) return; // Prevent multiple submissions

    // Immediately add the user message to the conversation (synchronous, before API call)
    const userMessage = { role: 'user', content: currentPrompt };
    setAiConversation(prev => [...prev, userMessage]);

    // Clear the input only AFTER adding the message to ensure it persists
    setAiPrompt("");
    setIsAiLoading(true);

    try {
      const response = await callOpenRouterAPI(currentPrompt);
      const aiMessage = { role: 'assistant', content: response || "Sorry, I couldn't get a response." };
      setAiConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI API Error in AiAssistantPage:", error);
      const errorMessage = { role: 'assistant', content: "Sorry, an error occurred while contacting the AI." };
      setAiConversation(prev => [...prev, errorMessage]); // Ensure error is also appended after user message
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle Enter key submission
  const handleAiKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSubmit();
    }
  };

  return (
    // Main container for the AI Assistant Page content
    // Removed outer container, assuming Layout provides padding
    <div className="flex flex-col flex-1 bg-white dark:bg-gray-900 md:rounded-l-xl overflow-hidden h-[calc(100vh-4rem)] md:h-auto max-h-screen"> {/* Adjust height calculation */}

      {/* Header specific to this page */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[#111618] dark:text-white text-2xl font-bold leading-tight tracking-[-0.033em]">AI Assistant</p>
            <p className="text-[#617c89] dark:text-gray-400 text-sm font-normal leading-normal">Your personal productivity assistant</p>
          </div>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 h-80 bg-gray-100 dark:bg-gray-800">
        {aiConversation.length === 0 && !isAiLoading ? (
          // Empty State - More engaging than the previous list
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
              className={`p-3 my-3 rounded-lg max-w-[50%] prose prose-sm ${msg.role === 'user' ? 'bg-blue-500 text-white self-end ml-auto' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 self-start mr-auto'}`}
            >
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isAiLoading && (
          <div className="ai-message p-2 my-1 bg-gray-300 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
            Thinking...
          </div>
        )}
      </div>

      {/* Chat Input Area - Wrapped with SpeechRecognitionHandler */}
      {/* 2. Wrap the input section */}
      <SpeechRecognitionHandler
        currentValue={aiPrompt} // Pass the current AI prompt state
        setCurrentValue={setAiPrompt} // Pass the setter for the AI prompt
        isEditing={false} // No editing mode here
      >
        {({ listening, startListening, stopListening, browserSupportsSpeechRecognition, transcript }) => {
          return (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <form onSubmit={handleAiSubmit} className="relative">
                <textarea
                  ref={textareaRef}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={handleAiKeyDown}
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-3 pr-28 pl-10 text-sm focus:ring-primary focus:border-primary dark:text-white resize-none border-transparent focus:border-primary overflow-hidden"
                  placeholder="Ask something, or use the mic..." // Updated placeholder
                  rows="1"
                  disabled={isAiLoading || listening} // Disable textarea while listening
                ></textarea>

                {/* Microphone Button */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                  {browserSupportsSpeechRecognition ? (
                    <button
                      type="button"
                      // 3. Use start/stopListening from handler props
                      onClick={() => {
                        if (listening) {
                          stopListening();
                        } else {
                          startListening();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (listening) {
                            stopListening();
                          }
                          handleAiSubmit();
                        }
                      }}
                      disabled={isAiLoading} // Disable mic if AI is loading
                      // Change color/icon based on listening state
                      className={`hover:text-primary disabled:opacity-50 ${listening ? 'text-red-500 animate-pulse' : 'text-[#617c89] dark:text-gray-400'}`}
                      title={listening ? "Stop listening" : "Start listening"}
                    >
                      {/* 4. Conditionally render Mic/MicOff icon */}
                      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                  ) : (
                    // Optionally show a disabled state or hide if not supported
                    <button type="button" disabled className="text-gray-400 cursor-not-allowed" title="Speech recognition not supported">
                      <MicOff className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Send Button */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                  <button
                    type="submit"
                    disabled={!aiPrompt.trim() || isAiLoading || listening}
                    // Changed bg-primary to bg-blue-500 (standard Tailwind light blue)
                    // You can replace 'bg-blue-500' with a more specific light blue like 'bg-sky-500' or 'bg-cyan-500'
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
