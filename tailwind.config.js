/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        'dark-950': '#050508',
        'dark-900': '#0a0a12',
        'dark-800': '#0f0f1a',
        'dark-700': '#161625',
        'dark-600': '#1e1e30',
        'dark-500': '#282840',
        'accent-blue': '#4f9cf9',
        'accent-purple': '#8b5cf6',
        'accent-cyan': '#06b6d4',
        'accent-green': '#10b981',
        'accent-orange': '#f59e0b',
        'accent-red': '#ef4444',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(79,156,249,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,156,249,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(79,156,249,0.3)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.3)',
        'glow-green': '0 0 20px rgba(16,185,129,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
