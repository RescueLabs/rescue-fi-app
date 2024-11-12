import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      spacing: {
        4.5: '18px',
        6.5: '26px',
        10.5: '42px',
        15: '60px',
        13: '52px',
        18: '72px',
        19: '76px',
        39: '156px',
      },
      colors: {
        background: {
          light: '#e7ebf9',
          dark: '#15181d',
        },
        foreground: {
          light: '#fff',
          dark: '#000',
        },
        'in-black': {
          30: '#171a1c4d',
          DEFAULT: '#1B1F23',
          300: '#1E2227',
          500: '#171A1C',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  // eslint-disable-next-line global-require
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
