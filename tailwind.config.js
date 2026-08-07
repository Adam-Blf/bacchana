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
        // Bacchus - néobrutalisme. Les couleurs themables passent par les
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

        // Pourpre de marque (logo Bacchus) : profondeur, jamais un aplat
        // général. Réservé aux halos d'ambiance et au sceau "verrouillé" du
        // paywall. Voir tokens.css + docs/DESIGN_TOKENS.md.
        depth: 'rgb(var(--c-depth) / <alpha-value>)',

        // Les cartes à jouer restent blanches dans les deux thèmes : ce sont
        // des objets physiques, pas des surfaces d'interface. card-red est
        // fixe (le rouge d'un pip de carte ne suit pas le thème) mais passe
        // par le canal RGB pour rester une source unique avec tokens.css.
        'card-face': '#FFFFFF',
        'card-ink': '#111111',
        'card-red': 'rgb(var(--c-card-red) / <alpha-value>)',

        // Texte/icône/bordure posé sur un aplat pop (yellow/pink/blue/lime) :
        // encre fixe, car ces fonds restent clairs dans les deux thèmes.
        // Ne jamais utiliser `text-ink` (thémable) au-dessus d'un `bg-pop-*`.
        // Voir tokens.css + docs/DESIGN_TOKENS.md.
        'tile-ink': 'rgb(var(--c-tile-ink) / <alpha-value>)',
        // Voile de modale, invariant au theme (voir tokens.css).
        scrim: 'rgb(var(--c-scrim) / <alpha-value>)',

        premium: 'rgb(var(--c-premium) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        warning: 'rgb(var(--c-warning) / <alpha-value>)',
        // Rouge sémantique (erreur, action destructive, alerte) : distinct de
        // card-red (fixe, réservé aux pips physiques des cartes). Voir
        // docs/DESIGN_TOKENS.md.
        danger: 'rgb(var(--c-danger) / <alpha-value>)',

        border: 'rgb(var(--c-border-strong) / var(--alpha-border))',
        'border-strong': 'rgb(var(--c-border-strong) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        sans: ['Bricolage Grotesque', 'system-ui', '-apple-system', 'sans-serif'],
        // HUD : Bricolage + tabular-nums (voir index.css). Cette famille
        // s'appelait `mono` et ne rendait AUCUNE chasse fixe, sur 90 sites
        // d'appel. Un nom qui ment fait ecrire du code faux : on lisait
        // `font-mono tabular-nums` en croyant doubler l'effet, alors que seul
        // `tabular-nums` travaillait. La vraie mono est `receipt`.
        hud: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        // Vraie mono, reservee au ticket de caisse (element signature).
        receipt: ['Space Mono', 'Consolas', 'monospace'],
      },
      // Deux paliers pour tout ce qui vit sous le corps de texte. Ils
      // remplacent 34 valeurs arbitraires `text-[10px]`, `[11px]` et `[13px]`
      // semees a la main sur les ecrans. Le 10px disparait : sous 11px, un
      // label en capitales avec du tracking devient illisible a bout de bras
      // sur une table, ce qui est litteralement le contexte d'usage.
      fontSize: {
        label: ['0.6875rem', { lineHeight: '1rem' }],
        caption: ['0.8125rem', { lineHeight: '1.125rem' }],
      },
      // Hauteurs de frappe. 44px est le minimum tactile (Apple HIG, WCAG
      // 2.5.5), 52px la hauteur des rangees de reglages.
      minHeight: {
        touch: '44px',
        row: '52px',
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
        // Sur --shadow-tile-lg et non --shadow-brutal-lg : une carte est claire
        // dans les deux themes, son ombre ne peut donc pas suivre --color-ink,
        // qui passe au creme en sombre et transforme l'ombre en halo.
        'card-elevated': 'var(--shadow-tile-lg)',
        'premium-glow': 'var(--shadow-brutal)',
        brutal: 'var(--shadow-brutal)',
        'brutal-sm': 'var(--shadow-brutal-sm)',
        'brutal-lg': 'var(--shadow-brutal-lg)',
        // Invariantes au theme, pour les objets poses sur un aplat pop.
        tile: 'var(--shadow-tile)',
        'tile-sm': 'var(--shadow-tile-sm)',
        'tile-lg': 'var(--shadow-tile-lg)',
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
