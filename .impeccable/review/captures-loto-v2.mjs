// Usage: node captures-loto-v2.mjs <baseUrl> <outDir>
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
const aller = (page, q) =>
  page.goto(`${base}/?${q}&players=${players}`, { waitUntil: 'networkidle' }).catch(() => {})

const navigateur = await chromium.launch()
for (const theme of ['dark', 'light']) {
  for (const v of vues) {
    const ctx = await navigateur.newContext({ ...v, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    await amorcerApp(page, { theme, consentement: true })
    const shot = (nom) => page.screenshot({ path: `${out}/${theme}-${v.nom}-${nom}.png` })

    await aller(page, 'screen=welcome')
    await page.waitForTimeout(1200)
    await shot('welcome')

    await aller(page, 'screen=hub')
    await page.waitForTimeout(1200)
    await shot('hub')
    if (v.nom === 'mobile') {
      await page.locator('main').first().evaluate((el) => el.scrollBy(0, 700)).catch(() => {})
      await page.waitForTimeout(500)
      await shot('hub-bas')
    }

    // Les regles d'un mode, depuis sa ligne.
    const regles = page.locator('[aria-label^="Voir les règles"]').first()
    if (await regles.count()) {
      await regles.click().catch(() => {})
      await page.waitForTimeout(700)
      await shot('regles')
      await page.keyboard.press('Escape').catch(() => {})
      await page.waitForTimeout(400)
    }

    // Le paywall : Action ou Verite porte des packs premium.
    await aller(page, 'screen=hub')
    await page.waitForTimeout(900)
    await page.getByRole('button', { name: /Action ou Vérité/i }).first().click().catch(() => {})
    await page.waitForTimeout(700)
    await page.locator('[aria-label$="contenu premium verrouillé"]').first().click().catch(() => {})
    await page.waitForTimeout(900)
    await shot('paywall')

    // Une partie, puis l'addition au bout des cartes.
    await aller(page, 'screen=game&mode=truthOrDare')
    await page.waitForTimeout(1200)
    await shot('prompt')
    for (let i = 0; i < 90; i++) {
      const fait = page.getByRole('button', { name: /^Fait$/i })
      if (!(await fait.count())) break
      if (i % 3 === 0) {
        await page.getByRole('button', { name: /pénalité/i }).first().click({ timeout: 800 }).catch(() => {})
      } else {
        await fait.first().click({ timeout: 800 }).catch(() => {})
      }
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(1500)
    await shot('addition')

    await ctx.close()
  }
}
await navigateur.close()
console.log('ok', out)
