// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AiAssistantPage from "./pages/AiAssistantPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage"; 
import ContactPage from "./pages/ContactPage"; // Added import for ContactPage
import "./App.css"; 

// Disclaimer Modal Component
function DisclaimerModal({ onAccept }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-[#111618] dark:text-white">Privacy & Disclaimer Policy</h2>
        <div className="prose prose-sm dark:prose-invert mb-6 text-gray-700 dark:text-gray-300 space-y-2">
          <p><strong>Important Notice:</strong> This app is <em>not production-grade</em>. It is a demo to showcase my technical skills in AI and web development.</p>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>No Sensitive Data:</strong> Do not store any real or sensitive information (e.g., passwords, personal details, confidential todos).</li>
            <li><strong>Database Limitations:</strong> Uses CockroachDB free trial—data (usernames, passwords, todos, embeddings for RAG queries) can be deleted anytime without notice.</li>
            <li><strong>TTL Expiry:</strong> Each todo expires after 24 hours to stay within free tier limits.</li>
            <li><strong>Chat History:</strong> AI conversations are not stored; history clears on session end or page refresh.</li>
          </ul>
          <p className="mt-4 text-sm">By continuing, you agree this is for demonstration only. For production needs, use secure services.</p>
        </div>
        <button
          onClick={onAccept}
          className="w-full bg-blue-300 hover:bg-blue-600 cursor-pointer text-white py-3 px-4 rounded-md font-semibold transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          I Understand & Accept
        </button>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Check if disclaimer has been shown for this session
  useEffect(() => {
    const disclaimerShown = sessionStorage.getItem('disclaimerShown');
    if (user && !disclaimerShown && !authLoading) {
      setShowDisclaimer(true);
    }
  }, [user, authLoading]);

  // Authentication check function - remains the same
  const fetchMe = async () => {
    try {
      setAuthLoading(true);
      const res = await fetch("/api/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null); // Explicitly set to null if not authenticated
      }
    } catch (err) {
      console.error("fetchMe error:", err);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // Run auth check on initial load
  useEffect(() => {
    fetchMe();
  }, []);

  // Handle logout function - remains the same, but clears user state
   const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      // Clear sessionStorage on logout to allow disclaimer on next login
      sessionStorage.removeItem('disclaimerShown');
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      setUser(null); // Clear user state on logout
    }
  };

  // Handle disclaimer acceptance
  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem('disclaimerShown', 'true');
    setShowDisclaimer(false);
  };

  // Show loading indicator while checking auth
  if (authLoading) {
    // Optional: Add a dedicated loading component later
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>; 
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Route: Login Page */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/" replace /> : <LoginPage onAuthSuccess={fetchMe} />
            } 
          />

          {/* Protected Routes inside Layout */}
          <Route 
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/ai-assistant" element={<AiAssistantPage />} />
            <Route path="/settings" element={<SettingsPage refreshAuth={fetchMe} />} /> 
            <Route path="/contact" element={<ContactPage />} /> {/* Added Contact route */}
            {/* Add other protected routes here */}
          </Route>

          {/* Optional: Catch-all route for 404 */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>

      {/* Disclaimer Modal */}
      {showDisclaimer && <DisclaimerModal onAccept={handleAcceptDisclaimer} />}
    </>
  );
}

export default App;