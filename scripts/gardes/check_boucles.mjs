/**
 * Garde : aucune animation infinie hors de l'ecran d'attente.
 *
 * POURQUOI ELLE EXISTE A COTE DE `check_repos`, ET NON A SA PLACE. Le
 * 2026-09-14, `check_repos` a trouve deux boucles infinies sur l'ecran de jeu
 * en MESURANT - 60 images par seconde sur un ecran pose. Elle en a manque une
 * TROISIEME, le chiffre de penalite du modal de contestation, qui pulsait de
 * 5 % : elle n'ouvre que le premier etat de chaque ecran, et ce modal est
 * derriere une interaction. Son en-tete annoncait honnetement cet angle mort ;
 * il a suffi d'un jour pour qu'il coute une boucle.
 *
 * Une garde qui mesure ne voit que les etats qu'elle sait atteindre. Une garde
 * qui lit la source les voit tous, mais ne sait pas si l'etat est atteignable.
 * Les deux ensemble couvrent ce que ni l'une ni l'autre ne couvre seule, et
 * c'est pour cela qu'il y en a deux.
 *
 * LE DEFAUT REEL, mesure. Ecran de jeu pose, personne n'y touchant : 165 images
 * sur 179 changeaient en trois secondes, jusqu'a 3,7 % de la surface, contre
 * zero sur le hub. Un agrandissement de quelques pour cent sur du texte cerne
 * re-tramise ses bords a chaque image. C'est ce que la tablee a decrit pendant
 * des semaines par « ca clignote en permanence, sans rien toucher ».
 *
 * L'EXCEPTION, ET POURQUOI ELLE EST LA SEULE. `Chargement` doit tourner tant
 * qu'il attend : son mouvement EST son message, et il disparait avec l'attente.
 * Une exception qui se justifie par la fonction du composant, pas par sa
 * commodite. Toute autre boucle doit devenir finie - deux ou trois cycles
 * suffisent a attirer l'oeil de quelqu'un qui arrive.
 *
 * CE QUE CETTE GARDE NE VOIT PAS.
 *   - Elle lit `repeat: Infinity` ecrit tel quel. Un `repeat: n` calcule, un
 *     `repeat` passe en prop, une boucle ecrite en CSS (`animation: ...
 *     infinite`) ou un `setInterval` qui repeint lui echappent. C'est
 *     `check_repos` qui couvre ce terrain-la, en mesurant.
 *   - Elle ne juge pas le COUT d'une boucle. Une animation infinie sur un
 *     element minuscule et une sur un aplat plein ecran lui sont
 *     indiscernables ; elle refuse les deux, parce que la distinction se fait
 *     a l'oeil et qu'aucune des deux n'a de raison d'etre permanente.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const RACINE = process.env.RACINE_BOUCLES ?? '.'
const SRC = join(RACINE, 'src')

/** Le mouvement de ce composant EST son message, et il s'arrete avec l'attente. */
const TOLERE = ['components/ui/Chargement.tsx']

function sources(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    const full = join(dir, e)
    if (statSync(full).isDirectory()) { out.push(...sources(full)); continue }
    if (!/\.(ts|tsx)$/.test(e) || /\.test\.(ts|tsx)$/.test(e)) continue
    out.push(full)
  }
  return out
}

/**
 * Blanchit les commentaires en gardant les retours a la ligne.
 *
 * Le premier jet decidait « est-ce un commentaire ? » au prefixe de la ligne -
 * `//`, `*`, `/*`. Il a accuse les deux commentaires de `GameBoard` qui
 * RACONTENT la correction, parce que leurs lignes de continuation commencent
 * par une espace puis un accent grave. Un faux positif sur une garde est plus
 * grave qu'il n'y parait : il pousse a la contourner, donc a la desarmer. On
 * retire donc les commentaires pour de bon, sans deplacer une seule ligne.
 */
function sansCommentaires(source) {
  let dedans = null // 'bloc' | 'ligne' | null
  let sortie = ''
  for (let i = 0; i < source.length; i++) {
    const deux = source.slice(i, i + 2)
    if (!dedans && deux === '/*') { dedans = 'bloc'; sortie += '  '; i++; continue }
    if (!dedans && deux === '//') { dedans = 'ligne'; sortie += '  '; i++; continue }
    if (dedans === 'bloc' && deux === '*/') { dedans = null; sortie += '  '; i++; continue }
    if (dedans === 'ligne' && source[i] === '\n') { dedans = null; sortie += '\n'; continue }
    sortie += dedans ? (source[i] === '\n' ? '\n' : ' ') : source[i]
  }
  return sortie
}

const fautes = []
for (const fichier of sources(SRC)) {
  const chemin = relative(SRC, fichier).split('\\').join('/')
  if (TOLERE.includes(chemin)) continue
  const lignes = sansCommentaires(readFileSync(fichier, 'utf8')).split('\n')
  lignes.forEach((ligne, i) => {
    if (!/\brepeat\s*:\s*Infinity\b/.test(ligne)) return
    fautes.push(
      `src/${chemin}:${i + 1} - animation infinie. Elle tient le compositeur eveille tant ` +
        `que l'ecran est ouvert, vide la batterie, et se voit comme un scintillement sur un ` +
        `ecran a forte densite. La rendre FINIE (\`repeat: 1\` ou \`2\`) : deux ou trois ` +
        `cycles suffisent a attirer l'oeil, au-dela le mouvement n'apprend plus rien.`
    )
  })
}

if (fautes.length) {
  console.error(`\nBoucles - ${fautes.length} animation(s) infinie(s) hors de l'ecran d'attente.\n`)
  for (const f of fautes) console.error(`  - ${f}`)
  process.exit(1)
}
console.log(
  `Boucles : aucune animation infinie hors de ${TOLERE.join(', ')}, dont le mouvement est le message.`
)
