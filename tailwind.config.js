/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        // Professional Blue Theme Palette
        'primary-50': '#EFF6FF',
        'primary-100': '#DBEAFE',
        'primary-200': '#BFDBFE',
        'primary-300': '#93C5FD',
        'primary-400': '#60A5FA', // Lighter blue accent
        'primary-500': '#3B82F6', // Main primary blue
        'primary-600': '#2563EB', // Darker blue for buttons/active states
        'primary-700': '#1D4ED8',
        'primary-800': '#1E40AF',
        'primary-900': '#1E3A8A',

        // Accent colors
        'accent-red': '#EF4444',
        'accent-green': '#22C55E',
        'accent-yellow': '#F59E0B',
        'accent-purple': '#A855F7',

        // Dark Mode Backgrounds / Card Colors
        'dark-background': '#1A202C',
        'dark-card': '#2D3748',
      },
      boxShadow: {
        'custom-light': '0 4px 10px rgba(0, 0, 0, 0.08)',
        'custom-dark': '0 4px 10px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}