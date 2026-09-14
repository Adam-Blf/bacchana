import { motion } from 'framer-motion'
import { Button, Icon } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import { PLAYABLE_MODES, ouvertureDeTablee } from '@/core/engine/modeRegistry'
import type { ModeDefinition } from '@/core/engine/types'
import { cn } from '@/utils'

/**
 * Le catalogue - les quinze jeux, ouverts ou non, avec leurs règles.
 *
 * L'ÉCRAN QUI MANQUAIT. Le hub n'affiche PAS un mode que la tablée ne peut pas
 * lancer, et c'est une bonne règle : une tuile qui refuse de démarrer est une
 * fausse promesse. Mais elle avait une conséquence que personne n'avait posée -
 * à deux joueurs, six jeux n'existaient nulle part dans l'application. Pas
 * grisés, pas annoncés : absents. On ne pouvait ni savoir qu'ils existaient, ni
 * lire leurs règles, ni apprendre qu'une chaise de plus les ouvrait.
 *
 * Ici tout est montré, y compris ce qui est fermé, avec la condition écrite.
 * Un jeu fermé reste LISIBLE : on peut ouvrir ses règles, décider qu'il vaut le
 * coup d'appeler quelqu'un, et savoir combien il en faut.
 *
 * CE QUE CET ÉCRAN NE FAIT PAS. Il ne lance rien. Le hub reste le seul endroit
 * d'où l'on démarre une partie - un catalogue qui lance à moitié (les ouverts
 * oui, les fermés non) rendrait deux tuiles identiques au toucher avec deux
 * comportements différents, ce qui est exactement le défaut qu'il corrige.
 */

function Fiche({ mode, joueurs }: { mode: ModeDefinition; joueurs: number }) {
  const navigateTo = useAppStore((s) => s.navigateTo)
  const setActiveMode = useAppStore((s) => s.setActiveMode)
  const ouvert = joueurs >= mode.minPlayers
  const manquants = mode.minPlayers - joueurs

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          setActiveMode(mode.id)
          navigateTo('mode-rules')
        }}
        aria-label={`Règles de ${mode.title}${ouvert ? '' : `, fermé, il faut ${mode.minPlayers} joueurs`}`}
        className={cn(
          'w-full min-h-[44px] px-4 py-3 flex items-center gap-3 rounded-card text-left',
          'border focus-ring-neon transition-colors',
          ouvert
            ? 'border-border-strong bg-surface text-ink'
            : // Un jeu fermé reste lisible : il est en retrait, jamais effacé.
              // `opacity` sur tout le bloc ferait passer le texte sous le seuil
              // de contraste, or c'est justement ce texte qu'on vient lire.
              'border-border bg-bg-raised text-ink-secondary border-dashed'
        )}
      >
        <Icon
          name={mode.icon}
          className={cn('w-6 h-6 shrink-0', ouvert ? 'text-ink' : 'text-ink-muted')}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-display text-lg uppercase tracking-tight truncate',
              ouvert ? 'text-ink' : 'text-ink-secondary'
            )}
          >
            {mode.title}
          </p>
          <p className="font-sans text-xs text-ink-secondary line-clamp-2">{mode.subtitle}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mt-1 tabular-nums">
            {ouvert ? (
              <>
                Ouvert - dès {mode.minPlayers} joueur{mode.minPlayers > 1 ? 's' : ''}
              </>
            ) : (
              <>
                Fermé - {manquants === 1 ? 'une chaise de plus' : `encore ${manquants} joueurs`}
              </>
            )}
          </p>
        </div>
        <Icon name="suivant" className="w-4 h-4 shrink-0 opacity-50" aria-hidden="true" />
      </button>
    </li>
  )
}

export function CatalogueScreen() {
  const goBack = useAppStore((s) => s.goBack)
  const joueurs = useGameStore((s) => s.players).length
  const ouverture = ouvertureDeTablee(joueurs)

  // Les ouverts d'abord, puis les fermés du plus proche au plus lointain : on
  // lit ce qu'on peut jouer maintenant, puis ce qu'une chaise de plus apporte.
  const ordonnes = [...PLAYABLE_MODES].sort((a, b) => {
    const ouvertA = joueurs >= a.minPlayers ? 0 : 1
    const ouvertB = joueurs >= b.minPlayers ? 0 : 1
    return ouvertA - ouvertB || a.minPlayers - b.minPlayers || a.title.localeCompare(b.title, 'fr')
  })

  return (
    // Pas d'animation de sortie : le cadre de transition d'`App.tsx` en porte
    // deja une, et `AnimatePresence` en mode `wait` attend la fin des DEUX.
    // Ce doublon coutait 470 ms au retour vers le hub. Voir HubScreen.tsx.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="h-dvh flex flex-col bg-bg"
    >
      <header className="shrink-0 sticky top-0 pt-safe z-30 bg-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={goBack} className="mr-3" aria-label="Retour">
            <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
          </Button>
          <h1 className="font-display text-xl uppercase tracking-tight text-ink">Les jeux</h1>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain max-w-lg mx-auto w-full px-4 py-5 pb-safe-6">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest mb-4 tabular-nums">
          {ouverture.ouverts} ouvert{ouverture.ouverts > 1 ? 's' : ''} sur {ouverture.total}
          {ouverture.manquants > 0 && (
            <>
              {' '}
              - il en faut {ouverture.seuilComplet} pour tout ouvrir
            </>
          )}
        </p>

        <ol className="space-y-2">
          {ordonnes.map((mode) => (
            <Fiche key={mode.id} mode={mode} joueurs={joueurs} />
          ))}
        </ol>

        <p className="text-ink-muted font-sans text-xs mt-5 text-center">
          Toucher une fiche ouvre ses règles, ouvert ou non. Les parties se lancent depuis le
          menu.
        </p>
      </main>
    </motion.div>
  )
}
