import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // La Tournée - néobrutalisme. Mêmes valeurs que src/styles/tokens.css
        // (hex littéraux ici pour que les modificateurs d'opacité bg-neon/10 marchent).
        bg: '#FFF9F0',
        'bg-raised': '#FFF3E0',
        surface: '#FFFFFF',
        'surface-elevated': '#FFEFD6',

        ink: '#111111',
        'ink-secondary': '#44444A',
        'ink-muted': '#6B6B70',

        // "neon" = accent de marque (orange), nom de token conservé.
        neon: '#FF5C00',
        'neon-deep': '#E24E00',
        'neon-soft': '#FF8A3D',

        'pop-yellow': '#FFD029',
        'pop-pink': '#FF6FB2',
        'pop-blue': '#6E9BFF',
        'pop-lime': '#9BE94C',

        'card-face': '#FFFFFF',
        'card-ink': '#111111',
        'card-red': '#E5323E',

        premium: '#A87718',
        success: '#1B8A5A',
        warning: '#B45309',

        border: 'rgba(17, 17, 17, 0.15)',
        'border-strong': '#111111',
      },
      fontFamily: {
        display: ['Montserrat', 'Arial Black', 'sans-serif'],
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        // 2 familles max : le "mono" du HUD est Poppins + tabular-nums (voir index.css).
        mono: ['Poppins', 'system-ui', 'sans-serif'],
      },
      // Bordures par défaut à 2px : signature néobrutaliste.
      borderWidth: {
        DEFAULT: '2px',
        0: '0',
        1: '1px',
        2: '2px',
        3: '3px',
        4: '4px',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
        pill: '9999px',
      },
      boxShadow: {
        // Noms historiques conservés, valeurs = ombres dures néobrutalistes.
        'neon-glow': 'var(--shadow-brutal)',
        'neon-glow-subtle': 'var(--shadow-brutal-sm)',
        'card-elevated': 'var(--shadow-brutal-lg)',
        'premium-glow': 'var(--shadow-brutal)',
        brutal: 'var(--shadow-brutal)',
        'brutal-sm': 'var(--shadow-brutal-sm)',
        'brutal-lg': 'var(--shadow-brutal-lg)',
      },
      // Single source of truth for stacking: content < cookie banner < fixed controls
      // < overlays/pickers < modals. The cookie banner must never cover quit buttons
      // or bottom CTAs' overlays.
      zIndex: {
        banner: '30',
        controls: '40',
        overlay: '50',
        modal: '60',
      },
      animation: {
        'glow-pulse': 'brutalPulse 2s ease-in-out infinite',
      },
      keyframes: {
        brutalPulse: {
          '0%, 100%': { boxShadow: '4px 4px 0 0 #111111' },
          '50%': { boxShadow: '7px 7px 0 0 #111111' },
        },
      },
    },
  },
  plugins: [
    // Safe-area utilities. Registered as real Tailwind utilities (not raw CSS after
    // @tailwind utilities) so they compose predictably with pt-*/pb-* and support
    // variants. pt-safe-N adds the inset ON TOP of the regular spacing step, which is
    // what fixed headers under a notch actually need.
    plugin(({ addUtilities, matchUtilities, theme }) => {
      addUtilities({
        '.top-safe': { top: 'max(1rem, env(safe-area-inset-top))' },
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top, 0px)' },
        '.pb-safe': { paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' },
      })
      matchUtilities(
        {
          'pt-safe': (value) => ({
            paddingTop: `calc(env(safe-area-inset-top, 0px) + ${value})`,
          }),
          'pb-safe': (value) => ({
            paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${value})`,
          }),
        },
        { values: theme('spacing') }
      )
    }),
  ],
}
