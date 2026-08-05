// One-shot localStorage migration towards the "La Tournee" key names.
// Imported FIRST in main.tsx so it runs before any zustand persist store hydrates.
// Old keys are copied, not deleted, so a rollback release keeps working.
//
// Four historical prefixes exist and must stay spelled exactly as they were
// shipped: `blackout-*` (first public release), `la-tournee-*` (short-lived
// 0.7.0 naming, since reused as the final target - see note below),
// `la-taverne-*` (product name until the Meskova rebrand, 0.8.0 -> 0.30.x)
// and `meskova-*` (product name until the La Tournee rebrand, 0.31.0 ->
// 0.32.x). Renaming them here would silently orphan real saved games.
//
// Note on the reused `la-tournee-*` prefix: the 2026-08-05 rebrand renamed the
// product back to "La Tournee", reusing the same key prefix as the short-lived
// 0.7.0 era. The final migration step below is appended LAST on purpose so it
// always runs after the old `la-tournee-* -> la-taverne-*` step has already
// consumed any 0.7.0-era value - a device stuck on that exact 0.7.0 build
// without ever updating since is the only theoretical case where this could
// matter, and it is not reachable in practice.

// Migrations copiées telles quelles (pas d'état de partie dedans).
const PLAIN_MIGRATIONS: Array<[oldKey: string, newKey: string]> = [
  // v1 - BlackOut
  ['blackout-storage', 'la-taverne-app'],
  ['blackout-consent', 'la-taverne-consent'],
  ['blackout-entitlement', 'la-taverne-entitlement'],
  ['blackout-anon-user-id', 'la-taverne-anon-user-id'],
  // v0.7.0 - La Tournée
  ['la-tournee-app', 'la-taverne-app'],
  ['la-tournee-consent', 'la-taverne-consent'],
  ['la-tournee-entitlement', 'la-taverne-entitlement'],
  ['la-tournee-custom-rules', 'la-taverne-custom-rules'],
  ['la-tournee-anon-user-id', 'la-taverne-anon-user-id'],
  // v0.8.0 -> v0.30.x - La Taverne -> Meskova (rebrand produit, 2026-08-04)
  ['la-taverne-app', 'meskova-app'],
  ['la-taverne-consent', 'meskova-consent'],
  ['la-taverne-entitlement', 'meskova-entitlement'],
  ['la-taverne-custom-rules', 'meskova-custom-rules'],
  ['la-taverne-anon-user-id', 'meskova-anon-user-id'],
  // Ces trois cles sont nees pendant l'ere La Taverne (pas d'anterieur BlackOut/La
  // Tournee a chainer) : un seul saut direct vers Meskova suffit.
  ['la-taverne-onboarding', 'meskova-onboarding'],
  ['la-taverne-custom-themes', 'meskova-custom-themes'],
  ['la-taverne-theme', 'meskova-theme'],
  // v0.31.0 -> v0.32.x - Meskova -> La Tournee (rebrand produit #2, 2026-08-05).
  // Cible finale : `la-tournee-*` redevient le prefixe courant.
  ['meskova-app', 'la-tournee-app'],
  ['meskova-consent', 'la-tournee-consent'],
  ['meskova-entitlement', 'la-tournee-entitlement'],
  ['meskova-custom-rules', 'la-tournee-custom-rules'],
  ['meskova-anon-user-id', 'la-tournee-anon-user-id'],
  ['meskova-onboarding', 'la-tournee-onboarding'],
  ['meskova-custom-themes', 'la-tournee-custom-themes'],
  ['meskova-theme', 'la-tournee-theme'],
]

// Clé "game" : ne recopier QUE gameOptions (préférence de table). Fermer l'app remet
// volontairement la tablée à zéro (2026-08-02) - copier tout le blob ressuscitait le
// deck, les joueurs et gamePhase d'une ancienne partie, jamais voulu.
const GAME_KEY_MIGRATIONS: Array<[oldKey: string, newKey: string]> = [
  ['borderland-game-storage', 'la-taverne-game'],
  ['la-tournee-game', 'la-taverne-game'],
  // v0.8.0 -> v0.30.x - La Taverne -> Meskova
  ['la-taverne-game', 'meskova-game'],
  // v0.31.0 -> v0.32.x - Meskova -> La Tournee (rebrand produit #2, 2026-08-05)
  ['meskova-game', 'la-tournee-game'],
]

function migratePlainKey(oldKey: string, newKey: string): void {
  const oldValue = window.localStorage.getItem(oldKey)
  if (oldValue !== null && window.localStorage.getItem(newKey) === null) {
    window.localStorage.setItem(newKey, oldValue)
  }
}

function migrateGameOptionsOnly(oldKey: string, newKey: string): void {
  const oldValue = window.localStorage.getItem(oldKey)
  if (oldValue === null || window.localStorage.getItem(newKey) !== null) return

  try {
    const parsed = JSON.parse(oldValue) as { state?: { gameOptions?: unknown } }
    if (!parsed.state || parsed.state.gameOptions === undefined) return
    window.localStorage.setItem(newKey, JSON.stringify({ state: { gameOptions: parsed.state.gameOptions } }))
  } catch {
    // Blob corrompu ou format inattendu - on ne migre rien plutôt que de ressusciter
    // un état de partie (deck, joueurs, gamePhase) qu'on ne veut plus jamais restaurer.
  }
}

try {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    for (const [oldKey, newKey] of PLAIN_MIGRATIONS) {
      migratePlainKey(oldKey, newKey)
    }
    for (const [oldKey, newKey] of GAME_KEY_MIGRATIONS) {
      migrateGameOptionsOnly(oldKey, newKey)
    }
  }
} catch {
  // Private mode / storage denied: nothing to migrate.
}

export {}
