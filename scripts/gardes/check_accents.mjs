#!/usr/bin/env node
/**
 * Garde des accents sur le TEXTE VISIBLE.
 *
 * Le depot melange deux ecritures. Les commentaires et les identifiants sont
 * volontairement sans accent - c'est du code, il se lit dans un terminal et se
 * cherche au `grep`. Le texte lu par la tablee, lui, doit etre en francais
 * correct : « Lance la soiree », « le taulier explique la regle » ou « choisir
 * nous-memes » se sont retrouves a l'ecran, en gros, au centre de la page.
 *
 * Ce que la garde regarde, et rien d'autre :
 *   - le texte entre balises JSX,
 *   - les valeurs des attributs qui s'affichent ou se lisent (aria-label,
 *     placeholder, title, alt),
 *   - les chaines des fichiers de contenu (src/content).
 *
 * Ce qu'elle ne regarde JAMAIS : les commentaires, les imports, les noms de
 * classes, les cles d'objet, les identifiants. Un correcteur d'accents lache
 * sur du code a deja casse des identifiants et un selecteur CSS sur un autre
 * projet d'Adam - la lecon tient en une ligne : on ne corrige pas ce qu'on ne
 * sait pas distinguer.
 *
 * Le dictionnaire est volontairement EXPLICITE plutot que devine. Une regle du
 * genre « toute voyelle suivie de -ee » attraperait des faux positifs, et une
 * garde qui crie a tort finit desactivee.
 */
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

/** mot mal accentue -> forme juste. Compare en minuscules, sans casse. */
const FAUTES = new Map([
  ['soiree', 'soirée'],
  ['soirees', 'soirées'],
  ['regle', 'règle'],
  ['regles', 'règles'],
  ['numero', 'numéro'],
  ['memes', 'mêmes'],
  ['meme', 'même'],
  ['deja', 'déjà'],
  ['apres', 'après'],
  ['penalite', 'pénalité'],
  ['penalites', 'pénalités'],
  ['tablee', 'tablée'],
  ['enchainer', 'enchaîner'],
  ['enchainement', 'enchaînement'],
  ['ecran', 'écran'],
  ['epuise', 'épuisé'],
  // `termine` est RETIRE du dictionnaire : c'est l'imperatif de « terminer »,
  // parfaitement correct sans accent (« Termine une partie »), et la garde
  // accusait donc une phrase juste. Une garde qui accuse ce qui va bien finit
  // desactivee. `terminee`, lui, n'a pas de forme non accentuee valable et
  // reste surveille.
  ['terminee', 'terminée'],
  ['reponse', 'réponse'],
  ['reponses', 'réponses'],
  ['selectionne', 'sélectionné'],
  ['derniere', 'dernière'],
  ['premiere', 'première'],
  ['decu', 'déçu'],
  ['decue', 'déçue'],
  ['ecoule', 'écoulé'],
  ['ecoulee', 'écoulée'],
  ['elu', 'élu'],
  ['elue', 'élue'],
  ['distribuee', 'distribuée'],
  ['distribuees', 'distribuées'],
  ['verifie', 'vérifié'],
  ['prefere', 'préfère'],
  ['preferes', 'préfères'],
  ['proces', 'procès'],
  ['criee', 'criée'],
  ['enchere', 'enchère'],
  ['encheres', 'enchères'],
  ['theme', 'thème'],
  ['themes', 'thèmes'],
  ['tres', 'très'],
  ['cle', 'clé'],
  ['cles', 'clés'],
  ['annee', 'année'],
  ['reprendre', null], // forme juste, sert de temoin negatif
])

const MOTS = [...FAUTES.entries()].filter(([, juste]) => juste !== null)

/** Extrait les segments de texte VISIBLE d'un fichier source. */
function segmentsVisibles(source) {
  const segments = []

  // 1. Texte entre balises JSX : > ... <  , en excluant ce qui contient une
  //    accolade (c'est une expression, pas du texte).
  //
  //    Le motif « ce qui se trouve entre un chevron fermant et un chevron
  //    ouvrant » attrape aussi du CODE : `useEtatDeManche<Record<string,
  //    number>>('x', ...)` en contient, et les generiques TypeScript aussi.
  //    D'ou le filtre ci-dessous, qui rejette tout segment portant un signe de
  //    ponctuation de code. Une garde qui signale une faute dans un appel de
  //    fonction envoie corriger un fichier a un endroit ou il n'y a rien a
  //    corriger, et c'est ainsi qu'on la desactive.
  for (const m of source.matchAll(/>([^<>{}]{3,})</g)) {
    const texte = m[1]
    // Les entites HTML se neutralisent AVANT le test : `&apos;` porte un
    // point-virgule, et le rejeter rendait muette toute phrase contenant une
    // apostrophe echappee - c'est-a-dire la moitie des phrases de l'app.
    const sansEntites = texte.replace(/&[a-zA-Z]+;/g, "'")
    if (/[=();[\]]|\/\/|\bconst\b|\breturn\b|=>/.test(sansEntites)) continue
    segments.push({ index: m.index + 1, texte })
  }

  // 2. Attributs qui s'affichent ou se lisent a voix haute.
  for (const m of source.matchAll(/(?:aria-label|placeholder|title|alt)=["']([^"']{3,})["']/g)) {
    segments.push({ index: m.index, texte: m[1] })
  }

  return segments
}

function ligneDe(source, index) {
  return source.slice(0, index).split('\n').length
}

/**
 * Les paquets de cartes, qui sont en JSON.
 *
 * Cette garde lisait `.tsx` et `.ts`. Or les quatre cent quatre-vingts cartes
 * reellement servies aux joueurs vivent dans `src/content/packs/*.json`, et
 * l'une d'elles portait « meme la nuit, meme quand tu lui demandes d'arrreter »
 * - deux accents manquants et une triple consonne, affiches tels quels. Une
 * garde qui ne lit pas ce qui s'affiche est verte pour la mauvaise raison.
 */
const CLES_TEXTE = new Set(['text', 'title', 'subtitle', 'label', 'detail'])

function chainesDesPaquets() {
  const out = []
  for (const fichier of globSync('src/content/packs/*.json')) {
    const brut = readFileSync(fichier, 'utf8')
    let donnees
    try {
      donnees = JSON.parse(brut)
    } catch {
      continue
    }
    const visiter = (noeud) => {
      if (Array.isArray(noeud)) return noeud.forEach(visiter)
      if (noeud && typeof noeud === 'object') {
        for (const [cle, valeur] of Object.entries(noeud)) {
          if (typeof valeur === 'string' && CLES_TEXTE.has(cle)) {
            const position = brut.indexOf(JSON.stringify(valeur))
            out.push({
              fichier,
              ligne: position === -1 ? 0 : brut.slice(0, position).split('\n').length,
              texte: valeur,
            })
          } else {
            visiter(valeur)
          }
        }
      }
    }
    visiter(donnees)
  }
  return out
}

const fichiers = [
  ...globSync('src/**/*.tsx'),
  ...globSync('src/content/**/*.ts'),
].filter((f) => !f.endsWith('.test.tsx') && !f.endsWith('.test.ts'))

const trouvees = []

const aExaminer = []
for (const fichier of fichiers) {
  const source = readFileSync(fichier, 'utf8')
  for (const { index, texte } of segmentsVisibles(source)) {
    aExaminer.push({ fichier, ligne: ligneDe(source, index), texte })
  }
}
for (const c of chainesDesPaquets()) aExaminer.push(c)

// Une garde verte parce qu'elle ne lit rien est le pire des deux mondes.
if (aExaminer.length < 400) {
  console.error(`Accents : seulement ${aExaminer.length} chaines lues - l'extraction est cassee.`)
  process.exit(1)
}

{
  for (const { fichier, ligne, texte } of aExaminer) {
    for (const [faute, juste] of MOTS) {
      // Bornes de mot : « regle » ne doit pas matcher dans « reglementaire ».
      const motif = new RegExp(`(?<![\\p{L}])${faute}(?![\\p{L}])`, 'giu')
      if (motif.test(texte)) {
        trouvees.push({ fichier, ligne, faute, juste, texte: texte.trim().slice(0, 70) })
      }
    }
  }
}

if (trouvees.length > 0) {
  console.error(`Accents : ${trouvees.length} occurrence(s) dans du texte visible.\n`)
  for (const t of trouvees) {
    console.error(`  ${t.fichier}:${t.ligne}  « ${t.faute} » -> « ${t.juste} »`)
    console.error(`    ${t.texte}`)
  }
  process.exit(1)
}

console.log(
  `Accents : ${aExaminer.length} chaines lues (${fichiers.length} sources + les paquets JSON), ` +
    `aucun mot non accentue dans le texte visible.`,
)
