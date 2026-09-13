import { AnimatePresence, motion } from 'framer-motion'
import { useEtatDeManche } from '@/stores/partieStore'
import { idsDejaVus, useMarquerVu } from '@/stores/vuStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { EcranDeMode } from '@/components/game'
import { Button, Icon } from '@/components/ui'
import { useGameStore } from '@/stores'
import {
  ECART_ACCEPTABLE,
  ECART_PLEIN_CENTRE,
  commencerCadrage,
  commencerVisee,
  createBarometreSession,
  deplacerAiguille,
  getAiguilleur,
  mancheSuivante,
  rendreLeTelephone,
  verdictDe,
  verrouillerVisee,
  type BarometreSessionState,
} from '@/core/engine/barometreSession'
import { AXES_BAROMETRE } from '@/content/barometre'
import { de } from '@/core/text/francais'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

/**
 * Le Baromètre - un axe entre deux extrêmes, une cible cachée, et un aiguilleur
 * qui n'a qu'UN mot pour l'indiquer. La tablée déplace l'aiguille ensemble ;
 * l'écart décide qui prend les pénalités.
 *
 * Tout le raisonnement vit dans `@/core/engine/barometreSession` : cet écran
 * affiche des phases et transmet des gestes, il ne décide rien - c'est ce qui
 * rend les pénalités testables sans monter de composant.
 */

/** Le cadran : sa zone cible n'est peinte que quand le regard a le droit de la voir. */
function Cadran({
  cible,
  aiguille,
  cibleVisible,
  aiguilleVisible,
}: {
  cible: number
  aiguille: number
  cibleVisible: boolean
  aiguilleVisible: boolean
}) {
  const debutZone = Math.max(0, cible - ECART_PLEIN_CENTRE)
  const finZone = Math.min(100, cible + ECART_PLEIN_CENTRE)

  return (
    <div className="relative h-11 w-full rounded-control border-2 border-tile-ink bg-card-face overflow-hidden">
      {/* Graduations tous les dix points : sans elles, « à 18 points près » ne
          veut rien dire à l'oeil, et la tablée ne sait pas ce qu'elle a raté. */}
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-card-ink/15"
          style={{ left: `${(i + 1) * 10}%` }}
          aria-hidden="true"
        />
      ))}

      {cibleVisible && (
        <>
          <div
            className="absolute inset-y-0 bg-aplat-1"
            style={{ left: `${debutZone}%`, width: `${finZone - debutZone}%` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 w-[3px] bg-card-ink"
            style={{ left: `calc(${cible}% - 1.5px)` }}
            aria-hidden="true"
          />
        </>
      )}

      {aiguilleVisible && (
        <div
          className="absolute inset-y-0 w-[3px] bg-neon"
          style={{ left: `calc(${aiguille}% - 1.5px)` }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export function BarometreScreen() {
  const { players } = useGameStore()

  const nouvelleSession = () =>
    createBarometreSession(AXES_BAROMETRE, players, Math.random, {
      dejaVus: idsDejaVus(),
      longueur: usePreferencesStore.getState().longueurManche,
    })

  // `useEtatDeManche` et non `useState` : la manche survit a un rechargement de
  // page. Voir stores/partieStore.ts.
  const [session, setSession] = useEtatDeManche<BarometreSessionState>(
    'barometre',
    players,
    'session',
    nouvelleSession,
  )
  useMarquerVu(session.manche?.axe.id)
  const aiguilleur = getAiguilleur(session)

  const axe = session.manche?.axe
  const cible = session.manche?.cible ?? 0
  const verdict = session.ecart === null ? null : verdictDe(session.ecart)

  return (
    <EcranDeMode
      mode="barometre"
      quitLabel="Quitter Le Baromètre et revenir à l'accueil"
      terminee={session.phase === 'finished'}
      addition={{
        players: session.players,
        penaltyCounts: session.penaltyCounts,
        turns: session.mancheNumero,
        onReplay: () => setSession(nouvelleSession()),
      }}
    >
      <header className="flex-shrink-0 mb-4 pt-16 relative z-10 text-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          Le Baromètre - manche {session.mancheNumero}
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* Le téléphone part vers l'aiguilleur */}
          {session.phase === 'passage' && (
            <motion.div
              key="passage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full rounded-card p-8 bg-aplat-3 text-tile-ink border border-tile-ink shadow-card-elevated text-center"
            >
              <Icon name="oeil-barre" className="w-10 h-10 mx-auto mb-4 text-tile-ink" aria-hidden="true" />
              <p className="font-sans text-tile-ink/80">Personne d&apos;autre ne regarde !</p>
              <p className="font-display text-3xl uppercase tracking-tight text-tile-ink mt-2">
                Passe le téléphone à {aiguilleur?.name}
              </p>
              <p className="font-sans text-sm text-tile-ink/80 mt-3">
                {aiguilleur?.name} est l&apos;aiguilleur : une cible cachée l&apos;attend sur le cadran.
              </p>
            </motion.div>
          )}

          {/* L'aiguilleur voit la cible et cherche son mot */}
          {session.phase === 'cadrage' && axe && (
            <motion.div
              key="cadrage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className="rounded-card p-5 bg-card-face border border-tile-ink shadow-card-elevated mb-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-card-ink-muted mb-3 text-center">
                  Cible secrète - chut !
                </p>
                <Cadran cible={cible} aiguille={session.aiguille} cibleVisible aiguilleVisible={false} />
                <div className="flex justify-between mt-2 gap-3">
                  <span className="font-sans font-bold text-sm text-card-ink">{axe.gauche}</span>
                  <span className="font-sans font-bold text-sm text-card-ink text-right">{axe.droite}</span>
                </div>
              </div>

              <p className="text-ink-secondary font-sans text-sm text-center">
                Trouve UN SEUL mot qui tombe pile sur la barre, et dis-le à voix haute. Un seul,
                sans geste et sans explication.
              </p>
            </motion.div>
          )}

          {/* Le téléphone revient au centre, cible masquée */}
          {session.phase === 'retour' && (
            <motion.div
              key="retour"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full rounded-card p-8 bg-aplat-2 text-tile-ink border border-tile-ink shadow-card-elevated text-center"
            >
              <Icon name="oeil" className="w-10 h-10 mx-auto mb-4 text-tile-ink" aria-hidden="true" />
              <p className="font-display text-3xl uppercase tracking-tight text-tile-ink">
                Cible verrouillée !
              </p>
              <p className="font-sans text-sm text-tile-ink/80 mt-3">
                {aiguilleur?.name}, lâche ton mot et repose le téléphone au centre de la table.
              </p>
            </motion.div>
          )}

          {/* La tablée vise, puis découvre l'écart */}
          {(session.phase === 'visee' || session.phase === 'verdict') && axe && (
            <motion.div
              key="visee"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className="rounded-card p-5 bg-card-face border border-tile-ink shadow-card-elevated mb-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-card-ink-muted mb-3 text-center">
                  {session.phase === 'visee'
                    ? `Le mot ${de(aiguilleur?.name ?? '')} tombe où ?`
                    : `Cible à ${cible}, aiguille à ${session.aiguille}`}
                </p>

                <Cadran
                  cible={cible}
                  aiguille={session.aiguille}
                  cibleVisible={session.phase === 'verdict'}
                  aiguilleVisible
                />

                <div className="flex justify-between mt-2 gap-3">
                  <span className="font-sans font-bold text-sm text-card-ink">{axe.gauche}</span>
                  <span className="font-sans font-bold text-sm text-card-ink text-right">{axe.droite}</span>
                </div>

                {session.phase === 'visee' && (
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={session.aiguille}
                    onChange={(e) => setSession(deplacerAiguille(session, Number(e.target.value)))}
                    className="cadran-curseur mt-3 focus-ring-neon"
                    aria-label={`Placer l'aiguille entre ${axe.gauche} et ${axe.droite}`}
                    aria-valuetext={`${session.aiguille} sur 100`}
                  />
                )}
              </div>

              <p className="text-ink-secondary font-sans text-sm text-center" aria-live="polite">
                {session.phase === 'visee' ? (
                  'Mettez-vous d’accord, puis verrouillez l’aiguille.'
                ) : verdict === 'plein-centre' ? (
                  `Plein centre, à ${session.ecart} points près : personne ne paie.`
                ) : verdict === 'dans-le-mille-large' ? (
                  `Raté de ${session.ecart} points : ${aiguilleur?.name} paie seul, c’est le mot qui était flou.`
                ) : (
                  `À côté de la plaque, ${session.ecart} points d’écart : tout le monde prend une pénalité.`
                )}
              </p>

              {session.phase === 'verdict' && (
                <div
                  className={cn(
                    'mt-4 rounded-control border-2 border-ink px-4 py-3 text-center font-display text-2xl uppercase tracking-tight',
                    verdict === 'plein-centre' && 'bg-aplat-4 text-tile-ink border-tile-ink',
                    verdict === 'dans-le-mille-large' && 'bg-surface text-ink',
                    verdict === 'a-cote' && 'bg-card-red/20 text-ink',
                  )}
                >
                  {verdict === 'plein-centre'
                    ? 'Vous vous comprenez'
                    : verdict === 'dans-le-mille-large'
                      ? `${ECART_PLEIN_CENTRE} points de marge, il en manquait peu`
                      : `Plus de ${ECART_ACCEPTABLE} points d’écart`}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10">
        {session.phase === 'passage' && (
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={() => setSession(commencerCadrage(session))}
          >
            Je suis {aiguilleur?.name}, j&apos;ai le téléphone
          </Button>
        )}
        {session.phase === 'cadrage' && (
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={() => { haptic('medium'); setSession(rendreLeTelephone(session)) }}
          >
            Mon mot est lâché
          </Button>
        )}
        {session.phase === 'retour' && (
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={() => setSession(commencerVisee(session))}
          >
            Le téléphone est au centre
          </Button>
        )}
        {session.phase === 'visee' && (
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={() => { haptic('medium'); setSession(verrouillerVisee(session)) }}
          >
            Verrouiller l&apos;aiguille
          </Button>
        )}
        {session.phase === 'verdict' && (
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={() => setSession(mancheSuivante(session))}
          >
            <Icon name="recommencer" className="w-5 h-5 mr-2" aria-hidden="true" />
            Manche suivante
          </Button>
        )}
      </footer>
    </EcranDeMode>
  )
}
