// Usage: node captures-classes.mjs <baseUrl> <outDir>
//
// UNE CAPTURE PAR CLASSE D'ÉCRAN DÉCLARÉE (voir DESIGN.md). Le balayage continu
// prouve qu'aucune largeur ne casse ; ces captures-ci montrent que la
// COMPOSITION change de nature d'une classe à l'autre, ce qu'un balayage ne
// peut pas montrer.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { amorcerApp } from 'file:///C:/Users/adamb/Documents/Projets/BLF%20Labs/Bacchana/bacchana/.claude/worktrees/design-polish-impeccable/scripts/outils/amorce_app.mjs'
import { amorcerScores } from 'file:///C:/Users/adamb/Documents/Projets/BLF%20Labs/Bacchana/bacchana/.claude/worktrees/design-polish-impeccable/.impeccable/review/amorce_scores.mjs'

const [base, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const players = encodeURIComponent('Alice,Bob,Chloé,Dimitri,Églantine,Fabrice,Gwenaëlle,Hyacinthe')

// Les classes déclarées dans DESIGN.md, plus les deux cas qui partagent une
// composition mais qu'Adam a nommés : le petit téléphone et le paysage court.
const CLASSES = [
  { nom: '1-telephone-petit', w: 320, h: 640, mobile: true },
  { nom: '2-telephone', w: 390, h: 844, mobile: true },
  { nom: '3-telephone-paysage', w: 740, h: 360, mobile: true },
  { nom: '4-pliant-tablette', w: 768, h: 1024 },
  { nom: '5-ordinateur', w: 1440, h: 900 },
  { nom: '6-televiseur', w: 1920, h: 1080 },
  { nom: '7-ultralarge', w: 2560, h: 1080 },
]

const navigateur = await chromium.launch()

for (const theme of ['dark', 'light']) {
  for (const c of CLASSES) {
    const ctx = await navigateur.newContext({
      viewport: { width: c.w, height: c.h },
      isMobile: Boolean(c.mobile),
      hasTouch: Boolean(c.mobile),
      deviceScaleFactor: c.w > 1600 ? 1 : 2,
    })
    const page = await ctx.newPage()
    await amorcerApp(page, { theme, consentement: true })
    await amorcerScores(page)
    const shot = (nom) => page.screenshot({ path: `${out}/${theme}-${c.nom}-${nom}.png` })
    const aller = (q) =>
      page.goto(`${base}/?${q}&players=${players}`, { waitUntil: 'networkidle' }).catch(() => {})

    // LA FICHE DE SCORE dans les deux registres : c'est la preuve demandée.
    await aller('screen=palmares')
    await page.waitForTimeout(1000)
    await shot('scores-soir')
    await page.getByRole('button', { name: /Toujours/i }).first().click({ timeout: 1500 }).catch(() => {})
    await page.waitForTimeout(600)
    await shot('scores-toujours')

    await aller('screen=hub')
    await page.waitForTimeout(1000)
    await shot('hub')

    await aller('screen=welcome')
    await page.waitForTimeout(1000)
    await shot('accueil')

    await ctx.close()
  }
}

await navigateur.close()
console.log('ok', out)
