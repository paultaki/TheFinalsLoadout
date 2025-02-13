/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-yellow': '#ffb700',
        'neon-orange': '#ff7b00',
        'neon-red': '#ff4f4f',
        'neon-blue': '#00f3ff',
        'bg-dark': '#1d1a21',
        'bg-darker': '#151318',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      fontFamily: {
        sans: ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
}