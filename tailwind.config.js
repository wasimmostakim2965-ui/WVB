/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0B0E14',
          soft: '#3A4150',
          mute: '#6B7280',
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bdd0ff',
          300: '#90b0ff',
          400: '#5b84fb',
          500: '#345ef5',
          600: '#1f3fe0',
          700: '#1b32b6',
          800: '#1c2f90',
          900: '#1c2d72',
        },
        accent: {
          DEFAULT: '#0FA36B',
          soft: '#E7F7F0',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F6F7F9',
          line: '#E6E8EC',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,14,20,0.04), 0 8px 24px -12px rgba(11,14,20,0.12)',
        lift: '0 2px 4px rgba(11,14,20,0.05), 0 18px 40px -16px rgba(11,14,20,0.22)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      maxWidth: {
        shell: '1200px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.2,.7,.2,1) both',
        'fade-in': 'fade-in .4s ease both',
      },
    },
  },
  plugins: [],
}
