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
        dark: {
          bg: '#0B0F17',
          surface: '#111827',
          card: '#1F2937',
          border: '#374151',
          hover: '#2D3748'
        },
        cyan: {
          500: '#00F2FE',
          400: '#38BDF8',
          600: '#0284C7'
        },
        crimson: {
          500: '#EF4444',
          400: '#F87171',
          600: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 242, 254, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 242, 254, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
