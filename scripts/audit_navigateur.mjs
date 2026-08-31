#!/usr/bin/env node
/**
 * Mesure l'application dans un vrai navigateur : performance, alignements,
 * debordements.
 *
 * Trois choses qu'aucun test unitaire ne peut dire, parce qu'elles n'existent
 * qu'une fois la page mise en page :
 *
 *   - LCP, CLS et un substitut d'INP. Un ecran qui « tient » en composant peut
 *     sauter au chargement des polices, et personne ne le voit en revue.
 *   - Les ALIGNEMENTS. Deux blocs qui devraient partager une gouttiere et qui
 *     divergent de trois pixels ne se voient pas a l'oeil, se voient tres bien
 *     une fois mesures, et c'est cette derive qui donne l'impression de bricole.
 *   - Le debordement horizontal, cause du glissement lateral signale.
 *
 * L'application s'ouvre par le pont d'apercu (`?screen=`), qui existe deja pour
 * l'import Figma : on mesure les ECRANS REELS, pas une maquette.
 *
 * Lancement :  node scripts/audit_navigateur.mjs [url]
 * Par defaut, http://localhost:4178 (servi par `npm run preview -- --port 4178`).
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:4178'
const SORTIE = 'audit-navigateur'

/**
 * Les gabarits mesures.
 *
 * 360 x 640 est le petit Android encore tres represente ; 390 x 844 l'iPhone
 * courant ; 412 x 915 le grand Android ; 768 la tablette en portrait. On ne
 * mesure pas au-dela : l'application est declaree `orientation: portrait` dans
 * son manifeste, mesurer un bureau dirait des choses vraies sur un cas qui
 * n'arrive pas.
 */
const GABARITS = [
  { nom: 'android-360', width: 360, height: 640, dpr: 3 },
  { nom: 'iphone-390', width: 390, height: 844, dpr: 3 },
  { nom: 'android-412', width: 412, height: 915, dpr: 2.625 },
  { nom: 'tablette-768', width: 768, height: 1024, dpr: 2 },
]

const ECRANS = [
  { nom: 'welcome', url: '/?screen=welcome' },
  { nom: 'hub', url: '/?screen=hub' },
  { nom: 'onboarding', url: '/?screen=onboarding' },
  { nom: 'settings', url: '/?screen=settings' },
  { nom: 'jeu-quiz', url: '/?screen=game&mode=quiz' },
  { nom: 'jeu-roulette', url: '/?screen=game&mode=roulette' },
  { nom: 'jeu-borderland', url: '/?screen=game&mode=borderland' },
  { nom: 'regles-borderland', url: '/?screen=rules' },
]

/** Mesure posee dans la page. Rend les metriques web et la carte des bords. */
const SONDE = () => {
  return new Promise((resolve) => {
    const resultat = { lcp: null, cls: 0, decalages: [] }

    try {
      new PerformanceObserver((liste) => {
        const entrees = liste.getEntries()
        const derniere = entrees[entrees.length - 1]
        if (derniere) resultat.lcp = Math.round(derniere.startTime)
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    } catch { /* non supporte */ }

    try {
      new PerformanceObserver((liste) => {
        for (const entree of liste.getEntries()) {
          if (entree.hadRecentInput) continue
          resultat.cls += entree.value
          if (entree.value > 0.01 && entree.sources?.length) {
            const source = entree.sources[0]
            resultat.decalages.push({
              valeur: Number(entree.value.toFixed(4)),
              element: source.node ? source.node.tagName + (source.node.className ? '.' + String(source.node.className).split(' ')[0] : '') : '?',
            })
          }
        }
      }).observe({ type: 'layout-shift', buffered: true })
    } catch { /* non supporte */ }

    // 2,5 s : au-dela, les animations d'entree sont finies et les polices
    // posees. Mesurer plus tot attribuerait a la mise en page des decalages qui
    // ne sont que l'animation d'arrivee.
    setTimeout(() => {
      resultat.cls = Number(resultat.cls.toFixed(4))
      resolve(resultat)
    }, 2500)
  })
}

/**
 * La regle.
 *
 * Premiere version : elle relevait tous les bords de la page et les comparait a
 * la « gouttiere dominante ». Elle rapportait surtout du PADDING - une carte a
 * 16 px du bord dont le titre est a 36 px n'est pas mal alignee, elle est
 * rembourree - et un signalement qui envoie corriger ce qui va bien finit
 * desactive.
 *
 * Ce qu'elle mesure maintenant, et qui est la definition d'un alignement :
 * des FRERES dans un meme conteneur doivent partager un bord. Un ecart de un a
 * huit pixels entre deux blocs empiles est le defaut qui compte - trop petit
 * pour se voir, assez grand pour que l'oeil sente que ca ne tombe pas juste.
 * Un ecart franc est presque toujours voulu (un decrochage, une puce), donc on
 * ne le signale pas.
 *
 * Elle verifie aussi la SYMETRIE des gouttieres de la colonne de contenu : une
 * marge gauche qui ne vaut pas la marge droite se voit tout de suite, meme sans
 * savoir pourquoi.
 */
const REGLE = () => {
  const visible = (el) => {
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return (
      r.width > 24 &&
      r.height > 8 &&
      s.visibility !== 'hidden' &&
      s.display !== 'none' &&
      Number(s.opacity) > 0.05 &&
      s.position !== 'absolute' &&
      s.position !== 'fixed'
    )
  }

  const nommer = (el) => {
    const cls = typeof el.className === 'string' ? el.className.split(' ').slice(0, 2).join('.') : ''
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '')
  }

  const desalignes = []

  // On ne compare que des freres EMPILES : dans une rangee (flex-row, grid a
  // plusieurs colonnes, inline), des bords gauches differents sont la mise en
  // page, pas un defaut.
  for (const parent of document.querySelectorAll('main, header, footer, section, div, ol, ul')) {
    const style = getComputedStyle(parent)
    const enRangee =
      (style.display.includes('flex') && style.flexDirection.startsWith('row')) ||
      (style.display.includes('grid') && style.gridTemplateColumns.split(' ').length > 1) ||
      style.display === 'inline'
    if (enRangee) continue

    const enfants = [...parent.children].filter(visible)
    if (enfants.length < 2) continue

    const bords = enfants.map((el) => ({ el, r: el.getBoundingClientRect() }))
    const gauches = bords.map((b) => Math.round(b.r.left))
    const reference = gauches.sort((a, b) => gauches.filter((v) => v === a).length - gauches.filter((v) => v === b).length).pop()

    for (const { el, r } of bords) {
      const ecart = Math.round(r.left) - reference
      if (ecart !== 0 && Math.abs(ecart) <= 8) {
        desalignes.push({ ecart, element: nommer(el), dans: nommer(parent) })
      }
    }
  }

  // Symetrie de la colonne de contenu : le plus large des conteneurs centres.
  const colonne = [...document.querySelectorAll('main, .max-w-lg, .max-w-md')].filter(visible)[0]
  const rect = colonne ? colonne.getBoundingClientRect() : null
  const margeGauche = rect ? Math.round(rect.left) : null
  const margeDroite = rect ? Math.round(window.innerWidth - rect.right) : null

  return {
    margeGauche,
    margeDroite,
    asymetrie: margeGauche !== null && margeDroite !== null ? Math.abs(margeGauche - margeDroite) : null,
    presqueAligne: desalignes.slice(0, 12),
    defilementHorizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    largeurDocument: document.documentElement.scrollWidth,
    largeurFenetre: document.documentElement.clientWidth,
    hauteurDocument: document.documentElement.scrollHeight,
    hauteurFenetre: document.documentElement.clientHeight,
  }
}

/** Substitut d'INP : le temps de traitement du plus lent des appuis simules. */
async function mesurerReactivite(page) {
  await page.evaluate(() => {
    window.__evenements = []
    try {
      new PerformanceObserver((liste) => {
        for (const e of liste.getEntries()) window.__evenements.push(Math.round(e.duration))
      }).observe({ type: 'event', durationThreshold: 16, buffered: true })
    } catch { /* non supporte */ }
  })

  const boutons = await page.$$('button:not([disabled])')
  for (const bouton of boutons.slice(0, 4)) {
    try {
      await bouton.click({ timeout: 800, trial: false })
      await page.waitForTimeout(150)
    } catch { /* bouton couvert ou disparu : on passe */ }
  }
  await page.waitForTimeout(400)

  const durees = await page.evaluate(() => window.__evenements ?? [])
  return durees.length ? Math.max(...durees) : 0
}

async function principal() {
  mkdirSync(SORTIE, { recursive: true })
  const navigateur = await chromium.launch()
  const rapport = []

  for (const gabarit of GABARITS) {
    const contexte = await navigateur.newContext({
      viewport: { width: gabarit.width, height: gabarit.height },
      deviceScaleFactor: gabarit.dpr,
      isMobile: true,
      hasTouch: true,
    })

    // Le bandeau de cookies est pose comme deja tranche : il recouvre les deux
    // tiers de l'ecran au premier lancement, et on mesure ici la MISE EN PAGE
    // des ecrans, pas la premiere ouverture. Le bandeau lui-meme se regarde
    // separement, sur l'ecran d'accueil.
    await contexte.addInitScript(() => {
      // `about:blank` refuse localStorage : le script d'initialisation s'execute
      // aussi la, et l'exception y remontait comme une erreur de console.
      try {
      localStorage.setItem(
        'bacchana-consent',
        JSON.stringify({
          state: {
            consent: { necessary: true, analytics: false },
            consentVersion: 1,
            decidedAt: Date.now(),
            isPanelOpen: false,
          },
          version: 0,
        }),
      )
      } catch { /* document sans stockage */ }
    })

    for (const ecran of ECRANS) {
      const page = await contexte.newPage()
      const erreurs = []
      page.on('pageerror', (e) => erreurs.push(String(e.message)))
      page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()) })

      await page.goto(BASE + ecran.url, { waitUntil: 'networkidle' })
      const perf = await page.evaluate(SONDE)
      const regle = await page.evaluate(REGLE)

      // La capture se prend AVANT la sonde de reactivite : celle-ci APPUIE sur
      // des boutons, donc l'ecran capture apres n'etait plus celui qu'on
      // croyait mesurer - le hub rendait une capture de l'ecran des joueurs.
      const nomFichier = `${gabarit.nom}-${ecran.nom}`
      await page.screenshot({ path: join(SORTIE, nomFichier + '.png'), fullPage: false })

      const inp = await mesurerReactivite(page)

      rapport.push({ gabarit: gabarit.nom, ecran: ecran.nom, ...perf, inp, ...regle, erreurs })
      await page.close()
    }

    await contexte.close()
  }

  await navigateur.close()
  writeFileSync(join(SORTIE, 'rapport.json'), JSON.stringify(rapport, null, 2), 'utf8')

  // ------------------------------------------------------------- resume
  const seuils = { lcp: 2500, cls: 0.1, inp: 200 }
  let echecs = 0
  console.log('\nGabarit          Ecran                LCP    CLS     INP   Debord.  Asym.  Desalignes')
  console.log('-'.repeat(92))
  for (const l of rapport) {
    const alerte =
      (l.lcp ?? 0) > seuils.lcp ||
      l.cls > seuils.cls ||
      l.inp > seuils.inp ||
      l.defilementHorizontal ||
      (l.asymetrie ?? 0) > 1 ||
      l.presqueAligne.length > 0
    if (alerte) echecs++
    console.log(
      `${l.gabarit.padEnd(16)} ${l.ecran.padEnd(20)} ${String(l.lcp ?? '-').padStart(5)}  ${String(l.cls).padStart(6)}  ${String(l.inp).padStart(4)}   ${(l.defilementHorizontal ? 'OUI' : 'non').padEnd(7)} ${String(l.asymetrie ?? '-').padStart(4)}  ${String(l.presqueAligne.length).padStart(3)}${alerte ? '   <-' : ''}`,
    )
  }

  const erreurs = rapport.flatMap((l) => l.erreurs)
  if (erreurs.length) {
    console.log('\nErreurs de console :')
    for (const e of [...new Set(erreurs)].slice(0, 10)) console.log('  -', e)
  }

  console.log(`\nCaptures et rapport detaille dans ${SORTIE}/`)
  console.log(echecs === 0 ? 'Aucun seuil depasse.' : `${echecs} mesure(s) au-dessus des seuils.`)
}

principal().catch((e) => {
  console.error(e)
  process.exit(1)
})
