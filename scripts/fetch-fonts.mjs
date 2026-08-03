// Vendors brand fonts locally (no-CDN rule) - reproducible asset script.
// Downloads latin woff2 files via the google-webfonts-helper API (static
// weights) and, for variable fonts like Fraunces, directly via the Google
// Fonts CSS2 API + gstatic, into public/fonts/. Usage: node scripts/fetch-fonts.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'fonts')
mkdirSync(outDir, { recursive: true })

const API = 'https://gwfh.mranftl.com/api/fonts'

const FONTS = [
  // Paire de marque avec du caractère (jamais de police basique) :
  // Anton (display condensé, esprit enseigne peinte de taverne, graisse
  // unique 400 qui pèse comme un Black) + Bricolage Grotesque (grotesque
  // à forte personnalité pour l'UI et le corps).
  { id: 'anton', variants: ['regular'] },
  { id: 'bricolage-grotesque', variants: ['regular', '500', '600', '700'] },
  // Space Mono : reservee au ticket de caisse de l'addition (element
  // signature) - la mono maison, jamais JetBrains ni IBM Plex.
  { id: 'space-mono', variants: ['regular', '700'] },
]

for (const font of FONTS) {
  try {
    const meta = await (await fetch(`${API}/${font.id}?subsets=latin`)).json()
    for (const variant of meta.variants) {
      if (!font.variants.includes(variant.id)) continue
      const url = variant.woff2
      const name = `${font.id}-latin-${variant.id}.woff2`
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
      writeFileSync(join(outDir, name), buf)
      console.log(`ok ${name} (${(buf.length / 1024).toFixed(0)} kB)`)
    }
  } catch (err) {
    // Idempotent : un host flaky (gwfh l'est par intermittence) ne doit pas
    // faire echouer tout le script si le fichier est deja present localement.
    console.error(`skip ${font.id} (fetch failed) : ${err.message ?? err}`)
  }
}

// Fraunces : police variable (axe opsz), pas toujours bien exposee par l'API
// gwfh statique. Fallback direct sur l'API CSS2 officielle de Google Fonts +
// gstatic (source du fichier reste Google Fonts, pas un CDN tiers custom - le
// woff2 est ensuite servi en local depuis public/fonts/, zero appel CDN au
// runtime de l'app).
const VARIABLE_FONTS = [
  // Reservee aux tres gros titres (hero, ecran a-propos), en complement du
  // display Anton. Graisse black uniquement, jamais en petit.
  { id: 'Fraunces', axes: 'opsz,wght@144,900', slug: 'fraunces', variant: '900' },
  { id: 'Fraunces', axes: 'ital,opsz,wght@1,144,900', slug: 'fraunces', variant: '900italic' },
]

// Google ne sert le woff2 (plutot que ttf) qu'aux user-agents modernes
// declares : un UA Chrome complet est necessaire, un fragment partiel bascule
// sur ttf sans le decoupage par sous-ensemble (donc sans bloc "/* latin */").
const MODERN_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

for (const font of VARIABLE_FONTS) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${font.id}:${font.axes}&display=swap`, {
        headers: { 'user-agent': MODERN_UA },
      })
    ).text()
    const latinBlock = css.split('/* latin */')[1] ?? css
    const match = latinBlock.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)
    if (!match) {
      console.error(`skip ${font.id} (aucun woff2 latin trouve)`)
      continue
    }
    const buf = Buffer.from(await (await fetch(match[1])).arrayBuffer())
    const name = `${font.slug}-latin-${font.variant}.woff2`
    writeFileSync(join(outDir, name), buf)
    console.log(`ok ${name} (${(buf.length / 1024).toFixed(0)} kB)`)
  } catch (err) {
    console.error(`skip ${font.id} (fetch failed) : ${err.message ?? err}`)
  }
}

console.log('done')
