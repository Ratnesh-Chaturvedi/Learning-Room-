/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-brand)',
        'brand-hover': 'var(--color-brand-hover)',
        'brand-soft': 'var(--color-brand-soft)',
        'brand-deep': 'var(--color-brand-deep)',
        surface: 'var(--color-surface)',
        'surface-secondary': 'var(--color-surface-secondary)',
        'surface-hover': 'var(--color-surface-hover)',
      },
      fontFamily: {
        heading: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        editorial: ['Fraunces', 'Newsreader', 'Georgia', 'serif'],
        handwriting: ['Caveat', 'cursive', 'sans-serif'],
        cursive: ['Dancing Script', 'Caveat', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      },
      dropShadow: {
        '2xs': '0 1px 1px rgba(0, 0, 0, 0.05)',
        'xs': '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        '2xs': '2px',
        'xs': '4px',
      },
      animation: {
        'float-slow': 'doodleFloatSlow 4s ease-in-out infinite',
        'float-medium': 'doodleFloatMedium 3.2s ease-in-out infinite',
        'float-gentle': 'doodleFloatGentle 4.5s ease-in-out infinite',
        'float-delayed': 'doodleFloatMedium 3.6s ease-in-out 1.2s infinite',
      },
    },
  },
  plugins: [],
};
