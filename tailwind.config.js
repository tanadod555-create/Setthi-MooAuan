/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yajok: {
          dark: '#12131A',
          card: '#1A1C26',
          border: '#282B3A',
          yellow: '#FFC93C',
          yellowHover: '#E5B434',
          salmon: '#FF6B6B',
          green: '#10B981',
          textMuted: '#94A3B8',
          textLight: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Prompt', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
