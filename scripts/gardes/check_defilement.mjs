/**
 * Garde : rien ne coupe l'axe Y a la racine du document, et aucun calque plein
 * ecran ne trame en sous-pixel.
 *
 * DEUX defauts. Aucun des deux ne se reproduit dans un navigateur pilote, et
 * c'est exactement pourquoi ils sont verrouilles par leur FORME.
 *
 * 1. `overflow-x: clip` sur `html` ou sur `body`. `clip`, contrairement a
 *    `hidden`, INTERDIT le defilement par definition : un conteneur `clip`
 *    n'est pas defilable, meme par script. Sur l'element racine, c'est donc
 *    un document qui ne peut plus defiler des qu'un moteur etend la coupe a
 *    l'axe Y - ce que plusieurs rapports decrivent sur iOS Safari jusqu'en
 *    18.x. Six ecrans portent un en-tete `sticky top-0` qui attend un
 *    defilement du document : Reglages, Regles, Regles d'un mode, Regles
 *    maison, Palmares et les pages legales. La coupe horizontale que les
 *    transitions d'ecran reclament appartient au cadre de transition
 *    d'`App.tsx`, dont la hauteur epouse son contenu : elle n'a rien a faire
 *    en plus sur la racine, ou elle etait redondante.
 *
 * 2. Un rayon en demi-point CSS dans un motif de fond repete. `radial-gradient
 *    (couleur 0.5px, transparent 0.5px)` vaut 1.5 pixel physique en DPR 3 : la
 *    tuile n'a pas de trame exacte, et le moteur arrondit ce demi-pixel selon
 *    l'echelle a laquelle il la tramise. Sur un calque plein ecran - le grain
 *    est pose sur l'accueil, le hub, le tapis et les modes a consigne - un
 *    basculement d'arrondi change la densite d'encre de toute la surface d'un
 *    coup. Un point d'un point CSS plein tombe net a toutes les densites.
 *
 * CE QUE CETTE GARDE NE VOIT PAS, ET CE QU'ELLE NE PRETEND PAS.
 *   - Elle ne prouve pas que ces deux formes causaient le scintillement
 *     signale sur iPhone le 2026-09-14. La campagne de mesure qui a precede ce
 *     correctif a conclu, a raison, que rien ne bouge sur Chromium en DPR 3 :
 *     au repos, les seuls pixels qui changent sur l'accueil sont la colonne de
 *     1 px du curseur de saisie. Les deux formes sont des defauts par
 *     elles-memes - une coupe redondante qui interdit le defilement de la
 *     racine, une trame sans compte rond de pixels - et c'est a ce titre
 *     qu'elles sont interdites ici.
 *   - Elle lit `src/index.css`. Une coupe posee sur `html` depuis un
 *     composant, par `document.documentElement.style`, lui echappe. La coupe
 *     du cadre de transition, ecrite en classe Tailwind dans `App.tsx`, lui
 *     echappe aussi - et c'est voulu : c'est la seule qui doit rester.
 *   - Elle ne juge que les rayons valant un demi-point en `px`. Un `0.25px`,
 *     un `1.5px` ou un rayon en `rem` passent.
 *   - Elle ne dit rien du fait qu'un ecran DEBORDE : c'est legitime, a
 *     condition que le document puisse defiler. Elle garantit qu'il peut.
 */
import { readFileSync } from 'node:fs'

const FICHIER = 'src/index.css'
const source = readFileSync(FICHIER, 'utf8')

/** Le corps de la regle `html { ... }` ou `body { ... }`, commentaires retires. */
function corpsDeRegle(selecteur) {
  const debut = source.search(new RegExp(`^${selecteur}\\s*\\{`, 'm'))
  if (debut === -1) return ''
  const fin = source.indexOf('\n}', debut)
  return source.slice(debut, fin === -1 ? source.length : fin).replace(/\/\*[\s\S]*?\*\//g, '')
}

const fautes = []

for (const selecteur of ['html', 'body']) {
  const corps = corpsDeRegle(selecteur)
  const coupe = corps.match(/overflow(?:-x|-y)?\s*:\s*clip/)
  if (coupe) {
    fautes.push(
      `${selecteur} porte « ${coupe[0]} » : sur iOS Safari la coupe s'applique aussi a Y ` +
        `et interdit tout defilement du document. La coupe horizontale des transitions ` +
        `appartient au cadre de transition d'App.tsx, dont la hauteur epouse son contenu.`
    )
  }
}

/** Rayons en demi-point dans un motif de fond repete.
 *
 *  On decoupe en DECLARATIONS, pas a l'expression reguliere sur `gradient(...)`.
 *  Une premiere version bornait la recherche a `[^)]*?` apres `radial-gradient(`
 *  et ne franchissait donc pas la parenthese de `var(--grain-color)` : elle
 *  rendait vert le grain en 0.5px qui avait motive cette garde. */
const declarations = source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split(';')
  .filter((d) => d.includes('gradient('))
for (const declaration of declarations) {
  const demiPoint = declaration.match(/(?<![\d.])\d*\.5px/)
  if (!demiPoint) continue
  const rayon = demiPoint[0]
  fautes.push(
    `un motif de fond repete a un rayon de ${rayon} : jamais un compte rond de pixels ` +
      `physiques, donc une trame qui bascule d'un coup sur tout un calque plein ecran. ` +
      `Utiliser un rayon en points CSS entiers et ajuster background-size pour garder ` +
      `la meme couverture d'encre.`
  )
}

if (fautes.length) {
  console.error(`\nDefilement et trame - ${fautes.length} faute(s) dans ${FICHIER}.\n`)
  for (const f of fautes) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  `Defilement : ${FICHIER} ne coupe pas l'axe Y a la racine, aucun motif de fond en demi-pixel.`
)
