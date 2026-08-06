import { auditScreen } from './audit.mjs'
import { settle } from './settle.mjs'
import { enterHub } from './seed.mjs'

/** Régex échappée pour matcher un titre de mode dans l'accessible name de sa tuile. */
function titleRe(title) {
  return new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
}

/** Quitte l'écran de jeu courant vers le hub, en passant par un dialogue de
 * confirmation ou une addition (SessionRecap) si le mode les impose. */
async function quitToHub(page, quitLabel, findings) {
  await page.getByRole('button', { name: quitLabel }).click()
  await page.waitForTimeout(300)
  const dialog = page.getByRole('alertdialog')
  if (await dialog.isVisible().catch(() => false)) {
    findings.push(...(await auditScreen(page, 'quit-confirm-dialog')))
    await dialog.getByRole('button', { name: /Quitter|Confirmer/i }).first().click()
    await page.waitForTimeout(300)
  }
  if (await page.locator('text=MERCI DE VOTRE VISITE').isVisible().catch(() => false)) {
    findings.push(...(await auditScreen(page, 'session-recap-quit')))
    await page.getByRole('button', { name: /Retour à l'accueil/ }).click()
    await page.waitForTimeout(200)
  }
  await page.waitForSelector('text=Bacchana', { timeout: 10000 })
}

/** Modes lancés directement depuis le hub (pas de choix de pack) : Quiz,
 * Podium, Criée, Tu préfères, Pilori. Couvre aussi l'écran de fin via quit. */
export async function runDirectModeScenarios(page, baseUrl) {
  const findings = []
  await enterHub(page, baseUrl)

  const modes = [
    ['Quitte ou Trinque', 'quiz', "Quitter le quiz et revenir à l'accueil"],
    ["Le Tableau d'Honneur", 'ranking', "Quitter le Podium et revenir à l'accueil"],
    ['La Criée', 'auction', "Quitter l'Enchère et revenir à l'accueil"],
    ['Tu préfères', 'wouldYouRather', "Quitter Tu préfères et revenir à l'accueil"],
    ['Le Pilori', 'tribunal', "Quitter le procès et revenir à l'accueil"],
  ]
  for (const [title, id, quitLabel] of modes) {
    await page.getByRole('button', { name: titleRe(title) }).first().click()
    await settle(page)
    findings.push(...(await auditScreen(page, `mode-${id}`)))
    await quitToHub(page, quitLabel, findings)
  }
  return findings
}

/** La Roue du Destin : lancer, résultat, addition de fin (branche "majeures"). */
export async function runRouletteScenario(page, baseUrl) {
  const findings = []
  await enterHub(page, baseUrl)
  await page.getByRole('button', { name: /La Roue du Destin/ }).first().click()
  await settle(page)
  findings.push(...(await auditScreen(page, 'roulette')))
  await page.getByRole('button', { name: 'Lancer la roue' }).click()
  await page.waitForTimeout(3700) // durée de l'animation de la roue, cf RouletteScreen.tsx
  findings.push(...(await auditScreen(page, 'roulette-result')))
  await page.getByRole('button', { name: 'Terminer la partie' }).click()
  await settle(page)
  findings.push(...(await auditScreen(page, 'session-recap-roulette')))
  return findings
}

/** Mode à prompts lancé sans choix de pack (7 Secondes) jusqu'à l'addition
 * (branche "penaltyCounts" de SessionRecap, distincte de la roulette). */
export async function runPromptModeScenario(page, baseUrl) {
  const findings = []
  await enterHub(page, baseUrl)
  await page.getByRole('button', { name: /7 Secondes/ }).first().click()
  await settle(page)
  findings.push(...(await auditScreen(page, 'mode-sevenSeconds')))
  for (let i = 0; i < 40; i++) {
    if (await page.locator('text=MERCI DE VOTRE VISITE').isVisible().catch(() => false)) break
    const doneButton = page.getByRole('button', { name: 'Fait' })
    if (!(await doneButton.isVisible().catch(() => false))) break
    await doneButton.click()
    await page.waitForTimeout(120)
  }
  findings.push(...(await auditScreen(page, 'session-recap-prompt')))
  return findings
}

/**
 * Choix de pack : couvre la carte "premium verrouillé" (opacity-70 -
 * régression réelle trouvée le 2026-08-05) sur deux modes représentatifs.
 * Le composant de choix est identique pour les 5 modes à catalogue premium -
 * tester 2 plutôt que 5 est un compromis assumé (voir README de ce dossier).
 */
export async function runPickerScenarios(page, baseUrl) {
  const findings = []
  await enterHub(page, baseUrl)
  for (const title of ['Action ou Vérité', 'Le Taulier']) {
    const tile = page.getByRole('button', { name: titleRe(title) }).first()
    if (!(await tile.isVisible().catch(() => false))) continue
    await tile.click()
    await settle(page)
    findings.push(...(await auditScreen(page, `picker-${title}`)))
    const lockedEntry = page.locator('button[aria-label*="contenu premium verrouillé"]').first()
    if (await lockedEntry.isVisible().catch(() => false)) {
      await lockedEntry.hover()
      findings.push(...(await auditScreen(page, `picker-${title}-premium-hover`)))
    }
    await page.getByRole('button', { name: 'Retour au hub' }).click()
    await settle(page)
  }
  return findings
}
