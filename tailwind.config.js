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
      },
      backgroundColor: {
        DEFAULT: '#0a0a0f',
      },
    },
  },
  plugins: [],
}