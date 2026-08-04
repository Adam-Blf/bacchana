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

  it('chains a v1 BlackOut key all the way to the current Meskova key', async () => {
    // Oldest surviving prefix on a device that never opened a La Tournee or
    // La Taverne build: the full historical chain must still resolve today.
    window.localStorage.setItem('blackout-consent', JSON.stringify({ state: { hasConsent: true } }))

    await runMigration()

    expect(window.localStorage.getItem('la-tournee-consent')).toBeNull()
    expect(window.localStorage.getItem('la-taverne-consent')).toEqual(
      JSON.stringify({ state: { hasConsent: true } })
    )
    expect(window.localStorage.getItem('meskova-consent')).toEqual(
      JSON.stringify({ state: { hasConsent: true } })
    )
  })

  it('migrates a La Taverne key straight to Meskova without touching an existing value', async () => {
    window.localStorage.setItem('la-taverne-entitlement', JSON.stringify({ state: { isPremium: true } }))
    window.localStorage.setItem('meskova-entitlement', JSON.stringify({ state: { isPremium: false } }))

    await runMigration()

    // The new key already had a value: migration must never overwrite it.
    expect(window.localStorage.getItem('meskova-entitlement')).toEqual(
      JSON.stringify({ state: { isPremium: false } })
    )
  })

  it('migrates the La Taverne-only keys (no BlackOut/La Tournee ancestor) to Meskova', async () => {
    window.localStorage.setItem('la-taverne-onboarding', JSON.stringify({ state: { hasSeenIntro: true } }))
    window.localStorage.setItem('la-taverne-theme', JSON.stringify({ state: { preference: 'dark' } }))
    window.localStorage.setItem(
      'la-taverne-custom-themes',
      JSON.stringify({ state: { themes: ['soiree-etudiante'] } })
    )

    await runMigration()

    expect(window.localStorage.getItem('meskova-onboarding')).toEqual(
      JSON.stringify({ state: { hasSeenIntro: true } })
    )
    expect(window.localStorage.getItem('meskova-theme')).toEqual(
      JSON.stringify({ state: { preference: 'dark' } })
    )
    expect(window.localStorage.getItem('meskova-custom-themes')).toEqual(
      JSON.stringify({ state: { themes: ['soiree-etudiante'] } })
    )
  })

  it('only recovers gameOptions when chaining a legacy game key to meskova-game', async () => {
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

    expect(window.localStorage.getItem('meskova-game')).toEqual(
      JSON.stringify({ state: { gameOptions: { deckCount: 2, jokers: true } } })
    )
  })
})
