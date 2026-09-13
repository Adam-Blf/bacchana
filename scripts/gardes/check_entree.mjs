#!/usr/bin/env node
/**
 * Garde : le morceau de DEMARRAGE ne transporte pas le contenu du jeu.
 *
 * Le defaut qu'elle verrouille, mesure le 2026-09-13. `modeRegistry` importait
 * `FREE_PACKS` - les six paquets entiers, 92 Ko de JSON - pour repondre a une
 * question qui tient en six identifiants : « quels paquets gratuits existent
 * pour ce mode ? ». Le registre etant atteignable depuis `App`, les 480 cartes
 * partaient dans le morceau d'entree. Quelqu'un qui ouvrait l'application
 * telechargeait donc la totalite du contenu avant de voir le premier ecran.
 * Mesure : 110 Ko d'entree, dont plus de la moitie de cartes jamais lues a cet
 * instant. Apres correction : 54 Ko.
 *
 * Rien ne le signalait. Le typecheck, les tests, le lint et les huit autres
 * gardes sont tous indifferents a l'endroit ou un octet atterrit ; seul le
 * build le sait, et il ne s'en plaint pas.
 *
 * CE QUE CETTE GARDE NE VOIT PAS.
 *   - Le POIDS. Elle ne fixe aucun plafond de kilo-octets : un budget chiffre
 *     se perime a la premiere fonctionnalite legitime, et une garde qui crie a
 *     tort finit desactivee. Elle verifie une PROPRIETE - le contenu de jeu
 *     n'est pas dans l'entree - qui reste vraie quelle que soit la taille.
 *   - Les autres morceaux. Que les cartes voyagent avec l'ecran d'accueil est
 *     exactement ce qu'on veut : il ne se charge qu'une fois la tablee saisie.
 *   - Ce que le NAVIGATEUR demande vraiment, qui est le domaine de
 *     `check_boot_js.mjs` et de son vrai navigateur.
 *
 * Usage : npm run build && node scripts/gardes/check_entree.mjs
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DIST = join(RACINE, 'dist')
const PAQUETS = join(RACINE, 'src/content/packs')

if (!existsSync(join(DIST, 'index.html'))) {
  console.error("Entree : aucun build a inspecter. Lance `npm run build` d'abord.")
  process.exit(1)
}

const html = readFileSync(join(DIST, 'index.html'), 'utf8')
// Les morceaux charges AVANT tout geste : ceux que la page declare elle-meme.
const entrees = [...html.matchAll(/assets\/[A-Za-z0-9_.-]+\.js/g)].map((m) => m[0])
if (entrees.length === 0) {
  console.error("Entree : aucun script trouve dans index.html - l'extraction est cassee.")
  process.exit(1)
}

/** Un echantillon de cartes reellement servies, pris dans chaque paquet. */
const temoins = []
for (const fichier of readdirSync(PAQUETS).filter((f) => f.endsWith('.json'))) {
  const paquet = JSON.parse(readFileSync(join(PAQUETS, fichier), 'utf8'))
  for (const item of paquet.items.slice(0, 3)) {
    temoins.push({ paquet: paquet.pack.id, texte: item.text })
  }
}
if (temoins.length === 0) {
  console.error('Entree : aucune carte lue - la garde ne mesurerait rien.')
  process.exit(1)
}

const echecs = []
for (const nom of entrees) {
  const source = readFileSync(join(DIST, nom), 'utf8')
  for (const t of temoins) {
    if (source.includes(t.texte)) {
      echecs.push(`${nom} transporte une carte de « ${t.paquet} » : « ${t.texte.slice(0, 50)}... »`)
      break
    }
  }
}

if (echecs.length) {
  console.error('\nGarde entree : ECHEC\n')
  for (const e of echecs) console.error(`  - ${e}`)
  console.error(
    '\nUn module du chemin de demarrage importe `@/content/paquets`. Les cartes se\n' +
      "chargent avec l'ecran qui les sert, jamais avant le premier rendu.\n"
  )
  process.exit(1)
}

const poids = entrees.reduce((total, nom) => total + readFileSync(join(DIST, nom)).length, 0)
console.log(
  `Entree : ${entrees.length} morceau(x), ${(poids / 1024).toFixed(1)} Ko, ` +
    `${temoins.length} cartes temoins verifiees, aucune dans le demarrage.`
)
