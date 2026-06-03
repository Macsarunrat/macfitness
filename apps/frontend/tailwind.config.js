/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: {
            light: '#FFF0F3',
            DEFAULT: '#FFCCD5',
            dark: '#FFB3C1',
            deep: '#FF8FAB',
            hot: '#FF5C8A',
            soft: '#FFE5EC',
          },
          purple: {
            light: '#FAF5FF',
            DEFAULT: '#F3E8FF',
            dark: '#E9D5FF',
            deep: '#D8B4FE',
          },
          peach: {
            light: '#FFF5F0',
            DEFAULT: '#FFE3D8',
            dark: '#FFD1C1',
          },
          cream: {
            DEFAULT: '#FFFDF9',
            dark: '#FFF9ED',
          },
          green: {
            light: '#F0FDF4',
            DEFAULT: '#DCFCE7',
            dark: '#BBF7D0',
          },
          grey: {
            light: '#FAF9F9',
            DEFAULT: '#F2ECE9',
            dark: '#E3D5CA',
          },
          text: '#4A3E3D',
          muted: '#8C7A78',
        }
      },
      fontFamily: {
        sans: ['"Quicksand"', '"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'cute': '0 8px 24px rgba(255, 182, 193, 0.25)',
        'cute-sm': '0 4px 12px rgba(255, 182, 193, 0.15)',
        'cute-lg': '0 16px 32px rgba(255, 182, 193, 0.35)',
        'inner-soft': 'inset 0 2px 4px rgba(255, 182, 193, 0.1)',
      },
      borderRadius: {
        'cute-sm': '1rem',
        'cute': '1.5rem',
        'cute-lg': '2.25rem',
      },
      animation: {
        'bounce-gentle': 'bounceGentle 2s infinite ease-in-out',
        'pulse-gentle': 'pulseGentle 2s infinite ease-in-out',
        'float-gentle': 'floatGentle 4s infinite ease-in-out',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) rotate(1deg)' },
        }
      }
    },
  },
  plugins: [],
}
