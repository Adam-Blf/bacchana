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
  // Paire festive issue des classiques du design d'apps mobiles :
  // Montserrat (display urbain, graisses lourdes) + Poppins (géométrique
  // chaleureuse, grande hauteur d'x) - 2 familles max, réglage tabular-nums
  // pour les compteurs.
  { id: 'montserrat', variants: ['800', '900'] },
  { id: 'poppins', variants: ['regular', '500', '600', '700'] },
  // Space Mono : reservee au ticket de caisse de l'addition (element
  // signature) - la mono maison, jamais JetBrains ni IBM Plex.
  { id: 'space-mono', variants: ['regular', '700'] },
]

for (const font of FONTS) {
  const meta = await (await fetch(`${API}/${font.id}?subsets=latin`)).json()
  for (const variant of meta.variants) {
    if (!font.variants.includes(variant.id)) continue
    const url = variant.woff2
    const name = `${font.id}-latin-${variant.id}.woff2`
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
    writeFileSync(join(outDir, name), buf)
    console.log(`ok ${name} (${(buf.length / 1024).toFixed(0)} kB)`)
  }
}
console.log('done')
