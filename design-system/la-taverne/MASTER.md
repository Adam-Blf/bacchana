# La Taverne — Brand book & design system

> Source de vérité du design. Les valeurs vivent dans `src/styles/tokens.css`
> (+ miroir hexadécimal dans `tailwind.config.js`). Tout écart entre ce document
> et les tokens est un bug de documentation.

## 1. La marque

**Nom** : La Taverne
**Pitch** : Les meilleurs jeux de soirée, réunis dans une seule app.
**Promesse** : tu sors ton téléphone, la soirée démarre. Pas de matériel, pas de
règles à lire pendant vingt minutes, pas d'écran de pub entre deux fous rires.

**Voix de marque** : celle du pote qui anime la table. Tutoiement systématique,
phrases courtes, humour complice, jamais moqueur ni vulgaire. On dit « pénalité »,
jamais « verre », « shot » ni aucune marque d'alcool (règle store-safe absolue —
la table décide dans la vraie vie de ce que vaut une pénalité).

**Wordmark** : « La Taverne » en Montserrat Black, « Taverne » en orange accent avec
ombre portée dure. Logo : deux verres qui trinquent (orange + jaune), éclat
« tchin » en étoile, contours encre épais — voir `public/icon.svg`.

## 2. Direction artistique — néobrutalisme

Références : aplats vifs très contrastés, bordures encre épaisses (2 px),
ombres portées franches jamais floutées, formes géométriques (étoiles, badges),
typographie massive, coins peu arrondis. L'interface doit donner l'impression
d'un jeu de société physique posé sur la table.

### Les 5 règles d'or
1. **Toute surface interactive** porte `border-2 border-ink` + une ombre dure
   (`shadow-brutal` / `brutal-sm` / `brutal-lg`).
2. **L'état pressé écrase l'ombre** : `active:translate-x/y` de la valeur de
   l'ombre + `active:shadow-none`. Jamais de scale-only.
3. **Jamais de flou** : pas de drop-shadow douce, pas de glassmorphism. Le seul
   flou toléré est le halo d'ambiance décoratif d'arrière-plan (`bg-neon/[0.05]`).
4. **Une couleur d'aplat par carte/tuile**, texte encre par-dessus. Le blanc
   (`surface`) est un aplat comme un autre.
5. **Le crème est le papier, l'encre est le stylo** : fond `#FFF9F0`, tout le
   texte courant en `#111111`.

## 3. Palette

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FFF9F0` | Fond papier crème |
| `bg-raised` | `#FFF3E0` | Fond secondaire |
| `surface` | `#FFFFFF` | Cartes, boutons secondaires |
| `surface-elevated` | `#FFEFD6` | Modales, bandeaux |
| `ink` | `#111111` | Texte, bordures, ombres |
| `ink-secondary` | `#44444A` | Texte secondaire |
| `ink-muted` | `#6B6B70` | Légendes (min. AA sur crème) |
| `neon` | `#FF5C00` | **Accent de marque** (CTA, logo) — nom de token historique conservé |
| `neon-deep` / `neon-soft` | `#E24E00` / `#FF8A3D` | Déclinaisons de l'accent |
| `pop-yellow` | `#FFD029` | Aplat tuile / surbrillance |
| `pop-pink` | `#FF6FB2` | Aplat tuile |
| `pop-blue` | `#6E9BFF` | Aplat tuile (éclairci pour AA avec texte encre) |
| `pop-lime` | `#9BE94C` | Aplat tuile / succès de jeu |
| `card-face` / `card-ink` / `card-red` | `#FFFFFF` / `#111111` / `#E5323E` | Cartes à jouer |
| `premium` | `#A87718` | Or premium (assombri pour AA sur clair) |
| `success` / `warning` | `#1B8A5A` / `#B45309` | États |

Contraste : texte encre sur tous les aplats ≥ AA. `ink-muted` réservé aux corps
≥ 12 px. Ne jamais poser du texte orange < 18 px sur crème.

## 4. Typographie

Deux familles Google Fonts, **auto-hébergées** en woff2 (`public/fonts/`,
récupérées par `scripts/fetch-fonts.mjs`) — jamais de CDN :

| Rôle | Famille | Graisses | Usage |
|---|---|---|---|
| Display | **Montserrat** | 800 / 900 | Titres, noms de modes, compteurs géants — toujours en capitales, `tracking-tight`, graisse Black |
| Texte/UI | **Poppins** | 400 / 500 / 600 / 700 | Corps, boutons, formulaires |
| HUD | **Poppins** + `tabular-nums` | 500 / 700 | Scores, valeurs de cartes (le slot `font-mono` mappe sur Poppins : 2 familles max) |

Interdits : Inter, IBM Plex, JetBrains Mono, Orbitron, Archivo/Space Grotesk
(reliquats d'anciennes identités), et tout `@import` de CDN. Préloads :
Montserrat 900 + Poppins regular uniquement (`index.html`).

## 5. Composants

- **Button** (`src/components/ui/Button.tsx`) : `primary` = aplat orange,
  `secondary` = blanc (hover jaune), `ghost` = transparent. Min 44 px de haut.
- **QuitButton** (`ui/QuitButton.tsx`) : bouton quitter partagé, `fixed top-safe
  left-4 z-controls`, 44×44, aria français. Obligatoire sur tout écran de jeu.
- **ConfirmDialog** (`ui/ConfirmDialog.tsx`) : confirmation destructive, se ferme
  au retour matériel (via `useBackClose`) et à Escape.
- **PlayingCard** : pips réels 2–10, figures V/D/R en miroir avec emblème
  (épée/joyau/couronne), Joker étoilé, dos rayé signature (`public/card-back.svg`).
- **ModeTile** (hub) : aplat `TILE_COLORS` en rotation, icône Lucide encre.

## 6. Ombres, radius, z-index

- Ombres : `--shadow-brutal-sm` 3px, `--shadow-brutal` 4px, `--shadow-brutal-lg`
  6px — toujours `0` de flou, toujours encre.
- Radius : `card` 12 px, `control` 10 px, `pill` 9999.
- Échelle z (tokens Tailwind) : contenu < `z-banner` (30, cookies) <
  `z-controls` (40, boutons fixes) < `z-overlay` (50, pickers) < `z-modal` (60).
  Le bandeau cookies ne recouvre **jamais** un bouton de navigation.

## 7. Safe-area & navigation

- Utilitaires plugin Tailwind : `top-safe`, `pt-safe`, `pb-safe`, `pt-safe-N`
  (inset + spacing). Tout élément `fixed` en haut d'écran utilise `top-safe`.
- Navigation : couche historique (`src/core/navigation/history.ts`). Le retour
  matériel ferme d'abord l'overlay ouvert, puis remonte l'écran, puis affiche le
  toast « Appuie encore pour quitter ». Toute nouvelle modale **doit** utiliser
  `useBackClose`.

## 8. Motion

- Framer Motion, `MotionConfig reducedMotion="user"` global + media query CSS.
- Entrées : spring damping 22–26. Presses : translation vers l'ombre (pas de
  scale suspendu). Flip de carte : 600 ms, `initial={false}` (jamais de flash de
  la face).

## 9. Accessibilité (checklist de sortie)

- [x] Zoom pinch actif (pas de `user-scalable=no`)
- [x] Cibles tactiles ≥ 44 px
- [x] `aria-live="polite"` sur les résultats de jeu
- [x] Modales : fermeture Escape + retour matériel + croix visible
- [x] Labels français accentués (« Dame de Cœur », « Carte face cachée »)
- [x] Contrastes AA sur la palette claire
