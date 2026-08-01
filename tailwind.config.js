/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Tokyo Borderland - source de verite: blackout-content/tokens/tokens.json
        bg: '#09090B',
        'bg-raised': '#0E0E12',
        surface: '#15151A',
        'surface-elevated': '#1C1C23',

        ink: '#FAFAF7',
        'ink-secondary': '#A1A1AA',
        'ink-muted': '#63636B',

        neon: '#FF3B41',
        'neon-deep': '#DC2626',
        'neon-soft': '#FF6B6E',

        'card-face': '#F7F5F0',
        'card-ink': '#111114',
        'card-red': '#E5323E',

        premium: '#D4A437',
        success: '#10B981',
        warning: '#F59E0B',

        border: 'rgba(250, 250, 247, 0.08)',
        'border-strong': 'rgba(250, 250, 247, 0.16)',
      },
      fontFamily: {
        display: ['Anton', 'Arial Narrow', 'sans-serif'],
        sans: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '1rem',
        control: '0.75rem',
        pill: '9999px',
      },
      boxShadow: {
        'neon-glow': '0 0 20px rgba(255, 59, 65, 0.4), 0 0 40px rgba(255, 59, 65, 0.2)',
        'neon-glow-subtle': '0 0 15px rgba(255, 59, 65, 0.25), 0 0 30px rgba(255, 59, 65, 0.12)',
        'card-elevated': '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 59, 65, 0.12)',
        'premium-glow': '0 0 16px rgba(212, 164, 55, 0.35)',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 59, 65, 0.35)' },
          '50%': { boxShadow: '0 0 36px rgba(255, 59, 65, 0.55), 0 0 60px rgba(255, 59, 65, 0.25)' },
        },
      },
    },
  },
  plugins: [],
}
