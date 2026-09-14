#!/usr/bin/env node
/**
 * Garde : l'ouverture ne doit montrer QU'UNE seule releve.
 *
 * LE DEFAUT, mesure le 2026-09-14 sur le site en production, decrit par la
 * tablee en trois mots : « ca clignote ». Sur un reseau de telephone, ouvrir
 * l'application affichait trois pleines pages qui se remplacaient en moins
 * d'une seconde et demie :
 *
 *   228 ms   l'amorce HTML, « ON OUVRE LA MAISON »
 *   1606 ms  un SECOND ecran d'attente, « ON SORT LE JEU », plus le bandeau
 *            de cookies apparu au passage
 *   2182 ms  l'intro - le bandeau disparaissant au meme instant
 *
 * Trois causes, toutes invisibles a l'oeil du developpeur sur une machine de
 * bureau ou tout arrive en 200 ms :
 *   1. le premier ecran etait charge a la demande, ce qui insere une attente
 *      React entre l'amorce et lui, alors qu'il est demande de toute facon ;
 *   2. l'ecran d'attente React n'avait pas exactement les encres de l'amorce,
 *      donc la releve se voyait au lieu d'etre continue ;
 *   3. le bandeau de cookies se jugeait sur l'ecran courant, qui vaut
 *      « welcome » pendant un tour de boucle avant de basculer sur l'intro.
 *
 * CE QUE LA GARDE COMPTE. Les etats visuels distincts entre le premier octet et
 * la stabilisation : elle echoue des qu'il y en a plus de DEUX (l'amorce, puis
 * le premier vrai ecran). Elle ne juge ni la beaute ni la vitesse - seulement
 * qu'on ne repeint pas l'ecran entier trois fois pour ouvrir une application.
 *
 * CE QU'ELLE NE VOIT PAS. Le reste de l'application : une fois la tablee
 * entree, les ecrans de jeu sont charges a la demande et c'est voulu. Elle ne
 * voit pas non plus un clignotement qui n'apparaitrait qu'au-dela de sa fenetre
 * de mesure, ni celui d'une reprise de partie apres rechargement.
 *
 * Lancement :  node scripts/gardes/check_ouverture.mjs [url]
 * Le binaire du navigateur peut etre impose par CHROMIUM_BIN.
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:4178'
const MAX_ETATS = 2
/** Reseau de telephone : c'est la seule condition ou les etapes se voient. */
const RESEAU = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
}

const navigateur = await chromium.launch(
  process.env.CHROMIUM_BIN ? { executablePath: process.env.CHROMIUM_BIN } : {}
)

/** Les quatre facons d'arriver sur l'application, semees avant le premier octet. */
const CAS = [
  { nom: 'premiere ouverture', theme: 'light', semer: null },
  { nom: 'premiere ouverture, theme sombre', theme: 'dark', semer: null },
  { nom: 'intro vue, consentement donne', theme: 'light', semer: 'complet' },
  { nom: 'intro vue, consentement en attente', theme: 'light', semer: 'intro' },
]

const echecs = []
const rapports = []

for (const cas of CAS) {
  const contexte = await navigateur.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: cas.theme,
  })
  if (cas.semer) {
    await contexte.addInitScript((quoi) => {
      try {
        localStorage.setItem(
          'bacchana-onboarding',
          JSON.stringify({ state: { hasSeenIntro: true }, version: 0 })
        )
        if (quoi === 'complet') {
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
            })
          )
        }
      } catch {
        /* document sans stockage */
      }
    }, cas.semer)
  }

  const page = await contexte.newPage()
  const cdp = await contexte.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', RESEAU)

  const depart = Date.now()
  const etats = []
  let precedent = ''
  const aller = page.goto(BASE + '/', { waitUntil: 'commit' })

  // Trois secondes a 40 ms : assez fin pour voir une releve, assez long pour
  // couvrir un demarrage complet sur ce reseau.
  for (let i = 0; i < 75; i++) {
    try {
      const vu = await page.evaluate(() => ({
        amorce: !!document.getElementById('amorce'),
        texte: (document.body.innerText || '').split('\n').filter(Boolean).slice(0, 2).join(' / '),
      }))
      const signature = `${vu.amorce}|${vu.texte}`
      if (signature !== precedent) {
        etats.push({ t: Date.now() - depart, ...vu })
        precedent = signature
      }
    } catch {
      /* la page n'est pas encore interrogeable */
    }
    await new Promise((r) => setTimeout(r, 40))
  }
  await aller.catch(() => {})
  await contexte.close()

  rapports.push({ cas: cas.nom, etats })
  if (etats.length > MAX_ETATS) {
    echecs.push(
      `${cas.nom} : ${etats.length} etats successifs\n` +
        etats.map((e) => `        ${String(e.t).padStart(5)} ms  ${e.texte.slice(0, 54)}`).join('\n')
    )
  }
}

await navigateur.close()

if (echecs.length) {
  console.error("\nGarde ouverture : ECHEC - l'application clignote au demarrage.\n")
  for (const e of echecs) console.error(`  - ${e}\n`)
  console.error(
    "Une ouverture montre l'amorce, puis le premier ecran. Tout etat supplementaire\n" +
      "est une page entiere repeinte sous les yeux de la tablee.\n"
  )
  process.exit(1)
}

console.log(
  `Ouverture : ${rapports.length} scenarios, ` +
    `${rapports.map((r) => r.etats.length).join('/')} etats - amorce puis premier ecran, sans releve visible.`
)
