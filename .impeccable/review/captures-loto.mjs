// Usage: node captures-loto.mjs <baseUrl> <outDir>
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { amorcerApp } from 'file:///C:/Users/adamb/Documents/Projets/BLF%20Labs/Bacchana/bacchana/.claude/worktrees/design-polish-impeccable/scripts/outils/amorce_app.mjs'

const [base, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const players = encodeURIComponent('Alice,Bob,Chloé,Dimitri')
const vues = [
  { nom: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { nom: 'desktop', viewport: { width: 1440, height: 900 } },
]
const ecrans = [
  ['welcome', 'screen=welcome&mode=borderland'],
  ['hub', 'screen=hub&mode=borderland'],
  ['borderland', 'screen=game&mode=borderland'],
  ['prompt', 'screen=game&mode=truthOrDare'],
]
const navigateur = await chromium.launch()
for (const theme of ['dark', 'light']) {
  for (const v of vues) {
    const ctx = await navigateur.newContext({ ...v, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    await amorcerApp(page, { theme, consentement: true })
    for (const [nom, q] of ecrans) {
      await page.goto(`${base}/?${q}&players=${players}`, { waitUntil: 'networkidle' }).catch(() => {})
      await page.waitForTimeout(1600)
      await page.screenshot({ path: `${out}/${theme}-${v.nom}-${nom}.png` })
      if (nom === 'hub' && v.nom === 'mobile') {
        await page.mouse.wheel(0, 700)
        await page.waitForTimeout(600)
        await page.screenshot({ path: `${out}/${theme}-${v.nom}-hub-bas.png` })
      }
      if (nom === 'borderland') {
        const regles = page.locator('[aria-label^="Voir les règles"]').first()
        if (await regles.count()) {
          await regles.click().catch(() => {})
          await page.waitForTimeout(800)
          await page.screenshot({ path: `${out}/${theme}-${v.nom}-modal-regles.png` })
        }
      }
    }
    await ctx.close()
  }
}
await navigateur.close()
console.log('ok', out)
