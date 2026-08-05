import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Preuve horodatée du double consentement requis avant tout paiement web (CGU/CGV art. 14) :
 * demande d'exécution immédiate du contenu numérique + renonciation expresse au droit de
 * rétractation de 14 jours (art. L221-28, 13° du Code de la consommation). Rattachée à la
 * version des CGU en vigueur au moment du consentement (`CGU_VERSION`, CguScreen.tsx).
 *
 * Ce n'est pas un état UI (les cases à cocher, elles, se réinitialisent à chaque ouverture
 * de la modale) : c'est la trace que les CGU promettent de conserver "pendant la durée de
 * prescription applicable", donc jamais effacée automatiquement, y compris après l'achat.
 */
export interface PurchaseConsentRecord {
  /** Epoch ms au moment où les deux cases ont été cochées et le paiement lancé. */
  consentedAt: number
  /** Version des CGU/CGV en vigueur au moment du consentement. */
  cguVersion: string
}

interface PurchaseConsentState {
  /** Dernière preuve de consentement enregistrée, null tant qu'aucun achat n'a été tenté. */
  record: PurchaseConsentRecord | null
  recordConsent: (cguVersion: string) => void
}

export const usePurchaseConsentStore = create<PurchaseConsentState>()(
  persist(
    (set) => ({
      record: null,
      recordConsent: (cguVersion) => set({ record: { consentedAt: Date.now(), cguVersion } }),
    }),
    { name: 'meskova-purchase-consent' }
  )
)
