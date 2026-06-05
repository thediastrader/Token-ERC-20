/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    'text-tier1', 'text-tier2', 'text-tier3',
    'border-tier1', 'border-tier2', 'border-tier3',
    'bg-tier1', 'bg-tier2', 'bg-tier3',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e1a',
        card: '#0d1325',
        gold: '#e8c96a',
        tier1: '#3a7a4a',
        tier2: '#4a6aaa',
        tier3: '#8a5aaa',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Rajdhani', 'sans-serif'],
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(232,201,106,0.2)' },
          '50%': { boxShadow: '0 0 28px rgba(232,201,106,0.45)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
      },
    },
  },
}
