import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Ce que la soirée a déjà vu passer, tous modes confondus.
 *
 * Chaque moteur de session mélangeait son propre paquet et n'avait aucune
 * mémoire d'une manche à l'autre. À l'intérieur d'une manche rien ne se
 * répétait, mais relancer le même mode un quart d'heure plus tard rebattait
 * tout et redonnait les mêmes cartes. Pour la tablée c'est la même soirée, et
 * c'est bien la même question.
 *
 * On retient des IDENTIFIANTS, jamais le texte : une carte reformulée reste la
 * même carte, et stocker le texte ferait grossir le stockage local pour rien.
 *
 * Le seuil est celui de la soirée - au-delà de quatre heures sans jouer, ce
 * n'est plus la même soirée et tout redevient inédit.
 */
const SEUIL_OUBLI_MS = 4 * 60 * 60 * 1000

interface VuState {
  /** Identifiant de carte vers l'horodatage où elle a été servie. */
  vus: Record<string, number>
  marquer: (id: string, maintenant?: number) => void
  oublierTout: () => void
}

export const useVuStore = create<VuState>()(
  persist(
    (set) => ({
      vus: {},
      marquer: (id, maintenant = Date.now()) =>
        set((etat) => (etat.vus[id] === undefined ? { vus: { ...etat.vus, [id]: maintenant } } : etat)),
      oublierTout: () => set({ vus: {} }),
    }),
    { name: 'bacchana-vus' },
  ),
)

/**
 * Les identifiants encore « frais » dans la mémoire de la soirée.
 *
 * Le tri se fait à la LECTURE et non à l'écriture : purger en écrivant
 * demanderait de parcourir toute la table à chaque carte servie, alors que la
 * lecture n'a lieu qu'au montage d'une manche.
 */
export function idsDejaVus(maintenant: number = Date.now()): ReadonlySet<string> {
  const { vus } = useVuStore.getState()
  const frais = new Set<string>()
  for (const [id, quand] of Object.entries(vus)) {
    if (maintenant - quand < SEUIL_OUBLI_MS) frais.add(id)
  }
  return frais
}

/** Retient une carte servie. Sans effet si elle l'était déjà. */
export function marquerVu(id: string | null | undefined): void {
  if (!id) return
  useVuStore.getState().marquer(id)
}

/**
 * Retient la carte affichée, à chaque fois qu'elle change.
 *
 * Le marquage se fait à l'AFFICHAGE et non à la constitution de la pioche :
 * une pioche de quinze cartes tirée sur un paquet de quatre-vingts en marquerait
 * quatre-vingts, et la soirée se croirait épuisée dès la première manche.
 */
export function useMarquerVu(id: string | null | undefined): void {
  useEffect(() => {
    marquerVu(id)
  }, [id])
}
