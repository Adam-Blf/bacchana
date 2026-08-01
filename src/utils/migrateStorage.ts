// One-shot localStorage migration towards the "La Taverne" key names.
// Imported FIRST in main.tsx so it runs before any zustand persist store hydrates.
// Old keys are copied, not deleted, so a rollback release keeps working.
//
// Two historical prefixes exist and must stay spelled exactly as they were
// shipped: `blackout-*` (first public release) and `la-tournee-*` (short-lived
// 0.7.0 naming). Renaming them here would silently orphan real saved games.

const MIGRATIONS: Array<[oldKey: string, newKey: string]> = [
  // v1 - BlackOut
  ['borderland-game-storage', 'la-taverne-game'],
  ['blackout-storage', 'la-taverne-app'],
  ['blackout-consent', 'la-taverne-consent'],
  ['blackout-entitlement', 'la-taverne-entitlement'],
  ['blackout-anon-user-id', 'la-taverne-anon-user-id'],
  // v0.7.0 - La Tournée
  ['la-tournee-game', 'la-taverne-game'],
  ['la-tournee-app', 'la-taverne-app'],
  ['la-tournee-consent', 'la-taverne-consent'],
  ['la-tournee-entitlement', 'la-taverne-entitlement'],
  ['la-tournee-custom-rules', 'la-taverne-custom-rules'],
  ['la-tournee-anon-user-id', 'la-taverne-anon-user-id'],
]

try {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    for (const [oldKey, newKey] of MIGRATIONS) {
      const oldValue = window.localStorage.getItem(oldKey)
      if (oldValue !== null && window.localStorage.getItem(newKey) === null) {
        window.localStorage.setItem(newKey, oldValue)
      }
    }
  }
} catch {
  // Private mode / storage denied: nothing to migrate.
}

export {}
