import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { Player } from '@/types'
import type { GameMode } from '@/core/engine/types'
import { useAppStore } from '@/stores'
import { BarreDeJeu } from '@/components/ui'
import { SessionRecap } from './SessionRecap'

/**
 * La coquille commune des modes à logique embarquée.
 *
 * LE DÉFAUT QU'ELLE CORRIGE, et la raison pour laquelle c'est une coquille et
 * non un utilitaire. « Quitter en cours de partie doit passer par l'addition » :
 * sans ça, ni l'ardoise de la soirée ni l'évènement `session_completed` ne se
 * déclenchent, et la partie disparaît sans laisser de trace. La règle était
 * connue, commentée, et appliquée par TROIS écrans sur huit - Quitte ou Double,
 * Le Tableau d'Honneur et Le Baromètre portaient chacun leur propre état
 * `quitting`. Les cinq autres - Le Pilori, La Criée, La Roue, Tu préfères, Le
 * Faux Frère - rendaient la main au hub directement, et leurs parties ne
 * comptaient pour rien.
 *
 * Une règle que chaque écran doit se rappeler d'appliquer est une règle qu'un
 * écran sur deux oubliera. Elle vit donc ici, au seul endroit par lequel tous
 * passent, et `EcranDeMode.test.tsx` la vérifie sur les huit.
 *
 * Ce que la coquille ne prend PAS en charge : la mise en page interne. Chaque
 * mode garde son `<header>`, son `<main>` et son `<footer>` - ils n'ont rien en
 * commun au-delà du cadre, et les uniformiser de force aurait transformé une
 * correction en refonte visuelle de huit écrans.
 */
export interface AdditionDeManche {
  /** La tablée telle que le mode l'a figée en démarrant. */
  players: Player[]
  /** Pénalités par joueur. Absent pour un mode qui ne compte rien (La Roue). */
  penaltyCounts?: Record<string, number>
  /** Nombre de tours joués, pour l'évènement de fin de session. */
  turns: number
  /** Revanche : le mode repart d'une manche neuve. */
  onReplay: () => void
}

interface Props {
  mode: GameMode
  /** Libellé du bouton de sortie, lu par les lecteurs d'écran. */
  quitLabel: string
  /** Vrai quand la manche est allée à son terme d'elle-même. */
  terminee: boolean
  addition: AdditionDeManche
  /** Contrôle propre au mode, posé dans la barre haute (ex. « recommencer »). */
  extra?: ReactNode
  children: ReactNode
}

export function EcranDeMode({ mode, quitLabel, terminee, addition, extra, children }: Props) {
  const goToHub = useAppStore((s) => s.goToHub)
  // L'abandon n'est PAS remonté au mode : il ne regarde que l'affichage de
  // l'addition. Un mode qui devrait s'en soucier devrait aussi penser à le
  // remettre à zéro pour la revanche, ce qui est exactement l'oubli qu'on retire.
  const [abandon, setAbandon] = useState(false)

  if (terminee || abandon) {
    return (
      <SessionRecap
        players={addition.players}
        penaltyCounts={addition.penaltyCounts}
        mode={mode}
        turns={addition.turns}
        onReplay={() => {
          setAbandon(false)
          addition.onReplay()
        }}
        onQuit={goToHub}
      />
    )
  }

  return (
    <motion.div
      className="min-h-dvh w-full flex flex-col px-6 pt-safe pb-safe relative overflow-hidden bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <BarreDeJeu mode={mode} quitLabel={quitLabel} extra={extra} onQuit={() => setAbandon(true)} />
      {children}
    </motion.div>
  )
}
