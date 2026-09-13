#!/usr/bin/env node
/**
 * Ce que le navigateur telecharge AVANT que la page soit utilisable.
 *
 * Le SDK de paiement est importe dynamiquement depuis toujours, ce qui suffisait
 * a le croire hors du chemin critique. Il ne l'etait pas : l'effet de montage
 * l'appelait, donc il partait juste derriere React, pour une fonctionnalite que
 * la majorite des soirees n'ouvrent jamais.
 *
 * La garde ne compte pas les octets du dossier `dist` - un fichier bati n'est
 * pas un fichier telecharge. Elle regarde ce que le navigateur DEMANDE avant le
 * premier rendu utile, ce qui est la seule mesure qui corresponde a l'attente
 * reelle.
 *
 * Lancement :  node scripts/check_boot_js.mjs [url]
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:4178'

/** Morceaux qui n'ont RIEN a faire dans le chargement initial. */
const INTERDITS = [/vendor-billing/, /vendor-analytics/]

const navigateur = await chromium.launch()
const page = await navigateur.newPage({ viewport: { width: 390, height: 844 } })

const demandes = []
page.on('request', (r) => {
  if (r.resourceType() === 'script') demandes.push({ url: r.url(), t: Date.now() })
})

const depart = Date.now()
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await page.waitForSelector('#root > *', { timeout: 10000 })
const premierRendu = Date.now() - depart

// On laisse une marge apres le premier rendu : ce qui arrive ensuite est
// justement ce qu'on a voulu deporter.
const avantRendu = demandes.filter((d) => d.t - depart <= premierRendu + 150)

console.log(`\nPremier rendu : ${premierRendu} ms`)
console.log(`Scripts demandes avant : ${avantRendu.length}`)
for (const d of avantRendu) console.log('  -', d.url.split('/').pop())

const fautes = avantRendu.filter((d) => INTERDITS.some((motif) => motif.test(d.url)))

if (fautes.length) {
  console.error(`\n${fautes.length} morceau(x) hors du chemin critique charge(s) au demarrage :`)
  for (const f of fautes) console.error('  -', f.url.split('/').pop())
  await navigateur.close()
  process.exit(1)
}

console.log('\nAucun morceau differe n\'est charge avant le premier rendu.')
await navigateur.close()
