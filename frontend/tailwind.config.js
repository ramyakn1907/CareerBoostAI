/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#030712',        // Slate-950 base
          card: 'rgba(17, 24, 39, 0.65)', // Zinc-900 transparent card
          accent: '#14b8a6',    // Teal-500 primary glow
          violet: '#8b5cf6',    // Violet-500 secondary
          cyan: '#06b6d4',      // Cyan highlight
          danger: '#ef4444',    // Red error/delete
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.25)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
