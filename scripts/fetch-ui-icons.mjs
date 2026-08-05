// Vendorise les icones du chrome UI en local (regle zero CDN) - script reproductible.
// Source : Icons8, style "Hatch" (traits pleins et epais, esprit gravure), le MEME style
// que les icones des modes (scripts/fetch-mode-icons.mjs) : un seul style sur toute
// l'app, fini le melange Hatch (modes) / filaire (chrome) qui trahissait un patchwork.
//
// Ces PNG monochromes sont rendus via CSS mask + backgroundColor: currentColor
// (src/components/ui/icons/Icon.tsx), donc ils suivent les deux themes sans variante.
//
// Licence : plan Icons8 gratuit, attribution obligatoire - le lien vers icons8.com
// figure dans les mentions legales (src/components/legal/MentionsLegalesScreen.tsx).
//
// Usage: node scripts/fetch-ui-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src', 'assets', 'icons', 'ui')
mkdirSync(outDir, { recursive: true })

// Cle = nom de fichier PNG (consomme par src/components/ui/icons/registry.ts),
// valeur = id Icons8 du style hatch, choisi via le MCP icons8 (recherche par
// metaphore, planche contact validee visuellement le 2026-08-05).
const ICONS = {
  'arrow-left': 'vnqUUEbrOiqX',  // fleche gauche - retours d'ecran
  'arrow-right': '6zRe7hb5RT0e', // fleche droite - CTA "continuer"
  book: 'PRDpguM69Eku',          // livre - regles du Coupe-Gorge
  brain: 'ynJJpl0grKW6',         // cerveau - quiz (partage avec le mode)
  check: '8FZJBNvt3gGe',         // coche - validations
  clock: 'wg6t8p1t5Sk2',         // horloge - timers de manche
  close: 'NvQ7QXYyF7eO',         // croix - fermetures de modale
  cookie: 'tJtzZBBfz0ao',        // cookie - bandeau de consentement
  crown: 'dv11MNIjLZvH',         // couronne - roi et taulier (partage)
  dice: '2ZoCwoQnYSqH',          // des - regles perso aleatoires
  'door-exit': '3jt8vGQZxzzi',   // porte de sortie - fin de partie
  eye: 'gEem2MeykyL5',           // oeil - reveler
  'eye-off': '3EdMPwZpkxdd',     // oeil barre - masquer
  flame: '6kJL0jix2nVs',         // flamme - action ou verite (partage)
  gavel: 'Pay3czT9Oynm',         // marteau - le Pilori (partage)
  gear: '01nEl1ROfhuO',          // engrenage - reglages
  gem: 'A7bx2xlqkGR2',           // joyau - dame des cartes
  help: '3yVcG23ou9FI',          // point d'interrogation - regles des modes
  home: 'O4uwtuMQi925',          // maison - retour a l'accueil
  infinity: 'AsSZO0hIy9KV',      // infini - mode cartes infinies
  layers: 'poCDqWsJXTXK',        // couches - nombre de paquets
  loader: 'wh6u4I7l37tx',        // cercle pointille - chargement (animation spin)
  lock: 'ZNuaaAffBMm9',          // cadenas - contenu premium verrouille
  medal: 'ZdmUKWCpj6JV',         // medaille - podium (partage)
  megaphone: 'WCCI8L2xmjKt',     // megaphone - la Criee (partage)
  minus: 'ENd8ksKmuPp3',         // moins - steppers d'enchere
  moon: 'IFfdqnyI37vc',          // lune - bascule theme sombre
  party: 'pH3unUXWvUHx',         // confettis - onboarding
  pencil: '036fSJ6Uqzi6',        // crayon - editions et regles perso
  play: 'vbh7leb0yfWs',          // triangle play - lancer une partie
  plus: 'VHwxsEt1nv6D',          // plus - ajouts
  receipt: 'NPd4NlJyrAhS',       // addition - l'ardoise du Pilori
  restart: 'duOIELcZcinz',       // fleche circulaire - rejouer
  scale: 'buSCkgPTDWHw',         // balance - votes et "tu preferes" (partage)
  scroll: 'c7mCna4ESdja',        // parchemin - ecrans de regles
  share: 'sCVV6VIdzajF',         // export - partager l'addition
  shield: 'E49BLaJL1PzD',        // bouclier - confidentialite
  sliders: '4KqxhLdoCRfu',       // curseurs - options et preferences
  sparkle: 'vFkiZVceZSre',       // eclat - premium et jokers
  stopwatch: 'ggkq7ZKoggie',     // chronometre - reset des timers (partage)
  'suit-club': 'RpX32QtoCWXB',   // trefle - enseigne de carte
  'suit-diamond': 'uthSn6CGWWqU',// carreau - enseigne de carte
  'suit-heart': '3mCZ36yWoNsf',  // coeur - enseigne de carte (partage)
  'suit-spade': 'VgjdTXf6ZKaD',  // pique - enseigne de carte
  sun: 'erGTUPuihZqM',           // soleil - bascule theme clair
  sword: 'AcH1EKe7caXg',         // epee - valet des cartes
  'thumbs-down': 'KA27wNHhVQDT', // pouce bas - verdict coupable
  'thumbs-up': 'S9UoxTCczq5a',   // pouce haut - verdict innocent
  trash: 'UM27jRDiW3hM',         // corbeille - suppressions
  'user-plus': '6qNXWsdXQAXq',   // ajout de joueur - une chaise de plus
  users: 'QN1t7yytS1zq',         // groupe - la tablee (partage)
  wheel: 'wUAb4st0wH3H',         // roulette - la Roue du Destin (partage)
  'wifi-off': '2JphZ0IWDTej',    // wifi barre - fonctionne hors ligne
  info: 'AIImWvfwW5WA',          // information - a propos
}

const SIZE = 192

for (const [name, id] of Object.entries(ICONS)) {
  const url = `https://img.icons8.com/?id=${id}&format=png&size=${SIZE}`
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`echec ${name} (${id}) : ${res.status}`)
    continue
  }
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(join(outDir, `${name}.png`), buf)
  console.log(`ok ${name}.png (${(buf.length / 1024).toFixed(1)} kB)`)
}
console.log('done')
