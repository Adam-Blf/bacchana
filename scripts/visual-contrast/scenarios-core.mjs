import { auditScreen } from './audit.mjs'
import { settle } from './settle.mjs'
import { enterHub } from './seed.mjs'

/**
 * Écrans "structurels" : accueil, hub, réglages, écrans légaux, bandeau
 * cookies, règles, mes règles. Un findings[] est accumulé et retourné - le
 * script appelant décide quoi en faire (exit 1 si non vide).
 */
export async function runCoreScenarios(page, baseUrl) {
  const findings = []
  const audit = async (label) => findings.push(...(await auditScreen(page, label)))

  await enterHub(page, baseUrl)
  await audit('welcome-filled')

  // Panneau genre/statut (joueur 1) - état déplié, testé une fois pour la forme du panneau.
  await page.getByRole('button', { name: /Genre et statut de Joueur 1/ }).click()
  await audit('welcome-attributes-open')
  await page.getByRole('button', { name: /Genre et statut de Joueur 1/ }).click()

  await page.getByRole('button', { name: 'Pousser la porte' }).click()
  await page.waitForSelector('text=Bacchana', { timeout: 15000 })
  await audit('hub')

  await page.hover('button:has-text("Modifier")')
  await audit('hub-hover-modifier')

  // Réglages, y compris le survol du bouton de réinitialisation (régression
  // réelle trouvée le 2026-08-05 : hover:text-tile-ink du variant "secondary"
  // du Button non retiré par l'override text-danger).
  await page.getByRole('button', { name: 'Réglages' }).click()
  await page.waitForSelector('text=Apparence')
  await audit('settings')
  await page.hover('button:has-text("Réinitialiser la tablée")')
  await audit('settings-hover-reset')
  await page.getByRole('button', { name: 'Réinitialiser la tablée' }).click()
  await audit('settings-confirm-reset-dialog')
  await page.getByRole('button', { name: 'Annuler' }).click()

  await page.getByRole('button', { name: 'Débloquer le premium' }).click()
  await settle(page)
  await audit('paywall')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: "Revenir à l'accueil" }).click()

  await page.getByRole('button', { name: 'Mes règles' }).first().click()
  await settle(page)
  await audit('custom-rules')
  await page.goBack().catch(() => {})
  await page.waitForSelector('text=Bacchana', { timeout: 10000 }).catch(() => {})
  await settle(page)

  await page.getByRole('button', { name: /^Règles$/ }).click()
  await settle(page)
  await audit('rules-borderland')
  await page.goBack().catch(() => {})
  await page.waitForSelector('text=Bacchana', { timeout: 10000 }).catch(() => {})
  await settle(page)

  await page.getByLabel('Voir les règles de Quitte ou Trinque').click()
  await settle(page)
  await audit('mode-rules-quiz')
  await page.goBack().catch(() => {})
  await page.waitForSelector('text=Bacchana', { timeout: 10000 }).catch(() => {})
  await settle(page)

  for (const [label, id] of [
    ['Mentions légales', 'mentions-legales'],
    ['Confidentialité', 'confidentialite'],
    ['CGU / CGV', 'cgu'],
  ]) {
    await page.getByRole('button', { name: label, exact: true }).first().click()
    await settle(page)
    await audit(`legal-${id}`)
    await page.goBack().catch(() => {})
    await page.waitForSelector('text=Bacchana', { timeout: 10000 }).catch(() => {})
    await settle(page)
  }

  await page.getByRole('button', { name: 'Cookies' }).click()
  await settle(page)
  await audit('cookie-manage-panel')
  await page.getByRole('button', { name: 'Enregistrer mes choix' }).click()
  await settle(page)

  return findings
}
