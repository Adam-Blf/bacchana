#!/usr/bin/env node
/**
 * Garde : le jeu d'icones est complet, local, et d'un seul style.
 *
 * Le defaut qu'elle verrouille. La migration de `lucide-react` vers des masques
 * Icons8 a laisse le depot dans trois etats simultanes : des ecrans migres, des
 * appels a des composants lucide supprimes qui cassaient le typecheck, et un
 * troisieme jeu d'icones parallele dans `public/icons/modes/`. Rien de tout
 * cela ne se voit sans compiler ou sans regarder l'ecran.
 *
 * Trois controles :
 *   1. chaque nom declare dans `icon-names.ts` a bien son fichier ;
 *   2. plus aucun import `lucide-react` dans `src/` ;
 *   3. le manifeste annonce un seul style, celui du script de rapatriement.
 *
 * CE QUE CETTE GARDE NE VOIT PAS.
 *   - Le DESSIN. Elle verifie qu'un fichier existe, pas qu'il montre la bonne
 *     chose. `pique` a livre une beche de jardin en production sous un nom
 *     Icons8 qui disait "Spade" : aucune garde automatique ne l'aurait vu, il a
 *     fallu regarder. Le controle du dessin se fait a l'oeil, une fois, au
 *     moment ou l'on epingle l'identifiant.
 *   - Les noms construits dynamiquement. `<Icon name={m.icon} />` est verifie
 *     par tsc via le type `IconName`, pas ici.
 *   - Le style REEL d'un fichier deja telecharge. Le controle 3 lit ce que le
 *     manifeste declare ; si une epingle etrangere au style a ete resolue avant
 *     que la garde python `verifier_epingles` n'existe, le PNG est du mauvais
 *     style et le manifeste l'ignore. C'est cette garde-la, cote python, qui
 *     couvre le cas a la source.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..')
const NOMS = join(RACINE, 'src/components/ui/icon-names.ts')
const ICONES = join(RACINE, 'public/icons')
const MANIFESTE = join(ICONES, 'manifest.json')
const VENDOR = join(RACINE, 'scripts/vendor_icons8.py')

const echecs = []

function fichiersSources(dossier) {
  const sortie = []
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree)
    if (statSync(chemin).isDirectory()) sortie.push(...fichiersSources(chemin))
    else if (['.ts', '.tsx'].includes(extname(entree))) sortie.push(chemin)
  }
  return sortie
}

// 1. Chaque nom declare a son fichier.
const declares = [...readFileSync(NOMS, 'utf8').matchAll(/^\s*'([^']+)',$/gm)].map((m) => m[1])
if (declares.length === 0) {
  echecs.push(`aucun nom lu dans ${NOMS} - le format du fichier a change`)
}
const manquants = declares.filter((n) => !existsSync(join(ICONES, `${n}.svg`)))
if (manquants.length) {
  echecs.push(`icones declarees sans fichier : ${manquants.join(', ')}`)
}

// 2. Plus aucun import lucide.
const coupables = fichiersSources(join(RACINE, 'src')).filter((f) =>
  readFileSync(f, 'utf8').includes('lucide-react')
)
if (coupables.length) {
  echecs.push(
    `lucide-react encore importe dans ${coupables.length} fichier(s) : ` +
      coupables.map((f) => f.replace(RACINE, '')).join(', ')
  )
}

// 3. Un seul style, et c'est celui du script de rapatriement.
const manifeste = JSON.parse(readFileSync(MANIFESTE, 'utf8'))
const attendu = readFileSync(VENDOR, 'utf8').match(/^PLATFORM = "([^"]+)"/m)?.[1]
if (!attendu) {
  echecs.push('PLATFORM introuvable dans scripts/vendor_icons8.py')
} else if (manifeste.platform !== attendu) {
  echecs.push(`manifeste en "${manifeste.platform}" alors que le script vendorise "${attendu}"`)
}
const styles = new Set(Object.values(manifeste.icones).map((i) => i.platform))
if (styles.size > 1) {
  echecs.push(`plusieurs styles melanges dans le manifeste : ${[...styles].join(', ')}`)
}

if (echecs.length) {
  console.error('\nGarde icones : ECHEC\n')
  for (const e of echecs) console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

console.log(
  `Icones : ${declares.length} noms declares, tous presents, style "${manifeste.platform}", ` +
    'aucun import lucide.'
)
