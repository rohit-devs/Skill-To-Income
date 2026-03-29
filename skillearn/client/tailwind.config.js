/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        's-low': "var(--s-low)",
        's-mid': "var(--s-mid)",
        's-high': "var(--s-high)",
        's-highest': "var(--s-highest)",
        primary: "var(--primary)",
        'primary-dim': "var(--primary-dim)",
        'primary-fixed': "var(--primary-fixed)",
        'on-primary': "var(--on-primary)",
        'p-container': "var(--p-container)",
        secondary: "var(--secondary)",
        'sec-fixed': "var(--sec-fixed)",
        'sec-container': "var(--sec-container)",
        'on-sec': "var(--on-sec)",
        'on-sec-fixed': "var(--on-sec-fixed)",
        'on-surface': "var(--on-surface)",
        'on-sv': "var(--on-sv)",
        outline: "var(--outline)",
        'outline-v': "var(--outline-v)",
        error: "var(--error)",
        success: "var(--success)",
        warning: "var(--warning)",
        accent: {
          cyan: "#06B6D4",
          violet: "#8B5CF6",
          indigo: "#6366F1"
        }
      },
      borderRadius: {
        'sm': 'var(--r-sm)',
        'md': 'var(--r-md)',
        'lg': 'var(--r-lg)',
        'xl': 'var(--r-xl)',
        'full': 'var(--r-full)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'pulse-border': 'pulseBorder 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(139, 92, 246, 0.6)' },
        },
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(99, 102, 241, 0.2)' },
          '50%': { borderColor: 'rgba(139, 92, 246, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
