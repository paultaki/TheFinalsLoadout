/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../New Test/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#7B1FA2',
        'secondary-blue': '#29B6F6',
        'accent-gold': '#FFD700',
        'alert-pink': '#FF1744',
        'base-dark': '#0e0e0e',
        'surface-dark': '#1a1a1a',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #7B1FA2 0%, #AB47BC 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #29B6F6 0%, #4FC3F7 100%)',
      },
    },
  },
  plugins: [],
}