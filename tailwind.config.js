/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kawaii pastel palette
        'kawaii': {
          'pink': '#FFB6C1',
          'rose': '#FFE4E1',
          'peach': '#FFDAB9',
          'cream': '#FFF8DC',
          'mint': '#98FB98',
          'sky': '#87CEEB',
          'lavender': '#E6E6FA',
          'lilac': '#DDA0DD',
          'sunshine': '#FFE4B5',
        },
        // Legacy support
        'pet-pink': '#FFB6C1',
        'pet-blue': '#87CEEB',
        'pet-green': '#98FB98',
        'pet-yellow': '#FFE4B5',
        'pet-purple': '#DDA0DD',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pop': 'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'kawaii': '0 4px 12px rgba(255, 182, 193, 0.3)',
        'kawaii-lg': '0 8px 24px rgba(255, 182, 193, 0.4)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'kawaii': '1rem',
        'kawaii-lg': '1.5rem',
      }
    },
  },
  plugins: [],
}
