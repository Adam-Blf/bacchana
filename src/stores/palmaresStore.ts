import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { meneurs, rangsDuClassement, type Rang } from '@/core/classement'
import type { GameMode } from '@/core/engine/types'

/**
 * Le palmarès de la maison - ce que chaque prénom traîne derrière lui, d'une
 * soirée à l'autre.
 *
 * Ce que « le profil » peut vouloir dire ici. Bacchana n'a pas de comptes : ni
 * serveur d'identités, ni mot de passe, ni adresse. En inventer un pour tenir un
 * score serait la plus lourde des réponses à la plus légère des demandes -
 * et il faudrait alors déclarer un traitement de données personnelles pour
 * savoir qui a bu le plus un samedi soir.
 *
 * Le profil, c'est donc le PRÉNOM, et il ne quitte jamais l'appareil. La clé est
 * le prénom normalisé, pas l'identifiant du joueur : les identifiants sont
 * régénérés à chaque tablée, donc s'en servir remettrait le palmarès à zéro
 * toutes les soirées, ce qui est exactement le contraire du but.
 *
 * La contrepartie, et il faut la dire : deux personnes qui portent le même
 * prénom partagent une ligne. L'écran de saisie propose désormais de numéroter
 * les doublons, ce qui donne « Alice » et « Alice 2 », deux lignes distinctes.
 *
 * PAS DE PÉREMPTION, contrairement à l'ardoise et aux manches en cours. Une
 * ardoise mesure une soirée et n'a pas de sens le lendemain ; un palmarès ne
 * mesure que le temps long. C'est la seule chose de l'application qui survit
 * volontairement à la nuit.
 */
export interface LignePalmares {
  /** Le prénom tel qu'il a été saisi la dernière fois. */
  nom: string
  /** Parties terminées, tous modes confondus. */
  parties: number
  /** Pénalités cumulées. */
  penalites: number
  /** Nombre de fois où ce prénom a raflé la palme d'une partie. */
  palmes: number
  /** Modes distincts joués. */
  modes: GameMode[]
  /** Horodatage de la dernière partie comptée. */
  derniereFois: number
}

interface PalmaresState {
  lignes: Record<string, LignePalmares>
  /** Enregistre une partie terminée pour toute la tablée. */
  enregistrer: (
    mode: GameMode,
    entrees: { nom: string; penalites: number; palme: boolean }[],
    maintenant?: number,
  ) => void
  /** Efface tout le palmarès - proposé dans les réglages, jamais automatique. */
  effacer: () => void
}

/** La clé d'un prénom : minuscules, espaces resserrés. « Léa » et « léa  » sont la même personne. */
export function cleDuNom(nom: string): string {
  return nom.trim().toLowerCase().replace(/\s+/g, ' ')
}

export const usePalmaresStore = create<PalmaresState>()(
  persist(
    (set) => ({
      lignes: {},

      enregistrer: (mode, entrees, maintenant = Date.now()) =>
        set((etat) => {
          const lignes = { ...etat.lignes }
          for (const { nom, penalites, palme } of entrees) {
            const cle = cleDuNom(nom)
            if (cle.length === 0) continue
            const avant = lignes[cle]
            const modes = avant?.modes ?? []
            lignes[cle] = {
              // Le prénom le plus RÉCENT gagne : quelqu'un qui corrige sa
              // majuscule reste la même ligne de palmarès.
              nom,
              parties: (avant?.parties ?? 0) + 1,
              penalites: (avant?.penalites ?? 0) + penalites,
              palmes: (avant?.palmes ?? 0) + (palme ? 1 : 0),
              modes: modes.includes(mode) ? modes : [...modes, mode],
              derniereFois: maintenant,
            }
          }
          return { lignes }
        }),

      effacer: () => set({ lignes: {} }),
    }),
    { name: 'bacchana-palmares' },
  ),
)

/** Le palmarès trié : le plus chargé d'abord, puis le plus assidu. */
export function classementPalmares(lignes: Record<string, LignePalmares>): LignePalmares[] {
  return Object.values(lignes).sort(
    (a, b) => b.penalites - a.penalites || b.parties - a.parties || a.nom.localeCompare(b.nom, 'fr'),
  )
}

/**
 * Les rangs du palmarès, avec les égalités dites plutôt qu'effacées.
 *
 * L'écran numérotait `index + 1`, donc il inventait toujours un vainqueur. Le
 * tri, lui, départage en dernier recours sur le prénom : à pénalités ET parties
 * identiques, la première place revenait à l'ordre alphabétique. Personne
 * autour de la table ne connaît ce critère, et il ne raconte rien de la soirée.
 *
 * Le calcul lui-même vit dans `@/core/classement` depuis le 2026-09-14 : l'écran
 * des scores montre DEUX classements - l'ardoise du soir et le palmarès - et le
 * second serait reparti sur `index + 1`, c'est-à-dire sur le défaut corrigé ici.
 * Ces deux fonctions restent exportées sous leur nom : elles sont appelées
 * ailleurs, et les renommer n'apporterait rien.
 */
export type RangPalmares = Rang<LignePalmares>

export const rangsPalmares = (classement: LignePalmares[]): RangPalmares[] =>
  rangsDuClassement(classement)

/** Les lignes qui se partagent la première place, ou rien du tout si la tête est seule. */
export const meneursExAequo = (rangs: RangPalmares[]): LignePalmares[] => meneurs(rangs)

