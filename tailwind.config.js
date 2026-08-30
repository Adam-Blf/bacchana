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
        // Bacchana - néobrutalisme. Les couleurs themables passent par les
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

        // Pourpre de marque (logo Bacchana) : profondeur, jamais un aplat
        // général. Réservé aux halos d'ambiance et au sceau "verrouillé" du
        // paywall. Voir tokens.css + docs/DESIGN_TOKENS.md.
        depth: 'rgb(var(--c-depth) / <alpha-value>)',

        // Les cartes à jouer restent blanches dans les deux thèmes : ce sont
        // des objets physiques, pas des surfaces d'interface. card-red est
        // fixe (le rouge d'un pip de carte ne suit pas le thème) mais passe
        // par le canal RGB pour rester une source unique avec tokens.css.
        'card-face': 'rgb(var(--c-card-face) / <alpha-value>)',
        'card-ink': 'rgb(var(--c-card-ink) / <alpha-value>)',
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

        // « Tirage de nuit ». La surimpression est l'accent reel du systeme
        // (`neon` en est un alias historique) ; `sur-surimpression` est la
        // SEULE encre admise par-dessus. Les deux filets portent l'elevation,
        // qui ne passe plus par une ombre.
        surimpression: 'rgb(var(--c-surimpression) / <alpha-value>)',
        'sur-surimpression': 'rgb(var(--c-sur-surimpression) / <alpha-value>)',
        'filet-clair': 'rgb(var(--c-filet-clair) / <alpha-value>)',
        'filet-chaud': 'rgb(var(--c-filet-chaud) / <alpha-value>)',
        appareil: 'rgb(var(--c-appareil) / <alpha-value>)',

        border: 'rgb(var(--c-border-strong) / var(--alpha-border))',
        'border-strong': 'rgb(var(--c-border-strong) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Big Shoulders Display', 'Haettenschweiler', 'Impact', 'sans-serif'],
        sans: ['Chivo', 'system-ui', '-apple-system', 'sans-serif'],
        // Le "mono" du HUD est Chivo + tabular-nums (voir index.css).
        mono: ['Chivo', 'system-ui', 'sans-serif'],
        // Vraie mono, reservee au ticket de caisse (element signature).
        receipt: ['Space Mono', 'Consolas', 'monospace'],
      },
      // Le filet gravé fait 1 point. Le 2 points reste disponible, réservé à
      // l'état pressé et au choix retenu : c'est là qu'un trait plus épais
      // porte une information, pas partout.
      borderWidth: {
        DEFAULT: '1px',
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
        // Le filet gravé remplace l'ombre : « Tirage de nuit » interdit le
        // flou ET l'ombre dure. Les noms historiques restent déclarés, à
        // `none`, pour qu'aucune classe existante ne casse pendant la reprise
        // des composants.
        gravure: 'var(--rule-engraved)',
        'gravure-forte': 'var(--rule-engraved-strong)',
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
