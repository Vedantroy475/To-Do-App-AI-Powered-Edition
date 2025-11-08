// src/pages/LoginPage.jsx
import { useState } from "react";
import PasswordInput from "../components/PasswordInput";
import PasswordStrengthValidator from "../components/PasswordStrengthValidator";

export default function LoginPage({ onAuthSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength state (only for signup)
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordChange = (e) => {
    const newPwd = e.target.value;
    setPassword(newPwd);
    if (isSignup) {
      setPasswordStrength(PasswordStrengthValidator.calculateStrength(newPwd));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    // Basic strength check for signup
    if (isSignup && !PasswordStrengthValidator.isValid(password)) {
      setError(PasswordStrengthValidator.getErrorMessage());
      return;
    }
    setError('');
    setLoading(true);
    try {
      const url = isSignup ? "/api/signup" : "/api/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include" // Important for cookies
      });
      
      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
        alert(json.error || "Authentication failed");
        setError(json.error || (isSignup ? "Signup failed" : "Login failed"));
      } else {
        if (isSignup) {
          alert('Signup successful! Please log in.');
          setIsSignup(false);
          setUsername('');
          setPassword('');
        } else {
          onAuthSuccess && onAuthSuccess(); 
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('An network error occurred. Please try again.');
      alert('An network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 font-display">
      <div className="absolute top-8 left-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">iTask</h2>
      </div>
      <div className="flex h-full grow flex-col justify-center w-full max-w-md">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="flex flex-col w-full gap-6">
            <div className="flex flex-col gap-3 text-center">
              <p className="text-4xl font-black tracking-tighter text-gray-900 dark:text-gray-100">
                {isSignup ? "Sign up" : "Log in"}
              </p>
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                Meet your new AI-powered task manager
              </p>
            </div>
            {error && (
              <div className="text-red-500 text-center p-2 bg-red-100 border border-red-400 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={submit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">Username</p>
                <input 
                  className="form-input flex w-full resize-none overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter your username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </label>
              
              {/* Using PasswordInput component */}
              <div className="flex flex-col gap-2">
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  showStrength={isSignup}
                  strength={passwordStrength}
                  className="gap-2"
                />
              </div>
            
              <div className="flex flex-col gap-3 mt-2">
                <button 
                  type="submit"
                  disabled={loading || (isSignup && !PasswordStrengthValidator.isValid(password))} 
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-blue-500 text-white text-base font-bold tracking-wide transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{loading ? "..." : (isSignup ? "Sign up" : "Log in")}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsSignup(!isSignup); setError(''); }}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-base font-bold tracking-wide transition-colors hover:bg-blue-500/10"
                >
                  <span className="truncate">{isSignup ? "Already have an account? Log in" : "Don't have an account? Sign up"}</span>
                </button>
              </div>
            </form>
            <div className="flex items-center justify-center gap-2 mt-4 text-yellow-500">
              <span>✨</span> 
              <p className="text-sm font-medium">AI Powered Todo Assistant Ready to Help</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}