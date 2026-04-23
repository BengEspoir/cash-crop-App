/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'dm-serif': ['"DM Serif Display"', 'serif'],
        'dm-sans': ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        green: {
          900: '#0D3D22',
          800: '#1A6B3C',
          700: '#2E8B57',
          600: '#3DAA6A',
          500: '#58C57F',
          400: '#83D8A0',
          300: '#AEE4C1',
          200: '#D4EDDA',
          100: '#EAF4EE',
          50: '#F3FAF5',
        },
        gold: {
          900: '#5B3F00',
          800: '#8A6200',
          700: '#B5892A',
          600: '#D1A23A',
          500: '#E0AE3E',
          400: '#E8B84B',
          300: '#F0CA71',
          200: '#F5DDA2',
          100: '#F7EDD5',
          50: '#FDF8EE',
        },
        ink: {
          900: '#0B1220',
          800: '#111827',
          700: '#374151',
          600: '#4B5563',
          500: '#6B7280',
          400: '#9CA3AF',
          300: '#D1D5DB',
          200: '#E5E7EB',
          100: '#F3F4F6',
          50: '#F9FAFB',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17, 24, 39, 0.04), 0 2px 8px rgba(17, 24, 39, 0.04)',
        lift: '0 8px 24px rgba(17, 24, 39, 0.08)',
        glow: '0 10px 30px rgba(26, 107, 60, 0.18)',
        'glow-gold': '0 10px 30px rgba(181, 137, 42, 0.2)',
        ring: '0 0 0 4px rgba(26, 107, 60, 0.12)',
      },
      borderRadius: {
        xl2: '18px',
        xl3: '22px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1.14) translate(-1%, -1%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out both',
        'fade-rise': 'fade-rise 360ms cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.4s linear infinite',
        'ken-burns': 'ken-burns 16s ease-in-out infinite alternate',
        float: 'float 6s ease-in-out infinite',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(1200px 600px at 80% -10%, rgba(232, 184, 75, 0.18), transparent), radial-gradient(800px 400px at 0% 100%, rgba(46, 139, 87, 0.2), transparent)',
        'shimmer-gradient':
          'linear-gradient(90deg, rgba(243,244,246,0) 0%, rgba(229,231,235,0.7) 50%, rgba(243,244,246,0) 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
