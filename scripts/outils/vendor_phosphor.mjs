#!/usr/bin/env node
/**
 * Rapatrie le jeu d'icones depuis Phosphor, en local, dans `public/icons/`.
 *
 * POURQUOI CE SCRIPT REMPLACE `vendor_icons8.py`. Icons8 imposait deux choses
 * dont le depot n'avait pas besoin : un compte paye dont la licence conditionne
 * la redistribution des fichiers, et une recherche par API qui rendait des
 * identifiants numeriques opaques - c'est ainsi que `pique` a livre une beche
 * de jardin en production sous un identifiant qui annoncait "Spade". Phosphor
 * est sous licence MIT et se distribue en paquet npm : les 1512 dessins sont
 * sur le disque, nommes en clair, et la correspondance ci-dessous se relit.
 *
 * Aucun appel reseau a l'execution du script, aucun CDN a l'execution de
 * l'app : les SVG sont copies dans `public/icons/` et servis en chemin
 * relatif, donc l'app reste entiere hors ligne.
 *
 * UN SEUL POIDS : `fill`. Phosphor en propose six (thin, light, regular, bold,
 * fill, duotone) et c'est precisement le piege - un jeu d'icones melange se
 * voit immediatement a l'ecran et ne se rattrape pas icone par icone. `fill`
 * est le seul qui reprend ce que faisait le style plein d'Icons8 : une forme, sans
 * contour, qui se peint entierement en `currentColor` a travers le masque CSS
 * d'`Icon.tsx`. Un poids a contour rendrait un masque troue.
 *
 * LES NOMS SONT DES INTENTIONS, PAS DES DESSINS. `quitter`, pas `porte`. La
 * colonne de gauche de CORRESPONDANCE ne change pas quand la source change :
 * c'est ce qui a permis de passer de lucide a Icons8 puis a Phosphor sans
 * toucher un seul des 200 appels a `<Icon name="..." />`.
 *
 * CE QUE CE SCRIPT NE VERIFIE PAS. Le DESSIN. Il garantit qu'un fichier existe
 * sous le bon nom, jamais qu'il montre la bonne chose : c'est exactement le
 * defaut de la beche de jardin, et aucune garde automatique ne le verra. Le
 * controle se fait a l'oeil, une fois, au moment ou l'on ecrit la ligne.
 */
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const POIDS = 'fill'

/**
 * Les cinq icones qui NE PEUVENT PAS etre en `fill`, et pourquoi.
 *
 * Phosphor n'a rien a remplir dans une marque qui n'est qu'un trait - un plus,
 * un moins, une croix, une coche, un huit couche. Son poids `fill` leur donne
 * donc autre chose : un ECUSSON, un carre arrondi plein dont la marque est
 * decoupee en negatif. Vu au travers du masque CSS, qui ne lit que la
 * geometrie, le bouton « + » d'une tablee devient un PAVE D'ENCRE de 20 px.
 * Releve a l'oeil sur planche contact le 2026-09-14, pas par une garde.
 *
 * `bold` est le meme dessin sans l'ecusson, au trait epais qui tient a cote
 * d'une forme pleine. Ce sont des chemins remplis, pas des traces : le masque
 * les rend entiers.
 *
 * DEUX ECUSSONS SONT GARDES EXPRES. `ticket` est un recu et `vote` une case a
 * cocher : la boite EST le dessin, pas un cadre autour. Un detecteur
 * automatique d'ecussons les accusait tous les deux - c'est pourquoi cette
 * liste est ecrite a la main et relue, et non deduite.
 */
const POIDS_PARTICULIERS = {
  plus: 'bold',
  moins: 'bold',
  fermer: 'bold',
  valider: 'bold',
  infini: 'bold',
}

const ASSETS = join(RACINE, 'node_modules/@phosphor-icons/core/assets')
const poidsDe = (nom) => POIDS_PARTICULIERS[nom] ?? POIDS
const SOURCE = join(ASSETS, POIDS)
const CIBLE = join(RACINE, 'public/icons')
const NOMS = join(RACINE, 'src/components/ui/icon-names.ts')
const MANIFESTE = join(CIBLE, 'manifest.json')

/**
 * nom d'intention -> nom Phosphor.
 *
 * Les choix qui ne vont PAS de soi, et pourquoi :
 *   - `gemme` est l'embleme de la dame, « la dame au joyau ». Phosphor n'a pas
 *     de gemme. `diamond` etait exclu : c'est le dessin de `carreau`, et les
 *     deux se retrouvent sur la meme carte - une dame de carreau aurait porte
 *     deux fois le meme glyphe. `diamonds-four` lit comme un joyau taille et
 *     ne se confond avec aucune enseigne.
 *   - `roue` est La Roue du Destin. `steering-wheel` lit comme un volant,
 *     `record` comme un disque : `pinwheel` est le seul cercle decoupe en
 *     secteurs, ce qu'est une roue de loterie.
 *   - `chut` sert la phase « Un mot chacun » du Faux Frere, dont la regle est
 *     « interdit de prononcer le mot lui-meme ». Phosphor n'a pas de doigt sur
 *     les levres ; `chat-circle-slash`, la bulle barree, dit la meme interdiction
 *     sans detour.
 *   - `main-levee` prend `hand-palm` (paume ouverte, face a la table) et non
 *     `hand`, qui est une main de cote : le vote du Tribunal se fait a main
 *     levee, paume visible.
 *   - `ecrire` et `editer` coexistent depuis lucide et ne sont pas synonymes
 *     ici : `note-pencil` est l'action d'ecrire une regle, `pencil-simple` la
 *     retouche d'une valeur deja posee.
 *   - `etoile` est une DETTE PAYEE. La demande d'avis affichait une medaille
 *     avec ce commentaire : « l'etoile serait le symbole juste, mais le
 *     catalogue vendorise n'en contient pas et le plan SVG Icons8 refuse
 *     actuellement les telechargements ». Phosphor a `star`, et ne demande
 *     ni cle ni abonnement : la medaille laisse la place a l'etoile.
 */
const CORRESPONDANCE = {
  accueil: 'house',
  aide: 'question',
  'ajouter-joueur': 'user-plus',
  appui: 'hand-tap',
  balance: 'scales',
  bouclier: 'shield',
  cadenas: 'lock',
  cadran: 'gauge',
  carreau: 'diamond',
  cerveau: 'brain',
  chargement: 'spinner-gap',
  chronometre: 'timer',
  chut: 'chat-circle-slash',
  coeur: 'heart',
  cookie: 'cookie',
  couronne: 'crown',
  curseurs: 'sliders-horizontal',
  des: 'dice-five',
  ecrire: 'note-pencil',
  editer: 'pencil-simple',
  epee: 'sword',
  etincelles: 'sparkle',
  etoile: 'star',
  fermer: 'x',
  fete: 'confetti',
  flamme: 'fire',
  gemme: 'diamonds-four',
  horloge: 'clock',
  'hors-ligne': 'wifi-slash',
  infini: 'infinity',
  info: 'info',
  jouer: 'play',
  joueurs: 'users-three',
  livre: 'book',
  lune: 'moon',
  'main-levee': 'hand-palm',
  'marteau-juge': 'gavel',
  masque: 'mask-happy',
  medaille: 'medal',
  megaphone: 'megaphone',
  moins: 'minus',
  oeil: 'eye',
  'oeil-barre': 'eye-slash',
  paquets: 'stack',
  partager: 'share-network',
  pique: 'spade',
  plus: 'plus',
  'pouce-bas': 'thumbs-down',
  'pouce-haut': 'thumbs-up',
  quitter: 'sign-out',
  recommencer: 'arrow-counter-clockwise',
  reglages: 'gear',
  retour: 'arrow-left',
  roue: 'pinwheel',
  soleil: 'sun',
  suivant: 'arrow-right',
  supprimer: 'trash',
  ticket: 'receipt',
  trefle: 'club',
  valider: 'check',
  vote: 'check-square',
}

if (!existsSync(SOURCE)) {
  console.error(
    `Les dessins Phosphor sont introuvables dans ${SOURCE}.\n` +
      `Installer la dependance de developpement : npm install -D @phosphor-icons/core`
  )
  process.exit(1)
}
mkdirSync(CIBLE, { recursive: true })

/**
 * Un SVG Phosphor porte `<rect width="256" height="256" fill="none"/>` en
 * premiere forme. Inoffensif dans un `<img>`, FATAL dans un masque CSS : le
 * masque ne lit que la geometrie, pas le `fill`, donc ce rectangle couvre
 * toute la surface et l'icone se peint en carre plein. Il est retire ici, pas
 * a l'execution, pour que ce qui est servi soit deja juste.
 */
function nettoyer(svg) {
  return svg
    .replace(/<rect[^>]*fill="none"[^>]*\/>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

const manifeste = {
  source: 'Phosphor Icons',
  poids: POIDS,
  poids_particuliers: POIDS_PARTICULIERS,
  format: 'svg',
  licence: 'MIT - https://github.com/phosphor-icons/core/blob/main/LICENSE',
  version: JSON.parse(
    readFileSync(join(RACINE, 'node_modules/@phosphor-icons/core/package.json'), 'utf8')
  ).version,
  genere_par: 'scripts/outils/vendor_phosphor.mjs',
  icones: {},
}

const noms = Object.keys(CORRESPONDANCE).sort()
let ecrits = 0
for (const nom of noms) {
  const slug = CORRESPONDANCE[nom]
  const poids = poidsDe(nom)
  const origine = join(ASSETS, poids, `${slug}-${poids}.svg`)
  if (!existsSync(origine)) {
    console.error(`Dessin Phosphor absent : ${nom} -> ${slug}-${poids}.svg`)
    process.exit(1)
  }
  const svg = nettoyer(readFileSync(origine, 'utf8'))
  if (/fill="none"/.test(svg)) {
    console.error(`${nom} garde un fill="none" apres nettoyage : le masque rendrait un carre plein.`)
    process.exit(1)
  }
  writeFileSync(join(CIBLE, `${nom}.svg`), svg + '\n')
  manifeste.icones[nom] = { phosphor: slug, poids, octets: svg.length }
  ecrits++
}

// Les fichiers d'un ancien jeu qui ne sont plus references : on les retire, pour
// qu'aucun reliquat Icons8 ne survive en tas dans `public/`.
const restes = readdirSync(CIBLE).filter((f) => f.endsWith('.svg') && !noms.includes(f.replace('.svg', '')))
for (const reste of restes) unlinkSync(join(CIBLE, reste))

writeFileSync(MANIFESTE, JSON.stringify(manifeste, null, 2) + '\n')

writeFileSync(
  NOMS,
  `// Genere par scripts/outils/vendor_phosphor.mjs. Ne pas editer a la main.\n` +
    `// Relancer : npm run icones\n` +
    `//\n` +
    `// Les noms sont des INTENTIONS, pas des dessins : \`quitter\`, pas \`porte\`.\n` +
    `// C'est ce qui a permis de passer de lucide a Icons8 puis a Phosphor sans\n` +
    `// toucher un seul appel a <Icon name="..." />. La correspondance vers les\n` +
    `// dessins Phosphor, et les choix qui ne vont pas de soi, sont dans le script.\n` +
    `\nexport const ICON_NAMES = [\n` +
    noms.map((n) => `  '${n}',`).join('\n') +
    `\n] as const\n\nexport type IconName = (typeof ICON_NAMES)[number]\n`
)

const exceptions = Object.keys(POIDS_PARTICULIERS)
console.log(
  `Phosphor ${manifeste.version}, poids ${POIDS} (sauf ${exceptions.length} en bold : ` +
    `${exceptions.join(', ')}) : ${ecrits} icones ecrites dans public/icons/` +
    (restes.length ? `, ${restes.length} reliquat(s) retire(s) : ${restes.join(', ')}` : '')
)
