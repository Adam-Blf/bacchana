/**
 * Garde : un ecran de premier niveau ne rejoue pas la transition du cadre, et
 * les cinq ecrans du menu restent prechargeables.
 *
 * DEUX defauts, tous deux mesures au chronometre DANS la page, entre le clic
 * reel et l'apparition du titre d'arrivee (viewport 390x844, build de
 * production servi en local).
 *
 * 1. L'ANIMATION DE SORTIE EN DOUBLE. `App.tsx` enveloppe chaque ecran dans un
 *    cadre `AnimatePresence` qui porte deja `initial`, `animate` et `exit`.
 *    Huit ecrans portaient EN PLUS, sur leur propre `motion.div` racine, un
 *    `exit={{ opacity: 0, x: 50 }}` en ressort de raideur 200. Les deux
 *    s'empilaient, et `AnimatePresence` en mode `wait` attend la fin des DEUX
 *    avant de monter l'ecran suivant : le ressort interne mettait a lui seul
 *    470 ms a se poser. Retire du hub, le trajet vers le palmares est tombe de
 *    773 a 506 ms ; retire des sept autres, le retour vers le hub est tombe de
 *    470 a 205 ms.
 *
 *    L'animation d'ENTREE, elle, reste legitime : elle s'ajoute au cadre sans
 *    le retarder, personne ne l'attend.
 *
 * 2. UN `lazy()` POUR UN ECRAN DU MENU. `lazy()` n'interroge sa fabrique qu'au
 *    premier rendu : que le morceau soit deja telecharge ET deja evalue par le
 *    prechargement n'y change rien, la fabrique rend une promesse, le composant
 *    suspend, le repli de `Suspense` est monte. React bride alors la livraison
 *    du vrai contenu de 300 ms (`FALLBACK_THROTTLE_MS`), pour ne pas le faire
 *    clignoter. Mesure : premiere ouverture 505 ms, seconde 209 ms, soit
 *    exactement ces 300 ms - pour un ecran entierement en memoire. Les cinq
 *    ecrans du menu passent donc par `ecransDuMenu.tsx`, qui garde le module
 *    resolu et rend le composant directement. Les redeclarer en `lazy()` dans
 *    `App.tsx` rendrait le repli - et la bride - sans rien casser de visible
 *    en test.
 *
 * CE QUE CETTE GARDE NE VOIT PAS, ET CE QU'ELLE NE PRETEND PAS.
 *   - Elle ne mesure PAS une seule milliseconde. Une transition lente pour
 *     une autre raison - un rendu couteux, un ressort mou dans `App.tsx`, un
 *     effet au montage qui bloque - passe au vert. Elle verrouille deux
 *     FORMES dont on a montre le cout, pas la latence elle-meme.
 *   - Elle ne juge que les `motion.div` dont la classe porte `h-dvh` ou
 *     `min-h-dvh`, c'est-a-dire les racines plein ecran. Un `exit` sur un
 *     panneau interne, une carte, une phase de jeu est parfaitement legitime
 *     et n'est pas regarde : c'est la que vit l'essentiel de l'animation de
 *     cette application.
 *   - Elle ne verifie pas que les cinq ecrans sont REELLEMENT prechargables :
 *     seulement qu'ils ne sont pas redeclares en `lazy()` a cote. Un
 *     `prechargerEcransDuMenu()` retire du hub lui echappe.
 *   - Elle lit le source, pas le rendu. Un `exit` passe en prop, ou construit
 *     dans une variable, lui echappe.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const RACINE = process.env.RACINE_TRANSITIONS ?? '.'
const DOSSIERS = ['src/components/screens', 'src/components/legal']
const APP = 'src/App.tsx'
const MENU = 'src/utils/ecransDuMenu.tsx'

const fautes = []

/**
 * Les balises ouvrantes `<motion.div ...>` d'un source, attributs compris.
 *
 * On avance caractere par caractere en comptant les accolades : un attribut
 * JSX peut contenir `>` (une fleche de fonction, une comparaison), et couper
 * au premier `>` rencontre tronquerait la balise au milieu. La balise se
 * termine au premier `>` lu HORS accolade.
 */
function balisesMotionDiv(source) {
  const balises = []
  let i = 0
  while ((i = source.indexOf('<motion.div', i)) !== -1) {
    let profondeur = 0
    let j = i + '<motion.div'.length
    for (; j < source.length; j++) {
      const c = source[j]
      if (c === '{') profondeur++
      else if (c === '}') profondeur--
      else if (c === '>' && profondeur === 0) break
    }
    balises.push({ texte: source.slice(i, j), ligne: source.slice(0, i).split('\n').length })
    i = j
  }
  return balises
}

// 1. Aucune racine plein ecran ne porte sa propre animation de sortie.
for (const dossier of DOSSIERS) {
  const chemin = join(RACINE, dossier)
  for (const fichier of readdirSync(chemin).filter((f) => f.endsWith('.tsx'))) {
    const source = readFileSync(join(chemin, fichier), 'utf8')
    for (const { texte, ligne } of balisesMotionDiv(source)) {
      const pleinEcran = /className=(?:"[^"]*|\{[^}]*)\bmin-h-dvh|className=(?:"[^"]*|\{[^}]*)\bh-dvh/.test(texte)
      if (!pleinEcran) continue
      if (!/\bexit=/.test(texte)) continue
      fautes.push(
        `${dossier}/${fichier}:${ligne} - la racine plein ecran porte son propre ` +
          `\`exit\`, en plus de celui du cadre de transition d'App.tsx. ` +
          `\`AnimatePresence\` en mode \`wait\` attend la fin des DEUX : ce doublon ` +
          `coutait 470 ms par changement d'ecran. Retirer l'\`exit\` (garder ` +
          `l'\`initial\`/\`animate\`, qui ne retardent personne).`
      )
    }
  }
}

// 2. Aucun ecran du menu n'est redeclare en `lazy()` dans App.tsx.
const menu = readFileSync(join(RACINE, MENU), 'utf8')
const ecransDuMenu = [...menu.matchAll(/export const \[(\w+), /g)].map((m) => m[1])
if (ecransDuMenu.length === 0) {
  fautes.push(
    `${MENU} n'exporte plus aucun ecran sous la forme \`export const [Nom, precharger...]\` : ` +
      `ce controle ne verifie donc plus rien. Mettre la garde a jour avec la nouvelle forme.`
  )
}
const app = readFileSync(join(RACINE, APP), 'utf8')
for (const nom of ecransDuMenu) {
  const declare = new RegExp(`const ${nom}\\s*=\\s*lazy\\(`).test(app)
  if (!declare) continue
  fautes.push(
    `${APP} - \`${nom}\` est redeclare en \`lazy()\` alors qu'il est deja fourni, ` +
      `prechargeable, par ${MENU}. \`lazy()\` monte le repli de \`Suspense\` meme ` +
      `quand le module est deja en memoire, et React bride alors la livraison de ` +
      `300 ms. Importer l'ecran depuis ${MENU}.`
  )
}

if (fautes.length) {
  console.error(`\nTransitions d'ecran - ${fautes.length} faute(s).\n`)
  for (const f of fautes) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  `Transitions : aucune racine plein ecran ne double la sortie du cadre, ` +
    `les ${ecransDuMenu.length} ecrans du menu restent prechargeables.`
)
