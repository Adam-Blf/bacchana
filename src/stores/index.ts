export { useAppStore } from './appStore'
export {
  useGameStore,
  createDeck,
  shuffleDeck,
  createPlayer,
  calculatePenalty,
  getNextPlayerIndex,
} from './gameStore'
export { usePromptStore } from './promptStore'
export { useEntitlementStore } from './entitlementStore'
export { useConsentStore, CONSENT_VERSION } from './consentStore'
export type { ConsentChoice } from './consentStore'
export { useOnboardingStore } from './onboardingStore'
export { usePurchaseConsentStore } from './purchaseConsentStore'
export type { PurchaseConsentRecord } from './purchaseConsentStore'
// `avisStore` et `soireeStore` s'importent par leur module, pas par ce barrel :
// ils ne sont consommes que par un ou deux ecrans, et un re-export que personne
// n'emprunte est du code mort.
