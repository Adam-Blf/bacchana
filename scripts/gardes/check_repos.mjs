/**
 * Garde : au repos, AUCUN ecran ne demande d'images.
 *
 * LE DEFAUT REEL. Le 2026-09-14, apres des semaines de « ca clignote sur
 * iPhone », la cause a ete trouvee sur l'ecran de jeu : deux animations en
 * `repeat: Infinity` - une pastille qui grossissait de 2 %, un paquet qui
 * flottait. Mesure sur Le Coupe-Gorge, tablee posee, personne ne touchant a
 * rien : 60 demandes d'image par seconde, et 165 images sur 179 qui changeaient
 * en trois secondes, jusqu'a 3,7 % de la surface. Le hub, au meme moment :
 * ZERO.
 *
 * CE QUI A LAISSE PASSER LE DEFAUT SI LONGTEMPS, et c'est ce que cette garde
 * corrige. Trois campagnes de mesure l'ont manque, parce que les trois
 * n'avaient regarde que l'accueil et le hub - les deux ecrans ou justement
 * rien ne tournait. Le defaut vivait la ou la tablee passe sa soiree. Une
 * garde qui ne visite pas TOUS les ecrans mesure surtout sa propre liste.
 *
 * POURQUOI UNE MESURE ET PAS UNE FORME. Interdire `repeat: Infinity` serait
 * plus simple et serait faux : un ecran d'attente doit tourner tant qu'il
 * attend, c'est sa raison d'etre. Ce qui est interdit, ce n'est pas la boucle,
 * c'est un ecran POSE qui continue de demander des images. On le mesure donc
 * la ou la question se pose : dans le navigateur, sur chaque ecran, apres
 * l'avoir laisse se poser.
 *
 * CE QUE CETTE GARDE NE VOIT PAS.
 *   - Elle attend PLAFOND_REPOS millisecondes avant de compter. Une animation
 *     plus longue que ce delai mais finie passe pour infinie ; une animation
 *     qui ne demarre qu'apres passe inapercue. Le delai est choisi au-dessus
 *     de la plus longue animation d'accueil de l'application (le paquet qui
 *     flotte, six secondes).
 *   - Elle compte les appels a `requestAnimationFrame`, pas les pixels. Une
 *     boucle qui tourne sans rien repeindre serait accusee - c'est voulu :
 *     elle coute quand meme de la batterie et tient le compositeur eveille.
 *     Une animation CSS pure qui ne passe pas par rAF lui echappe en revanche,
 *     et c'est sa vraie limite : `check_defilement` couvre une partie de ce
 *     terrain par la forme.
 *   - Elle ouvre chaque mode sur sa PREMIERE carte. Une animation infinie qui
 *     n'apparait qu'a une phase plus tardive - un recap, un verdict - lui
 *     echappe.
 */
import { chromium } from 'playwright'
import { amorcerApp } from '../outils/amorce_app.mjs'

const BASE = process.env.BASE ?? 'http://127.0.0.1:4173'
const CHROMIUM = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

/** Au-dessus de la plus longue animation d'arrivee (le paquet, 2 x 3 s). */
const PLAFOND_REPOS = 8000
/** Duree de comptage. Trois secondes suffisent a distinguer 0 de 60 par seconde. */
const FENETRE = 2500
/** Quelques images par seconde restent du bruit de mesure, pas une boucle. */
const SEUIL = 3

const JOUEURS = 'Adam,Nawel,Emilien,Lea'
const MODES = [
  'borderland', 'quiz', 'ranking', 'auction', 'picolo', 'truthOrDare', 'neverHaveIEver',
  'whoAmong', 'wouldYouRather', 'itsA10But', 'sevenSeconds', 'tribunal', 'roulette',
  'fauxFrere', 'barometre',
]
const ECRANS = [
  ['accueil', '/'],
  ['hub', `/?screen=hub&players=${JOUEURS}`],
  ['catalogue', `/?screen=catalogue&players=${JOUEURS}`],
  ['palmares', `/?screen=palmares&players=${JOUEURS}`],
  ['reglages', '/?screen=settings'],
  ['regles', '/?screen=rules'],
  ...MODES.map((m) => [`jeu-${m}`, `/?screen=game&mode=${m}&players=${JOUEURS}`]),
]

const navigateur = await chromium.launch({ executablePath: CHROMIUM })
const contexte = await navigateur.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
})
const page = await contexte.newPage()
// Compte les demandes d'image AVANT que l'application ne demarre.
await page.addInitScript(() => {
  window.__imagesDemandees = 0
  const vrai = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => { window.__imagesDemandees++; return vrai(cb) }
})
await amorcerApp(page, { theme: 'light', consentement: true })

const fautes = []
for (const [nom, chemin] of ECRANS) {
  await page.goto(BASE + chemin, { waitUntil: 'networkidle' })
  await page.waitForTimeout(PLAFOND_REPOS)
  const avant = await page.evaluate(() => window.__imagesDemandees)
  await page.waitForTimeout(FENETRE)
  const apres = await page.evaluate(() => window.__imagesDemandees)
  const parSeconde = ((apres - avant) / FENETRE) * 1000
  const ok = parSeconde <= SEUIL
  console.log(`  ${nom.padEnd(20)} ${parSeconde.toFixed(1).padStart(6)} img/s  ${ok ? 'au repos' : 'NE SE POSE PAS'}`)
  if (!ok) {
    fautes.push(
      `${nom} demande encore ${parSeconde.toFixed(1)} images par seconde ${PLAFOND_REPOS / 1000} s ` +
        `apres son ouverture, sans que personne n'y touche. Chercher une animation en ` +
        `\`repeat: Infinity\` : elle tient le compositeur eveille, vide la batterie, et se voit ` +
        `comme un scintillement sur un ecran a forte densite.`
    )
  }
}
await navigateur.close()

if (fautes.length) {
  console.error(`\nRepos - ${fautes.length} ecran(s) qui ne se posent pas.\n`)
  for (const f of fautes) console.error(`  - ${f}`)
  process.exit(1)
}
console.log(`\nRepos : les ${ECRANS.length} ecrans se posent, aucun ne demande d'images une fois ouvert.`)
