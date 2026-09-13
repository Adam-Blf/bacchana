#!/usr/bin/env node
/**
 * Garde : aucun document confidentiel dans un depot PUBLIC.
 *
 * L'INCIDENT DU 2026-08-31, qui est la raison d'etre de ce fichier.
 *
 * Le depot est passe de prive a public dans la matinee. Un audit de secrets a
 * ete passe sur les 115 commits des deux ports natifs : jetons, cles privees,
 * keystores, donnees personnelles. Rien trouve, et c'etait vrai.
 *
 * L'apres-midi, en cherchant tout autre chose, une branche oubliee est apparue :
 * `feat/icons8-forma-bold-sharp`, poussee sur origin, portant un dossier
 * incubateur complet - resume executif, etude de marche, BUDGET PREVISIONNEL en
 * PDF et en Excel, feuille de route, note equipe, analyse des risques, trame de
 * pitch deck, plus `docs/creation-sasu-blf-labs.md` et
 * `docs/stores-comptes-developpeur.md`.
 *
 * Rien de tout cela n'est un secret au sens d'une cle. C'est pire a sa facon :
 * ce sont des chiffres, une strategie et une analyse de risques, rendus publics
 * par une bascule de visibilite que personne n'avait reliee a eux. Un scanner de
 * jetons ne pouvait pas le voir - il cherchait la mauvaise chose.
 *
 * LA LECON, et elle vaut au-dela de ce depot : avant de rendre un depot public,
 * on n'audite pas seulement les SECRETS, on audite ce qu'on ne voulait pas
 * PUBLIER. Ce sont deux questions differentes, et la seconde n'a pas d'outil.
 * Celui-ci en est un.
 *
 * CE QUE CETTE GARDE NE VOIT PAS :
 *   - l'historique. Elle juge l'arbre courant, pas les commits passes. Un
 *     document deja pousse reste atteignable par son empreinte sur GitHub, meme
 *     apres suppression de sa branche - verifie le jour meme, l'API rend encore
 *     le commit. Le purger vraiment demande d'ecrire au support GitHub ;
 *   - un document confidentiel qui ne porte aucun des mots ci-dessous. La liste
 *     se complete quand un cas nouveau apparait, elle ne pretend pas etre close.
 *
 * Usage : node scripts/check_fichiers_confidentiels.mjs
 */
import { execSync } from 'node:child_process'

/** Chemins et noms qui n'ont rien a faire dans un depot public. */
const MOTIFS = [
  ['dossier incubateur', /(^|\/)_?dossier[-_]incubateur\//i],
  ['budget ou previsionnel', /budget|pr[ée]visionnel/i],
  ['pitch deck', /pitch[-_ ]?deck/i],
  ['business plan', /business[-_ ]?plan/i],
  ['creation de societe', /creation[-_](sasu|sarl|sas|eurl)|statuts?[-_]/i],
  ['comptes developpeur', /comptes?[-_]developpeur/i],
  ['audit de securite en document', /audit[-_]s[ée]curit[ée].*\.(pdf|docx?|xlsx?)$/i],
  ['piece comptable', /(facture|devis|kbis|urssaf|bilan)[-_.]/i],
  ['tableur ou document bureautique', /\.(xlsx?|docx?|pptx?)$/i],
]

/** Exemptions NOMMEES. Une exemption sans raison ecrite est une porte ouverte. */
const EXEMPTIONS = [
  // Le mot « budget » au sens d'un budget de performance, pas d'argent.
  /performance[-_]budget/i,
]

const suivis = execSync('git ls-files', { encoding: 'utf-8' }).split('\n').filter(Boolean)

const fautes = []
for (const f of suivis) {
  if (EXEMPTIONS.some((e) => e.test(f))) continue
  for (const [etiquette, motif] of MOTIFS) {
    if (motif.test(f)) {
      fautes.push([f, etiquette])
      break
    }
  }
}

if (fautes.length) {
  console.error(`\nDocument confidentiel suivi dans un depot public - ${fautes.length} fichier(s).\n`)
  console.error('Un depot public publie tout ce qu\'il suit, y compris ce que personne')
  console.error('n\'a pense a relier a la bascule de visibilite. Retirer le fichier du')
  console.error('suivi (git rm --cached) et l\'ajouter au .gitignore.\n')
  console.error('Attention : retirer un fichier deja pousse ne le depublie PAS. Le commit')
  console.error('reste atteignable par son empreinte sur GitHub, meme sans branche qui y')
  console.error('mene. Le purger demande d\'ecrire au support GitHub.\n')
  for (const [f, etiquette] of fautes) console.error(`  ${f}  [${etiquette}]`)
  process.exit(1)
}

console.log(`Documents confidentiels : ${suivis.length} fichiers suivis, aucun document sensible.`)
