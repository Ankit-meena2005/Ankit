/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#eefcf3', 100: '#d6f7e3', 200: '#aeedc7', 300: '#79e0a3',
          400: '#3acc7a', 500: '#14b85f', 600: '#08994b', 700: '#077a3f',
          800: '#096035', 900: '#0a4d2d', 950: '#022817'
        },
        soil: {
          50: '#faf6f0', 100: '#f0e5cf', 200: '#e3cd9e', 300: '#d3b06c',
          400: '#c39442', 500: '#a87b2f', 600: '#855f25', 700: '#6a4b1f',
          800: '#5a3e1f', 900: '#4d341d'
        },
        night: {
          50: '#f3f6f9', 100: '#e1eaf3', 200: '#c6d7e8', 300: '#9ab8d2',
          400: '#6597b9', 500: '#447da4', 600: '#34678d', 700: '#2c5474',
          800: '#24445d', 900: '#0f1e2b', 950: '#070f16'
        }
      },
      boxShadow: {
        glow: '0 0 40px rgba(20, 184, 95, 0.35)',
        card: '0 8px 30px rgba(2, 40, 23, 0.12)'
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseRing: { '0%': { transform: 'scale(0.9)', opacity: '0.7' }, '100%': { transform: 'scale(1.6)', opacity: '0' } }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        pulseRing: 'pulseRing 1.8s ease-out infinite'
      }
    }
  },
  plugins: []
}
