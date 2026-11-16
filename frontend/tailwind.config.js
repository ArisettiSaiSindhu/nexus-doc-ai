/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        secondary: '#111113',
        card: '#18181b',
        'card-hover': '#1f1f23',
        nexusRed: '#ff3b2f',
        'nexusRed-hover': '#ff5147',
        'nexusRed-glow': 'rgba(255, 59, 47, 0.22)',
        'nexusRed-muted': 'rgba(255, 59, 47, 0.12)',
        'border-subtle': 'rgba(255, 255, 255, 0.10)',
        'border-focus': 'rgba(255, 59, 47, 0.45)',
        textMain: '#f5f5f5',
        textMuted: '#a1a1aa',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'red-glow': '0 0 30px rgba(255, 59, 47, 0.22)',
        'red-glow-lg': '0 0 50px rgba(255, 59, 47, 0.35)',
        'card-glow': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 59, 47, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
