#!/usr/bin/env node
// Analyse TEMPORAIRE (non commitee) : calcule le ratio WCAG reel de chaque
// combinaison (encre fixe a opacite reduite) x (fond) x (theme) trouvee dans
// le code, pour construire le tableau de defauts et verifier les corrections.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'src', 'styles', 'tokens.css'), 'utf-8')
function extractBlock(source, selector) {
  const start = source.indexOf(selector)
  const braceOpen = source.indexOf('{', start)
  let depth = 0, i = braceOpen
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}') { depth--; if (depth === 0) break }
  }
  return source.slice(braceOpen + 1, i)
}
function extractTokens(block) {
  const t = {}
  const re = /--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g
  let m
  while ((m = re.exec(block))) t[m[1]] = m[2].length === 9 ? m[2].slice(0, 7) : m[2]
  return t
}
const LIGHT = extractTokens(extractBlock(css, ':root {'))
const DARK = { ...LIGHT, ...extractTokens(extractBlock(css, "[data-theme='dark'] {")) }
const FIXED = { 'card-face': '#ffffff', 'card-ink': '#111111', 'tile-ink': '#111111' }
const THEMES = { clair: { ...FIXED, ...LIGHT }, sombre: { ...FIXED, ...DARK } }

function hexToRgb(hex) { const n = parseInt(hex.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
function chan(c) { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
function lum(hex) { const [r, g, b] = hexToRgb(hex); return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b) }
function ratio(a, b) { const la = lum(a), lb = lum(b); const [hi, lo] = la >= lb ? [la, lb] : [lb, la]; return (hi + 0.05) / (lo + 0.05) }
function composite(fgHex, alpha, bgHex) {
  const [fr, fg, fb] = hexToRgb(fgHex)
  const [br, bg, bb] = hexToRgb(bgHex)
  const r = Math.round(fr * alpha + br * (1 - alpha))
  const g = Math.round(fg * alpha + bg * (1 - alpha))
  const b = Math.round(fb * alpha + bb * (1 - alpha))
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

const inks = ['tile-ink', 'card-ink']
const opacities = [60, 70, 80]
const backgrounds = ['aplat-1', 'aplat-2', 'aplat-3', 'aplat-4', 'neon', 'card-face']

console.log('ink/opacite | fond | theme | hex compose | ratio | seuil AA normal (4.5)')
for (const ink of inks) {
  for (const op of opacities) {
    for (const bg of backgrounds) {
      for (const themeName of ['clair', 'sombre']) {
        const T = THEMES[themeName]
        const inkHex = FIXED[ink]
        const bgHex = T[bg]
        if (!bgHex) continue
        const composited = composite(inkHex, op / 100, bgHex)
        const r = ratio(composited, bgHex)
        const pass = r >= 4.5
        console.log(
          `${ink}/${op} | ${bg} | ${themeName} | fg_eff=${composited} | ${r.toFixed(2)} | ${pass ? 'OK' : 'ECHEC'}`
        )
      }
    }
  }
}
