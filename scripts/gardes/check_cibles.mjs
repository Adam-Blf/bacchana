#!/usr/bin/env node
/**
 * Garde : aucune commande sous 44 points de contact.
 *
 * LE SEUIL. 44 x 44 points (Apple, Human Interface Guidelines) ; Google demande
 * 48 dp, donc 44 est le plancher commun. Une commande plus petite n'est pas une
 * imperfection de style : c'est un bouton qu'on rate, debout, une main occupee,
 * dans une piece mal eclairee - le contexte exact de cette application.
 *
 * POURQUOI CETTE GARDE N'EXISTAIT PAS AVANT. Parce que la mesure evidente est
 * FAUSSE, deux fois, et qu'une garde fausse aurait ete desactivee le jour meme.
 * Les deux pieges, releves le 2026-09-14 en les tombant tous les deux :
 *
 *   1. LA BOITE ENGLOBANTE MENT. `getBoundingClientRect` ne voit pas une zone
 *      de contact etendue par un pseudo-element - le motif `after:-inset-1`,
 *      utilise a cinq endroits du depot pour garder une pastille de 36 points
 *      avec 44 points de contact. Mesurer la boite accusait huit boutons
 *      parfaitement conformes sur le seul ecran d'accueil.
 *   2. LES COINS NE SONT PAS DANS UN CERCLE. Tester les quatre coins d'un carre
 *      de 44 accusait le bouton « quitter » de TOUS les ecrans de jeu : il est
 *      rond, de 44 points de diametre, donc conforme - et ses coins tombent
 *      evidemment hors du disque.
 *   3. LA ZONE N'EST PAS CENTREE SUR L'ELEMENT. Mesurer 21 points de part et
 *      d'autre du CENTRE accusait les pastilles de regles du hub : leur zone
 *      fait 44 points, mais repartis 8 au-dessus et 36 en dessous du bord haut,
 *      parce qu'un paragraphe voisin recouvre l'extension du bas. Quarante-
 *      quatre points de prise restent quarante-quatre points de prise.
 *
 * D'ou la mesure retenue : on MARCHE vers l'exterieur depuis le centre, point
 * par point, dans les quatre directions, jusqu'a ce que `elementFromPoint` ne
 * rende plus l'element. La somme gauche+droite et la somme haut+bas donnent
 * l'etendue REELLE de la prise, quelle que soit sa forme et ou qu'elle soit
 * posee. Chaque element est amene au centre de la fenetre avant d'etre mesure :
 * `elementFromPoint` ne voit rien hors de la fenetre, et une mesure sans ce
 * defilement declarait conforme tout ce qui se trouvait sous la ligne de
 * flottaison - c'est-a-dire la moitie des ecrans longs.
 *
 * CE QUE CETTE GARDE NE VOIT PAS.
 *   - Les etats. Elle ouvre chaque ecran dans son etat d'arrivee : une commande
 *     qui n'apparait qu'apres un choix, dans une modale ou en cours de manche,
 *     n'est pas mesuree. Le paywall, les dialogues de confirmation et les
 *     phases avancees des jeux lui echappent.
 *   - Un seul gabarit, 390 x 844. Un ecran plus etroit resserre les rangees.
 *   - L'ESPACEMENT entre deux cibles. Deux boutons de 44 colles l'un a l'autre
 *     passent, alors que le doigt, lui, hesite.
 *   - Le texte courant. Un lien ou un bouton DANS un paragraphe est un mot de
 *     phrase : l'agrandir casserait l'interligne, et la regle ne le vise pas.
 *     C'est une exemption reelle, pas une commodite - les deux seuls cas du
 *     depot sont des renvois vers les CGU au milieu d'une phrase juridique.
 */
import { chromium } from 'playwright'
import { amorcerApp } from '../outils/amorce_app.mjs'

const BASE = process.env.BASE ?? 'http://127.0.0.1:4173'
const MIN = 44
const TABLEE = 'Alice,Bob,Chloé,Dimitri'

const ECRANS = [
  'welcome', 'hub', 'catalogue', 'settings', 'palmares', 'custom-rules',
  'rules', 'mode-rules', 'mentions-legales', 'confidentialite', 'cgu', 'onboarding',
]
const JEUX = [
  'borderland', 'quiz', 'auction', 'ranking', 'tribunal', 'fauxFrere', 'barometre',
  'roulette', 'wouldYouRather', 'picolo', 'truthOrDare', 'neverHaveIEver',
  'itsA10But', 'whoAmong', 'sevenSeconds',
]

const navigateur = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})
const contexte = await navigateur.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
const page = await contexte.newPage()
await amorcerApp(page, { theme: 'light', consentement: true })

const fautes = []

async function mesurer(etiquette, url) {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1400)
  const trop_petites = await page.evaluate(async (MIN) => {
    const sortie = []
    const selecteur =
      'button,a[href],input,select,textarea,[role="button"],[role="switch"],[role="checkbox"]'
    const dort = (ms) => new Promise((r) => setTimeout(r, ms))

    for (const e of document.querySelectorAll(selecteur)) {
      if (e.offsetParent === null || e.disabled) continue
      if (e.closest('p,li')) continue // mot de texte courant, voir l'en-tete

      // `elementFromPoint` ne voit QUE la fenetre : sans ce recentrage, tout ce
      // qui est sous la ligne de flottaison passait pour conforme sans avoir
      // ete mesure une seule fois.
      e.scrollIntoView({ block: 'center', behavior: 'instant' })
      await dort(0)

      const b = e.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) continue
      const cx = Math.round(b.left + b.width / 2)
      const cy = Math.round(b.top + b.height / 2)

      // L'element LUI-MEME ou un de ses DESCENDANTS - jamais un ancetre.
      // Une premiere version acceptait aussi `dessus.contains(e)`, c'est-a-dire
      // n'importe quel parent : la marche vers l'exterieur ne s'arretait donc
      // jamais, puisqu'on finit toujours par tomber sur un conteneur qui
      // contient l'element. La garde rendait vert un bouton de 26 points, et
      // c'est la regression volontaire qui l'a montre - pas la relecture.
      const touche = (x, y) => {
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false
        const dessus = document.elementFromPoint(x, y)
        return !!dessus && (dessus === e || e.contains(dessus))
      }
      if (!touche(cx, cy)) continue // recouvert en son centre : autre probleme

      /**
       * De combien on peut s'ecarter du centre avant de perdre la prise.
       *
       * Au QUART de point, et pas au point entier. Un echantillonnage entier
       * depuis un centre arrondi perd jusqu'a deux points par axe : il
       * mesurait 42 x 43 sur les pastilles de l'accueil, dont la zone fait
       * exactement 44 (36 de dessin plus quatre de chaque cote). Une garde qui
       * accuse a deux points pres du seuil est une garde qu'on desactive.
       */
      const PAS = 0.25
      const portee = (dx, dy) => {
        let n = 0
        while (n < 40 / PAS && touche(cx + dx * PAS * (n + 1), cy + dy * PAS * (n + 1))) n++
        return n * PAS
      }
      const large = portee(-1, 0) + portee(1, 0) + PAS
      const haute = portee(0, -1) + portee(0, 1) + PAS

      // La demi-marge absorbe le dernier arrondi du centre, jamais davantage :
      // un bouton de 43 points reste refuse.
      if (large < MIN - 0.5 || haute < MIN - 0.5) {
        sortie.push({
          libelle: (e.getAttribute('aria-label') || e.textContent || e.tagName)
            .trim().replace(/\s+/g, ' ').slice(0, 40),
          l: Math.round(b.width),
          h: Math.round(b.height),
          prise: `${large.toFixed(2)}x${haute.toFixed(2)}`,
        })
      }
    }
    return [...new Map(sortie.map((x) => [x.libelle + x.l + x.h, x])).values()]
  }, MIN)

  if (trop_petites.length) {
    fautes.push({ etiquette, trop_petites })
  }
  console.log(`  ${etiquette.padEnd(22)} ${trop_petites.length ? `${trop_petites.length} trop petite(s)` : 'ok'}`)
}

for (const e of ECRANS) {
  await mesurer(e, `${BASE}/?screen=${e}&mode=borderland&players=${encodeURIComponent(TABLEE)}`)
}
for (const m of JEUX) {
  await mesurer('jeu-' + m, `${BASE}/?screen=game&mode=${m}&players=${encodeURIComponent(TABLEE)}`)
}

await navigateur.close()

if (fautes.length) {
  console.error(`\nCibles tactiles sous ${MIN} points - ${fautes.length} ecran(s).\n`)
  for (const f of fautes) {
    console.error(`  ${f.etiquette} :`)
    for (const c of f.trop_petites) {
      console.error(`    ${c.libelle.padEnd(42)} dessin ${c.l}x${c.h}, prise ${c.prise}`)
    }
  }
  console.error(
    `\n  Agrandir la commande, ou etendre sa zone de contact sans l'elargir :\n` +
      `  relative after:absolute after:-inset-1 after:content-[''] (motif deja\n` +
      `  utilise sur les pastilles de l'accueil et du hub).\n`,
  )
  process.exit(1)
}

console.log(
  `\nCibles tactiles : ${ECRANS.length + JEUX.length} ecrans, toutes les commandes ` +
    `atteignent ${MIN} points sur chaque axe.`,
)
