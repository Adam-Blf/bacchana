// Usage: node captures-paywall.mjs <baseUrl> <outDir>
//
// L'ECRAN DE VENTE, une capture par classe d'ecran declaree et par theme.
//
// La classe television ne se declenche pas a la largeur : le variant `tv` teste
// `(hover: none) and (pointer: coarse)` au-dela de 1240, ou 2000 de large. Les
// deux cas sont donc captures separement - un televiseur a 1920 sans survol, et
// un tres grand ecran a 2560 - sans quoi on croirait la classe morte.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { amorcerApp } from 'file:///C:/Users/adamb/Documents/Projets/BLF%20Labs/Bacchana/bacchana/.claude/worktrees/design-polish-impeccable/scripts/outils/amorce_app.mjs'

const [base, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const players = encodeURIComponent('Alice,Bob,Chloé,Dimitri')

const CLASSES = [
  { nom: '1-telephone-petit', w: 320, h: 640, tactile: true },
  { nom: '2-telephone', w: 390, h: 844, tactile: true },
  { nom: '3-pliant', w: 626, h: 890, tactile: true },
  { nom: '4-duo-ouvert', w: 890, h: 626, tactile: true },
  { nom: '5-ordinateur', w: 1440, h: 900, tactile: false },
  // Televiseur : 1920 SANS survol ni pointeur fin, c'est ce qui declenche `tv`.
  { nom: '6-televiseur', w: 1920, h: 1080, tactile: true },
  // Tres grand ecran : declenche `tv` par la largeur seule.
  { nom: '7-ultralarge', w: 2560, h: 1300, tactile: false },
]

const navigateur = await chromium.launch()
for (const theme of ['dark', 'light']) {
  for (const c of CLASSES) {
    const ctx = await navigateur.newContext({
      viewport: { width: c.w, height: c.h },
      isMobile: c.tactile && c.w < 1000,
      hasTouch: c.tactile,
      deviceScaleFactor: c.w > 1600 ? 1 : 2,
    })
    const page = await ctx.newPage()
    await amorcerApp(page, { theme, consentement: true })
    await page
      .goto(`${base}/?screen=hub&players=${players}`, { waitUntil: 'networkidle' })
      .catch(() => {})
    await page.waitForTimeout(900)
    await page.getByRole('button', { name: /Action ou Vérité/i }).first().click({ timeout: 2000 }).catch(() => {})
    await page.waitForTimeout(700)
    await page
      .locator('[aria-label$="contenu premium verrouillé"]')
      .first()
      .click({ timeout: 2000 })
      .catch(() => {})
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${out}/${theme}-${c.nom}-paywall.png` })
    await ctx.close()
  }
}
await navigateur.close()
console.log('ok', out)
