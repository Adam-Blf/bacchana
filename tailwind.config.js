import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Thème sombre « Nuit de tournée » piloté par la classe .dark sur <html>
  // (settingsStore : system / light / dark).
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // La Tournée - néobrutalisme. Valeurs dans src/styles/tokens.css
        // (triplets RGB pour garder les modificateurs d'opacité bg-neon/10).
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        'bg-raised': 'rgb(var(--c-bg-raised) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--c-surface-elevated) / <alpha-value>)',

        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-secondary': 'rgb(var(--c-ink-secondary) / <alpha-value>)',
        'ink-muted': 'rgb(var(--c-ink-muted) / <alpha-value>)',

        // "neon" = accent de marque (orange), nom de token conservé.
        neon: 'rgb(var(--c-neon) / <alpha-value>)',
        'neon-deep': 'rgb(var(--c-neon-deep) / <alpha-value>)',
        'neon-soft': 'rgb(var(--c-neon-soft) / <alpha-value>)',

        'pop-yellow': 'rgb(var(--c-pop-yellow) / <alpha-value>)',
        'pop-pink': 'rgb(var(--c-pop-pink) / <alpha-value>)',
        'pop-blue': 'rgb(var(--c-pop-blue) / <alpha-value>)',
        'pop-lime': 'rgb(var(--c-pop-lime) / <alpha-value>)',

        // Texte/bordure posés sur un aplat pop ou orange : noirs dans les 2 thèmes.
        'on-pop': 'rgb(var(--c-on-pop) / <alpha-value>)',

        // Cartes à jouer : objets physiques, identiques dans les 2 thèmes.
        'card-face': 'rgb(var(--c-card-face) / <alpha-value>)',
        'card-ink': 'rgb(var(--c-card-ink) / <alpha-value>)',
        'card-red': 'rgb(var(--c-card-red) / <alpha-value>)',
        'card-border': 'rgb(var(--c-card-border) / <alpha-value>)',

        premium: 'rgb(var(--c-premium) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        warning: 'rgb(var(--c-warning) / <alpha-value>)',

        border: 'var(--color-border)',
        'border-strong': 'rgb(var(--c-ink) / <alpha-value>)',
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
