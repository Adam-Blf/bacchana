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
        // La Taverne - néobrutalisme. Les couleurs themables passent par les
        // canaux RGB de tokens.css (rgb(var(--c-x) / <alpha-value>)) pour que
        // les modificateurs d'opacité bg-neon/10 suivent le mode sombre.
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
        // Orange réservé au TEXTE/petits labels (< 18px, non-gras) : plus
        // sombre que neon-deep en clair pour repasser AA normal (4.5:1) sur
        // le fond crème. En sombre il vaut neon (déjà AAA sur l'encre).
        'orange-ink': 'rgb(var(--c-orange-ink) / <alpha-value>)',

        'pop-yellow': 'rgb(var(--c-pop-yellow) / <alpha-value>)',
        'pop-pink': 'rgb(var(--c-pop-pink) / <alpha-value>)',
        'pop-blue': 'rgb(var(--c-pop-blue) / <alpha-value>)',
        'pop-lime': 'rgb(var(--c-pop-lime) / <alpha-value>)',

        // Les cartes à jouer restent blanches dans les deux thèmes : ce sont
        // des objets physiques, pas des surfaces d'interface. card-red est
        // fixe (le rouge d'un pip de carte ne suit pas le thème) mais passe
        // par le canal RGB pour rester une source unique avec tokens.css.
        'card-face': '#FFFFFF',
        'card-ink': '#111111',
        'card-red': 'rgb(var(--c-card-red) / <alpha-value>)',

        // Texte posé sur les aplats pop des tuiles : encre fixe, car ces
        // fonds restent clairs dans les deux thèmes.
        'tile-ink': '#111111',

        premium: 'rgb(var(--c-premium) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        warning: 'rgb(var(--c-warning) / <alpha-value>)',

        border: 'rgb(var(--c-border-strong) / var(--alpha-border))',
        'border-strong': 'rgb(var(--c-border-strong) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        sans: ['Bricolage Grotesque', 'system-ui', '-apple-system', 'sans-serif'],
        // Le "mono" du HUD est Bricolage + tabular-nums (voir index.css).
        mono: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        // Vraie mono, reservee au ticket de caisse (element signature).
        receipt: ['Space Mono', 'Consolas', 'monospace'],
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
