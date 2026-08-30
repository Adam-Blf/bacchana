import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * La regle qui compte : une mise a jour ne recharge JAMAIS pendant une partie.
 *
 * Ce banc verrouille les deux sens. Qu'une version prete s'applique bien quand
 * personne ne joue est la moitie facile ; qu'elle ATTENDE pendant une manche
 * est celle qui protege la soiree de six personnes qui attendent la carte
 * suivante. Un test qui ne verifierait que le premier laisserait passer
 * exactement le comportement qu'on a voulu eviter en quittant `autoUpdate`.
 */

let rappels: {
  onNeedRefresh?: () => void
  onRegisteredSW?: (url: string, r: unknown) => void
} = {}
const appliquer = vi.fn(() => Promise.resolve())

vi.mock('virtual:pwa-register', () => ({
  registerSW: (options: typeof rappels) => {
    rappels = options
    return appliquer
  },
}))

const update = vi.fn(() => Promise.resolve())

async function charger() {
  vi.resetModules()
  rappels = {}
  appliquer.mockClear()
  update.mockClear()
  const { brancherMiseAJour } = await import('./miseAJour')
  const { useAppStore } = await import('@/stores')
  return { brancherMiseAJour, useAppStore }
}

describe('mise a jour de la PWA', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: vi.fn() },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('applique tout de suite quand personne ne joue', async () => {
    const { brancherMiseAJour, useAppStore } = await charger()
    useAppStore.getState().navigateTo('hub')
    const arreter = brancherMiseAJour()

    rappels.onNeedRefresh?.()

    expect(appliquer).toHaveBeenCalledWith(true)
    arreter()
  })

  it("N'APPLIQUE PAS pendant une partie - c'est tout l'interet du dispositif", async () => {
    const { brancherMiseAJour, useAppStore } = await charger()
    useAppStore.getState().navigateTo('game')
    const arreter = brancherMiseAJour()

    rappels.onNeedRefresh?.()

    expect(appliquer).not.toHaveBeenCalled()
    arreter()
  })

  it('applique des le retour a un ecran de repos, sans attendre le prochain reveil', async () => {
    const { brancherMiseAJour, useAppStore } = await charger()
    useAppStore.getState().navigateTo('game')
    const arreter = brancherMiseAJour()

    rappels.onNeedRefresh?.()
    expect(appliquer).not.toHaveBeenCalled()

    useAppStore.getState().navigateTo('hub')
    expect(appliquer).toHaveBeenCalledWith(true)
    arreter()
  })

  it('ne redemande pas une version deja appliquee', async () => {
    const { brancherMiseAJour, useAppStore } = await charger()
    useAppStore.getState().navigateTo('hub')
    const arreter = brancherMiseAJour()

    rappels.onNeedRefresh?.()
    useAppStore.getState().navigateTo('rules')
    useAppStore.getState().navigateTo('hub')

    expect(appliquer).toHaveBeenCalledTimes(1)
    arreter()
  })

  it('interroge le serveur toutes les heures tant que l\'application reste ouverte', async () => {
    const { brancherMiseAJour } = await charger()
    const arreter = brancherMiseAJour()
    rappels.onRegisteredSW?.('/sw.js', { update })

    expect(update).not.toHaveBeenCalled()
    vi.advanceTimersByTime(60 * 60 * 1000)
    expect(update).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(60 * 60 * 1000)
    expect(update).toHaveBeenCalledTimes(2)
    arreter()
  })

  it('interroge au retour dans l\'application', async () => {
    const { brancherMiseAJour } = await charger()
    const arreter = brancherMiseAJour()
    rappels.onRegisteredSW?.('/sw.js', { update })

    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(update).toHaveBeenCalled()
    arreter()
  })

  it('ne fait rien quand l\'application part en arriere-plan', async () => {
    const { brancherMiseAJour } = await charger()
    const arreter = brancherMiseAJour()
    rappels.onRegisteredSW?.('/sw.js', { update })

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(update).not.toHaveBeenCalled()
    arreter()
  })

  it('survit a un echec hors ligne sans rejeter', async () => {
    const { brancherMiseAJour } = await charger()
    const arreter = brancherMiseAJour()
    // Hors ligne, `update()` rejette. Une promesse non capturee remonterait a
    // Sentry a chaque tunnel de metro, ce qui noierait les vraies erreurs.
    const casse = vi.fn(() => Promise.reject(new Error('hors ligne')))
    rappels.onRegisteredSW?.('/sw.js', { update: casse })

    const rejetsNonCaptures: unknown[] = []
    const surRejet = (e: PromiseRejectionEvent) => rejetsNonCaptures.push(e.reason)
    window.addEventListener('unhandledrejection', surRejet)

    window.dispatchEvent(new Event('online'))
    await Promise.resolve()
    await Promise.resolve()

    window.removeEventListener('unhandledrejection', surRejet)
    expect(casse).toHaveBeenCalled()
    expect(rejetsNonCaptures).toEqual([])
    arreter()
  })

  it('debranche tout a l\'arret', async () => {
    const { brancherMiseAJour } = await charger()
    const arreter = brancherMiseAJour()
    rappels.onRegisteredSW?.('/sw.js', { update })
    arreter()

    vi.advanceTimersByTime(3 * 60 * 60 * 1000)
    window.dispatchEvent(new Event('online'))
    expect(update).not.toHaveBeenCalled()
  })

  it('ne touche a rien quand le navigateur ne sait pas faire de service worker', async () => {
    // @ts-expect-error - on retire volontairement la capacite
    delete navigator.serviceWorker
    const { brancherMiseAJour } = await charger()
    const arreter = brancherMiseAJour()
    expect(appliquer).not.toHaveBeenCalled()
    expect(() => arreter()).not.toThrow()
  })
})
