import { motion } from 'framer-motion'
import { Button, ConfirmDialog, Icon } from '@/components/ui'
import { useAppStore } from '@/stores'
import { classementPalmares, usePalmaresStore } from '@/stores/palmaresStore'
import { getModeDefinition } from '@/core/engine/modeRegistry'
import { useState } from 'react'
import { cn } from '@/utils'

/**
 * Le palmarès de la maison - ce que chaque prénom traîne d'une soirée à l'autre.
 *
 * L'ardoise mesure UNE soirée et disparaît avec elle. Ce n'était pas suffisant :
 * une tablée qui se retrouve tous les mois n'avait aucune trace de ce qui s'est
 * passé la fois d'avant, et « le score » n'existait qu'entre deux parties.
 *
 * Tout reste sur l'appareil, indexé par prénom. Voir palmaresStore pour ce que
 * « profil » veut dire dans une application sans comptes, et ce que ce choix
 * coûte.
 */
export function PalmaresScreen() {
  const goBack = useAppStore((s) => s.goBack)
  const lignes = usePalmaresStore((s) => s.lignes)
  const effacer = usePalmaresStore((s) => s.effacer)
  const [confirmerEffacement, setConfirmerEffacement] = useState(false)

  const classement = classementPalmares(lignes)
  const totalParties = classement.reduce((n, l) => n + l.parties, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-dvh flex flex-col bg-bg"
    >
      <header className="shrink-0 sticky top-0 pt-safe z-30 bg-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={goBack} className="mr-3" aria-label="Retour">
            <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
          </Button>
          <h1 className="font-display text-xl uppercase tracking-tight text-ink">
            Palmarès de la maison
          </h1>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain max-w-lg mx-auto w-full px-4 py-5 pb-safe-6">
        {classement.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="medaille" className="w-10 h-10 mx-auto mb-4 text-ink-muted" aria-hidden="true" />
            <p className="font-display text-2xl uppercase tracking-tight text-ink">
              Le registre est vierge
            </p>
            <p className="text-ink-secondary font-sans text-sm mt-2">
              Termine une partie et le palmarès se remplit tout seul. Il reste sur ce
              téléphone, et il ne s&apos;efface pas au petit matin.
            </p>
          </div>
        ) : (
          <>
            <p className="text-ink-muted font-mono text-xs uppercase tracking-widest mb-4 tabular-nums">
              {classement.length} prénom{classement.length > 1 ? 's' : ''} - {totalParties} partie
              {totalParties > 1 ? 's' : ''} comptée{totalParties > 1 ? 's' : ''}
            </p>

            <ol className="space-y-2">
              {classement.map((ligne, index) => (
                <li
                  key={ligne.nom}
                  className={cn(
                    'rounded-card border px-4 py-3 flex items-center gap-3',
                    index === 0
                      ? 'bg-aplat-1 border-tile-ink text-tile-ink shadow-gravure'
                      : 'bg-surface border-border-strong text-ink',
                  )}
                >
                  <span className="font-mono font-bold tabular-nums text-sm w-6 shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg uppercase tracking-tight truncate">
                      {ligne.nom}
                    </p>
                    <p
                      className={cn(
                        'font-sans text-xs',
                        index === 0 ? 'text-tile-ink/80' : 'text-ink-secondary',
                      )}
                    >
                      {ligne.parties} partie{ligne.parties > 1 ? 's' : ''} -{' '}
                      {ligne.modes.length} jeu{ligne.modes.length > 1 ? 'x' : ''}
                      {ligne.palmes > 0 && (
                        <>
                          {' '}
                          - {ligne.palmes} palme{ligne.palmes > 1 ? 's' : ''}
                        </>
                      )}
                    </p>
                    {ligne.modes.length > 0 && (
                      <p
                        className={cn(
                          'font-sans text-[11px] mt-0.5 truncate',
                          index === 0 ? 'text-tile-ink/70' : 'text-ink-muted',
                        )}
                      >
                        {ligne.modes.map((m) => getModeDefinition(m).title).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-bold tabular-nums text-2xl shrink-0">
                    {ligne.penalites}
                  </span>
                </li>
              ))}
            </ol>

            <p className="text-ink-muted font-sans text-xs mt-5 text-center">
              Le palmarès vit sur ce téléphone et n&apos;en sort jamais. Deux personnes qui
              portent le même prénom partagent une ligne - numérote-les à la saisie pour les
              séparer.
            </p>

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setConfirmerEffacement(true)}
            >
              <Icon name="supprimer" className="w-4 h-4 mr-2" aria-hidden="true" />
              Effacer le palmarès
            </Button>
          </>
        )}
      </main>

      <ConfirmDialog
        open={confirmerEffacement}
        id="palmares-effacer"
        title="Effacer le palmarès ?"
        message="Tout l'historique des soirées est perdu, sur ce téléphone comme ailleurs - il n'existe nulle part d'autre."
        confirmLabel="Effacer"
        onConfirm={() => {
          effacer()
          setConfirmerEffacement(false)
        }}
        onClose={() => setConfirmerEffacement(false)}
      />
    </motion.div>
  )
}
