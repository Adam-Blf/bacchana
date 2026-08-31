import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'
import { Icon } from '../ui/Icon'

interface Props {
  /** Duree de la manche, en secondes. */
  secondes: number
  /**
   * Change a chaque nouvelle carte : le compte a rebours repart de zero et
   * repasse a l'arret. Sans cette cle, une carte suivante heritait du chrono
   * epuise de la precedente.
   */
  cle: string
  className?: string
}

/**
 * Le compte a rebours des modes chronometres.
 *
 * « 7 Secondes » annoncait sept secondes et n'en comptait aucune : le mode
 * passe par l'ecran generique des cartes a prompt, qui ne sait rien du temps.
 * La table devait compter a voix haute, ce que ses regles demandent d'ailleurs -
 * mais alors l'ecran ne tenait pas la moitie de sa promesse, et rien ne
 * tranchait quand la tablee comptait vite.
 *
 * Il DEMARRE A LA DEMANDE, jamais tout seul. Le joueur doit d'abord lire sa
 * carte : un chrono qui part au montage brule deux secondes sur la lecture, et
 * la manche est perdue avant d'avoir commence.
 */
export function Chrono({ secondes, cle, className }: Props) {
  const [restant, setRestant] = useState(secondes)
  const [enCours, setEnCours] = useState(false)
  const finRef = useRef<number | null>(null)

  // Nouvelle carte : on revient a l'arret, compteur plein.
  useEffect(() => {
    setEnCours(false)
    setRestant(secondes)
    finRef.current = null
  }, [cle, secondes])

  useEffect(() => {
    if (!enCours) return

    // On lit l'horloge plutot que de decrementer un compteur : un intervalle
    // que le navigateur ralentit (onglet en arriere-plan, telephone qui se
    // verrouille) rendrait un chrono plus long que la duree annoncee.
    finRef.current = Date.now() + restant * 1000
    const tick = setInterval(() => {
      const reste = Math.max(0, (finRef.current ?? 0) - Date.now())
      const secondesRestantes = reste / 1000
      setRestant(secondesRestantes)
      if (reste <= 0) {
        clearInterval(tick)
        setEnCours(false)
        haptic('heavy')
      }
    }, 100)

    return () => clearInterval(tick)
    // `restant` volontairement hors dependances : il change a chaque tick, et
    // l'y mettre relancerait l'intervalle dix fois par seconde.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enCours, cle])

  const ecoule = restant <= 0
  const affiche = Math.ceil(restant)
  const part = secondes > 0 ? Math.max(0, Math.min(1, restant / secondes)) : 0

  if (!enCours && !ecoule) {
    return (
      <button
        type="button"
        onClick={() => { haptic('medium'); setEnCours(true) }}
        className={cn(
          'mt-6 w-full min-h-[52px] rounded-control border-2 border-tile-ink bg-aplat-1 text-tile-ink',
          'font-display uppercase text-xl inline-flex items-center justify-center gap-2 focus-ring-neon',
          className
        )}
      >
        <Icon name="chronometre" className="w-5 h-5" aria-hidden="true" />
        Lancer les {secondes} secondes
      </button>
    )
  }

  return (
    <div className={cn('mt-6 flex flex-col items-center gap-2', className)} aria-live="polite">
      <span
        className={cn(
          'font-display tabular-nums leading-none text-[3.5rem]',
          ecoule ? 'text-card-danger' : 'text-card-ink'
        )}
      >
        {ecoule ? 'Temps écoulé' : affiche}
      </span>

      {/* La barre double le chiffre : le critere 1.4.1 interdit que la couleur
          porte seule l'information, et de l'autre bout de la table on lit une
          jauge qui se vide avant de lire un chiffre. */}
      <div className="w-full h-2 rounded-pill bg-card-ink/10 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-pill', ecoule ? 'bg-card-danger' : 'bg-card-red')}
          animate={{ width: `${part * 100}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      {ecoule && (
        <button
          type="button"
          onClick={() => { setRestant(secondes); setEnCours(true) }}
          className="min-h-[44px] px-4 font-mono text-xs uppercase tracking-widest text-card-ink-muted focus-ring-neon"
        >
          Relancer
        </button>
      )}
    </div>
  )
}
