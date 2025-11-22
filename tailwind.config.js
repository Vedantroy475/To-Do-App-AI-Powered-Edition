/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
         primary: "#13a4ec",
         'background-light': "#f6f7f8",
         'background-dark': "#101c22",
         'text-light-primary': '#111618',
         'text-light-secondary': '#617c89',
         'text-dark-primary': '#FFFFFF',
         'text-dark-secondary': '#a0aec0',
         'icon-purple': '#a855f7',
         'icon-blue': '#3b82f6',
         'icon-red': '#ef4444',
         'icon-gray': '#6b7280',
         'custom-bg': '#dbd8ec',  // Added: Your desired persistent background color
       },
       fontFamily: {
         display: ["Manrope", "Noto Sans", "sans-serif"],
       },
       borderRadius: {
         DEFAULT: "0.5rem",
         lg: "0.75rem",
         xl: "1rem",
       },
    },
  },
  plugins: [
    typography(),
    require('@tailwindcss/forms'),
  ],
};