// One-shot localStorage migration: BlackOut -> La Tournée key names.
// Imported FIRST in main.tsx so it runs before any zustand persist store hydrates.
// Old keys are copied, not deleted, so a rollback release keeps working.

const MIGRATIONS: Array<[oldKey: string, newKey: string]> = [
  ['borderland-game-storage', 'la-tournee-game'],
  ['blackout-storage', 'la-tournee-app'],
  ['blackout-consent', 'la-tournee-consent'],
  ['blackout-entitlement', 'la-tournee-entitlement'],
  ['blackout-anon-user-id', 'la-tournee-anon-user-id'],
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
