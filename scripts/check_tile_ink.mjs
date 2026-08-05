#!/usr/bin/env node
/**
 * Garde : pas d'encre thematique sur un aplat qui reste clair.
 *
 * Le defaut. Les aplats pop, le neon et les faces de carte restent CLAIRS dans
 * les deux themes. Un cerne ou une ombre indexes sur `--color-ink` y passent au
 * creme en theme sombre : mesure entre 1.20 et 1.21:1, le cerne disparait et
 * l'ombre devient un halo plus clair que ce qu'elle porte.
 *
 * Pourquoi une garde. Le defaut a d'abord ete corrige sur la seule tuile de
 * mode alors qu'il existait a trente endroits, dont la grande tuile d'accueil
 * et la carte a jouer elle-meme. Un bug qui se recopie a l'identique dans tout
 * un depot ne se corrige pas a la main, il se verrouille.
 *
 * Unite d'analyse : le BLOC `className`, pas la ligne. Une premiere version
 * ligne a ligne manquait les cas ou le fond et le cerne sont ecrits sur deux
 * lignes du meme appel a `cn()`. Une deuxieme version decoupait a l'expression
 * reguliere et rendait des fragments arbitraires : elle laissait passer une
 * regression introduite pour la tester. D'ou l'equilibrage explicite ci-dessous.
 *
 * CE QUE CETTE GARDE NE VOIT PAS. Elle lit des CLASSES de fond. Des qu'un fond
 * vient d'ailleurs, elle est aveugle :
 *   - une couleur passee par prop, `<ModeTile color={mode.tileColor} />` ;
 *   - une image de fond, comme les trois dos du paquet dans GameBoard, qui
 *     etaient cernes de creme en theme sombre et n'ont ete vus qu'a l'ecran.
 * Ces cas restent a la charge de la relecture et de la capture. La garde couvre
 * les fonds ecrits en clair - la grande majorite - et ne pretend pas plus.
 */
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

/** Fonds invariants clairs : ils ne s'inversent pas avec le theme. */
const FOND_CLAIR = /(?<!hover:)\bbg-(pop-[a-z]+|neon|card-face)\b/
/** Jetons indexes sur --color-ink, qui s'inversent avec le theme. */
const ENCRE_THEME = /(?<!hover:)\b(border-ink|shadow-brutal(-sm|-lg)?)\b/

/**
 * Decoupe un fichier en blocs `className`, par equilibrage.
 *
 * Depuis chaque `className=`, on suit soit une chaine entre guillemets, soit une
 * expression entre accolades dont on compte les niveaux. Pas d'heuristique : la
 * fin du bloc est celle que lit le compilateur.
 */
function blocs(source) {
  const out = []
  const ancre = 'className='
  let i = 0
  while ((i = source.indexOf(ancre, i)) !== -1) {
    let j = i + ancre.length
    const ligne = source.slice(0, i).split('\n').length
    if (source[j] === '"' || source[j] === "'") {
      const q = source[j]
      const fin = source.indexOf(q, j + 1)
      if (fin === -1) break
      out.push({ ligne, texte: source.slice(j + 1, fin) })
      i = fin + 1
    } else if (source[j] === '{') {
      let n = 0
      let k = j
      for (; k < source.length; k++) {
        if (source[k] === '{') n++
        else if (source[k] === '}') {
          n--
          if (n === 0) break
        }
      }
      out.push({ ligne, texte: source.slice(j + 1, k) })
      i = k + 1
    } else {
      i = j
    }
  }
  return out
}

const fichiers = globSync('src/**/*.tsx')
const fautes = []

for (const f of fichiers) {
  const source = readFileSync(f, 'utf-8')
  for (const b of blocs(source)) {
    // Les commentaires sont retires AVANT toute analyse. Sans cela, un
    // commentaire expliquant « utiliser border-tile-ink » declenchait
    // l'exemption ci-dessous et la garde s'aveuglait elle-meme, precisement
    // dans les blocs ou l'on avait pris la peine de documenter le piege.
    const code = b.texte.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
    if (!FOND_CLAIR.test(code) || !ENCRE_THEME.test(code)) continue
    // Une bascule legitime porte les DEUX cernes, un par branche de fond :
    // l'encre thematique sur la surface, l'encre fixe sur l'aplat pop.
    if (/border-tile-ink/.test(code) && /\bborder-ink\b/.test(code)) continue
    fautes.push(`${f}:${b.ligne}`)
  }
}

if (fautes.length) {
  console.error(
    `\nEncre thematique sur aplat clair - ${fautes.length} bloc(s).\n` +
      `Utiliser border-tile-ink et shadow-tile*, invariants au theme.\n`
  )
  for (const x of fautes) console.error(`  ${x}`)
  process.exit(1)
}

console.log(`Aplats clairs : ${fichiers.length} fichiers verifies, aucun cerne thematique.`)
