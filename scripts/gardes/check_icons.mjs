#!/usr/bin/env node
/**
 * Garde : le jeu d'icones est complet, d'une seule famille (Reicon), sans reste.
 *
 * HISTORIQUE. Le depot est passe de lucide-react a des masques Icons8, puis a des
 * SVG Phosphor, puis (2026-10-08) a Reicon. Chaque migration a laisse des
 * reliquats que seul un controle mecanique retrouve : appels a un composant
 * supprime, fichiers d'un jeu abandonne, imports qui cassent le typecheck.
 *
 * Quatre controles :
 *   1. chaque nom declare dans `icon-names.ts` a son dessin dans la table
 *      `GLYPHES` d'`Icon.tsx`, et inversement (aucune entree orpheline) ;
 *   2. aucune bibliotheque d'icones concurrente - lucide, Phosphor, Icons8,
 *      heroicons, react-icons - dans `src/`, `scripts/` ni `package.json` ;
 *   3. aucun dossier `public/icons/` : les icones sont des composants, un SVG
 *      servi serait un reliquat de l'ancien systeme de masques CSS ;
 *   4. `reicon-react` est bien declare dans `package.json`.
 *
 * CE QUE CETTE GARDE NE VOIT PAS. Le DESSIN. Elle verifie qu'un nom a un
 * glyphe, pas que ce glyphe montre la bonne chose (`pique` a deja livre une
 * beche de jardin). Le dessin se controle a l'oeil, au moment ou l'on ecrit la
 * ligne de `GLYPHES`.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const NOMS = join(RACINE, 'src/components/ui/icon-names.ts')
const ICON = join(RACINE, 'src/components/ui/Icon.tsx')
const PACKAGE = join(RACINE, 'package.json')
const MOI = fileURLToPath(import.meta.url)
const PREUVE = join(dirname(MOI), 'verif_garde_icones.mjs')

const echecs = []

function fichiersSources(dossier, extensions) {
  const sortie = []
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree)
    if (statSync(chemin).isDirectory()) sortie.push(...fichiersSources(chemin, extensions))
    else if (extensions.includes(extname(entree))) sortie.push(chemin)
  }
  return sortie
}

// 1. Les noms declares et la table GLYPHES s'accordent.
const declares = [...readFileSync(NOMS, 'utf8').matchAll(/^\s*'([^']+)',$/gm)].map((m) => m[1])
if (declares.length === 0) echecs.push(`aucun nom lu dans ${NOMS} - le format du fichier a change`)
const source = readFileSync(ICON, 'utf8')
const table = source.match(/const GLYPHES[^=]*=\s*\{([\s\S]*?)\n\}/)?.[1]
if (table === undefined) {
  echecs.push('table GLYPHES introuvable dans Icon.tsx')
} else {
  const mappes = [...table.matchAll(/^\s*'?([a-z-]+)'?:\s*[A-Za-z0-9]+,$/gm)].map((m) => m[1])
  const sansDessin = declares.filter((n) => !mappes.includes(n))
  if (sansDessin.length) echecs.push(`noms declares sans dessin dans GLYPHES : ${sansDessin.join(', ')}`)
  const orphelins = mappes.filter((n) => !declares.includes(n))
  if (orphelins.length) echecs.push(`entrees de GLYPHES sans nom declare : ${orphelins.join(', ')}`)
}

// 2. Aucune bibliotheque d'icones concurrente.
const CONCURRENTES = /\b(?:lucide|phosphor|icons8)|heroicons|react-icons/i
const coupables = [
  ...fichiersSources(join(RACINE, 'src'), ['.ts', '.tsx', '.css']),
  ...fichiersSources(join(RACINE, 'scripts'), ['.ts', '.mjs', '.js', '.py']),
  PACKAGE,
]
  .filter((f) => f !== MOI && f !== PREUVE)
  .filter((f) => CONCURRENTES.test(readFileSync(f, 'utf8')))
if (coupables.length) {
  echecs.push(
    `bibliotheque d'icones concurrente encore citee dans ${coupables.length} fichier(s) : ` +
      coupables.map((f) => f.replace(RACINE, '').replace(/\\/g, '/')).join(', ')
  )
}

// 3. Plus de SVG servis : les icones sont des composants.
if (existsSync(join(RACINE, 'public/icons'))) {
  echecs.push('public/icons/ existe encore - reliquat du systeme de masques CSS, a supprimer')
}

// 4. La dependance est declaree.
if (!('reicon-react' in (JSON.parse(readFileSync(PACKAGE, 'utf8')).dependencies ?? {}))) {
  echecs.push('reicon-react absent des dependencies de package.json')
}

if (echecs.length) {
  console.error('\nGarde icones : ECHEC\n')
  for (const e of echecs) console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

console.log(
  `Icones : ${declares.length} noms declares, tous dessines (Reicon + glyphes maison), ` +
    `aucune bibliotheque concurrente, aucun SVG servi.`
)
