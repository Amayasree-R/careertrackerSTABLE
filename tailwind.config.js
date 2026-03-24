/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg':     '#0a0a0f',
        'dark-card':   '#13131a',
        'dark-border': '#1e1e2e',
        'dark-muted':  '#2a2a3d',
        black: { DEFAULT: '#0a0a0a', card: '#111111', surface: '#1a1a1a', border: '#242424' },
        orange: { DEFAULT: '#ff5500', hover: '#e64d00', light: '#ff7733', tint: '#2a1500' }
      },
      backgroundColor: {
        DEFAULT: '#0a0a0f',
      },
    },
  },
  plugins: [],
}