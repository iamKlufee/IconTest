/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'scientific-blue': '#1e40af',
        'scientific-gray': '#f8fafc',
        'scientific-dark': '#1e293b'
      }
    },
  },
  plugins: [],
} 