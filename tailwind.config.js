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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        card: 'var(--card)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        geist: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'modern': '0 1px 4px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.06)',
        'modern-lg': '0 4px 16px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.12)',
        'modern-xl': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'modern': '12px',
        'modern-lg': '16px',
        'modern-xl': '20px',
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'pulse-modern': 'pulseModern 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-modern': 'spinModern 1s linear infinite',
        'slide-in-up': 'slideInUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-delayed': 'fadeIn 0.5s ease-out 0.2s both',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseModern: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spinModern: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        slideInUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
