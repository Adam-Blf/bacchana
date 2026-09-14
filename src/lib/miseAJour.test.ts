import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * La regle qui compte : une mise a jour ne recharge jamais une page QU'ON
 * REGARDE.
 *
 * Ce banc verrouillait une regle plus faible - « jamais pendant une partie » -
 * et c'est precisement ce qui a laisse passer le defaut corrige le
 * 2026-09-14 : il tenait « ecran de repos » pour « personne ne regarde ». Le
 * hub est un ecran de repos, et c'est aussi celui ou une tablee s'attarde a
 * choisir un jeu. Le rechargement y vidait la page sous les yeux de tout le
 * monde, et il se declenchait surtout AU RETOUR dans l'application - donc au
 * moment precis ou le joueur reprend son telephone.
 *
 * Les tests ci-dessous verrouillent donc la condition DOUBLE : aucune partie
 * en cours ET application cachee. Trois d'entre eux affirmaient le contraire
 * et ont ete reecrits ; ils sont conserves sous leur nouvelle regle plutot que
 * supprimes, parce que le chemin qu'ils exercent - l'attente, puis
 * l'application - reste celui qui compte.
 */

/** Met l'application a l'ecran, ou la cache, comme le ferait le telephone. */
function visibilite(etat: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { value: etat, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

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

  it("N'APPLIQUE PAS sur le hub tant que l'application est a l'ecran", async () => {
    const { brancherMiseAJour, useAppStore } = await charger()
    useAppStore.getState().navigateTo('hub')
    visibilite('visible')
    const arreter = brancherMiseAJour()

    rappels.onNeedRefresh?.()

    // C'est le defaut du 2026-09-14 : le hub passait pour « personne ne
    // regarde », et la page se rechargeait sous les yeux de la tablee.
    expect(appliquer).not.toHaveBeenCalled()
    arreter()
  })

  it("applique des que le joueur range son telephone", async () => {
    const { brancherMiseAJour, useAppStore } = await charger()
    useAppStore.getState().navigateTo('hub')
    visibilite('visible')
    const arreter = brancherMiseAJour()
    rappels.onRegisteredSW?.('/sw.js', { update })

    rappels.onNeedRefresh?.()
    expect(appliquer).not.toHaveBeenCalled()

    visibilite('hidden')
    expect(appliquer).toHaveBeenCalledWith(true)
    arreter()
  })

  it("n'applique PAS en arriere-plan si une partie tourne", async () => {
    const { brancherMiseAJour, useAppStore } = await charger()
    useAppStore.getState().navigateTo('game')
    const arreter = brancherMiseAJour()
    rappels.onRegisteredSW?.('/sw.js', { update })

    rappels.onNeedRefresh?.()
    visibilite('hidden')

    // Une partie mise en arriere-plan se reprend : la recharger la perdrait.
    expect(appliquer).not.toHaveBeenCalled()
    arreter()
  })

  it("N'APPLIQUE PAS pendant une partie - c'est tout l'interet du dispositif", async () => {
    const { brancherMiseAJour, useAppStore } = await charger()
    useAppStore.getState().navigateTo('game')
    visibilite('hidden')
    const arreter = brancherMiseAJour()

    rappels.onNeedRefresh?.()

    expect(appliquer).not.toHaveBeenCalled()
    arreter()
  })

  it('applique des la sortie de partie, quand l ecran est deja eteint', async () => {
    const { brancherMiseAJour, useAppStore } = await charger()
    useAppStore.getState().navigateTo('game')
    visibilite('hidden')
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
    visibilite('hidden')
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

    visibilite('visible')

    expect(update).toHaveBeenCalled()
    arreter()
  })

  it('n\'INTERROGE pas le serveur quand l\'application part en arriere-plan', async () => {
    const { brancherMiseAJour } = await charger()
    const arreter = brancherMiseAJour()
    rappels.onRegisteredSW?.('/sw.js', { update })

    visibilite('hidden')

    // Partir en arriere-plan APPLIQUE une version deja prete (voir plus haut),
    // mais ne va pas en chercher une : le reseau n'est pas garanti et la page
    // est sur le point d'etre gelee.
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
