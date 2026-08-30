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

/** Fonds invariants clairs : ils ne s'inversent pas avec le theme.
 *
 *  CORRIGE LE 2026-08-31, et c'est la partie la plus importante de ce fichier.
 *  Ce motif cherchait `bg-pop-[a-z]+`, et le suivant `shadow-brutal`. Le
 *  renommage de la palette du 30/08 a mis les DEUX a zero occurrence :
 *  `bg-pop-*` est devenu `bg-aplat-*` (53 usages) et l'alias `shadow-brutal` a
 *  ete supprime de la configuration Tailwind. La garde tournait, annoncait
 *  « 41 fichiers verifies, aucun cerne thematique », et ne surveillait plus
 *  qu'un fond sur trois contre un seul jeton d'encre. Verte sur une palette
 *  morte, pendant que douze echecs reels vivaient dans le depot.
 *
 *  La lecon n'est pas de mieux tenir cette liste : c'est qu'un renommage doit
 *  relire les GARDES avant les fichiers. Un fichier qui ne compile plus se
 *  voit ; une garde qui ne correspond plus a rien se tait. */
const FOND_CLAIR = /(?<!hover:)\bbg-(aplat-[a-z0-9]+|neon|card-face)\b(?!\/)/
/** Jetons indexes sur --color-ink, qui s'inversent avec le theme.
 *
 *  Les `text-*` ont ete ajoutes le 2026-08-31 : la version precedente ne
 *  connaissait que les cernes et les ombres, alors que les douze echecs reels
 *  mesures ce jour-la, entre 1,34:1 et 2,01:1, etaient tous du TEXTE - dont
 *  celui qui annonce la penalite, a 1,94:1 dans le theme de reference.
 *
 *  `shadow-gravure` N'Y FIGURE PAS, et c'est deliberé. En l'ajoutant, la garde
 *  a d'abord accuse douze blocs corrects. Le filet grave est indexe sur
 *  `--color-filet-clair`, redefini dans les trois themes : il s'adapte au
 *  fond au lieu de s'y fondre. Une garde qui accuse ce qui est juste finit
 *  desactivee, ce qui est pire que pas de garde - donc on ne l'elargit qu'aux
 *  jetons dont on a VERIFIE qu'ils suivent `--color-ink`. */
const ENCRE_THEME =
  /(?<!hover:)\b(border-ink|text-(ink|ink-muted|ink-secondary|neon|danger|success|warning))\b(?!\/)/

/**
 * Decoupe un fichier en blocs `className`, par equilibrage.
 *
 * Depuis chaque `className=`, on suit soit une chaine entre guillemets, soit une
 * expression entre accolades dont on compte les niveaux. Pas d'heuristique : la
 * fin du bloc est celle que lit le compilateur.
 */
/**
 * Retrait de la ligne qui porte un `className`, en nombre d'espaces.
 *
 * Sert de mesure d'IMBRICATION. Le depot est formate par Prettier, donc le
 * retrait suit fidelement la profondeur JSX. Ce n'est pas un analyseur
 * syntaxique et ca ne pretend pas l'etre : c'est la mesure la moins chere qui
 * distingue un parent d'un enfant, et cette distinction est tout ce qui
 * manquait a cette garde.
 */
/**
 * Retrait de la BALISE qui porte ce `className`, en nombre d'espaces.
 *
 * On remonte jusqu'au `<` ouvrant, et non jusqu'au debut de la ligne du
 * `className`. Corrige le 2026-08-31 : un `className` est un ATTRIBUT, donc
 * ecrit un niveau plus profond que sa balise des que l'element est multiligne.
 * Mesurer la ligne de l'attribut donnait 14 la ou l'element vit a 12, et les
 * enfants a 14 n'apparaissaient alors pas comme plus profonds. Trois defauts
 * sur six passaient au travers pour cette seule raison, dont celui qui annonce
 * la penalite.
 *
 * Sert de mesure d'IMBRICATION. Le depot est formate par Prettier, donc le
 * retrait suit fidelement la profondeur JSX. Ce n'est pas un analyseur
 * syntaxique et ca ne pretend pas l'etre : c'est la mesure la moins chere qui
 * distingue un parent d'un enfant, et cette distinction est tout ce qui
 * manquait a cette garde.
 */
function retraitDe(source, position) {
  let ouvrante = position
  while (ouvrante > 0) {
    if (source[ouvrante] === '<' && /[A-Za-z]/.test(source[ouvrante + 1] ?? '')) break
    ouvrante--
  }
  const debutLigne = source.lastIndexOf('\n', ouvrante) + 1
  let n = 0
  while (source[debutLigne + n] === ' ') n++
  return n
}

/** Numero de ligne, 1-indexe, d'une position dans la source. */
function ligneDe(source, position) {
  let n = 1
  for (let i = 0; i < position; i++) if (source[i] === '\n') n++
  return n
}

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
      out.push({
        ligne,
        texte: source.slice(j + 1, fin),
        retrait: retraitDe(source, i),
        ligneFin: ligneDe(source, fin),
      })
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
      out.push({
        ligne,
        texte: source.slice(j + 1, k),
        retrait: retraitDe(source, i),
        ligneFin: ligneDe(source, k),
      })
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
  const lignes = source.split('\n')
  // Portee d'un element : de sa ligne jusqu'a la premiere ligne NON VIDE dont
  // le retrait est inferieur ou egal au sien. C'est l'ajout du 2026-08-31, et
  // c'est ce qui manquait le plus : avant, chaque bloc `className` etait juge
  // SEUL. Or le defaut reel se presente presque toujours en deux morceaux -
  // `bg-card-face` sur la div parente, `text-ink-muted` sur le <p> enfant -
  // donc dans deux blocs differents, dont aucun n'est fautif pris isolement.
  //
  // Premiere tentative, corrigee le meme jour : une pile depilee au prochain
  // `className` moins profond. Elle a rendu onze accusations FAUSSES, parce
  // qu'entre la fermeture d'une carte et le bloc suivant il n'y avait aucun
  // `className` au bon retrait - l'ancetre restait empile bien apres sa mort.
  // On calcule donc la portee dans le TEXTE, pas dans la suite des blocs.
  // On part de la fin du bloc `className`, pas de son debut. Sur un `cn()`
  // multiligne, le `>` qui ferme la balise d'ouverture est ecrit au retrait de
  // l'element lui-meme : partir du debut faisait fermer la portee sur ce `>`,
  // donc AVANT les enfants. C'est ce qui laissait passer trois defauts sur six,
  // dont la penalite. Les lignes de pure ponctuation JSX sont sautees pour la
  // meme raison.
  const PONCTUATION = /^[>)}\]/\s]*$/
  const finDePortee = (ligneFin, retrait) => {
    for (let n = ligneFin; n < lignes.length; n++) {
      const l = lignes[n]
      if (!l.trim() || PONCTUATION.test(l)) continue
      if (l.length - l.trimStart().length <= retrait) return n
    }
    return lignes.length
  }
  const fondsOuverts = []
  for (const b of blocs(source)) {
    // Les commentaires sont retires AVANT toute analyse. Sans cela, un
    // commentaire expliquant « utiliser border-tile-ink » declenchait
    // l'exemption ci-dessous et la garde s'aveuglait elle-meme, precisement
    // dans les blocs ou l'on avait pris la peine de documenter le piege.
    const code = b.texte.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

    const fondIci = FOND_CLAIR.test(code)
    const encreIci = ENCRE_THEME.test(code)

    // Une bascule legitime porte les DEUX cernes, un par branche de fond :
    // l'encre thematique sur la surface, l'encre fixe sur l'aplat.
    const bascule = /border-tile-ink/.test(code) && /\bborder-ink\b/.test(code)

    // Un fond OPAQUE pose sur l'element lui-meme coupe l'heritage : ce qui est
    // dessous n'est plus visible, l'encre est jugee contre ce fond-la. Un fond
    // TRANSLUCIDE (`bg-x/20`) ne coupe rien - il laisse voir la carte creme, et
    // c'est exactement le cas d'un `border-ink` sur `bg-card-red/20`.
    //
    // Ajoute apres coup : sans cette regle la garde accusait trois elements
    // corrects qui declaraient `bg-surface`, donc un fond qui suit le theme.
    // L'ancrage de fin est `(?![a-z0-9-/])` et non `\b(?!\/)`. Avec `\b`, sur
    // `bg-card-red/20` le moteur matche le prefixe `bg-card` - suivi d'un `-`,
    // qui n'est pas un `/` - et concluait a un fond opaque. La garde exemptait
    // alors le seul vrai defaut qui restait.
    const fondPropreOpaque = /\bbg-[a-z0-9-]+(?![a-z0-9-/])/.test(code)

    const ancetre = fondPropreOpaque
      ? null
      : fondsOuverts.find((a) => b.ligne > a.ligne && b.ligne <= a.fin)

    if (encreIci && !bascule && (fondIci || ancetre)) {
      fautes.push(`${f}:${b.ligne}${fondIci ? '' : ` (sous le fond clair de la ligne ${ancetre.ligne})`}`)
    }

    if (fondIci) fondsOuverts.push({ ligne: b.ligne, fin: finDePortee(b.ligneFin, b.retrait) })
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
