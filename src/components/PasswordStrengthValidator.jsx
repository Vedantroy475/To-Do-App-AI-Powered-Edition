// src/components/PasswordStrengthValidator.jsx
import React from 'react';

/**
 * Custom hook for password strength validation
 * Returns the strength calculation function and strength score
 */
export const usePasswordStrength = () => {
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z\d]/.test(pwd)) score++;
    return score;
  };

  return { getPasswordStrength };
};

/**
 * Password strength validator component
 * Can be used as a utility export or rendered component
 */
const PasswordStrengthValidator = {
  // Minimum required strength for valid passwords
  MIN_STRENGTH: 3,

  // Calculate password strength (0-5)
  calculateStrength: (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    return score;
  },

  // Check if password meets minimum strength requirement
  isValid: (password) => {
    return PasswordStrengthValidator.calculateStrength(password) >= PasswordStrengthValidator.MIN_STRENGTH;
  },

  // Get strength label
  getStrengthLabel: (strength) => {
    if (strength === 0) return 'Very Weak';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Medium';
    if (strength === 4) return 'Strong';
    return 'Very Strong';
  },

  // Get error message for invalid password
  getErrorMessage: () => {
    return 'Password must be at least medium strength (8+ chars, mix of letters, numbers, symbols).';
  }
};

export default PasswordStrengthValidator;