import { describe, it, expect, beforeEach, vi } from 'vitest'

// migrateStorage.ts runs its migration as a side effect at import time (it must
// run before any zustand persist store hydrates, see main.tsx). To test it we
// reset the module registry and re-import fresh for each case.
async function runMigration(): Promise<void> {
  vi.resetModules()
  await import('./migrateStorage')
}

describe('migrateStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('chains a v1 BlackOut key all the way to the current Bacchus key', async () => {
    // Oldest surviving prefix on a device that never opened a La Tournee or
    // La Taverne build: the full historical chain must still resolve today.
    window.localStorage.setItem('blackout-consent', JSON.stringify({ state: { hasConsent: true } }))

    await runMigration()

    expect(window.localStorage.getItem('la-tournee-consent')).toBeNull()
    expect(window.localStorage.getItem('la-taverne-consent')).toEqual(
      JSON.stringify({ state: { hasConsent: true } })
    )
    expect(window.localStorage.getItem('bacchus-consent')).toEqual(
      JSON.stringify({ state: { hasConsent: true } })
    )
  })

  it('migrates a La Taverne key straight to Bacchus without touching an existing value', async () => {
    window.localStorage.setItem('la-taverne-entitlement', JSON.stringify({ state: { isPremium: true } }))
    window.localStorage.setItem('bacchus-entitlement', JSON.stringify({ state: { isPremium: false } }))

    await runMigration()

    // The new key already had a value: migration must never overwrite it.
    expect(window.localStorage.getItem('bacchus-entitlement')).toEqual(
      JSON.stringify({ state: { isPremium: false } })
    )
  })

  it('migrates the La Taverne-only keys (no BlackOut/La Tournee ancestor) to Bacchus', async () => {
    window.localStorage.setItem('la-taverne-onboarding', JSON.stringify({ state: { hasSeenIntro: true } }))
    window.localStorage.setItem('la-taverne-theme', JSON.stringify({ state: { preference: 'dark' } }))
    window.localStorage.setItem(
      'la-taverne-custom-themes',
      JSON.stringify({ state: { themes: ['soiree-etudiante'] } })
    )

    await runMigration()

    expect(window.localStorage.getItem('bacchus-onboarding')).toEqual(
      JSON.stringify({ state: { hasSeenIntro: true } })
    )
    expect(window.localStorage.getItem('bacchus-theme')).toEqual(
      JSON.stringify({ state: { preference: 'dark' } })
    )
    expect(window.localStorage.getItem('bacchus-custom-themes')).toEqual(
      JSON.stringify({ state: { themes: ['soiree-etudiante'] } })
    )
  })

  it('only recovers gameOptions when chaining a legacy game key to bacchus-game', async () => {
    window.localStorage.setItem(
      'borderland-game-storage',
      JSON.stringify({
        state: {
          gameOptions: { deckCount: 2, jokers: true },
          players: [{ id: '1', name: 'Adam' }],
          gamePhase: 'playing',
        },
      })
    )

    await runMigration()

    expect(window.localStorage.getItem('bacchus-game')).toEqual(
      JSON.stringify({ state: { gameOptions: { deckCount: 2, jokers: true } } })
    )
  })
  it('carries a Meskova-era device over to Bacchus', async () => {
    // Le cas le plus courant aujourd'hui : tout appareil ayant ouvert
    // l'application depuis le 4 aout 2026 porte des cles `meskova-*`.
    window.localStorage.setItem('meskova-consent', JSON.stringify({ state: { hasConsent: true } }))
    window.localStorage.setItem('meskova-custom-themes', JSON.stringify({ state: { themes: ['apero'] } }))

    await runMigration()

    expect(window.localStorage.getItem('bacchus-consent')).toEqual(
      JSON.stringify({ state: { hasConsent: true } })
    )
    expect(window.localStorage.getItem('bacchus-custom-themes')).toEqual(
      JSON.stringify({ state: { themes: ['apero'] } })
    )
  })

  it('carries the anonymous RevenueCat app user id over to Bacchus', async () => {
    // Cette cle rattache l'achat a vie a l'appareil. RevenueCat Web n'a aucune
    // restauration entre appareils : la perdre rend l'achat irrecuperable, y
    // compris via le bouton "Restaurer mes achats".
    window.localStorage.setItem('meskova-anon-user-id', 'anon-42')

    await runMigration()

    expect(window.localStorage.getItem('bacchus-anon-user-id')).toBe('anon-42')
  })

  it('carries only gameOptions when chaining the Meskova game key to Bacchus', async () => {
    window.localStorage.setItem(
      'meskova-game',
      JSON.stringify({
        state: {
          gameOptions: { deckCount: 3 },
          players: [{ id: '1', name: 'Adam' }],
          gamePhase: 'playing',
        },
      })
    )

    await runMigration()

    // Meme regle que pour les generations precedentes : la tablee ne ressuscite pas.
    expect(window.localStorage.getItem('bacchus-game')).toEqual(
      JSON.stringify({ state: { gameOptions: { deckCount: 3 } } })
    )
  })

  it('carries a Bacchus-era device over to Bacchana', async () => {
    // Le cas le plus courant apres le renommage du 6 aout 2026 : tout appareil
    // ayant ouvert l'application depuis le 5 aout porte des cles `bacchus-*`.
    // L'achat a vie tient a `anon-user-id` : RevenueCat Web n'offre aucune
    // restauration entre appareils, perdre cette cle rend l'achat irrecuperable.
    window.localStorage.setItem('bacchus-consent', JSON.stringify({ state: { hasConsent: true } }))
    window.localStorage.setItem('bacchus-anon-user-id', 'anon-77')
    window.localStorage.setItem('bacchus-entitlement', JSON.stringify({ state: { isPremium: true } }))

    await runMigration()

    expect(window.localStorage.getItem('bacchana-consent')).toEqual(
      JSON.stringify({ state: { hasConsent: true } })
    )
    expect(window.localStorage.getItem('bacchana-anon-user-id')).toBe('anon-77')
    expect(window.localStorage.getItem('bacchana-entitlement')).toEqual(
      JSON.stringify({ state: { isPremium: true } })
    )
  })

  it('chains a v1 BlackOut key all the way to Bacchana, five renames later', async () => {
    // La chaine complete, de la premiere version publique a aujourd'hui. C'est
    // ce test qui casse si un maillon est reecrit au lieu d'etre ajoute.
    window.localStorage.setItem('blackout-consent', JSON.stringify({ state: { hasConsent: true } }))

    await runMigration()

    expect(window.localStorage.getItem('bacchana-consent')).toEqual(
      JSON.stringify({ state: { hasConsent: true } })
    )
  })

  // Le produit a porte cinq noms avant Bacchana : blackout, la-tournee,
  // la-taverne, meskova, bacchus. Un appareil peut avoir ete ouvert pour la
  // derniere fois sous n'importe lequel des cinq et doit quand meme atterrir
  // sur les cles `bacchana-*` aujourd'hui. Table-driven pour que l'ajout d'un
  // sixieme nom un jour force explicitement une nouvelle ligne ici, plutot que
  // de laisser une ere silencieusement non couverte.
  it.each([
    ['blackout-consent'],
    ['la-tournee-consent'],
    ['la-taverne-consent'],
    ['meskova-consent'],
    ['bacchus-consent'],
  ])('carries a consent value seeded at %s all the way to bacchana-consent', async (oldKey) => {
    window.localStorage.setItem(oldKey, JSON.stringify({ state: { hasConsent: true } }))

    await runMigration()

    expect(window.localStorage.getItem('bacchana-consent')).toEqual(
      JSON.stringify({ state: { hasConsent: true } })
    )
  })

  // Meme couverture pour l'id anonyme RevenueCat : c'est la cle qui rattache
  // l'achat a vie a l'appareil (pas de restauration cross-device en Web). La
  // perdre a n'importe quelle ere rend un achat reel irrecuperable.
  it.each([
    ['blackout-anon-user-id'],
    ['la-tournee-anon-user-id'],
    ['la-taverne-anon-user-id'],
    ['meskova-anon-user-id'],
    ['bacchus-anon-user-id'],
  ])('carries the RevenueCat anon id seeded at %s all the way to bacchana-anon-user-id', async (oldKey) => {
    window.localStorage.setItem(oldKey, 'anon-fixture')

    await runMigration()

    expect(window.localStorage.getItem('bacchana-anon-user-id')).toBe('anon-fixture')
  })

  it('carries only gameOptions when chaining the Bacchus game key to Bacchana', async () => {
    window.localStorage.setItem(
      'bacchus-game',
      JSON.stringify({
        state: {
          gameOptions: { deckCount: 2 },
          players: [{ id: '1', name: 'Nawel' }],
          gamePhase: 'playing',
        },
      })
    )

    await runMigration()

    expect(window.localStorage.getItem('bacchana-game')).toEqual(
      JSON.stringify({ state: { gameOptions: { deckCount: 2 } } })
    )
  })

  it('leaves a device already on Bacchana keys untouched (sixth name, no-op)', async () => {
    // Le sixieme nom de la table historique n'est pas un ancetre a chainer :
    // c'est la destination. Un appareil qui a deja ouvert l'app depuis le
    // renommage du 6 aout ne doit jamais etre retouche, meme si une future
    // migration ajoute un septieme nom un jour.
    window.localStorage.setItem('bacchana-consent', JSON.stringify({ state: { hasConsent: true } }))
    window.localStorage.setItem('bacchana-anon-user-id', 'anon-already-current')
    window.localStorage.setItem(
      'bacchana-game',
      JSON.stringify({ state: { gameOptions: { deckCount: 1 } } })
    )

    await runMigration()

    expect(window.localStorage.getItem('bacchana-consent')).toEqual(
      JSON.stringify({ state: { hasConsent: true } })
    )
    expect(window.localStorage.getItem('bacchana-anon-user-id')).toBe('anon-already-current')
    expect(window.localStorage.getItem('bacchana-game')).toEqual(
      JSON.stringify({ state: { gameOptions: { deckCount: 1 } } })
    )
  })
})
