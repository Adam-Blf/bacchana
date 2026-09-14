#!/usr/bin/env node
/**
 * Prouve que `check_icons.mjs` echoue quand elle le doit, controle par controle.
 *
 * Regle du chantier : une garde jamais vue rouge ne garde rien (CLAUDE.md
 * 17.5bis, gravee apres trois defauts successifs de `check_tile_ink.mjs`, tous
 * trouves par regression volontaire et aucun par relecture).
 *
 * Les cinq regressions reintroduites ici ne sont pas theoriques. Elles ont
 * toutes eu lieu sur ce depot, ou elles sont la raison d'etre du controle :
 *
 *   1. un nom declare sans fichier - la migration lucide a laisse des appels a
 *      des icones qui n'existaient plus ;
 *   2. un fichier orphelin - `public/icons/modes/` a vecu en parallele du jeu
 *      principal pendant toute une version ;
 *   3. un import lucide survivant - il cassait le typecheck sans que rien ne le
 *      nomme ;
 *   4. un `fill="none"` dans un SVG servi - le masque CSS ne lit que la
 *      geometrie, donc le rectangle de cadrage de Phosphor se peint en CARRE
 *      PLEIN sur la tuile. C'est le defaut que le passage a Phosphor a
 *      introduit le 2026-09-14, et le seul des cinq qui ne se voit pas du tout
 *      en lisant le code ;
 *   5. un poids etranger dans le manifeste - six epingles heritees d'un autre
 *      style avaient ramene des filets fins au milieu d'un jeu plein, sans
 *      aucune erreur ;
 *   6. une exception de poids perdue. C'est le cas qui compte le plus, parce
 *      que c'est la forme exacte qu'une regression prendra ici : cinq marques
 *      sont en `bold` parce que le `fill` de Phosphor les enferme dans un
 *      ecusson plein, et un bouton « + » redevenu `fill` est un pave d'encre de
 *      20 px - avec tout le reste au vert.
 *
 * Chaque cas est encadre par un try/finally : le disque est restaure meme si la
 * garde plante.
 *
 * CE QUE CE SCRIPT NE PROUVE PAS. Que la garde attrape TOUT - seulement qu'elle
 * attrape ces six formes. Et rien du DESSIN : aucun de ces cas ne dirait qu'une
 * beche de jardin est arrivee sous le nom `pique`.
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const GARDE = join(RACINE, 'scripts/gardes/check_icons.mjs')
const NOMS = join(RACINE, 'src/components/ui/icon-names.ts')
const ICONES = join(RACINE, 'public/icons')
const MANIFESTE = join(ICONES, 'manifest.json')
const CIBLE_LUCIDE = join(RACINE, 'src/components/ui/Icon.tsx')

function garde() {
  const r = spawnSync('node', [GARDE], { encoding: 'utf8' })
  return { code: r.status, sortie: (r.stdout || '') + (r.stderr || '') }
}

let echecs = 0
/** Joue une regression, exige le rouge, restaure, exige le vert. */
function cas(titre, indice, casser, restaurer) {
  try {
    casser()
    const { code, sortie } = garde()
    if (code === 0) {
      console.log(`  ECHEC  ${titre} : la garde est restee VERTE`)
      echecs++
    } else if (!sortie.includes(indice)) {
      console.log(`  ECHEC  ${titre} : rouge, mais sans nommer « ${indice} »`)
      console.log(sortie.trim().split('\n').map((l) => '         ' + l).join('\n'))
      echecs++
    } else {
      console.log(`  ok     ${titre}`)
    }
  } finally {
    restaurer()
  }
  const apres = garde()
  if (apres.code !== 0) {
    console.log(`  ECHEC  ${titre} : le disque n'est pas revenu a l'etat vert`)
    echecs++
  }
}

console.log('Preuve de la garde icones - six regressions volontaires\n')

// 1. Un nom declare sans fichier.
{
  const bon = readFileSync(NOMS, 'utf8')
  cas(
    'nom declare sans fichier',
    'declarees sans fichier',
    () => writeFileSync(NOMS, bon.replace("  'accueil',", "  'accueil',\n  'nexistepas',")),
    () => writeFileSync(NOMS, bon)
  )
}

// 2. Un fichier orphelin, comme le jeu parallele de public/icons/modes/.
{
  const intrus = join(ICONES, 'reliquat-dun-autre-jeu.svg')
  cas(
    'fichier orphelin',
    'reliquat-dun-autre-jeu',
    () => writeFileSync(intrus, '<svg viewBox="0 0 24 24"><path d="M0 0h24v24z"/></svg>'),
    () => existsSync(intrus) && unlinkSync(intrus)
  )
}

// 3. Un import lucide survivant.
{
  const bon = readFileSync(CIBLE_LUCIDE, 'utf8')
  cas(
    'import lucide survivant',
    'lucide-react',
    () => writeFileSync(CIBLE_LUCIDE, `import { Home } from 'lucide-react'\n` + bon),
    () => writeFileSync(CIBLE_LUCIDE, bon)
  )
}

// 4. Le rectangle de cadrage de Phosphor, laisse dans un SVG servi.
{
  const cible = join(ICONES, 'coeur.svg')
  const bon = readFileSync(cible, 'utf8')
  cas(
    'fill="none" dans un SVG servi',
    'carre plein',
    () =>
      writeFileSync(
        cible,
        bon.replace('<path', '<rect width="256" height="256" fill="none"/><path')
      ),
    () => writeFileSync(cible, bon)
  )
}

// 5. Un poids etranger glisse dans le manifeste.
{
  const bon = readFileSync(MANIFESTE, 'utf8')
  const m = JSON.parse(bon)
  m.icones.coeur.poids = 'thin'
  cas(
    'poids etranger dans le manifeste',
    'coeur en "thin"',
    () => writeFileSync(MANIFESTE, JSON.stringify(m, null, 2) + '\n'),
    () => writeFileSync(MANIFESTE, bon)
  )
}

// 6. Une exception de poids reprise en `fill` : c'est le retour de l'ecusson.
//    Le cas qui compte le plus, parce que c'est exactement la forme que prend
//    une regression ici - quelqu'un relance un script qui a perdu l'exception,
//    le bouton « + » redevient un pave d'encre, et tout le reste est vert.
{
  const bon = readFileSync(MANIFESTE, 'utf8')
  const m = JSON.parse(bon)
  m.icones.plus.poids = 'fill'
  cas(
    'exception de poids perdue (ecusson de retour)',
    'plus en "fill" au lieu de "bold"',
    () => writeFileSync(MANIFESTE, JSON.stringify(m, null, 2) + '\n'),
    () => writeFileSync(MANIFESTE, bon)
  )
}

console.log()
if (echecs) {
  console.error(`${echecs} controle(s) de la garde icones ne tiennent pas.`)
  process.exit(1)
}
console.log('Les controles de check_icons.mjs echouent bien quand ils le doivent.')
