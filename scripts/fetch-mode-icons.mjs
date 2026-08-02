// Vendorise les icones des modes en local (regle zero CDN) - script reproductible.
// Source : Icons8, style "Hatch" (formes pleines et epaisses, esprit gravure), choisi
// via le MCP icons8 parce que les jeux d'icones filaires generiques ne tiennent pas
// la DA neobrutaliste de La Taverne.
//
// Licence : plan Icons8 gratuit, attribution obligatoire - le lien vers icons8.com
// figure dans les mentions legales de l'app (src/components/legal/MentionsScreen.tsx).
//
// Usage: node scripts/fetch-mode-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons', 'modes')
mkdirSync(outDir, { recursive: true })

// Cle = valeur du champ `icon` d'un mode dans modeRegistry.ts (identifiant technique,
// inchange), valeur = id Icons8 du style hatch.
const ICONS = {
  Spade: 'gbWhbq6znvTd',      // carte a jouer - Le Coupe-Gorge
  Brain: 'ynJJpl0grKW6',      // cerveau - Quitte ou Trinque
  Medal: 'ZdmUKWCpj6JV',      // medaille - Le Tableau d'Honneur
  Megaphone: 'WCCI8L2xmjKt',  // megaphone - La Criee
  Crown: 'dv11MNIjLZvH',      // couronne medievale - Le Taulier
  Flame: '6kJL0jix2nVs',      // flamme - Action ou Verite
  HandMetal: 'xMYTX1mcJNWD',  // main - Je n'ai jamais
  Users: 'QN1t7yytS1zq',      // groupe - Qui de nous
  Scale: 'buSCkgPTDWHw',      // balance - C'est un 10 mais
  Heart: '3mCZ36yWoNsf',      // coeur - Tu preferes
  Timer: 'ggkq7ZKoggie',      // chronometre - 7 Secondes
  Gavel: 'Pay3czT9Oynm',      // justice - Le Pilori
  Disc3: 'wUAb4st0wH3H',      // roulette - La Roue du Destin
}

const SIZE = 240

for (const [glyph, id] of Object.entries(ICONS)) {
  const url = `https://img.icons8.com/?id=${id}&format=png&size=${SIZE}`
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`echec ${glyph} (${id}) : ${res.status}`)
    continue
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const name = `${glyph.toLowerCase()}.png`
  writeFileSync(join(outDir, name), buf)
  console.log(`ok ${name} (${(buf.length / 1024).toFixed(1)} kB)`)
}
console.log('done')
