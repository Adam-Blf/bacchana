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
  // Paire de marque « Tirage de nuit », arretee le 2026-08-30 et RESERVEE a
  // Bacchana dans ~/.claude/design/fonts-registry.json : Big Shoulders
  // Display (display condense a chasse etroite, qui tient un titre de
  // capitales sur deux lignes dans 350 points) + Chivo (grotesque a chiffres
  // tabulaires, indispensable a une colonne de scores).
  // Anton et Bricolage Grotesque ont ete liberees en quittant le
  // neobrutalisme : leurs fichiers restent dans public/fonts tant que la
  // reprise des composants n'est pas finie, et se suppriment apres.
  // ATTENTION au nom : Google a renomme la famille « Big Shoulders Display »
  // en « Big Shoulders ». Figma affiche encore l'ancien nom, la fonderie sert
  // le nouveau. Le @font-face de src/index.css declare la famille sous
  // l'ANCIEN nom pour que le fichier Figma et le code parlent pareil.
  { id: 'big-shoulders', variants: ['700', '900'] },
  { id: 'chivo', variants: ['regular', '500', '700'] },
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
