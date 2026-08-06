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
 * sur les aplats `pop-yellow`/`pop-lime` tombait à ~1.2:1 en thème sombre
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

const LIGHT = extractColorTokens(lightBlock)
const DARK = { ...LIGHT, ...extractColorTokens(darkBlock) } // le sombre hérite, puis surcharge

// Tokens fixes non présents dans tokens.css (déclarés en dur dans
// tailwind.config.js car volontairement identiques dans les deux thèmes -
// objets physiques : cartes à jouer). Dupliqués ici pour rester une
// vérification "réelle", pas une supposition - à resynchroniser si
// tailwind.config.js change ces deux valeurs.
const FIXED = {
  'card-face': '#ffffff',
  'card-ink': '#111111',
}

const THEMES = {
  clair: { ...FIXED, ...LIGHT },
  sombre: { ...FIXED, ...DARK },
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
  { fg: 'depth', bg: 'bg', level: 'normal', theme: 'both', usage: 'pourpre de marque (baseline)' },

  // --- Pourpre de profondeur (sceau verrouillé du paywall, sur modale) ---
  { fg: 'depth', bg: 'surface-elevated', level: 'normal', theme: 'both', usage: 'PremiumPaywallModal, icône du sceau verrouillé' },

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

  // --- Texte posé sur un aplat pop plein (le bug corrigé) ---
  { fg: 'tile-ink', bg: 'pop-yellow', level: 'normal', theme: 'both', usage: 'Button secondary hover, HubScreen options, QuizScreen, CustomRulesScreen, AuctionScreen' },
  { fg: 'tile-ink', bg: 'pop-lime', level: 'normal', theme: 'both', usage: 'AuctionScreen, QuizScreen, RankingScreen, CustomRulesScreen, HubScreen' },
  { fg: 'tile-ink', bg: 'pop-pink', level: 'normal', theme: 'both', usage: 'RankingScreen, QuizScreen, WouldYouRatherScreen, OnboardingScreen' },
  { fg: 'tile-ink', bg: 'pop-blue', level: 'normal', theme: 'both', usage: 'QuizScreen, RankingScreen, TribunalScreen, WouldYouRatherScreen, OnboardingScreen' },
  // Bordure claire : WCAG 1.4.11 exige 3:1 pour un composant d'interface.
  // A 0.15 d'alpha elle mesurait 1.54:1 et n'etait pas gardee, d'ou une
  // affordance perdue sur l'ecran Reglages, constatee a l'ecran.
  { fg: 'border', bg: 'surface', level: 'ui', theme: 'both', usage: 'Filets de separation, champs de saisie, puces secondaires' },
  // Symboles d'enseigne du hub. Portaient card-red, juste sur une carte
  // blanche mais pas sur bg-surface en theme sombre.
  { fg: 'danger', bg: 'surface', level: 'ui', theme: 'both', usage: 'Symboles de coeur et carreau, HubScreen options' },
]

// Aplats hors tokens.css (roulette, alternance hex figée, cf RouletteScreen.tsx
// WHEEL_COLORS) : vérifiés séparément car ce ne sont pas des `--color-*`.
const WHEEL_COLORS = ['#FF8A3D', '#FFD029', '#9BE94C', '#6E9BFF']
const WHEEL_PAIRS = WHEEL_COLORS.map((bg, i) => ({
  fg: 'tile-ink',
  fgHex: '#111111',
  bg: `wheel-${i}`,
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
