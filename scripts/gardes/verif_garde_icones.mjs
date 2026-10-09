#!/usr/bin/env node
/**
 * Prouve que `check_icons.mjs` echoue quand elle le doit, controle par controle.
 *
 * Regle du chantier : une garde jamais vue rouge ne garde rien. Les quatre
 * regressions reintroduites ici ont toutes eu lieu (ou menacent) sur ce depot :
 *
 *   1. un nom declare sans dessin - la migration lucide a laisse des appels a
 *      des icones qui n'existaient plus ;
 *   2. une entree orpheline dans la table GLYPHES ;
 *   3. un import d'une bibliotheque concurrente survivante ;
 *   4. un dossier `public/icons/` ressuscite, reliquat des masques CSS.
 *
 * Chaque cas est encadre par un try/finally : le disque est restaure meme si la
 * garde plante. CE QUE CE SCRIPT NE PROUVE PAS : que la garde attrape TOUT,
 * seulement ces quatre formes, et rien du DESSIN.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const GARDE = join(RACINE, 'scripts/gardes/check_icons.mjs')
const NOMS = join(RACINE, 'src/components/ui/icon-names.ts')
const ICON = join(RACINE, 'src/components/ui/Icon.tsx')
const DOSSIER = join(RACINE, 'public/icons')

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
      echecs++
    } else {
      console.log(`  ok     ${titre}`)
    }
  } finally {
    restaurer()
  }
  if (garde().code !== 0) {
    console.log(`  ECHEC  ${titre} : le disque n'est pas revenu a l'etat vert`)
    echecs++
  }
}

console.log('Preuve de la garde icones - quatre regressions volontaires\n')

{
  const bon = readFileSync(NOMS, 'utf8')
  cas(
    'nom declare sans dessin',
    'sans dessin',
    () => writeFileSync(NOMS, bon.replace("  'accueil',", "  'accueil',\n  'nexistepas',")),
    () => writeFileSync(NOMS, bon)
  )
}

{
  const bon = readFileSync(ICON, 'utf8')
  cas(
    'entree orpheline dans GLYPHES',
    'sans nom declare',
    () => writeFileSync(ICON, bon.replace('  accueil: Home,', '  accueil: Home,\n  fantome: Home,')),
    () => writeFileSync(ICON, bon)
  )
}

{
  const bon = readFileSync(ICON, 'utf8')
  cas(
    'bibliotheque concurrente survivante',
    'concurrente',
    () => writeFileSync(ICON, `import { Home } from 'lucide-react'\n` + bon),
    () => writeFileSync(ICON, bon)
  )
}

cas(
  'public/icons ressuscite',
  'public/icons',
  () => mkdirSync(DOSSIER, { recursive: true }),
  () => existsSync(DOSSIER) && rmSync(DOSSIER, { recursive: true })
)

if (echecs) {
  console.log(`\n${echecs} echec(s)`)
  process.exit(1)
}
console.log("\nLa garde est rouge quand elle doit l'etre et verte quand le disque est sain.")
