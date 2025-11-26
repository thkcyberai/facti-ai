/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'kycshield': {
          'dark': '#0a0a1a',
          'primary': '#00d4ff',
          'secondary': '#7c3aed',
          'accent': '#10b981',
          'danger': '#ef4444',
          'warning': '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}
