/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        solar: { 400: '#FFCA28', 500: '#FFC107', 600: '#FFB300' },
        energy: { 400: '#29B6F6', 500: '#03A9F4', 600: '#039BE5' },
        grid: { green: '#4CAF50', red: '#EF5350' },
        surface: { 50: '#1a1a2e', 100: '#16213e', 200: '#0f3460', 300: '#1a1a3e' },
      },
    },
  },
  plugins: [],
};
