/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        whatsapp: '#25d366',
        gray: {
          50: 'var(--gray-50, #f9fafb)',
          100: 'var(--gray-100, #f3f4f6)',
          200: 'var(--gray-200, #e5e7eb)',
          300: 'var(--gray-300, #d1d5db)',
          400: 'var(--gray-400, #9ca3af)',
          500: 'var(--gray-500, #6b7280)',
          600: 'var(--gray-600, #4b5563)',
          700: 'var(--gray-700, #374151)',
          800: 'var(--gray-800, #1f2937)',
          900: 'var(--gray-900, #111827)',
          950: 'var(--gray-950, #030712)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
