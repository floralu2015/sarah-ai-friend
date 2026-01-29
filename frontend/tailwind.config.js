/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kid-friendly color palette
        primary: {
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e', // Main pink
          600: '#e11d48',
          700: '#be123c',
        },
        happy: '#fbbf24',    // Sunny yellow
        sad: '#60a5fa',      // Soft blue
        mad: '#f87171',      // Gentle red
        worried: '#a78bfa',  // Calming purple
        excited: '#34d399',  // Energetic green
        confused: '#fb923c', // Warm orange
      },
      fontFamily: {
        friendly: ['Comic Neue', 'Comic Sans MS', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-soft': 'pulse 3s infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        }
      }
    },
  },
  plugins: [],
}
