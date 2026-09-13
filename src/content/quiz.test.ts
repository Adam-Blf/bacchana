import { describe, expect, it } from 'vitest'
import { QUIZ_QUESTIONS, type QuizCategory } from './quiz'

/**
 * Les défauts de FABRICATION d'une question de culture générale.
 *
 * Trois d'entre eux ont été joués en soirée avant d'être vus, et aucun n'était
 * visible à la relecture d'une carte isolée - ils ne sautent aux yeux qu'une
 * fois la question posée à voix haute devant cinq personnes :
 *
 *   1. la réponse était DANS la question (« la trilogie du Seigneur des
 *      anneaux » attendait « 3 », « quel instrument joue un batteur »
 *      attendait « la batterie ») ;
 *   2. la réponse en proposait DEUX, « accepté : ... », ce qui revient à n'en
 *      proposer aucune et laisse la table arbitrer un litige à 23 h ;
 *   3. la question et sa réponse se contredisaient (« quel légume » pour
 *      « l'avocat, techniquement un fruit »).
 *
 * Les contrôles sont SYNTAXIQUES, comme ceux de `scripts/check_contenu.mjs`.
 * Aucun test ne dira si une réponse est vraie - ça se vérifie à la main, une
 * fois, en écrivant la carte. Ce qui se vérifie mécaniquement, c'est qu'une
 * question ne se réponde pas toute seule.
 *
 * Ici et pas dans `scripts/` : la CI fait tourner `npm test` sur chaque poussée,
 * alors que la moitié des gardes du dossier `scripts/` n'y sont pas branchées.
 * Une garde que l'intégration continue n'exécute pas ne verrouille rien.
 */

/** Mots qui ne portent aucune information : leur présence des deux côtés ne dit rien. */
const MOTS_OUTILS = new Set([
  'dans', 'avec', 'pour', 'sans', 'sous', 'chez', 'vers', 'entre', 'plus', 'moins',
  'tous', 'tout', 'toute', 'toutes', 'cette', 'quel', 'quelle', 'quels', 'quelles',
  'combien', 'comment', 'quoi', 'lequel', 'laquelle', 'est', 'sont', 'etait', 'etaient',
  'elle', 'elles', 'leur', 'leurs', 'mais', 'donc', 'aussi', 'meme', 'environ',
  'premier', 'premiere', 'dernier', 'derniere', 'grand', 'grande', 'petit', 'petite',
])

/**
 * Les mots qui disent un nombre sans l'écrire, par valeur.
 *
 * C'est le défaut le plus coûteux et le plus invisible : « trilogie » répond
 * « 3 » avant le joueur, et la carte a survécu à toutes les relectures parce
 * qu'aucun caractère de la réponse n'apparaît dans la question.
 */
const MOTS_QUI_CHIFFRENT: Record<string, readonly string[]> = {
  '2': ['deux', 'duo', 'duel', 'binome', 'tandem', 'double', 'paire'],
  '3': ['trois', 'trio', 'trilogie', 'triple', 'triptyque', 'tiers'],
  '4': ['quatre', 'quatuor', 'quadruple', 'quart'],
  '5': ['cinq', 'quintette', 'quintuple'],
  '6': ['six', 'hexagone', 'sextuor'],
  '7': ['sept', 'septuor', 'semaine'],
  '8': ['huit', 'octogone', 'octuor', 'octave'],
  '9': ['neuf', 'neuvieme'],
  '10': ['dix', 'dizaine', 'decennie', 'decuple'],
  '11': ['onze'],
  '12': ['douze', 'douzaine'],
}

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function mots(texte: string): string[] {
  return normaliser(texte).split(' ').filter(Boolean)
}

/** Le radical : cinq lettres suffisent à rapprocher « batteur » de « batterie ». */
function radical(mot: string): string {
  return mot.slice(0, 5)
}

/** La partie de la réponse qui compte : ce qui précède la parenthèse de précision. */
function reponsePrincipale(answer: string): string {
  return answer.split('(')[0]
}

/**
 * Le nom de CLASSE que la question pose elle-même, et qu'une réponse a le droit
 * de reprendre.
 *
 * « Quel océan borde la Californie ? » - « l'océan Pacifique » n'est pas une
 * fuite : le mot vient de la question, la réponse est « Pacifique ». Sans cette
 * exemption la garde accuserait une formulation parfaitement juste, et une
 * garde qui accuse ce qui va bien finit désactivée (voir check_tile_ink.mjs).
 */
function nomsDeClasse(motsQuestion: string[]): Set<string> {
  const exempts = new Set<string>()
  motsQuestion.forEach((mot, i) => {
    const precedent = motsQuestion[i - 1]
    if (precedent && ['quel', 'quelle', 'quels', 'quelles'].includes(precedent)) exempts.add(mot)
    if (precedent === 'de' && motsQuestion[i - 2] === 'combien') exempts.add(mot)
    if (precedent === 'combien') exempts.add(mot)
  })
  return exempts
}

describe('QUIZ_QUESTIONS - fabrication', () => {
  it('porte des identifiants uniques et bien formés', () => {
    const ids = QUIZ_QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^qz-\d{3}$/)
  })

  it('pose une question lisible et donne une réponse non vide', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.question.endsWith('?'), `${q.id} ne se termine pas par un point d'interrogation`).toBe(true)
      expect(q.question.length, `${q.id} est trop courte`).toBeGreaterThanOrEqual(20)
      expect(q.question.length, `${q.id} est trop longue pour un écran de téléphone`).toBeLessThanOrEqual(160)
      expect(q.answer.trim().length, `${q.id} n'a pas de réponse`).toBeGreaterThan(0)
    }
  })

  it('ne laisse jamais la réponse dans la question', () => {
    const fuites: string[] = []
    for (const q of QUIZ_QUESTIONS) {
      const motsQuestion = mots(q.question)
      const exempts = nomsDeClasse(motsQuestion)
      const radicauxQuestion = new Set(
        motsQuestion.filter((m) => !exempts.has(m)).map(radical),
      )
      for (const mot of mots(reponsePrincipale(q.answer))) {
        if (mot.length < 4 || MOTS_OUTILS.has(mot)) continue
        if (radicauxQuestion.has(radical(mot))) {
          fuites.push(`${q.id} : « ${mot} » est déjà dans la question`)
        }
      }
    }
    expect(fuites).toEqual([])
  })

  it('ne chiffre pas la réponse dans la question', () => {
    const fuites: string[] = []
    for (const q of QUIZ_QUESTIONS) {
      const principale = reponsePrincipale(q.answer).trim()
      const valeur = principale.match(/^(\d+)\b/)?.[1]
      if (!valeur) continue
      const motsQuestion = new Set(mots(q.question))
      for (const indice of MOTS_QUI_CHIFFRENT[valeur] ?? []) {
        if (motsQuestion.has(indice)) fuites.push(`${q.id} : « ${indice} » annonce « ${valeur} »`)
      }
      if (motsQuestion.has(valeur)) fuites.push(`${q.id} : « ${valeur} » est écrit dans la question`)
    }
    expect(fuites).toEqual([])
  })

  it('ne propose jamais deux réponses acceptées', () => {
    const hesitations: string[] = []
    for (const q of QUIZ_QUESTIONS) {
      // « ou » entre deux réponses, « accepté », « techniquement » : autant de
      // signes que la carte n'a pas tranché et laisse la table se disputer.
      if (/accept[eé]|au choix|techniquement|\bou\b/i.test(q.answer)) {
        hesitations.push(`${q.id} : « ${q.answer} »`)
      }
    }
    expect(hesitations).toEqual([])
  })

  it('ne pose pas deux fois la même question', () => {
    const vues = new Map<string, string>()
    const doublons: string[] = []
    for (const q of QUIZ_QUESTIONS) {
      const empreinte = normaliser(q.question)
      const precedent = vues.get(empreinte)
      if (precedent) doublons.push(`${q.id} répète ${precedent}`)
      else vues.set(empreinte, q.id)
    }
    expect(doublons).toEqual([])
  })

  it('garde chaque catégorie assez fournie pour tenir une manche', () => {
    // On ne FIGE pas le total : un paquet qui grandit ne doit pas casser son
    // propre test. Ce qui compte est qu'aucune catégorie ne se vide au point de
    // toujours ressortir les mêmes cartes.
    const parCategorie = new Map<QuizCategory, number>()
    for (const q of QUIZ_QUESTIONS) {
      parCategorie.set(q.category, (parCategorie.get(q.category) ?? 0) + 1)
    }
    for (const [categorie, nombre] of parCategorie) {
      expect(nombre, `la catégorie ${categorie} est trop maigre`).toBeGreaterThanOrEqual(15)
    }
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(100)
  })
})
