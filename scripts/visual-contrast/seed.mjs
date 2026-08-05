import { settle } from './settle.mjs'

const DEFAULT_PLAYERS = ['Adam', 'Nawel', 'Bruno', 'Sami', 'Lina', 'Yanis', 'Zoe', 'Karim']

/**
 * Seed le localStorage AVANT le premier rendu (via addInitScript) pour sauter
 * l'onboarding et le bandeau cookies sur les scenarios qui ne les testent pas
 * explicitement, et forcer le theme sans dependre du systeme d'exploitation.
 * Format zustand persist ({state, version}) - doit rester synchronise avec
 * chaque store concerne si son schema de persistance change.
 */
export async function seedApp(page, theme) {
  await page.addInitScript((theme) => {
    localStorage.setItem('bacchus-theme', JSON.stringify({ state: { preference: theme }, version: 0 }))
    localStorage.setItem('bacchus-onboarding', JSON.stringify({ state: { hasSeenIntro: true }, version: 0 }))
    localStorage.setItem(
      'bacchus-consent',
      JSON.stringify({
        state: { consent: { necessary: true, analytics: false }, consentVersion: 1, decidedAt: Date.now() },
        version: 0,
      })
    )
  }, theme)
}

/** Seede sans consentement decide, pour les scenarios qui testent le bandeau cookies lui-meme. */
export async function seedAppNoConsent(page, theme) {
  await page.addInitScript((theme) => {
    localStorage.setItem('bacchus-theme', JSON.stringify({ state: { preference: theme }, version: 0 }))
    localStorage.setItem('bacchus-onboarding', JSON.stringify({ state: { hasSeenIntro: true }, version: 0 }))
  }, theme)
}

/** Navigue vers l'accueil, remplit la tablee (8 joueurs par defaut - deverrouille tous les modes) et entre dans le hub. */
export async function enterHub(page, baseUrl, names = DEFAULT_PLAYERS) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Pousser la porte', { timeout: 15000 })
  const inputs = page.locator('input[id^="player-"]')
  for (let i = 0; i < names.length; i++) {
    if (i >= 2) await page.getByRole('button', { name: 'Une chaise de plus' }).click()
    await inputs.nth(i).fill(names[i])
  }
  await page.getByRole('button', { name: 'Pousser la porte' }).click()
  await page.waitForSelector('text=Bacchus', { timeout: 15000 })
  await settle(page)
}

export { DEFAULT_PLAYERS }
