/**
 * Contraste WCAG 2.1 (luminance relative) - utilisé pour choisir dynamiquement
 * une encre lisible sur un fond dont la couleur n'est pas connue à l'avance
 * (ex. segments de la roulette, qui alternent des aplats).
 *
 * Règle du produit (docs/DESIGN_TOKENS.md, section "Texte sur pop") : tout
 * texte/icône posé sur un aplat clair doit utiliser une encre fixe (jamais
 * `--color-ink`, qui s'inverse avec le thème). Ce module calcule laquelle des
 * deux encres fixes (sombre ou claire) est la plus lisible sur un fond donné,
 * au lieu de la figer en dur - utile si un fond peut varier (clair OU foncé).
 *
 * Même formule que scripts/check_contrast.mjs (dupliquée intentionnellement :
 * l'un tourne en Node ESM pré-build sur tokens.css, l'autre dans l'app - pas
 * assez de logique commune pour justifier un partage cross build-step).
 */

/** Encre sombre fixe (= --color-tile-ink / --color-card-ink). */
export const INK_DARK = '#111111'
/** Encre claire fixe (= --color-ink en thème sombre, crème). */
export const INK_LIGHT = '#f4efe6'

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const full =
    normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized
  const int = parseInt(full, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function channelLuminance(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/** Luminance relative WCAG 2.1 d'une couleur hex. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

/** Ratio de contraste WCAG 2.1 entre deux couleurs hex, toujours >= 1. */
export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA)
  const lB = relativeLuminance(hexB)
  const [lighter, darker] = lA >= lB ? [lA, lB] : [lB, lA]
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Choisit l'encre fixe (sombre ou claire) la plus lisible sur `bgHex`, parmi
 * les deux candidates data (par défaut les encres fixes du design system).
 * Ne devine jamais : calcule le ratio réel des deux options et prend la
 * meilleure.
 */
export function pickForeground(bgHex: string, dark = INK_DARK, light = INK_LIGHT): string {
  const onDark = contrastRatio(dark, bgHex)
  const onLight = contrastRatio(light, bgHex)
  return onDark >= onLight ? dark : light
}
