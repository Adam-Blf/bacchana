#!/usr/bin/env node
/**
 * Garde de contraste WCAG 2.1 sur le RENDU RÉEL (Playwright + axe-core),
 * complément de scripts/check_contrast.mjs (qui ne connaît que les tokens
 * écrits à la main dans tokens.css).
 *
 * Pourquoi les deux gardes coexistent - voir docs/DESIGN_TOKENS.md section
 * "Garde de contraste" pour le compromis complet. En bref : check_contrast.mjs
 * est instantané (pas de navigateur, tourne à chaque commit) mais ne voit que
 * les paires qu'un humain a pensé à lister ; ce script-ci rend chaque écran
 * dans un vrai Chromium et laisse axe-core mesurer les couleurs CALCULÉES
 * (styles inline, JS, SVG, opacité composée, survol, focus, modales) - il ne
 * peut structurellement pas "oublier" une combinaison, mais coûte ~2-3 min de
 * CI. Les deux tournent en CI (voir .github/workflows/ci.yml) : la garde
 * rapide à chaque push, celle-ci après le build.
 *
 * Usage : npm run check:contrast:visual (nécessite `npm run build` avant, et
 * `npx playwright install chromium` en local la première fois).
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runCoreScenarios } from './visual-contrast/scenarios-core.mjs'
import {
  runDirectModeScenarios,
  runRouletteScenario,
  runPromptModeScenario,
  runPickerScenarios,
} from './visual-contrast/scenarios-modes.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PORT = process.env.VISUAL_CHECK_PORT || '4174'
const BASE_URL = `http://localhost:${PORT}`

function assertBuilt() {
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.error('dist/index.html introuvable - lance `npm run build` avant ce script.')
    process.exit(1)
  }
}

function startPreviewServer() {
  const child = spawn('npx', ['vite', 'preview', '--port', PORT, '--strictPort'], {
    cwd: ROOT,
    stdio: 'pipe',
    shell: process.platform === 'win32',
  })
  return child
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // pas encore prêt
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`Le serveur de preview ne répond pas sur ${url} après ${timeoutMs}ms`)
}

/** Exécute un groupe de scénarios dans un contexte de navigateur FRAIS -
 * une session unique trop longue (15+ écrans successifs) fait planter le
 * renderer Chromium (observé lors de l'audit du 2026-08-05) ; des contextes
 * courts et jetables sont nettement plus fiables en CI. */
async function runInFreshContext(browser, viewport, theme, seedFn, runner) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
  const page = await context.newPage()
  let findings = []
  try {
    await seedFn(page, theme)
    findings = await runner(page, BASE_URL)
  } catch (err) {
    findings = [{ label: `SCENARIO_ERROR:${runner.name}`, selector: '-', html: '-', summary: err.message }]
  } finally {
    await context.close()
  }
  return findings.map((f) => ({ ...f, theme, viewport: viewport.width >= 1000 ? 'desktop' : 'mobile' }))
}

async function main() {
  assertBuilt()
  const server = startPreviewServer()
  const allFindings = []

  try {
    await waitForServer(BASE_URL)
    const browser = await chromium.launch()
    const { seedApp } = await import('./visual-contrast/seed.mjs')
    const desktop = { width: 1280, height: 800 }
    const mobile = { width: 390, height: 844 }

    const runners = [runCoreScenarios, runDirectModeScenarios, runRouletteScenario, runPromptModeScenario, runPickerScenarios]

    for (const theme of ['light', 'dark']) {
      for (const runner of runners) {
        allFindings.push(...(await runInFreshContext(browser, desktop, theme, seedApp, runner)))
      }
    }
    // Largeur mobile : passe ciblée sur les écrans structurels (le plus haut
    // risque de rupture de layout/contraste au responsive), pas le produit
    // cartésien complet théme x écran x mobile - voir README de ce dossier.
    for (const theme of ['light', 'dark']) {
      allFindings.push(...(await runInFreshContext(browser, mobile, theme, seedApp, runCoreScenarios)))
    }

    await browser.close()
  } finally {
    server.kill()
  }

  console.log(`\nGarde de contraste visuelle (Playwright + axe-core) - ${allFindings.length} défaut(s)\n`)
  for (const f of allFindings) {
    console.log(`[${f.label}/${f.theme}/${f.viewport}] ${f.selector}`)
    console.log(`  ${f.summary}`)
  }

  if (allFindings.length > 0) {
    console.error(`\n${allFindings.length} défaut(s) de contraste détecté(s) sur le rendu réel.`)
    process.exit(1)
  }
  console.log('Aucun défaut de contraste détecté sur les écrans/états couverts.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
