/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './screens/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F5F8FF',
        foreground: '#15234D',
        muted: '#64748B',
        border: '#e5e7eb',
        card: '#ffffff',
        siam: {
          blue: {
            DEFAULT: '#2450C4',
            light: '#3567F6',
            dark: '#163A9D',
            bright: '#3567F6',
            navy: '#102C76',
          },
          yellow: {
            DEFAULT: '#FFD32F',
            light: '#FFE566',
            dark: '#FFC928',
          },
          gray: {
            DEFAULT: '#64748B',
            light: '#94A3B8',
            dark: '#15234D',
          },
        },
      },
    },
  },
  plugins: [],
};
