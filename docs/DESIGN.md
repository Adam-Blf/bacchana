# La Taverne - Direction artistique

Version 2 - 2026-08-02. Remplace la DA v1, archivée dans
l'historique git. La source de vérité détaillée est
`design-system/la-taverne/MASTER.md` ; ce document en est le résumé durable.

## Concept

Taverne néobrutaliste : papier crème, encre noire, aplats pop, ombres dures.
Le comptoir comme scène de jeu - les cartes à jouer restent des objets
physiques blancs dans les deux thèmes. Mode sombre "chandelle" : bois brûlé,
crème chaude, orange braise.

## Palette

Voir `design-system/la-taverne/MASTER.md` (section 3) et
`src/styles/tokens.css` (canaux RGB, thème `[data-theme='dark']`).
Accent de marque : orange `#FF5C00` (token historique `neon`).

Interdits : dégradés violets, or décoratif hors premium, AI aesthetic générique.

## Typographie (self-hosted woff2, subset latin, font-display swap)

- **Anton** (400, pèse comme un Black) - titres, noms de modes, compteurs
  géants. Uppercase, esprit enseigne peinte de taverne.
- **Bricolage Grotesque** (400, 500, 600, 700) - UI, corps, boutons.
  Grotesque à forte personnalité, anti AI-slop.
- **Space Mono** (400, 700) - réservée au ticket de caisse de l'addition.
  `tabular-nums` sur tous les chiffres.

Interdits : toute police basique (Inter, Arial, Roboto par défaut, Montserrat,
Poppins), IBM Plex Mono, JetBrains Mono. Jamais de police via CDN.

## Signature par écran

- **Welcome (La tablée)** : enregistrement des joueurs, slogan "Les meilleurs
  jeux de soirée, servis au comptoir."
- **Hub** : grille de tuiles pop, sceau de cire sur le premium, bascule de thème.
- **Game (Le Coupe-Gorge)** : carte à jouer géante, tirage en touchant le paquet.
- **Recap (L'addition)** : ticket de caisse Space Mono, bords crantés,
  faux code-barres - élément signature de fin de partie.

## Motion

Framer Motion. 150-300ms UI, 600ms flip de carte. `prefers-reduced-motion`
respecté partout (flip devient fondu). Stagger d'apparition de la grille du hub.

## A11y

Cibles 44px min, focus visible (ring orange), contraste AA, ARIA sur cartes et
modales, safe-area-insets, deux thèmes (clair par défaut, sombre chandelle).
