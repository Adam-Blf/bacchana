// Vendors brand fonts locally (no-CDN rule) - reproducible asset script.
// Downloads latin woff2 files via the google-webfonts-helper API into public/fonts/.
// Usage: node scripts/fetch-fonts.mjs
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

console.log('done')
