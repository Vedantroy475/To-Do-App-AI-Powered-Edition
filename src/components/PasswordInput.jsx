// src/components/PasswordInput.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable password input component with view/hide toggle and optional strength indicator
 * 
 * @param {string} label - Label text for the input field
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Current password value
 * @param {function} onChange - Change handler function
 * @param {boolean} required - Whether the field is required
 * @param {boolean} showStrength - Whether to show password strength indicator
 * @param {number} strength - Password strength score (0-5), only used if showStrength is true
 * @param {string} className - Additional classes for the container
 */
function PasswordInput({ 
  label = "Password",
  placeholder = "Enter your password",
  value,
  onChange,
  required = false,
  showStrength = false,
  strength = 0,
  className = ""
}) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrengthText = (score) => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  return (
    <label className={`flex flex-col min-w-40 flex-1 relative ${className}`}>
      <p className="text-[#111618] dark:text-white text-base font-medium leading-normal pb-2">
        {label}
      </p>
      <div className="relative">
        <input
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111618] dark:text-white focus:outline-0 focus:ring-0 border border-[#dbe4e6] dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#618389] pr-12 p-[15px] text-base font-normal leading-normal"
          placeholder={placeholder}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Password Strength Indicator */}
      {showStrength && (
        <div className="mt-2">
          <div className="flex gap-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-full rounded-full transition-all duration-300 ${
                  i < strength
                    ? 'bg-green-500'
                    : i < Math.ceil(strength / 2) * 2
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ opacity: i < strength ? 1 : 0.3 }}
              />
            ))}
          </div>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400 capitalize">
            {getStrengthText(strength)}
          </p>
        </div>
      )}
      
      {/* Spacer to maintain consistent height when strength indicator is not shown */}
      {!showStrength && <div className="h-8" />}
    </label>
  );
}

export default PasswordInput;