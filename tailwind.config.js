/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        sand: '#F6F3ED',
        ink: '#111111',
        mist: '#E5E5E5',
        fog: '#D4D0C9',
        shadow: '#9B9691',
        // Dark mode colors
        charcoal: '#1a1a1a',
        slate: '#2d2d2d',
        stone: '#3d3d3d',
        ash: '#4a4a4a',
        smoke: '#888888',
      },
    },
  },
  plugins: [],
}
