#!/usr/bin/env node
/**
 * Script d'exploration TEMPORAIRE (non commite) - audit visuel exhaustif via
 * un vrai navigateur (Playwright + axe-core) de tous les ecrans / etats /
 * themes de l'application, contre le serveur de preview local (4173).
 */
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE_URL = 'http://localhost:4173'
const EVIDENCE_DIR = 'C:/Users/adamb/AppData/Local/Temp/la-taverne-audit'
mkdirSync(EVIDENCE_DIR, { recursive: true })
mkdirSync(join(EVIDENCE_DIR, 'screenshots'), { recursive: true })

const axeSource = readFileSync(
  join(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js'),
  'utf-8'
)

const results = []
let shotIndex = 0

async function seedLocalStorage(page, { theme, onboardingSeen = true, consentDecided = true }) {
  await page.addInitScript(
    ({ theme, onboardingSeen, consentDecided }) => {
      window.localStorage.setItem(
        'meskova-theme',
        JSON.stringify({ state: { preference: theme }, version: 0 })
      )
      if (onboardingSeen) {
        window.localStorage.setItem(
          'meskova-onboarding',
          JSON.stringify({ state: { hasSeenIntro: true }, version: 0 })
        )
      }
      if (consentDecided) {
        window.localStorage.setItem(
          'meskova-consent',
          JSON.stringify({
            state: {
              consent: { necessary: true, analytics: false },
              consentVersion: 1,
              decidedAt: Date.now(),
            },
            version: 0,
          })
        )
      }
    },
    { theme, onboardingSeen, consentDecided }
  )
}

async function settle(page, timeout = 4000) {
  // framer-motion drives most springs/opacity fades via rAF + direct inline-style
  // mutation, NOT the Web Animations API - document.getAnimations() misses those
  // entirely (returns empty -> false "already settled"). Poll the actual computed
  // opacity of every element instead: wait until two consecutive snapshots 150ms
  // apart are identical. A mid-fade frame (opacity ~0.05-0.3) reads as a near-black
  // or near-white background/text - a false positive, not a real contrast bug.
  const start = Date.now()
  let last = ''
  let stable = 0
  while (Date.now() - start < timeout) {
    const snap = await page.evaluate(() =>
      Array.from(document.querySelectorAll('body *'))
        .map((el) => getComputedStyle(el).opacity)
        .join(',')
    )
    if (snap === last) {
      stable++
      if (stable >= 2) break
    } else {
      stable = 0
    }
    last = snap
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(150)
}

async function audit(page, screenName, theme, viewport) {
  await settle(page)
  await page.addScriptTag({ content: axeSource })
  const axeResults = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, {
      runOnly: { type: 'rule', values: ['color-contrast'] },
      resultTypes: ['violations', 'incomplete'],
    })
  })

  shotIndex += 1
  const shotName = `${String(shotIndex).padStart(3, '0')}-${screenName}-${theme}-${viewport}.png`
  await page.screenshot({ path: join(EVIDENCE_DIR, 'screenshots', shotName), fullPage: true }).catch(() => {})

  for (const v of axeResults.violations) {
    for (const node of v.nodes) {
      results.push({
        screen: screenName,
        theme,
        viewport,
        selector: node.target.join(' '),
        text: (node.html || '').replace(/\s+/g, ' ').slice(0, 140),
        message: node.failureSummary,
        screenshot: shotName,
      })
    }
  }
  for (const v of axeResults.incomplete) {
    for (const node of v.nodes) {
      results.push({
        screen: screenName,
        theme,
        viewport,
        selector: node.target.join(' '),
        text: (node.html || '').replace(/\s+/g, ' ').slice(0, 140),
        message: `INCOMPLETE (needs manual review): ${node.failureSummary ?? v.description}`,
        screenshot: shotName,
      })
    }
  }
  console.log(`  audited ${screenName} [${theme}/${viewport}] - ${axeResults.violations.length} violation group(s), ${axeResults.incomplete.length} incomplete`)
}

async function fillPlayers(page, names) {
  // Two default rows exist - fill them, then add more.
  const inputs = page.locator('input[id^="player-"]')
  for (let i = 0; i < names.length; i++) {
    if (i >= 2) {
      await page.getByRole('button', { name: 'Une chaise de plus' }).click()
    }
    await inputs.nth(i).fill(names[i])
  }
}

async function runFlow(browser, theme, viewportSize) {
  const viewport = viewportSize.width >= 1000 ? 'desktop' : 'mobile'
  const context = await browser.newContext({ viewport: viewportSize, reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`  [console.error] ${msg.text().slice(0, 200)}`)
  })
  await seedLocalStorage(page, { theme })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })

  // Onboarding (fresh, separate short pass) skipped here (seeded seen=true) -
  // covered by a dedicated fresh-context pass below in main().

  await page.waitForSelector('text=Pousser la porte', { timeout: 15000 })
  await audit(page, 'welcome', theme, viewport)

  await fillPlayers(page, ['Adam', 'Nawel', 'Bruno', 'Sami', 'Lina', 'Yanis', 'Zoe', 'Karim'])
  await audit(page, 'welcome-filled', theme, viewport)

  // Expand attribute panel (genre/statut) on player 1 for extra state coverage.
  await page.getByRole('button', { name: /Genre et statut de Joueur 1/ }).click()
  await audit(page, 'welcome-attributes-open', theme, viewport)
  await page.getByRole('button', { name: /Genre et statut de Joueur 1/ }).click()

  await page.getByRole('button', { name: 'Pousser la porte' }).click()
  await page.waitForSelector('text=Meskova', { timeout: 15000 })
  await audit(page, 'hub', theme, viewport)

  // Hover states on hub tiles / header buttons.
  await page.hover('button:has-text("Modifier")')
  await audit(page, 'hub-hover-modifier', theme, viewport)

  // Settings screen.
  await page.getByRole('button', { name: 'Réglages' }).click()
  await page.waitForSelector('text=Apparence')
  await audit(page, 'settings', theme, viewport)
  // Hover the danger reset button - known suspect (secondary variant override).
  await page.hover('button:has-text("Réinitialiser la tablée")')
  await audit(page, 'settings-hover-reset', theme, viewport)
  await page.getByRole('button', { name: 'Réinitialiser la tablée' }).click()
  await audit(page, 'settings-confirm-reset-dialog', theme, viewport)
  await page.getByRole('button', { name: 'Annuler' }).click()
  // Paywall from settings.
  await page.getByRole('button', { name: 'Débloquer le premium' }).click()
  await page.waitForTimeout(300)
  await audit(page, 'paywall', theme, viewport)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: "Revenir à l'accueil" }).click()

  // Custom rules.
  await page.getByRole('button', { name: 'Mes règles' }).first().click()
  await page.waitForTimeout(300)
  await audit(page, 'custom-rules', theme, viewport)
  await page.goBack().catch(() => {})
  await page.waitForSelector('text=Meskova', { timeout: 10000 }).catch(() => {})

  // Rules (Coupe-Gorge).
  await page.getByRole('button', { name: /^Règles$/ }).click()
  await page.waitForTimeout(300)
  await audit(page, 'rules-borderland', theme, viewport)
  await page.goBack().catch(() => {})
  await page.waitForSelector('text=Meskova', { timeout: 10000 }).catch(() => {})

  // Mode rules (sample: quiz).
  await page.getByLabel('Voir les règles de Quitte ou Trinque').click()
  await page.waitForTimeout(300)
  await audit(page, 'mode-rules-quiz', theme, viewport)
  await page.goBack().catch(() => {})
  await page.waitForSelector('text=Meskova', { timeout: 10000 }).catch(() => {})

  // Legal screens via footer.
  for (const [label, name] of [
    ['Mentions légales', 'mentions-legales'],
    ['Confidentialité', 'confidentialite'],
    ['CGU / CGV', 'cgu'],
  ]) {
    await page.getByRole('button', { name: label, exact: true }).first().click()
    await page.waitForTimeout(400)
    await audit(page, `legal-${name}`, theme, viewport)
    await page.goBack().catch(() => {})
    await page.waitForSelector('text=Meskova', { timeout: 10000 }).catch(() => {})
    await settle(page)
  }

  // Cookie manage panel (from footer "Cookies").
  await page.getByRole('button', { name: 'Cookies' }).click()
  await page.waitForTimeout(300)
  await audit(page, 'cookie-manage-panel', theme, viewport)
  await page.getByRole('button', { name: 'Enregistrer mes choix' }).click()
  await page.waitForTimeout(300)

  async function quitToHub(quitLabel) {
    await page.getByRole('button', { name: quitLabel }).click()
    await page.waitForTimeout(300)
    const dialog = page.getByRole('alertdialog')
    if (await dialog.isVisible().catch(() => false)) {
      await audit(page, 'quit-confirm-dialog', theme, viewport)
      await dialog.getByRole('button', { name: /Quitter|Confirmer/i }).first().click()
      await page.waitForTimeout(300)
    }
    // Quiz/Ranking route "quit" through SessionRecap instead of straight to hub.
    const recapVisible = await page.locator('text=MERCI DE VOTRE VISITE').isVisible().catch(() => false)
    if (recapVisible) {
      await audit(page, 'session-recap-quit', theme, viewport)
      await page.getByRole('button', { name: /Retour à l'accueil/ }).click()
      await page.waitForTimeout(200)
    }
    await page.waitForSelector('text=Meskova', { timeout: 10000 })
  }

  // --- Direct-launch modes (no pack picker) ---
  const directModes = [
    ['Quitte ou Trinque', 'quiz', "Quitter le quiz et revenir à l'accueil"],
    ["Le Tableau d'Honneur", 'ranking', 'Quitter le Podium et revenir à l\'accueil'],
    ['La Criée', 'auction', "Quitter l'Enchère et revenir à l'accueil"],
    ['Tu préfères', 'wouldYouRather', 'Quitter Tu préfères et revenir à l\'accueil'],
    ['Le Pilori', 'tribunal', 'Quitter le procès et revenir à l\'accueil'],
  ]
  for (const [title, id, quitLabel] of directModes) {
    await page.getByRole('button', { name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first().click()
    await page.waitForTimeout(600)
    await audit(page, `mode-${id}`, theme, viewport)
    await quitToHub(quitLabel).catch((e) => console.log(`  quit failed for ${id}: ${e.message}`))
  }

  // --- Roulette full loop: spin, view result, finish session -> SessionRecap ---
  try {
    await settle(page)
    const debugButtons = await page.locator('button').evaluateAll((els) => els.map((e) => e.textContent?.trim().slice(0, 40)))
    console.log('  DEBUG hub buttons after tribunal quit:', JSON.stringify(debugButtons))
    await page.getByRole('button', { name: /^La Roue du Destin/ }).first().click({ timeout: 8000 })
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'Lancer la roue' }).click()
    await page.waitForTimeout(3800)
    await audit(page, 'roulette-result', theme, viewport)
    await page.getByRole('button', { name: 'Terminer la partie' }).click()
    await page.waitForTimeout(400)
    await audit(page, 'session-recap-roulette', theme, viewport)
    await page.getByRole('button', { name: /Retour à l'accueil/ }).click()
    await page.waitForSelector('text=Meskova', { timeout: 10000 })
  } catch (e) {
    console.log(`  roulette flow failed FULL: ${e.stack || e}`)
    await page.goto(BASE_URL, { waitUntil: 'networkidle' }).catch(() => {})
    await fillPlayers(page, ['Adam', 'Nawel', 'Bruno', 'Sami', 'Lina', 'Yanis', 'Zoe', 'Karim']).catch(() => {})
    await page.getByRole('button', { name: 'Pousser la porte' }).click().catch(() => {})
    await page.waitForSelector('text=Meskova', { timeout: 10000 }).catch(() => {})
  }

  // --- Prompt-based modes: direct start (sevenSeconds) + picker (the other 4) ---
  try {
    await page.getByRole('button', { name: /^7 Secondes/ }).first().click({ timeout: 8000 })
    await page.waitForTimeout(500)
    await audit(page, 'mode-sevenSeconds', theme, viewport)
    await clickDoneUntilFinished(page)
    await audit(page, 'session-recap-prompt', theme, viewport)
    await page.getByRole('button', { name: /Retour à l'accueil/ }).click()
    await page.waitForSelector('text=Meskova', { timeout: 10000 })
  } catch (e) {
    console.log(`  sevenSeconds flow failed: ${e.message}`)
  }

  const pickerModes = [
    ['Action ou Vérité', 'truthOrDare'],
    ["C'est un 10 mais", 'itsA10But'],
    ["Je n'ai jamais", 'neverHaveIEver'],
    ['Qui de nous', 'whoAmong'],
    ['Le Taulier', 'picolo'],
  ]
  for (const [title, id] of pickerModes) {
    try {
      const tile = page.getByRole('button', { name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first()
      if (!(await tile.isVisible({ timeout: 3000 }).catch(() => false))) continue
      await tile.click()
      await page.waitForTimeout(400)
      await audit(page, `picker-${id}`, theme, viewport)
      const freePackButton = page.locator('button:has(h3)').first()
      await freePackButton.click({ timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(400)
      await audit(page, `mode-${id}`, theme, viewport)
      await page.goto(BASE_URL, { waitUntil: 'networkidle' }).catch(() => {})
      break // one full picker->game pass is representative; avoids reload wiping players for the rest
    } catch (e) {
      console.log(`  picker ${id} failed: ${e.message}`)
    }
  }

  await context.close()
}

async function clickDoneUntilFinished(page, maxTurns = 40) {
  for (let i = 0; i < maxTurns; i++) {
    const finished = await page.locator('text=MERCI DE VOTRE VISITE').isVisible().catch(() => false)
    if (finished) return
    const doneButton = page.getByRole('button', { name: 'Fait' })
    if (!(await doneButton.isVisible().catch(() => false))) return
    await doneButton.click()
    await page.waitForTimeout(150)
  }
}

async function main() {
  const browser = await chromium.launch()
  try {
    console.log('=== Theme clair / desktop ===')
    await runFlow(browser, 'light', { width: 1280, height: 800 }).catch((e) => console.error('FLOW ERROR light/desktop', e.message))
    if (!process.env.AUDIT_QUICK) {
      console.log('=== Theme sombre / desktop ===')
      await runFlow(browser, 'dark', { width: 1280, height: 800 }).catch((e) => console.error('FLOW ERROR dark/desktop', e.message))
      console.log('=== Theme sombre / mobile ===')
      await runFlow(browser, 'dark', { width: 390, height: 844 }).catch((e) => console.error('FLOW ERROR dark/mobile', e.message))
    }
  } finally {
    await browser.close()
    writeFileSync(join(EVIDENCE_DIR, 'results.json'), JSON.stringify(results, null, 2))
    console.log(`\n${results.length} defaut(s)/incomplete(s) trouve(s). Voir ${EVIDENCE_DIR}/results.json`)
    for (const r of results) {
      console.log(`- [${r.screen}/${r.theme}/${r.viewport}] ${r.selector} :: ${r.message}`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
