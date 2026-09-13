#!/usr/bin/env node
/**
 * Garde typographique francaise sur le TEXTE VISIBLE.
 *
 * Deux regles, et deux seulement, parce qu'elles sont les seules qui se
 * verifient sans juger du sens.
 *
 * 1. L'ESPACE AVANT LES PONCTUATIONS DOUBLES. Le francais demande une espace
 *    avant `? ! ; :`. L'application le fait dans la grande majorite des cartes,
 *    ce qui rend les manquements d'autant plus visibles quand deux versions se
 *    croisent au meme ecran. L'espace attendue est l'espace fine insecable
 *    U+202F : une espace ordinaire se casse en fin de ligne et laisse le point
 *    d'interrogation seul sur la ligne suivante.
 *
 * 2. LE VOUVOIEMENT D'UNE SEULE PERSONNE. L'application a DEUX destinataires -
 *    celui qui tient le telephone, qu'elle tutoie, et la tablee, qu'elle
 *    interpelle au pluriel. « Mettez-vous d'accord » adresse au groupe est
 *    juste ; « vous pouvez en citer » adresse au joueur qui enchérit ne l'est
 *    pas. La garde ne cherche donc PAS le mot « vous », qui serait un piege a
 *    faux positifs : elle cherche les formes de politesse au singulier, listees
 *    une par une.
 *
 * Ce qu'elle ne regarde jamais : les pages legales et le bandeau de cookies,
 * ou le vouvoiement est la norme et un tutoiement serait deplace ; les
 * commentaires ; les identifiants.
 */
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

const FINE = ' '

/** Formes de politesse adressees a UNE personne. Liste close, pas de devinette. */
const POLITESSE = [
  /\bvous (pouvez|avez|etes|êtes|voulez|devez|allez|preferez|préférez)\b/i,
  /\bvotre (tour|telephone|téléphone|prenom|prénom|carte|verre|choix)\b/i,
  /\bdites-le\b/i,
  /\bon ne vous\b/i,
]

const EXCLUS = [/components[\\/]legal[\\/]/, /components[\\/]cookies[\\/]/, /\.test\./]

function segmentsVisibles(source) {
  const segments = []
  for (const m of source.matchAll(/>([^<>{}]{3,})</g)) {
    const texte = m[1]
    const sansEntites = texte.replace(/&[a-zA-Z]+;/g, "'")
    if (/[=();[\]]|\/\/|\bconst\b|\breturn\b|=>/.test(sansEntites)) continue
    segments.push({ index: m.index + 1, texte })
  }
  for (const m of source.matchAll(/(?:aria-label|placeholder|title|alt)=["']([^"']{3,})["']/g)) {
    segments.push({ index: m.index, texte: m[1] })
  }
  return segments
}

/** Les chaines de contenu : les cartes de jeu, qui vivent hors du JSX. */
function chainesDeContenu(source) {
  const out = []
  for (const m of source.matchAll(/(?:text|question|answer|optionA|optionB|label|detail|title|subtitle|theme):\s*(['"])((?:\\.|(?!\1).)*)\1/g)) {
    out.push({ index: m.index, texte: m[2] })
  }
  return out
}

/**
 * Les paquets de cartes, qui sont en JSON.
 *
 * Ils ne passaient sous AUCUNE des deux gardes de texte : celles-ci lisaient
 * `.ts` et `.tsx`, et les quatre cent quatre-vingts cartes reellement servies
 * aux joueurs vivent dans `src/content/packs/*.json`. Vingt-cinq d'entre elles
 * portaient une ponctuation double collee, et personne ne le voyait - une garde
 * verte parce qu'elle ne mesure rien est le pire des deux mondes.
 */
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
      if (Array.isArray(noeud)) {
        noeud.forEach(visiter)
        return
      }
      if (noeud && typeof noeud === 'object') {
        for (const [cle, valeur] of Object.entries(noeud)) {
          if (typeof valeur === 'string' && CLES_TEXTE.has(cle)) {
            // La ligne est retrouvee dans le fichier brut : un JSON reserialise
            // n'a pas les memes numeros de ligne que celui du depot.
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

const CLES_TEXTE = new Set(['text', 'title', 'subtitle', 'label', 'detail'])

function ligneDe(source, index) {
  return source.slice(0, index).split('\n').length
}

const fichiers = [...globSync('src/**/*.tsx'), ...globSync('src/**/*.ts')].filter(
  (f) => !EXCLUS.some((motif) => motif.test(f)),
)

const fautesPonctuation = []
const fautesTon = []

const aExaminer = []
for (const fichier of fichiers) {
  const source = readFileSync(fichier, 'utf8')
  const segments = fichier.endsWith('.tsx')
    ? [...segmentsVisibles(source), ...chainesDeContenu(source)]
    : chainesDeContenu(source)
  for (const s of segments) aExaminer.push({ fichier, ligne: ligneDe(source, s.index), texte: s.texte })
}
for (const c of chainesDesPaquets()) aExaminer.push(c)

// Une garde verte parce qu'elle ne lit rien est le pire des deux mondes : on
// annonce donc ce qui a ete mesure, et on refuse de conclure sur le vide.
if (aExaminer.length < 400) {
  console.error(`Typographie FR : seulement ${aExaminer.length} chaines lues - l'extraction est cassee.`)
  process.exit(1)
}

{
  for (const { fichier, ligne, texte } of aExaminer) {
    // Les entites HTML sont DECODEES avant toute analyse de ponctuation.
    // `&apos;` se termine par un point-virgule precede d'un « s » : sans ce
    // decodage, la garde signalait comme faute chaque apostrophe echappee de
    // l'application, soit vingt chaines parfaitement correctes. Une garde qui
    // accuse ce qui va bien finit desactivee.
    const lisible = texte
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&[a-zA-Z]+;/g, ' ')
      .replace(/https?:[/][/]\S+/g, ' ')

    const collee = lisible.match(/[^\s\u0020\u00a0\u202f\\]([?!;:])/g)
    if (collee) {
      // `:` colle est admis dans une heure (23:41) et un ratio (4.5:1).
      const vraies = collee.filter((c) => !/[0-9][:;]/.test(c))
      if (vraies.length > 0) {
        fautesPonctuation.push({
          fichier,
          ligne,
          extrait: texte.trim().slice(0, 72),
          signes: vraies.join(' '),
        })
      }
    }

    // Une carte qui nomme DEUX joueurs s'adresse a deux personnes : « vous
    // devez vous ignorer » y est un pluriel juste, pas une politesse. Sans
    // cette exemption la garde accusait trois cartes correctes, et une garde
    // qui accuse ce qui va bien finit desactivee.
    const deuxDestinataires = /\{player2\}/.test(texte)

    for (const motif of deuxDestinataires ? [] : POLITESSE) {
      if (motif.test(texte)) {
        fautesTon.push({ fichier, ligne, extrait: texte.trim().slice(0, 72) })
        break
      }
    }
  }
}

let echec = false

if (fautesPonctuation.length) {
  console.error(`\nPonctuation double sans espace fine - ${fautesPonctuation.length} chaine(s).`)
  console.error(`Le francais demande une espace avant ? ! ; :, et l'espace fine insecable`)
  console.error(`U+202F plutot qu'une espace ordinaire, qui casse en fin de ligne.\n`)
  for (const f of fautesPonctuation.slice(0, 40)) {
    console.error(`  ${f.fichier}:${f.ligne}  [${f.signes}]  ${f.extrait}`)
  }
  if (fautesPonctuation.length > 40) console.error(`  ... et ${fautesPonctuation.length - 40} autres`)
  echec = true
}

if (fautesTon.length) {
  console.error(`\nVouvoiement d'une seule personne - ${fautesTon.length} chaine(s).`)
  console.error(`L'application tutoie celui qui tient le telephone et interpelle la tablee`)
  console.error(`au pluriel. Le pluriel reste juste ; c'est la politesse au singulier qui detonne.\n`)
  for (const f of fautesTon) console.error(`  ${f.fichier}:${f.ligne}  ${f.extrait}`)
  echec = true
}

if (echec) process.exit(1)

console.log(
  `Typographie FR : ${aExaminer.length} chaines lues (${fichiers.length} sources + les paquets JSON), ` +
    `espace fine U+${FINE.charCodeAt(0).toString(16).toUpperCase()} presente avant chaque ponctuation double, ` +
    `aucun vouvoiement au singulier.`,
)
