// Usage: node captures-loto-v3.mjs <baseUrl> <outDir>
//
// Troisieme tour de captures. Ajout par rapport a v2 : la FICHE DE SCORE, qui
// n'etait jamais capturee. Elle a besoin de donnees pour exister - un palmares
// vide affiche un etat vide - donc les deux magasins sont amorces ici, avec la
// meme forme que `persist` de zustand ({ state, version }).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { amorcerApp } from 'file:///C:/Users/adamb/Documents/Projets/BLF%20Labs/Bacchana/bacchana/.claude/worktrees/design-polish-impeccable/scripts/outils/amorce_app.mjs'

const [base, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const players = encodeURIComponent('Alice,Bob,Chloé,Dimitri')

/**
 * L'ardoise du soir et le palmares de toujours, avec de VRAIES donnees :
 * une egalite en tete du palmares (Bob et Chloé a 31), un ex aequo plus bas,
 * et des nombres de parties differents - c'est exactement ce que la fiche doit
 * savoir montrer, et ce qu'un jeu de donnees plat ne teste pas.
 */
function amorcerScores(page) {
  return page.addInitScript(() => {
    try {
      const maintenant = Date.now()
      localStorage.setItem(
        'bacchana-ardoise',
        JSON.stringify({
          state: {
            ledger: {
              j1: { name: 'Alice', total: 12, games: 4 },
              j2: { name: 'Bob', total: 9, games: 4 },
              j3: { name: 'Chloé', total: 9, games: 3 },
              j4: { name: 'Dimitri', total: 4, games: 4 },
            },
            gamesPlayed: 4,
            modesPlayed: ['truthOrDare', 'picolo', 'quiz'],
            majLe: maintenant,
          },
          version: 0,
        })
      )
      localStorage.setItem(
        'bacchana-palmares',
        JSON.stringify({
          state: {
            lignes: {
              alice: {
                nom: 'Alice',
                parties: 11,
                penalites: 38,
                palmes: 3,
                modes: ['truthOrDare', 'picolo', 'quiz'],
                derniereFois: maintenant,
              },
              bob: {
                nom: 'Bob',
                parties: 9,
                penalites: 31,
                palmes: 1,
                modes: ['truthOrDare', 'neverHaveIEver'],
                derniereFois: maintenant - 86400000,
              },
              'chloé': {
                nom: 'Chloé',
                parties: 9,
                penalites: 31,
                palmes: 2,
                modes: ['picolo', 'whoAmong'],
                derniereFois: maintenant - 172800000,
              },
              dimitri: {
                nom: 'Dimitri',
                parties: 6,
                penalites: 17,
                palmes: 0,
                modes: ['quiz'],
                derniereFois: maintenant - 604800000,
              },
            },
          },
          version: 0,
        })
      )
    } catch {
      /* document sans stockage */
    }
  })
}

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
    await amorcerScores(page)
    const shot = (nom) => page.screenshot({ path: `${out}/${theme}-${v.nom}-${nom}.png` })

    await aller(page, 'screen=welcome')
    await page.waitForTimeout(1200)
    await shot('welcome')

    await aller(page, 'screen=hub')
    await page.waitForTimeout(1200)
    await shot('hub')
    await page.locator('main').first().evaluate((el) => el.scrollBy(0, 700)).catch(() => {})
    await page.waitForTimeout(500)
    await shot('hub-bas')

    // LA FICHE DE SCORE, les deux registres.
    await aller(page, 'screen=palmares')
    await page.waitForTimeout(1000)
    await shot('scores-soir')
    await page.getByRole('button', { name: /Toujours/i }).first().click({ timeout: 1500 }).catch(() => {})
    await page.waitForTimeout(600)
    await shot('scores-toujours')
    // Une ligne depliee : le detail des modes et de la derniere partie.
    await page.locator('ol button[aria-expanded]').first().click({ timeout: 1500 }).catch(() => {})
    await page.waitForTimeout(500)
    await shot('scores-detail')

    // Les regles d'un mode, depuis sa ligne.
    await aller(page, 'screen=hub')
    await page.waitForTimeout(900)
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
