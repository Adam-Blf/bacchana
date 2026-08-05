#!/usr/bin/env node
/**
 * Script d'exploration TEMPORAIRE #2 (non commite) - verifications ciblees en
 * contexte navigateur FRAIS a chaque scenario (evite le crash memoire observe
 * sur une session unique trop longue dans _audit_tmp.mjs).
 */
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE_URL = 'http://localhost:4173'
const EVIDENCE_DIR = 'C:/Users/adamb/AppData/Local/Temp/la-taverne-audit'
mkdirSync(join(EVIDENCE_DIR, 'screenshots'), { recursive: true })
const axeSource = readFileSync(join(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js'), 'utf-8')

const results = []

async function settle(page, timeout = 4000) {
  const start = Date.now()
  let last = ''
  let stable = 0
  while (Date.now() - start < timeout) {
    const snap = await page
      .evaluate(() => Array.from(document.querySelectorAll('body *')).map((el) => getComputedStyle(el).opacity).join(','))
      .catch(() => 'ERR')
    if (snap === last) {
      stable++
      if (stable >= 2) break
    } else stable = 0
    last = snap
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(150)
}

async function audit(page, name) {
  await settle(page)
  await page.addScriptTag({ content: axeSource })
  const r = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] }, resultTypes: ['violations', 'incomplete'] })
  })
  await page.screenshot({ path: join(EVIDENCE_DIR, 'screenshots', `iso-${name}.png`), fullPage: true }).catch(() => {})
  for (const v of r.violations) for (const n of v.nodes) results.push({ screen: name, type: 'VIOLATION', selector: n.target.join(' '), message: n.failureSummary })
  for (const v of r.incomplete) for (const n of v.nodes) results.push({ screen: name, type: 'incomplete', selector: n.target.join(' '), message: n.failureSummary ?? v.description })
  console.log(`${name}: ${r.violations.length} violation group(s), ${r.incomplete.length} incomplete`)
}

async function seed(page, theme) {
  await page.addInitScript((theme) => {
    localStorage.setItem('meskova-theme', JSON.stringify({ state: { preference: theme }, version: 0 }))
    localStorage.setItem('meskova-onboarding', JSON.stringify({ state: { hasSeenIntro: true }, version: 0 }))
    localStorage.setItem(
      'meskova-consent',
      JSON.stringify({ state: { consent: { necessary: true, analytics: false }, consentVersion: 1, decidedAt: Date.now() }, version: 0 })
    )
  }, theme)
}

async function toHub(page, theme, names = ['Adam', 'Nawel', 'Bruno', 'Sami']) {
  await seed(page, theme)
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Pousser la porte')
  const inputs = page.locator('input[id^="player-"]')
  for (let i = 0; i < names.length; i++) {
    if (i >= 2) await page.getByRole('button', { name: 'Une chaise de plus' }).click()
    await inputs.nth(i).fill(names[i])
  }
  await page.getByRole('button', { name: 'Pousser la porte' }).click()
  await page.waitForSelector('text=Meskova')
  await settle(page)
}

async function withPage(fn) {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  try {
    await fn(page)
  } catch (e) {
    console.log('  SCENARIO FAILED:', e.message)
    await page.screenshot({ path: join(EVIDENCE_DIR, 'screenshots', `FAILDEBUG-${Date.now()}.png`), fullPage: true }).catch(() => {})
    const btns = await page.locator('button').evaluateAll((els) => els.map((e) => e.textContent?.trim().slice(0, 30))).catch(() => ['ERR'])
    console.log('  buttons at failure:', JSON.stringify(btns))
  } finally {
    await context.close()
    await browser.close()
  }
}

async function main() {
  // 1. Roulette wheel - spin, result, finish -> SessionRecap (majeures branch), both themes.
  for (const theme of ['light', 'dark']) {
    await withPage(async (page) => {
      await toHub(page, theme)
      await page.getByRole('button', { name: /La Roue du Destin/ }).first().click()
      await page.waitForTimeout(400)
      await audit(page, `roulette-${theme}`)
      await page.getByRole('button', { name: 'Lancer la roue' }).click()
      await page.waitForTimeout(3700)
      await audit(page, `roulette-result-${theme}`)
      await page.getByRole('button', { name: 'Terminer la partie' }).click()
      await page.waitForTimeout(500)
      await audit(page, `session-recap-roulette-${theme}`)
    })
  }

  // 2. Prompt mode (7 Secondes, direct) through to SessionRecap (penaltyCounts branch).
  for (const theme of ['light', 'dark']) {
    await withPage(async (page) => {
      await toHub(page, theme)
      await page.getByRole('button', { name: /7 Secondes/ }).first().click()
      await page.waitForTimeout(400)
      await audit(page, `sevenSeconds-${theme}`)
      for (let i = 0; i < 30; i++) {
        const finished = await page.locator('text=MERCI DE VOTRE VISITE').isVisible().catch(() => false)
        if (finished) break
        const doneBtn = page.getByRole('button', { name: 'Fait' })
        if (!(await doneBtn.isVisible().catch(() => false))) break
        await doneBtn.click()
        await page.waitForTimeout(120)
      }
      await audit(page, `session-recap-prompt-${theme}`)
    })
  }

  // 3. Premium picker overlay - locked pack teaser (opacity-70), both themes.
  for (const theme of ['light', 'dark']) {
    await withPage(async (page) => {
      await toHub(page, theme)
      await page.getByRole('button', { name: /Action ou Vérité/ }).first().click()
      await page.waitForTimeout(400)
      await audit(page, `picker-premium-locked-${theme}`)
      await page.hover('button[aria-label*="contenu premium verrouillé"]').catch(() => {})
      await audit(page, `picker-premium-locked-hover-${theme}`)
    })
  }

  // 4. Settings reset button hover, isolated repro of the suspected bug.
  for (const theme of ['light', 'dark']) {
    await withPage(async (page) => {
      await toHub(page, theme)
      await page.getByRole('button', { name: 'Réglages' }).click()
      await page.waitForSelector('text=Apparence')
      await settle(page)
      await page.hover('button:has-text("Réinitialiser la tablée")')
      await page.waitForTimeout(200)
      await audit(page, `settings-reset-hover-${theme}`)
    })
  }

  writeFileSync(join(EVIDENCE_DIR, 'results-iso.json'), JSON.stringify(results, null, 2))
  console.log(`\n${results.length} finding(s). Detail:`)
  for (const r of results) console.log(`- [${r.screen}] (${r.type}) ${r.selector} :: ${r.message}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
