/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        garden: {
          blush:    '#FFD6E0',
          rose:     '#FF6B9D',
          petal:    '#FF8FAB',
          lavender: '#C9B1FF',
          violet:   '#9B72CF',
          mint:     '#B8F0D8',
          sage:     '#6BCB96',
          gold:     '#FFD166',
          sun:      '#FFAA33',
          cream:    '#FFF8F0',
          deep:     '#1A0A2E',
          midnight: '#0D0620',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        fairy:   ['var(--font-fairy)', 'cursive'],
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 9s ease-in-out infinite',
        'float-fast':   'float 4s ease-in-out infinite',
        'spin-slow':    'spin 20s linear infinite',
        'pulse-soft':   'pulse-soft 3s ease-in-out infinite',
        'shimmer':      'shimmer 3s linear infinite',
        'butterfly':    'butterfly 8s ease-in-out infinite',
        'petal-fall':   'petal-fall 8s ease-in infinite',
        'glow-pulse':   'glow-pulse 2s ease-in-out infinite',
        'bounce-soft':  'bounce-soft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':       { transform: 'translateY(-20px) rotate(2deg)' },
          '66%':       { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':       { opacity: '1',   transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        butterfly: {
          '0%':   { transform: 'translate(0,0) rotate(0deg) scaleX(1)' },
          '25%':  { transform: 'translate(40px,-30px) rotate(15deg) scaleX(-1)' },
          '50%':  { transform: 'translate(80px,10px) rotate(-5deg) scaleX(1)' },
          '75%':  { transform: 'translate(30px,40px) rotate(10deg) scaleX(-1)' },
          '100%': { transform: 'translate(0,0) rotate(0deg) scaleX(1)' },
        },
        'petal-fall': {
          '0%':   { transform: 'translateY(-10px) rotate(0deg)',   opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '0.6' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,107,157,0.4)' },
          '50%':       { boxShadow: '0 0 60px rgba(255,107,157,0.8), 0 0 100px rgba(201,177,255,0.4)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'gradient-garden':  'linear-gradient(135deg, #FFD6E0 0%, #C9B1FF 50%, #B8F0D8 100%)',
        'gradient-magical': 'linear-gradient(180deg, #1A0A2E 0%, #2D1B5E 40%, #1A0A2E 100%)',
        'gradient-dawn':    'linear-gradient(180deg, #FFE4F3 0%, #FFF0FB 50%, #E8F4FF 100%)',
        'shimmer-gold':     'linear-gradient(90deg, transparent, rgba(255,209,102,0.4), transparent)',
      },
    },
  },
  plugins: [],
}
