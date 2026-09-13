/**
 * Lecture des jetons de couleur, et calcul de contraste. Source unique.
 *
 * Extrait de `check_contrast.mjs` le 2026-08-31, quand le nuancier a eu besoin
 * des memes valeurs. Recopier le lecteur aurait mis DEUX interpretations de
 * `tokens.css` dans le depot, et l'histoire de ce projet dit ce qui arrive
 * ensuite : une garde qui gardait une seconde copie en dur des couleurs de la
 * roue s'est retrouvee verte sur une palette morte. Un seul lecteur, un seul
 * calcul, et le fichier de jetons reste la seule verite.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CHEMIN_JETONS = join(__dirname, '..', '..', 'src', 'styles', 'tokens.css')

/** Extrait le contenu d'un bloc CSS `selecteur { ... }` par comptage d'accolades. */
export function extraireBloc(source, selecteur) {
  const debut = source.indexOf(selecteur)
  if (debut === -1) throw new Error(`Bloc introuvable dans tokens.css : ${selecteur}`)
  const ouvrante = source.indexOf('{', debut)
  let profondeur = 0
  let i = ouvrante
  for (; i < source.length; i++) {
    if (source[i] === '{') profondeur++
    if (source[i] === '}') {
      profondeur--
      if (profondeur === 0) break
    }
  }
  return source.slice(ouvrante + 1, i)
}

function normaliserHex(hex) {
  return hex.length === 9 ? hex.slice(0, 7) : hex
}

/**
 * Les proprietes `--color-*` d'un bloc.
 *
 * Accepte l'hexadecimal ET `rgba()`. Une valeur semi-transparente est conservee
 * telle quelle et composee plus tard sur son fond reel : une couleur a quinze
 * pour cent d'opacite n'a pas de contraste en soi, elle n'en a qu'une fois
 * posee. Ignorer l'alpha a deja laisse passer un filet a 1,54:1.
 */
export function extraireJetons(bloc) {
  const jetons = {}
  const reHex = /--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g
  let m
  while ((m = reHex.exec(bloc))) jetons[m[1]] = normaliserHex(m[2])

  const reRgba = /--color-([a-z0-9-]+):\s*rgba?\(([^)]+)\)\s*;/g
  while ((m = reRgba.exec(bloc))) {
    const parts = m[2].split(',').map((v) => v.trim())
    if (parts.length < 3) continue
    const [r, g, b] = parts.slice(0, 3).map(Number)
    if ([r, g, b].some(Number.isNaN)) continue
    const alpha = parts.length > 3 ? Number(parts[3]) : 1
    jetons[m[1]] = { r, g, b, alpha: Number.isNaN(alpha) ? 1 : alpha }
  }
  return jetons
}

/** Compose une couleur semi-transparente sur son fond, et rend un hexadecimal. */
export function aplatir(valeur, fondHex) {
  if (typeof valeur === 'string') return valeur
  const bg = fondHex.replace('#', '')
  const br = parseInt(bg.slice(0, 2), 16)
  const bgc = parseInt(bg.slice(2, 4), 16)
  const bb = parseInt(bg.slice(4, 6), 16)
  const melange = (c, b) => Math.round(c * valeur.alpha + b * (1 - valeur.alpha))
  const hex = (n) => n.toString(16).padStart(2, '0')
  return `#${hex(melange(valeur.r, br))}${hex(melange(valeur.g, bgc))}${hex(melange(valeur.b, bb))}`
}

function canal(c) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

/** Le ratio de contraste WCAG 2.1 entre deux couleurs opaques. */
export function contraste(hexA, hexB) {
  const lA = luminance(hexA)
  const lB = luminance(hexB)
  const [clair, sombre] = lA >= lB ? [lA, lB] : [lB, lA]
  return (clair + 0.05) / (sombre + 0.05)
}

/**
 * Les trois themes, jetons resolus.
 *
 * Le sombre et le daltonien HERITENT du clair puis le surchargent, exactement
 * comme la cascade CSS : un jeton absent d'un bloc n'est pas absent de l'ecran,
 * il vaut la valeur de `:root`.
 */
export function lireThemes() {
  const css = readFileSync(CHEMIN_JETONS, 'utf-8')
  const clair = extraireJetons(extraireBloc(css, ':root {'))
  return {
    clair,
    sombre: { ...clair, ...extraireJetons(extraireBloc(css, "[data-theme='dark'] {")) },
    daltonien: { ...clair, ...extraireJetons(extraireBloc(css, "[data-theme='daltonien'] {")) },
    /**
     * Le panneau de profondeur, qui REDEFINIT ses jetons dans sa portee.
     *
     * Sans lui, une planche de reference mesure l'encre du THEME contre le fond
     * du PANNEAU - deux valeurs qui ne se rencontrent jamais a l'ecran. La
     * premiere version du nuancier annoncait ainsi 1,00:1 sur un panneau
     * parfaitement lisible, ce qui est le meilleur moyen de faire ignorer la
     * planche entiere.
     */
    profond: { ...clair, ...extraireJetons(extraireBloc(css, '.contexte-profond {')) },
  }
}
