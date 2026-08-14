#!/usr/bin/env node
/**
 * Garde : le registre des modes permet a « Lance la soiree » de fonctionner.
 *
 * Le defaut qu'elle verrouille. Le sequenceur choisit le mode suivant a partir
 * d'attributs portes par le registre. Un mode ajoute plus tard sans ces
 * attributs ne casse rien de visible : il est simplement ecarte du tirage, ou
 * mal place dans le rythme de la soiree. Personne ne le remarque avant une vraie
 * soiree, et encore, seulement si quelqu'un se demande pourquoi ce mode ne sort
 * jamais.
 *
 * Cinq controles :
 *   1. chaque mode declare dans GAME_MODES porte `dureeIndicative` ;
 *   2. et `demandeExplication` ;
 *   3. la duree vaut court, moyen ou long, rien d'autre ;
 *   4. au moins un mode est jouable a deux, sinon une petite tablee ne peut
 *      jamais lancer de soiree ;
 *   5. au moins un mode est court et au moins un demande des explications, sans
 *      quoi les regles de rythme d'ouverture et de fin de soiree ne peuvent
 *      jamais s'appliquer.
 *
 * CE QUE CETTE GARDE NE VOIT PAS.
 *   - Si une duree declaree est JUSTE. Declarer Borderland comme court alors
 *     qu'il dure quarante minutes passe ici sans un mot. Cette valeur releve du
 *     jugement de quelqu'un qui a fait tourner les modes en soiree, et aucun
 *     script ne la remplacera. Les valeurs actuelles sont provisoires et
 *     marquees comme telles dans le registre.
 *   - Si `demandeExplication` correspond a la realite. Meme raison.
 *   - Le comportement du sequenceur lui-meme, qui est couvert par son propre
 *     corpus de tests. Cette garde regarde la DONNEE, pas la DECISION.
 *   - Un mode present dans le registre mais absent de GAME_MODES. Le typage
 *     l'interdit deja a la compilation.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..')
const TYPES = join(RACINE, 'src/core/engine/types.ts')
const REGISTRE = join(RACINE, 'src/core/engine/modeRegistry.ts')

const DUREES = ['court', 'moyen', 'long']

const echecs = []

const sourceTypes = readFileSync(TYPES, 'utf8')
const sourceRegistre = readFileSync(REGISTRE, 'utf8')

/** Identifiants declares dans GAME_MODES. */
const blocModes = /export const GAME_MODES: GameMode\[\] = \[([\s\S]*?)\]/.exec(sourceTypes)?.[1]
if (!blocModes) {
  console.error('SEQUENCEUR : GAME_MODES introuvable dans types.ts.')
  process.exit(1)
}
const modes = [...blocModes.matchAll(/'([A-Za-z0-9]+)'/g)].map((m) => m[1])

/**
 * Decoupe le registre en blocs par mode. On repere l'ouverture `  <id>: {` et on
 * s'arrete a l'ouverture suivante. Suffisant ici : le registre est un objet plat
 * dont chaque entree est un mode.
 */
function blocDuMode(id) {
  const debut = new RegExp(`^\\s{2}${id}:\\s*\\{`, 'm').exec(sourceRegistre)
  if (!debut) return null
  const reste = sourceRegistre.slice(debut.index + debut[0].length)
  const suivant = /^\s{2}[A-Za-z0-9]+:\s*\{/m.exec(reste)
  return suivant ? reste.slice(0, suivant.index) : reste
}

const dureesVues = []
let explicatifs = 0
let jouableADeux = 0

for (const id of modes) {
  const bloc = blocDuMode(id)
  if (!bloc) {
    echecs.push(`${id} : absent du registre alors qu'il est declare dans GAME_MODES.`)
    continue
  }

  const duree = /dureeIndicative:\s*'([a-z]+)'/.exec(bloc)?.[1]
  const explication = /demandeExplication:\s*(true|false)/.exec(bloc)?.[1]
  const minJoueurs = /minPlayers:\s*(\d+)/.exec(bloc)?.[1]

  if (!duree) {
    echecs.push(`${id} : dureeIndicative manquante. Le mode serait mal place dans le rythme de la soiree.`)
  } else if (!DUREES.includes(duree)) {
    echecs.push(`${id} : dureeIndicative vaut "${duree}", attendu ${DUREES.join(', ')}.`)
  } else {
    dureesVues.push(duree)
  }

  if (explication === undefined) {
    echecs.push(`${id} : demandeExplication manquante.`)
  } else if (explication === 'true') {
    explicatifs += 1
  }

  if (minJoueurs !== undefined && Number(minJoueurs) <= 2) jouableADeux += 1
}

if (jouableADeux === 0) {
  echecs.push('aucun mode jouable a deux joueurs : une tablee de deux ne pourrait jamais lancer de soiree.')
}
if (!dureesVues.includes('court')) {
  echecs.push('aucun mode court : la regle de fin de soiree ne pourrait jamais s appliquer.')
}
if (explicatifs === 0) {
  echecs.push('aucun mode a explications : la regle d ouverture de soiree ne pourrait jamais s appliquer.')
}

if (echecs.length === 0) {
  console.log(
    `Sequenceur : ${modes.length} modes, tous attribues. ` +
      `${jouableADeux} jouables a deux, ${dureesVues.filter((d) => d === 'court').length} courts, ` +
      `${explicatifs} avec explications.`,
  )
  process.exit(0)
}

for (const e of echecs) console.error(`SEQUENCEUR : ${e}`)
console.error(`\nGarde du sequenceur : ${echecs.length} probleme(s).`)
process.exit(1)
