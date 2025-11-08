/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'; // Import the plugin

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all your React components
  ],
  theme: {
    extend: {
      colors: {
         // Based on Stitch HTML/Config
         primary: "#13a4ec", // Main interactive color
         'background-light': "#f6f7f8", // Light mode background
         'background-dark': "#101c22",  // Dark mode background (adjust if needed)
         // Text colors can often use defaults like text-gray-900/text-white
         'text-light-primary': '#111618',
         'text-light-secondary': '#617c89',
         'text-dark-primary': '#FFFFFF', // Or a slightly off-white like #f6f7f8
         'text-dark-secondary': '#a0aec0', // Example dark mode secondary text
         // Add specific colors if needed
         'icon-purple': '#a855f7', // For Improve button icon
         'icon-blue': '#3b82f6',   // For Summarize button icon
         'icon-red': '#ef4444',     // For Delete button icon
         'icon-gray': '#6b7280',   // For Edit button icon
       },
       fontFamily: {
         // Based on Stitch HTML/Config (ensure Manrope is loaded via index.html or CSS)
         display: ["Manrope", "Noto Sans", "sans-serif"], 
       },
       borderRadius: {
         // Stitch uses different values, overriding defaults
         DEFAULT: "0.5rem",   // 8px (Tailwind's md)
         lg: "0.75rem",    // 12px (Tailwind's lg)
         xl: "1rem",      // 16px (Tailwind's xl)
         // full: "9999px" // Default is fine
       },
    },
  },
  plugins: [
    typography(), // Add the plugin to the list
    require('@tailwindcss/forms'), // Add forms plugin for better default input styles
  ],
};
