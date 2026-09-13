// Baril des magasins. Meme regle que pour `game` : on n'expose que ce qui est
// importe depuis l'exterieur. Les fabriques de jeu (createDeck, shuffleDeck,
// createPlayer, calculatePenalty, getNextPlayerIndex) s'importent depuis
// `@/core/engine`, pas d'ici. `avisStore` et `soireeStore` s'importent par
// leur module, ils ne servent qu'a un ou deux ecrans.
export { useAppStore } from './appStore'
export { useGameStore } from './gameStore'
export { usePromptStore } from './promptStore'
export { useEntitlementStore } from './entitlementStore'
export { useConsentStore } from './consentStore'
export { useOnboardingStore } from './onboardingStore'
export { usePurchaseConsentStore } from './purchaseConsentStore'
