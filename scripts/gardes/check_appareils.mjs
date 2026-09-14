#!/usr/bin/env node
/**
 * Garde : chaque ecran tient sur chaque telephone, y compris couche et plie.
 *
 * LE PARC. Les largeurs ne sont pas des tailles rondes : chacune est un
 * appareil reellement vendu, et les extremes sont ce qui casse.
 *   - 280 : Galaxy Z Fold premiere generation, ecran de couverture. Le plus
 *     etroit encore en circulation, et de loin.
 *   - 344 : Z Fold 5/6 ferme. 375 : iPhone SE 3 et 13 mini.
 *   - 673 x 841 : Z Fold ouvert. 744 : iPad mini.
 *   - Et le PAYSAGE. Un telephone pose a plat au milieu de la table, c'est la
 *     position normale de ce jeu, pas un cas limite. C'est aussi la seule
 *     orientation ou l'application etait cassee : la roue du Destin, mesuree
 *     sur la largeur, depassait de tres loin sous un `overflow-hidden` ; et la
 *     carte d'introduction poussait « Suivant » hors de l'ecran, ce qui faisait
 *     du tout premier ecran de l'application une IMPASSE.
 *
 * TROIS CONTROLES, et aucun ne repose sur une heuristique de texte coupe.
 *
 *   1. Debordement lateral du document. Mesure fiable, sans piege.
 *   2. Du contenu plus haut que la fenetre qui ne peut PAS defiler. C'est la
 *      pire des pannes parce qu'elle est silencieuse : le contenu existe,
 *      il est peint, et il est inatteignable.
 *   3. UNE COMMANDE QU'AUCUN DEFILEMENT NE RAMENE. On amene chaque bouton au
 *      centre par `scrollIntoView`, puis on regarde s'il est dans la fenetre.
 *      S'il n'y est toujours pas, il est hors de portee : c'est exactement
 *      l'etat du bouton « Suivant » de l'introduction en paysage.
 *
 * CE QUE CETTE GARDE NE VOIT PAS, et pourquoi elle ne cherche PAS le texte coupe.
 *   - Cinq versions successives d'un detecteur de « texte coupe » ont ete
 *     ecrites et jetees ici. Toutes accusaient des elements parfaitement sains,
 *     et toujours les MEMES sur les quinze appareils - y compris en 841 points
 *     de large, ce qui aurait du suffire a les disqualifier. La cause :
 *     `scrollWidth` compte les pseudo-elements absolus, donc les zones tactiles
 *     etendues par `after:-inset-2`. La pastille « Règles » mesurait 91 contre
 *     83 : exactement les huit points de debord, pas une lettre coupee.
 *     Le texte reellement coupe reste donc a la charge de l'oeil et de la
 *     capture. Une garde qui accuse ce qui va bien finit desactivee, et c'est
 *     pire que pas de garde du tout.
 *   - Les ETATS. Chaque ecran est ouvert dans son etat d'arrivee : une modale,
 *     un paywall, une phase avancee de manche ne sont pas mesures.
 *   - Un seul theme, clair. Le sombre change les couleurs, pas les boites.
 */
import { chromium } from 'playwright'
import { amorcerApp } from '../outils/amorce_app.mjs'

const BASE = process.env.BASE ?? 'http://127.0.0.1:4173'
const TABLEE = 'Alice,Bob,Chloé,Dimitri'

const FILTRE = process.env.PROFILS ? process.env.PROFILS.split(',') : null
const APPAREILS_TOUS = [
  { nom: 'Fold-1-ferme', w: 280, h: 653 },
  { nom: 'iPhone-SE-3', w: 375, h: 667 },
  { nom: 'iPhone-14', w: 390, h: 844 },
  { nom: 'iPhone-15-Pro-Max', w: 430, h: 932 },
  { nom: 'Z-Fold-ouvert', w: 673, h: 841 },
  { nom: 'iPhone-14-paysage', w: 844, h: 390 },
  { nom: 'Fold-1-paysage', w: 653, h: 280 },
]
const APPAREILS = FILTRE ? APPAREILS_TOUS.filter((a) => FILTRE.includes(a.nom)) : APPAREILS_TOUS

const ECRANS = [
  'onboarding', 'welcome', 'hub', 'catalogue', 'settings', 'palmares',
  'custom-rules', 'rules', 'mode-rules', 'mentions-legales', 'confidentialite', 'cgu',
]
const JEUX = [
  'borderland', 'quiz', 'auction', 'ranking', 'tribunal', 'fauxFrere', 'barometre',
  'roulette', 'wouldYouRather', 'picolo', 'truthOrDare', 'neverHaveIEver',
  'itsA10But', 'whoAmong', 'sevenSeconds',
]

const navigateur = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})

const fautes = []
let mesures = 0

for (const a of APPAREILS) {
  const contexte = await navigateur.newContext({
    viewport: { width: a.w, height: a.h },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  const page = await contexte.newPage()
  await amorcerApp(page, { theme: 'light', consentement: true })
  const problemes = []

  const cibles = [
    ...ECRANS.map((e) => [e, `screen=${e}&mode=borderland`]),
    ...JEUX.map((m) => ['jeu-' + m, `screen=game&mode=${m}`]),
  ]

  for (const [nom, requete] of cibles) {
    await page
      .goto(`${BASE}/?${requete}&players=${encodeURIComponent(TABLEE)}`, { waitUntil: 'networkidle' })
      .catch(() => {})
    await page.waitForTimeout(900)
    mesures++

    const m = await page.evaluate(async () => {
      const dort = (ms) => new Promise((r) => setTimeout(r, ms))
      const d = document.documentElement

      const deborde = d.scrollWidth - d.clientWidth

      // Du contenu plus haut que la fenetre doit pouvoir etre atteint.
      let bloque = false
      if (d.scrollHeight > d.clientHeight + 2) {
        const avant = window.scrollY
        window.scrollTo(0, 600)
        const bougeDocument = window.scrollY > avant
        window.scrollTo(0, avant)
        const bougeConteneur = [...document.querySelectorAll('*')].some((el) => {
          const s = getComputedStyle(el)
          return /auto|scroll/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 2
        })
        bloque = !bougeDocument && !bougeConteneur
      }

      // Une commande qu'aucun defilement A LA PORTEE DU DOIGT ne ramene.
      //
      // Surtout pas `scrollIntoView` : il fait defiler les conteneurs
      // `overflow: hidden`, que le navigateur accepte de bouger par script
      // mais que l'utilisateur ne peut PAS faire defiler au doigt. Une
      // premiere version s'en servait et restait verte sur la regression de
      // l'introduction en paysage - le bouton « Suivant » etait hors de
      // l'ecran, et la garde le ramenait elle-meme avant de conclure qu'il
      // allait bien. Seuls `auto` et `scroll` sont des defilements reels.
      const defileurUtilisable = (el) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const s = getComputedStyle(p)
          if (/auto|scroll/.test(s.overflowY) && p.scrollHeight > p.clientHeight + 2) return p
          if (/auto|scroll/.test(s.overflowX) && p.scrollWidth > p.clientWidth + 2) return p
        }
        return d.scrollHeight > d.clientHeight + 2 ? document.scrollingElement : null
      }
      const dansLaFenetre = (r) =>
        r.bottom > 1 && r.top < innerHeight - 1 && r.right > 1 && r.left < innerWidth - 1

      const horsDePortee = []
      for (const e of document.querySelectorAll('button:not([disabled]),a[href],[role="button"]')) {
        if (e.offsetParent === null) continue
        const avant = e.getBoundingClientRect()
        if (avant.width === 0 || avant.height === 0) continue
        if (dansLaFenetre(avant)) continue

        // `scrollIntoView`, mais SEULEMENT si un vrai defileur existe.
        //
        // Le remplacer par « je pousse le defileur tout en bas, puis tout en
        // haut » ratait tout ce qui se trouve au MILIEU d'une longue liste :
        // la garde accusait alors une dizaine de tuiles du hub, du catalogue
        // et des reglages, tous parfaitement atteignables au doigt. Les deux
        // pieges sont symetriques - defiler ce qui ne defile pas, et ne pas
        // savoir defiler ce qui defile.
        const defileur = defileurUtilisable(e)
        let atteint = false
        if (defileur) {
          e.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' })
          await dort(0)
          atteint = dansLaFenetre(e.getBoundingClientRect())
        }
        if (!atteint) {
          horsDePortee.push(
            (e.getAttribute('aria-label') || e.textContent || e.tagName)
              .trim().replace(/\s+/g, ' ').slice(0, 34),
          )
        }
      }
      return { deborde, bloque, horsDePortee: [...new Set(horsDePortee)] }
    })

    const p = []
    if (m.deborde > 1) p.push(`deborde lateralement de ${m.deborde} points`)
    if (m.bloque) p.push('plus haut que la fenetre ET ne defile pas')
    if (m.horsDePortee.length) {
      p.push(`commande(s) hors de portee : ${m.horsDePortee.join(' | ')}`)
    }
    if (p.length) problemes.push(`${nom} : ${p.join(' ; ')}`)
  }

  console.log(
    `  ${a.nom.padEnd(20)} ${String(a.w).padStart(4)}x${String(a.h).padEnd(4)} ` +
      `${problemes.length ? problemes.length + ' probleme(s)' : 'ok'}`,
  )
  if (problemes.length) fautes.push({ appareil: `${a.nom} (${a.w}x${a.h})`, problemes })
  await contexte.close()
}

await navigateur.close()

if (fautes.length) {
  console.error(`\nEcrans qui ne tiennent pas - ${fautes.length} appareil(s).\n`)
  for (const f of fautes) {
    console.error(`  ${f.appareil}`)
    for (const p of f.problemes) console.error(`    - ${p}`)
  }
  console.error(
    `\n  Une taille fixe lue sur la LARGEUR casse en paysage. Prendre la plus\n` +
      `  petite des deux contraintes : w-[min(18rem,52vh)] plutot que w-72.\n`,
  )
  process.exit(1)
}

console.log(
  `\nAppareils : ${mesures} mesures sur ${APPAREILS.length} gabarits, aucun debordement, ` +
    `aucun contenu bloque, aucune commande hors de portee.`,
)
