/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        vastu: {
          dark: '#0f172a',
          card: '#1e293b',
          gold: '#f59e0b',
          emerald: '#10b981',
          indigo: '#6366f1'
        }
      }
    },
  },
  plugins: [],
}
