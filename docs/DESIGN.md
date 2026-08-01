# La Taverne - Direction artistique Neo-Tokyo Borderland

Version 1 - 2026-08-01. Source des tokens : `la-taverne-content/tokens/tokens.json`.

## Concept

Arène de jeu nocturne inspirée d'Alice in Borderland : ville éteinte, néons rouges,
cartes à jouer géantes comme enjeu central. Pas de casino, pas de feutrine, pas d'or
décoratif. Le noir domine, le rouge signe, la carte blanche est la seule surface claire
de l'écran : c'est l'élément signature.

## Palette

| Token | Hex | Usage |
|-------|-----|-------|
| bg | #09090B | Fond global (noir profond, jamais #000 pur) |
| bg-raised | #0E0E12 | Fond de zones |
| surface | #15151A | Cards UI, panneaux |
| surface-elevated | #1C1C23 | Modales, éléments flottants |
| ink | #FAFAF7 | Texte principal (contraste 18:1 sur bg) |
| ink-secondary | #A1A1AA | Texte secondaire (7:1) |
| ink-muted | #63636B | Placeholders, désactivé (4.6:1) |
| neon | #FF3B41 | Signature : glows, accents, éléments actifs |
| neon-deep | #DC2626 | Boutons primaires (texte blanc dessus, AA) |
| card-face | #F7F5F0 | Face des cartes à jouer (blanc cassé) |
| card-ink | #111114 | Pips noirs sur carte |
| card-red | #E5323E | Pips rouges sur carte (coeur, carreau) |
| premium | #D4A437 | Badges premium uniquement, jamais décoratif |

Interdits : dégradés violets, or décoratif hors premium, vert feutrine, néon vert/violet legacy.

## Typographie (self-hosted woff2, subset latin, font-display swap)

- **Anton** (400) - titres, noms de modes, compteurs géants. Uppercase, tracking léger négatif.
- **Space Grotesk** (400, 500, 700) - UI, corps, boutons. Grotesque avec du caractère, jamais Inter (anti AI-slop).
- **Space Mono** (400, 700) - valeurs de cartes, penalites, stats, HUD. `tabular-nums`. Jamais IBM Plex Mono ni JetBrains Mono.

Jamais JetBrains Mono. Jamais de police via CDN.

## Signature par écran

- **Welcome** : logo + slogan "52 cartes - 4 règles - 0 pitié." en Anton géant, entrée des joueurs type liste d'inscription à l'arène.
- **Hub** : grille bento des modes, chaque mode une carte sombre avec glyphe néon, tag PREMIUM doré sur les packs payants.
- **Game (Borderland)** : la carte blanche géante au centre, halo néon rouge, fond noir. HUD minimal en Plex Mono.
- **Recap** : podium, stats en tabular-nums.

## Motion

Framer Motion. 150-300ms UI, 600ms flip de carte. `prefers-reduced-motion` respecté
partout (flip devient fondu). Stagger d'apparition de la grille du hub.

## A11y

Cibles 44px min, focus visible (ring neon), contraste AA vérifié ci-dessus,
ARIA sur cartes et modales, safe-area-insets, dark only (l'app est nocturne par nature,
pas de mode clair en v1).
