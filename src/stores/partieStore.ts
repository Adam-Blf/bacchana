import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameMode } from '@/core/engine/types'
import type { Player } from '@/types'

/**
 * Les parties en cours, ecrites sur l'appareil, pour survivre a un
 * rafraichissement.
 *
 * Le probleme. Huit modes portent leur manche dans l'etat local de leur
 * composant. Un rechargement de page - le geste le plus banal d'une application
 * web, et celui que le service worker declenche lui-meme quand une mise a jour
 * s'applique - effacait tout : la manche, les penalites, le tour de parole.
 * Rien ne le disait, la tablee retrouvait un ecran neuf.
 *
 * Ce qui est repris, et ce qui ne l'est pas. La regle produit du 2026-08-02 dit
 * qu'une OUVERTURE d'application est une nouvelle tablee, et elle reste vraie :
 * un instantane n'est repris que s'il a moins de quatre heures ET que la tablee
 * n'a pas change. Passe ce delai on ne propose pas de reprendre la soiree de la
 * veille - c'est le seuil deja retenu pour la soiree, pour la meme raison.
 *
 * L'EMPREINTE DE TABLEE compte autant que le delai. Sans elle, changer de
 * joueurs puis relancer un mode ressuscitait la partie des precedents, avec
 * leurs noms et leurs penalites. Un instantane appartient a une tablee, pas a
 * un mode.
 */

interface Instantane {
  /** L'etat du mode, par cle. Opaque : chaque ecran connait la forme des siennes. */
  valeurs: Record<string, unknown>
  /** Derniere ecriture, base de l'expiration. */
  majLe: number
  /** Identifiants des joueurs au moment de l'ecriture, dans l'ordre. */
  empreinteTablee: string
}

interface PartieState {
  parties: Partial<Record<GameMode, Instantane>>
  ecrire: (
    mode: GameMode,
    cle: string,
    valeur: unknown,
    empreinteTablee: string,
    maintenant: number,
  ) => void
  effacer: (mode: GameMode) => void
  toutEffacer: () => void
}

/** Au dela, un instantane n'est plus repris. Meme seuil que la soiree. */
export const SEUIL_REPRISE_PARTIE_MS = 4 * 60 * 60 * 1000

export const usePartieStore = create<PartieState>()(
  persist(
    (set) => ({
      parties: {},
      ecrire: (mode, cle, valeur, empreinteTablee, maintenant) =>
        set((prev) => {
          const precedent = prev.parties[mode]
          // Changer de tablee repart d'une feuille blanche : melanger les
          // valeurs de deux tablees rendrait un etat incoherent, pire qu'un
          // etat perdu.
          const valeurs =
            precedent && precedent.empreinteTablee === empreinteTablee ? precedent.valeurs : {}
          return {
            parties: {
              ...prev.parties,
              [mode]: { valeurs: { ...valeurs, [cle]: valeur }, majLe: maintenant, empreinteTablee },
            },
          }
        }),
      effacer: (mode) =>
        set((prev) => {
          const parties = { ...prev.parties }
          delete parties[mode]
          return { parties }
        }),
      toutEffacer: () => set({ parties: {} }),
    }),
    { name: 'bacchana-parties' },
  ),
)

/** L'empreinte d'une tablee : ses identifiants, dans l'ordre. */
export function empreinteDe(players: Player[]): string {
  return players.map((p) => p.id).join('|')
}

/**
 * La valeur reprise pour une cle, ou `null` s'il n'y a rien de reprenable.
 *
 * Rend un enveloppe `{ valeur }` et non la valeur nue : `undefined`, `null` et
 * `false` sont des etats legitimes, et les confondre avec « rien » remettrait
 * la valeur initiale par-dessus une reprise valable.
 */
export function lireValeur<T>(
  mode: GameMode,
  cle: string,
  empreinteTablee: string,
  maintenant: number,
): { valeur: T } | null {
  const instantane = usePartieStore.getState().parties[mode]
  if (!instantane) return null
  if (instantane.empreinteTablee !== empreinteTablee) return null
  if (maintenant - instantane.majLe >= SEUIL_REPRISE_PARTIE_MS) return null
  if (!(cle in instantane.valeurs)) return null
  return { valeur: instantane.valeurs[cle] as T }
}

/**
 * `useState`, mais l'etat survit a un rechargement de la page.
 *
 * Remplacant DIRECT de `useState` dans les ecrans de mode : meme signature,
 * meme forme fonctionnelle acceptee. Il fallait qu'il le soit - les modes
 * portent leur manche sur dix a douze etats separes, et un mecanisme qui aurait
 * exige de les regrouper en un objet aurait transforme une correction en
 * refonte, sur les quatre ecrans les plus fournis de l'application.
 *
 * `cle` doit etre unique DANS le mode. Elle est ecrite a la main plutot que
 * derivee de l'ordre d'appel : un etat ajoute au milieu d'un composant
 * decalerait toutes les cles suivantes et une manche reprise irait chercher la
 * valeur d'un autre etat.
 */
export function useEtatDeManche<T>(
  mode: GameMode,
  players: Player[],
  cle: string,
  initial: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const empreinte = empreinteDe(players)

  const [valeur, setValeur] = useState<T>(() => {
    const reprise = lireValeur<T>(mode, cle, empreinte, Date.now())
    return reprise ? reprise.valeur : initial()
  })

  // L'ecriture passe par un effet, et non par le calculateur d'etat : React
  // peut rejouer un calculateur, et un effet de bord qui s'y trouve s'execute
  // alors deux fois. Le premier rendu n'ecrit rien - il n'y a encore rien de
  // nouveau a retenir, et ecrire ici rafraichirait l'horodatage d'un instantane
  // qu'on vient tout juste de decider trop vieux.
  const premierRendu = useRef(true)
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false
      return
    }
    usePartieStore.getState().ecrire(mode, cle, valeur, empreinte, Date.now())
  }, [mode, cle, valeur, empreinte])

  return [valeur, setValeur]
}

/** Oublie la manche d'un mode - fin de partie, revanche, abandon. */
export function oublierManche(mode: GameMode): void {
  usePartieStore.getState().effacer(mode)
}
