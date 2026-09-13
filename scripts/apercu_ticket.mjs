#!/usr/bin/env node
/**
 * Rend l'addition partagee en image, pour la REGARDER.
 *
 * Le ticket est dessine au canevas : rien dans les tests unitaires ne peut dire
 * qu'un titre deborde, qu'une conduite de points tombe a cote ou que le
 * code-barres mord sur le pied de page. Un moteur qui dessine sans qu'on
 * regarde le resultat produit des visuels faux en silence.
 *
 * Le module est compile a la volee et injecte dans une page de l'application,
 * pour que Space Mono soit chargee - une mesure de texte faite avec la police de
 * repli decale toute la mise en page du ticket.
 *
 * Lancement :  node scripts/apercu_ticket.mjs [url]
 */
import { chromium } from 'playwright'
import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:4178'
const SORTIE = 'audit-navigateur'

const CAS = {
  complet: {
    horodatage: '31/08/2026  23:41',
    effectif: 4,
    lignes: [
      { nom: '1. Emilien', valeur: '14' },
      { nom: '2. Nawel', valeur: '9' },
      { nom: '3. Adam', valeur: '6' },
      { nom: '4. Amina', valeur: '2' },
    ],
    total: 31,
    mention: 'Emilien, champion de la tablée',
    ardoise: {
      titre: 'Ardoise de la soirée - 3 parties',
      lignes: [
        { nom: 'Emilien', valeur: '27' },
        { nom: 'Nawel', valeur: '18' },
        { nom: 'Adam', valeur: '11' },
      ],
    },
  },
  sansScore: {
    horodatage: '31/08/2026  23:58',
    effectif: 4,
    lignes: [],
    total: null,
    mention: "5 tours de roue, personne n'a compté",
  },
  nomsLongs: {
    horodatage: '31/08/2026  00:12',
    effectif: 8,
    lignes: [
      { nom: '1. Marie-Christine-Alexandra', valeur: '128' },
      { nom: '2. Jean', valeur: '3' },
    ],
    total: 131,
    mention: 'Marie-Christine-Alexandra, championne de la tablée',
  },
}

const { outputFiles } = await build({
  entryPoints: ['src/lib/ticketImage.ts'],
  bundle: true,
  format: 'iife',
  globalName: 'Ticket',
  write: false,
  target: 'es2020',
})
const source = outputFiles[0].text

mkdirSync(SORTIE, { recursive: true })
const navigateur = await chromium.launch()
const page = await navigateur.newPage({ viewport: { width: 800, height: 1400 }, deviceScaleFactor: 1 })
await page.goto(BASE + '/?screen=hub', { waitUntil: 'networkidle' })
await page.addScriptTag({ content: source })

for (const [nom, contenu] of Object.entries(CAS)) {
  const dataUrl = await page.evaluate(async (c) => {
    const blob = await window.Ticket.dessinerTicket(c)
    if (!blob) return null
    return await new Promise((r) => {
      const lecteur = new FileReader()
      lecteur.onload = () => r(lecteur.result)
      lecteur.readAsDataURL(blob)
    })
  }, contenu)

  if (!dataUrl) {
    console.error('ticket non produit :', nom)
    continue
  }
  const octets = Buffer.from(String(dataUrl).split(',')[1], 'base64')
  const chemin = join(SORTIE, `ticket-${nom}.png`)
  writeFileSync(chemin, octets)
  console.log('ecrit', chemin, `(${Math.round(octets.length / 1024)} ko)`)
}

await navigateur.close()
