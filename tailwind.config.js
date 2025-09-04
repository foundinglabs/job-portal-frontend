/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        // Light mode palette
        'primary-50': '#EFF6FF',
        'primary-100': '#DBEAFE',
        'primary-200': '#BFDBFE',
        'primary-300': '#93C5FD',
        'primary-400': '#60A5FA',
        'primary-500': '#3B82F6',
        'primary-600': '#2563EB',
        'primary-700': '#1D4ED8',
        'primary-800': '#1E40AF',
        'primary-900': '#1E3A8A',

        // Accent colors
        'accent-red': '#EF4444',
        'accent-green': '#22C55E',
        'accent-yellow': '#F59E0B',
        'accent-purple': '#A855F7',

        // Dark mode palette (Updated for a more professional look)
        'dark-background': '#0F172A',
        'dark-card': '#1E293B',
        'dark-text': '#E2E8F0',
        'dark-border': '#475569',
        'dark-icon': '#94A3B8',
        'dark-accent-blue': '#60A5FA',

        linkedin: {
          black: "#000000",
          dark: "#1D2226",
          blue: "#0A66C2", // brand blue
      },
      },
      
      boxShadow: {
        'custom-light': '0 4px 10px rgba(0, 0, 0, 0.08)',
        'custom-dark': '0 4px 10px rgba(0, 0, 0, 0.4)',
      },
      ringOffsetColor: {
        'dark-card': '#1D2226',
      },
    },
  },
  plugins: [],
}