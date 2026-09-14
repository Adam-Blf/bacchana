#!/usr/bin/env node
/**
 * Garde : le jeu d'icones est complet, local, d'un seul poids, et masquable.
 *
 * LE DEFAUT D'ORIGINE. La migration de `lucide-react` vers des masques Icons8 a
 * laisse le depot dans trois etats simultanes : des ecrans migres, des appels a
 * des composants lucide supprimes qui cassaient le typecheck, et un troisieme
 * jeu d'icones parallele dans `public/icons/modes/`. Rien de tout cela ne se
 * voit sans compiler ou sans regarder l'ecran.
 *
 * LE DEFAUT AJOUTE LE 2026-09-14, au passage a Phosphor. Un SVG Phosphor porte
 * `<rect width="256" height="256" fill="none"/>` en premiere forme. Dans un
 * `<img>` c'est inoffensif. Dans un MASQUE CSS c'est fatal : le masque ne lit
 * que la geometrie, pas le `fill`, donc ce rectangle couvre toute la surface et
 * l'icone se peint en CARRE PLEIN. Une icone sur une tuile devient un pave
 * d'encre. Le script de rapatriement le retire, cette garde verifie qu'il l'a
 * fait - parce qu'un fichier ajoute a la main ne passera pas par le script.
 *
 * Cinq controles :
 *   1. chaque nom declare dans `icon-names.ts` a bien son fichier ;
 *   2. aucun fichier orphelin : un reliquat d'un jeu precedent se voit ici ;
 *   3. plus aucun import `lucide-react`, et plus aucune trace du CANAL Icons8
 *      - cle d'API, points de terminaison, valeur `ios_filled`, script portant
 *      le nom du fournisseur. La prose garde le droit de nommer d'ou l'on
 *      vient, c'est la regle du depot ; ce qui est interdit est ce qui
 *      permettrait d'y retourner sans decision ;
 *   4. aucun `fill="none"` dans les SVG servis (le carre plein ci-dessus) ;
 *   5. chaque icone porte le poids que le script declare pour elle - `fill` par
 *      defaut, `bold` pour les cinq marques que le `fill` de Phosphor enferme
 *      dans un ecusson plein.
 *
 * CE QUE CETTE GARDE NE VOIT PAS.
 *   - Le DESSIN. Elle verifie qu'un fichier existe et qu'il se masquera, pas
 *     qu'il montre la bonne chose. `pique` a livre une beche de jardin en
 *     production sous un identifiant Icons8 qui disait "Spade" : aucune garde
 *     automatique ne l'aurait vu, il a fallu regarder. Le controle du dessin se
 *     fait a l'oeil, une fois, au moment ou l'on ecrit la ligne de
 *     correspondance. C'est aussi pourquoi cette correspondance est en clair
 *     dans `vendor_phosphor.mjs` et non derriere des identifiants numeriques.
 *   - Les noms construits dynamiquement. `<Icon name={m.icon} />` est verifie
 *     par tsc via le type `IconName`, pas ici.
 *   - Un nom declare mais jamais appele. `aide` et `vote` sont dans ce cas :
 *     la garde ne s'en plaint pas, un jeu d'icones a le droit d'avoir une
 *     avance sur les ecrans.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const NOMS = join(RACINE, 'src/components/ui/icon-names.ts')
const ICONES = join(RACINE, 'public/icons')
const MANIFESTE = join(ICONES, 'manifest.json')
const VENDOR = join(RACINE, 'scripts/outils/vendor_phosphor.mjs')

const echecs = []

function fichiersSources(dossier, extensions = ['.ts', '.tsx']) {
  const sortie = []
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree)
    if (statSync(chemin).isDirectory()) sortie.push(...fichiersSources(chemin, extensions))
    else if (extensions.includes(extname(entree))) sortie.push(chemin)
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

// 2. Aucun fichier orphelin. Un jeu abandonne laisse ses dessins en tas.
const fichiers = readdirSync(ICONES)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => f.replace(/\.svg$/, ''))
const orphelins = fichiers.filter((f) => !declares.includes(f))
if (orphelins.length) {
  echecs.push(
    `fichiers sans nom declare - reliquat d'un jeu precedent : ${orphelins.join(', ')}. ` +
      `Relancer npm run icones, qui les retire.`
  )
}

// 3. Ni lucide, ni le CANAL Icons8.
//
// « Canal », pas « mot ». La prose a le droit de nommer d'ou l'on vient - c'est
// meme la regle de ce depot, et `vendor_phosphor.mjs` explique longuement
// pourquoi Icons8 est parti. Ce qui est interdit, c'est ce qui permettrait d'y
// RETOURNER sans decision : la cle d'API, les deux points de terminaison, la
// valeur de style `ios_filled`, et un script dont le nom porte le fournisseur.
const CANAL_ICONS8 = /ICONS8_API_KEY|(?:search|api-icons)\.icons8\.com|ios_filled/
for (const [etiquette, dossier, motif] of [
  ['lucide-react', 'src', /lucide-react/],
  ['le canal Icons8', 'src', CANAL_ICONS8],
  ['le canal Icons8', 'scripts', CANAL_ICONS8],
]) {
  const racine = join(RACINE, dossier)
  const coupables = fichiersSources(racine, ['.ts', '.tsx', '.mjs', '.js', '.py'])
    .filter((f) => f !== fileURLToPath(import.meta.url))
    .filter((f) => motif.test(readFileSync(f, 'utf8')))
  if (coupables.length) {
    echecs.push(
      `${etiquette} encore present dans ${dossier}/ - ${coupables.length} fichier(s) : ` +
        coupables.map((f) => f.replace(RACINE + '/', '')).join(', ')
    )
  }
}
const scriptsFournisseur = fichiersSources(join(RACINE, 'scripts'), ['.py', '.mjs', '.js']).filter(
  (f) => /icons8/i.test(f)
)
if (scriptsFournisseur.length) {
  echecs.push(
    `script nomme d'apres Icons8 encore present : ` +
      scriptsFournisseur.map((f) => f.replace(RACINE + '/', '')).join(', ')
  )
}

// 4. Aucun `fill="none"` servi : ce serait un carre plein a travers le masque.
const carresPleins = fichiers.filter((f) =>
  /fill\s*=\s*"none"/.test(readFileSync(join(ICONES, `${f}.svg`), 'utf8'))
)
if (carresPleins.length) {
  echecs.push(
    `SVG avec fill="none" - le masque CSS les rendrait en carre plein : ${carresPleins.join(', ')}`
  )
}

// 5. Le poids de CHAQUE icone est celui que le script declare pour elle.
//
// Ce controle disait « un seul poids » jusqu'au 2026-09-14. Il ne pouvait plus :
// cinq marques sont volontairement en `bold`, parce que le `fill` de Phosphor
// leur met un ecusson plein autour et qu'un bouton « + » devenait un pave
// d'encre a travers le masque. « Un seul poids » aurait force a reintroduire le
// defaut ou a desactiver la garde - et une garde qui accuse ce qui va bien finit
// desactivee. Elle verifie donc l'ACCORD entre le script et le manifeste, icone
// par icone : le jeu peut avoir deux poids, mais pas un de plus que ce qui est
// ecrit et relu dans `vendor_phosphor.mjs`.
const manifeste = JSON.parse(readFileSync(MANIFESTE, 'utf8'))
const scriptVendor = readFileSync(VENDOR, 'utf8')
const defaut = scriptVendor.match(/^const POIDS = '([^']+)'/m)?.[1]
const blocParticuliers = scriptVendor.match(/const POIDS_PARTICULIERS = \{([\s\S]*?)\n\}/)?.[1]
if (!defaut) {
  echecs.push('POIDS introuvable dans scripts/outils/vendor_phosphor.mjs')
} else if (blocParticuliers === undefined) {
  echecs.push('POIDS_PARTICULIERS introuvable dans scripts/outils/vendor_phosphor.mjs')
} else {
  const particuliers = Object.fromEntries(
    [...blocParticuliers.matchAll(/^\s*'?([a-z-]+)'?:\s*'([a-z]+)',/gm)].map((m) => [m[1], m[2]])
  )
  if (manifeste.poids !== defaut) {
    echecs.push(`manifeste en "${manifeste.poids}" alors que le script vendorise "${defaut}"`)
  }
  const desaccords = []
  for (const [nom, icone] of Object.entries(manifeste.icones)) {
    const voulu = particuliers[nom] ?? defaut
    if (icone.poids !== voulu) desaccords.push(`${nom} en "${icone.poids}" au lieu de "${voulu}"`)
  }
  if (desaccords.length) {
    echecs.push(`poids en desaccord avec le script : ${desaccords.join(', ')}. Relancer npm run icones.`)
  }
  const inconnus = Object.keys(particuliers).filter((n) => !(n in manifeste.icones))
  if (inconnus.length) {
    echecs.push(`POIDS_PARTICULIERS nomme des icones qui n'existent pas : ${inconnus.join(', ')}`)
  }
}

if (echecs.length) {
  console.error('\nGarde icones : ECHEC\n')
  for (const e of echecs) console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

console.log(
  `Icones : ${declares.length} noms declares, tous presents, aucun orphelin, ` +
    `${manifeste.source} poids "${manifeste.poids}" (+ ${Object.keys(manifeste.poids_particuliers ?? {}).length} en bold), ` +
    `aucun fill="none", ni lucide ni Icons8.`
)
