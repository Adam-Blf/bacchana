#!/usr/bin/env node
/**
 * Garde mécanique de contraste WCAG 2.1 - lit les vraies valeurs de tokens
 * depuis src/styles/tokens.css (thème clair `:root` + thème sombre
 * `[data-theme='dark']`), calcule le ratio de contraste réel pour chaque
 * paire premier plan / arrière-plan effectivement utilisée dans les
 * composants (voir la liste PAIRS ci-dessous, chaque entrée référence le
 * fichier/composant d'origine), et échoue (exit 1) si une paire tombe sous
 * le seuil WCAG applicable.
 *
 * Contexte : bug réel corrigé le 2026-08-04 - du texte `--color-ink` posé
 * sur les aplats `aplat-1`/`aplat-4` tombait à ~1.2:1 en thème sombre
 * (`--color-ink` s'inverse avec le thème, les pop-* restent clairs dans
 * les deux thèmes). Ce script transforme "on l'a vérifié une fois" en
 * garde permanente : toute régression (nouveau composant qui repose du
 * texte thémable sur un pop, ou qui assombrit un pop sous le seuil) casse
 * le build.
 *
 * Usage : node scripts/check_contrast.mjs
 * Branché dans `npm test` (voir package.json) et la CI (.github/workflows/ci.yml).
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKENS_PATH = join(__dirname, '..', 'src', 'styles', 'tokens.css')

// ============================================================
// 1. Lecture des tokens réels (pas de valeurs recopiées à la main)
// ============================================================

const css = readFileSync(TOKENS_PATH, 'utf-8')

/** Extrait le contenu d'un bloc CSS `selector { ... }` par comptage d'accolades. */
function extractBlock(source, selector) {
  const start = source.indexOf(selector)
  if (start === -1) throw new Error(`Bloc introuvable dans tokens.css : ${selector}`)
  const braceOpen = source.indexOf('{', start)
  let depth = 0
  let i = braceOpen
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}') {
      depth--
      if (depth === 0) break
    }
  }
  return source.slice(braceOpen + 1, i)
}

/** Extrait les custom properties --color-xxx d'un bloc CSS.
 *
 * Accepte l'hexadecimal ET la notation rgba(). Les valeurs semi-transparentes
 * sont conservees telles quelles et composees plus tard sur leur fond reel :
 * une couleur a 15 pour cent d'opacite n'a pas de contraste en soi, elle n'en a
 * qu'une fois posee. Ignorer l'alpha, c'est ce qui a laisse passer un filet a
 * 1.54:1 sur un composant d'interface. */
function extractColorTokens(block) {
  const tokens = {}
  const reHex = /--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g
  let m
  while ((m = reHex.exec(block))) {
    tokens[m[1]] = normalizeHex(m[2])
  }
  const reRgba = /--color-([a-z0-9-]+):\s*rgba?\(([^)]+)\)\s*;/g
  while ((m = reRgba.exec(block))) {
    const parts = m[2].split(',').map((v) => v.trim())
    if (parts.length < 3) continue
    const [r, g, b] = parts.slice(0, 3).map(Number)
    if ([r, g, b].some(Number.isNaN)) continue
    const alpha = parts.length > 3 ? Number(parts[3]) : 1
    tokens[m[1]] = { r, g, b, alpha: Number.isNaN(alpha) ? 1 : alpha }
  }
  return tokens
}

/** Compose une couleur semi-transparente sur son fond, et rend un hexadecimal.
 *
 * C'est le seul calcul honnete : l'oeil ne voit jamais la couleur declaree,
 * il voit le resultat de sa composition sur ce qu'il y a derriere. */
function flatten(value, backdropHex) {
  if (typeof value === 'string') return value
  const bg = backdropHex.replace('#', '')
  const br = parseInt(bg.slice(0, 2), 16)
  const bgc = parseInt(bg.slice(2, 4), 16)
  const bb = parseInt(bg.slice(4, 6), 16)
  const mix = (c, b) => Math.round(c * value.alpha + b * (1 - value.alpha))
  const hex = (n) => n.toString(16).padStart(2, '0')
  return `#${hex(mix(value.r, br))}${hex(mix(value.g, bgc))}${hex(mix(value.b, bb))}`
}

function normalizeHex(hex) {
  return hex.length === 9 ? hex.slice(0, 7) : hex // ignore un éventuel canal alpha 8 chiffres
}

const lightBlock = extractBlock(css, ':root {')
const darkBlock = extractBlock(css, "[data-theme='dark'] {")
// Le troisième thème n'était pas lu. Ajouté le 2026-08-31 : `tokens.css` porte
// 70 lignes de bloc daltonien depuis le 30/08, et aucune garde ne les mesurait.
const daltonienBlock = extractBlock(css, "[data-theme='daltonien'] {")

const LIGHT = extractColorTokens(lightBlock)
const DARK = { ...LIGHT, ...extractColorTokens(darkBlock) } // le sombre hérite, puis surcharge
const DALTONIEN = { ...LIGHT, ...extractColorTokens(daltonienBlock) }

// Il y avait ici un bloc `FIXED` qui redéclarait `card-face: '#ffffff'` et
// `card-ink: '#111111'` en dur, avec un commentaire disant qu'il fallait le
// resynchroniser à la main. Il ne l'a pas été : les vraies valeurs sont
// `#fff9f0` et `#2a1140` depuis la refonte du 30/08. Il était inoffensif parce
// que `{...FIXED, ...LIGHT}` le surchargeait aussitôt, mais c'est exactement la
// forme d'une garde qui recopie sa cible et finit par mesurer une palette
// morte. Supprimé : les deux jetons sont dans `tokens.css`, on les y lit.

const THEMES = {
  clair: LIGHT,
  sombre: DARK,
  daltonien: DALTONIEN,
}

// ============================================================
// 2. Formule de contraste WCAG 2.1 (luminance relative)
// ============================================================

function hexToRgb(hex) {
  const int = parseInt(hex.replace('#', ''), 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function channelLuminance(c) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexA)
  const lB = relativeLuminance(hexB)
  const [lighter, darker] = lA >= lB ? [lA, lB] : [lB, lA]
  return (lighter + 0.05) / (darker + 0.05)
}

const THRESHOLDS = { normal: 4.5, large: 3.0,
  // WCAG 1.4.11 : un composant d'interface non textuel, bordure comprise,
  // doit atteindre 3:1 contre son fond adjacent.
  ui: 3,
}

// ============================================================
// 3. Paires réellement utilisées dans le produit (fg/bg + niveau + origine)
// ============================================================
// `theme: 'both'` = paire vérifiée dans les deux thèmes (fg et/ou bg suivent
// le thème). `theme: 'clair'|'sombre'` = paire figée dans un seul thème
// (ex. objet physique bg-card-face, ou aplat WHEEL_COLORS hors tokens).

const PAIRS = [
  // --- Texte de base sur les fonds de page (baseline, régression globale) ---
  { fg: 'ink', bg: 'bg', level: 'normal', theme: 'both', usage: 'texte body (index.css)' },
  { fg: 'ink-secondary', bg: 'bg', level: 'normal', theme: 'both', usage: 'texte secondaire' },
  { fg: 'ink-muted', bg: 'bg', level: 'normal', theme: 'both', usage: 'légendes' },
  { fg: 'orange-ink', bg: 'bg', level: 'normal', theme: 'both', usage: 'liens/labels orange' },
  { fg: 'danger', bg: 'bg', level: 'normal', theme: 'both', usage: 'texte erreur/danger' },
  { fg: 'premium', bg: 'bg', level: 'normal', theme: 'both', usage: 'badges premium' },
  { fg: 'success', bg: 'bg', level: 'normal', theme: 'both', usage: 'texte succès' },
  { fg: 'warning', bg: 'bg', level: 'normal', theme: 'both', usage: 'texte warning' },
  // --- `depth` a CHANGE DE ROLE le 2026-08-30 ---
  // Dans le neobrutalisme, depth etait une ENCRE : un lavande pose sur le
  // fond, d'ou les deux paires depth/bg et depth/surface-elevated qui
  // exigeaient 4,5:1. Dans « Tirage de nuit », depth est un FOND - le pourpre
  // profond des panneaux poses sur l'aplat. Un fond n'a pas a contraster avec
  // le fond voisin : c'est son FILET qui porte la limite, au titre du critere
  // 1.4.11. Garder les anciennes paires reclamait l'impossible, et une garde
  // qui reclame l'impossible finit desarmee.
  // Ce qu'on controle desormais, c'est ce qu'on POSE dessus.
  // Un panneau `depth` bascule ses jetons via .contexte-profond (voir
  // tokens.css) : ce qui vit dedans n'emploie donc PAS les encres de la page.
  // On mesure les valeurs du panneau, litterales et identiques dans les trois
  // themes puisque le panneau est sombre partout.
  { fg: 'ink (panneau)', fgHex: '#fff9f0', bg: 'depth', level: 'normal', theme: 'both', usage: 'texte dans .contexte-profond' },
  { fg: 'ink-secondary (panneau)', fgHex: '#dccfea', bg: 'depth', level: 'normal', theme: 'both', usage: 'corps de texte dans .contexte-profond' },
  { fg: 'surimpression (panneau)', fgHex: '#ffd029', bg: 'depth', level: 'normal', theme: 'both', usage: 'accent dans .contexte-profond' },
  { fg: 'filet (panneau)', fgHex: '#fff9f0', bg: 'depth', level: 'ui', theme: 'both', usage: 'filet gravé du panneau (critère 1.4.11)' },

  // --- Les jetons neufs du systeme ---
  { fg: 'sur-surimpression', bg: 'surimpression', level: 'normal', theme: 'both', usage: "la SEULE encre admise sur l'aplat d'accent" },
  { fg: 'filet-clair', bg: 'bg', level: 'ui', theme: 'both', usage: 'filet gravé sur le fond de page (critère 1.4.11)' },
  { fg: 'filet-clair', bg: 'surface-elevated', level: 'ui', theme: 'both', usage: 'filet gravé sur une surface élevée' },

  // --- Hiérarchie d'élévation en thème sombre (modales/cartes/bandes) ---
  { fg: 'ink', bg: 'surface', level: 'normal', theme: 'sombre', usage: 'texte sur cartes' },
  { fg: 'ink', bg: 'surface-elevated', level: 'normal', theme: 'sombre', usage: 'texte sur modales' },
  { fg: 'ink-secondary', bg: 'surface-elevated', level: 'normal', theme: 'sombre', usage: 'corps de texte modale (ContestModal, GameBoard)' },
  // Exception documentée (docs/DESIGN_TOKENS.md section 3.3) : ink-muted sur
  // surface-elevated est réservé aux icônes/libellés décoratifs >= 18px, donc
  // seuil "large", jamais au texte courant.
  { fg: 'ink-muted', bg: 'surface-elevated', level: 'large', theme: 'sombre', usage: 'icônes/libellés décoratifs modale (large uniquement)' },

  // --- Cartes à jouer (objet physique, fond blanc fixe dans les 2 thèmes) ---
  { fg: 'card-ink', bg: 'card-face', level: 'normal', theme: 'clair', usage: 'PlayingCard, QuizScreen, AuctionScreen, TribunalScreen' },
  { fg: 'card-red', bg: 'card-face', level: 'normal', theme: 'clair', usage: 'pips rouges + RouletteScreen résultat' },
  // Encres FIXES posees sur une face de carte, ajoutees le 2026-08-31. Elles
  // existent parce que les legendes et les penalites utilisaient auparavant
  // `ink-muted` et `danger`, qui s'inversent avec le theme alors que la face
  // reste creme : le texte de la penalite tombait a 1,94:1 en theme sombre.
  // Seuil vise 7:1 et non 4,5 - c'est du texte lu a voix haute, a bout de bras,
  // dans une piece sombre.
  { fg: 'card-ink-muted', bg: 'card-face', level: 'normal', theme: 'both', usage: 'legendes sur face de carte (AuctionScreen, RankingScreen, TribunalScreen)' },
  { fg: 'card-danger', bg: 'card-face', level: 'normal', theme: 'both', usage: 'penalite annoncee sur la carte (PromptGameScreen)' },

  // --- Texte posé sur un aplat pop plein (le bug corrigé) ---
  { fg: 'tile-ink', bg: 'aplat-1', level: 'normal', theme: 'both', usage: 'Button secondary hover, HubScreen options, QuizScreen, CustomRulesScreen, AuctionScreen' },
  { fg: 'tile-ink', bg: 'aplat-4', level: 'normal', theme: 'both', usage: 'AuctionScreen, QuizScreen, RankingScreen, CustomRulesScreen, HubScreen' },
  { fg: 'tile-ink', bg: 'aplat-2', level: 'normal', theme: 'both', usage: 'RankingScreen, QuizScreen, WouldYouRatherScreen, OnboardingScreen' },
  { fg: 'tile-ink', bg: 'aplat-3', level: 'normal', theme: 'both', usage: 'QuizScreen, RankingScreen, TribunalScreen, WouldYouRatherScreen, OnboardingScreen' },
  // Bordure claire : WCAG 1.4.11 exige 3:1 pour un composant d'interface.
  // A 0.15 d'alpha elle mesurait 1.54:1 et n'etait pas gardee, d'ou une
  // affordance perdue sur l'ecran Reglages, constatee a l'ecran.
  { fg: 'border', bg: 'surface', level: 'ui', theme: 'both', usage: 'Filets de separation, champs de saisie, puces secondaires' },
  // Symboles d'enseigne du hub. Portaient card-red, juste sur une carte
  // blanche mais pas sur bg-surface en theme sombre.
  { fg: 'danger', bg: 'surface', level: 'ui', theme: 'both', usage: 'Symboles de coeur et carreau, HubScreen options' },
]

// Secteurs de la roue. Ils etaient RECOPIES ici en dur, en meme temps qu'ils
// l'etaient dans RouletteScreen : deux copies d'une meme palette divergent au
// premier correctif, et c'est la garde qui devient fausse sans rien dire.
// Depuis le 2026-08-30 le composant lit les jetons pop-*, et la garde les lit
// aussi - une seule source.
const WHEEL_TOKENS = ['aplat-1', 'aplat-2', 'aplat-3', 'aplat-4']
const WHEEL_COLORS = WHEEL_TOKENS.map((t) => THEMES.clair[t])
const WHEEL_PAIRS = WHEEL_COLORS.map((bg, i) => ({
  fg: 'tile-ink',
  fgHex: THEMES.clair['tile-ink'],
  bg: WHEEL_TOKENS[i],
  bgHex: bg,
  level: 'normal',
  theme: 'both',
  // Les secteurs ne portent plus de libellé, mais la paire reste gardée : le
  // pointeur et les séparateurs sont en tile-ink par-dessus ces aplats, et un
  // libellé pourrait y revenir.
  usage: 'RouletteScreen secteurs (WHEEL_COLORS, fixe hors thème)',
}))

// ============================================================
// 4. Évaluation
// ============================================================

const rows = []
let hasFailure = false

function evaluate(pair, themeName, themeTokens) {
  const fgRaw = pair.fgHex ?? themeTokens[pair.fg]
  const bgRaw = pair.bgHex ?? themeTokens[pair.bg]
  if (!fgRaw || !bgRaw) {
    throw new Error(`Token introuvable pour la paire ${pair.fg}/${pair.bg} en thème ${themeName}`)
  }
  // Le fond se compose en premier : un premier plan semi-transparent doit etre
  // pose sur le fond DEJA aplati, sinon on mesure une couleur qui n'existe pas.
  const bgHex = flatten(bgRaw, '#ffffff')
  const fgHex = flatten(fgRaw, bgHex)
  const ratio = contrastRatio(fgHex, bgHex)
  const threshold = THRESHOLDS[pair.level]
  const pass = ratio >= threshold
  if (!pass) hasFailure = true
  rows.push({
    theme: themeName,
    pair: `${pair.fg} / ${pair.bg}`,
    hex: `${fgHex} / ${bgHex}`,
    level: pair.level,
    threshold: threshold.toFixed(1),
    ratio: ratio.toFixed(2),
    pass,
    usage: pair.usage,
  })
}

for (const pair of PAIRS) {
  if (pair.theme === 'both' || pair.theme === 'clair') evaluate(pair, 'clair', THEMES.clair)
  if (pair.theme === 'both' || pair.theme === 'sombre') evaluate(pair, 'sombre', THEMES.sombre)
  // Le daltonien est mesuré sur TOUTES les paires, sans exception de thème.
  // Il hérite de `:root` puis surcharge, donc une paire déclarée `clair` ou
  // `sombre` y existe aussi : la restreindre reviendrait à ne pas la mesurer là
  // où la palette est la plus retouchée. C'est le troisième thème du produit,
  // et jusqu'au 2026-08-31 il n'était mesuré nulle part.
  evaluate(pair, 'daltonien', THEMES.daltonien)
}
for (const pair of WHEEL_PAIRS) {
  evaluate(pair, 'clair/sombre (fixe)', THEMES.clair)
}

// ============================================================
// 5. Rendu du tableau
// ============================================================

const headers = ['Thème', 'Paire', 'Hex', 'Niveau', 'Seuil', 'Ratio', 'Résultat', 'Usage']
const colWidths = headers.map((h, i) =>
  Math.max(
    h.length,
    ...rows.map((r) => String(Object.values(r)[i] ?? '').length)
  )
)

function pad(str, width) {
  return String(str).padEnd(width, ' ')
}

function printRow(values) {
  console.log(values.map((v, i) => pad(v, colWidths[i])).join('  |  '))
}

console.log('\nVérification de contraste WCAG 2.1 (scripts/check_contrast.mjs)\n')
printRow(headers)
printRow(colWidths.map((w) => '-'.repeat(w)))
for (const r of rows) {
  printRow([
    r.theme,
    r.pair,
    r.hex,
    r.level,
    r.threshold,
    r.ratio,
    r.pass ? 'OK' : 'ECHEC',
    r.usage,
  ])
}

const failed = rows.filter((r) => !r.pass)
console.log(
  `\n${rows.length} paires vérifiées, ${failed.length} échec(s), seuils AA (normal 4.5:1, large 3:1).\n`
)

if (hasFailure) {
  console.error('Contraste insuffisant détecté - voir le tableau ci-dessus.')
  process.exit(1)
}

console.log('Toutes les paires passent le seuil WCAG AA applicable.')
