import { useState, useCallback, useMemo, useRef } from 'react'
import { useEtatDeManche } from '@/stores/partieStore'
import { motion, AnimatePresence } from 'framer-motion'
import { SessionRecap } from '@/components/game/SessionRecap'
import { Button, BarreDeJeu, Icon } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import {
  demarrerManche,
  joueurSuivant,
  marquerMotVu,
  motDuJoueur,
  ouvrirLeVote,
  penalitesDeManche,
  plusDesignes,
  retirerUneVoix,
  revelation,
  tableeGagne,
  totalDesVoix,
  voteIndecis,
  voter,
  type EtatFauxFrere,
} from '@/core/engine/fauxFrereSession'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

/**
 * Le Faux Frère - la mécanique de bluff que l'étude bêta réclamait (9 réponses
 * sur 16), et qu'aucun des treize autres modes ne couvrait.
 *
 * Tout le raisonnement vit dans `@/core/engine/fauxFrereSession` : cet écran
 * n'affiche que l'état et appelle les transitions. C'est ce qui permet de
 * prouver le tirage et le verdict sans monter de composant.
 *
 * LE POINT DÉLICAT, et c'est tout le mode : pendant la distribution le
 * téléphone passe de main en main, et le mot ne doit JAMAIS s'afficher tant
 * que le doigt n'appuie pas. Un mot visible une demi-seconde de trop grille la
 * manche pour tout le monde, sans retour possible.
 */
export function FauxFrereScreen() {
  const { goToHub } = useAppStore()
  const { players } = useGameStore()
  const activePlayers = useMemo(() => players.filter((p) => p.active), [players])

  const [numeroDeManche, setNumeroDeManche] = useEtatDeManche('fauxFrere', players, 'manche', () => 1)
  const [duosJoues, setDuosJoues] = useEtatDeManche<string[]>('fauxFrere', players, 'duosJoues', () => [])
  const [penalites, setPenalites] = useEtatDeManche<Record<string, number>>('fauxFrere', players, 'penalites', () => ({}))
  const [termine, setTermine] = useEtatDeManche('fauxFrere', players, 'termine', () => false)
  const [motAffiche, setMotAffiche] = useState(false)

  /**
   * Identifiant de SESSION, tire une fois au montage.
   *
   * La graine valait `faux-frere-${numero de manche}`. Rien n'y variait d'une
   * soiree a l'autre, et `seededRng` est pure : la manche 1 tirait donc TOUJOURS
   * le meme duo de mots et TOUJOURS le meme siege. Mesure : trois soirees de
   * suite rendaient le duo ff-056 et le quatrieme joueur saisi. Au troisieme
   * soir, la table a compris le motif et le mode est mort.
   *
   * Le commentaire du moteur disait la bonne chose - la graine existe pour que
   * deux rendus successifs ne redistribuent pas les roles - mais l'identifiant
   * choisi etait celui de la MANCHE, pas celui de la SESSION. C'est le genre de
   * defaut qu'aucune garde ne pouvait voir : les tests epinglent la graine
   * volontairement, et c'est ce qui les rend deterministes.
   */
  const [graineDeSession] = useState(
    () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  )

  const [etat, setEtat] = useState<EtatFauxFrere>(() =>
    demarrerManche(activePlayers, `${graineDeSession}-1`, [])
  )

  const joueurCourant = etat.joueurs[etat.indexDistribution]
  const designes = plusDesignes(etat)
  const indecis = voteIndecis(etat)

  /**
   * Relache le mot, et ne le marque VU que s'il a vraiment ete affiche.
   *
   * `onPointerLeave` se declenche a tout franchissement de la cible, y compris
   * un survol souris sans appui, ou un doigt qui traverse la zone pendant un
   * defilement. Cette fonction appelant `marquerMotVu` sans condition, le
   * scenario etait : le joueur pose le telephone a plat, effleure la carte en
   * la reprenant, ne lit rien - et le bouton « Passer a X » s'active quand
   * meme. Le telephone circule, et quelqu'un decouvre a la phase de vote qu'il
   * n'a jamais eu son mot.
   *
   * On conditionne donc a un `onPointerDown` reel. Via une REFERENCE et non
   * l'etat : un appui bref groupe `pointerdown` et `pointerup` dans le meme lot
   * React, et `motAffiche` serait alors encore `false` dans la fermeture - la
   * garde bloquerait le cas nominal au lieu du cas parasite. Une reference est
   * lue a l'instant ou l'evenement arrive, sans dependre du rendu.
   */
  const appuiEnCours = useRef(false)

  const saisirLeMot = useCallback(() => {
    appuiEnCours.current = true
    setMotAffiche(true)
  }, [])

  const relacherLeMot = useCallback(() => {
    if (!appuiEnCours.current) return
    appuiEnCours.current = false
    setMotAffiche(false)
    setEtat((e) => marquerMotVu(e))
  }, [])

  const passerAuSuivant = useCallback(() => {
    haptic('light')
    setMotAffiche(false)
    setEtat((e) => joueurSuivant(e))
  }, [])

  const lancerLeVote = useCallback(() => {
    haptic('medium')
    setEtat((e) => ouvrirLeVote(e))
  }, [])

  /**
   * Cloture la manche sur un accuse, et compte les penalites UNE fois.
   *
   * Ce corps calculait `suivant` et `pen` a l'interieur du `setEtat`, et
   * appelait `setPenalites` depuis la. Un updater de `useState` doit etre PUR :
   * `StrictMode` est actif (voir `main.tsx`) et React double-invoque ces
   * fonctions en developpement, donc l'addition affichait 6 penalites la ou le
   * moteur en avait calcule 3. En production le risque subsiste, React pouvant
   * rejouer la file de mises a jour quand un rendu est interrompu puis repris.
   *
   * Le calcul lui-meme etait juste - `penalitesDeManche` est teste - c'est son
   * branchement a l'ecran qui ne l'etait pas. On calcule donc hors du setter, et
   * on appelle les deux setters cote a cote.
   */
  const trancher = useCallback(
    (accuseId: string) => {
      haptic('heavy')
      const suivant = revelation(etat, accuseId)
      const pen = penalitesDeManche(suivant)
      setEtat(suivant)
      setPenalites((prev) => {
        const out = { ...prev }
        for (const [id, n] of Object.entries(pen)) out[id] = (out[id] ?? 0) + n
        return out
      })
    },
    [etat]
  )

  const mancheSuivante = useCallback(() => {
    haptic('light')
    const n = numeroDeManche + 1
    setNumeroDeManche(n)
    setDuosJoues((prev) => [...prev, etat.duo.id])
    setMotAffiche(false)
    setEtat(demarrerManche(activePlayers, `${graineDeSession}-${n}`, [...duosJoues, etat.duo.id]))
  }, [numeroDeManche, etat.duo.id, duosJoues, activePlayers, graineDeSession])

  const rejouer = useCallback(() => {
    setPenalites({})
    setNumeroDeManche(1)
    setDuosJoues([])
    setTermine(false)
    setMotAffiche(false)
    // Graine neuve, et non `${graineDeSession}-1` : sans elle, « rejouer »
    // rejouerait la partie qu'on vient de finir, duo pour duo et siege pour
    // siege. C'est le meme defaut a une echelle plus courte.
    setEtat(demarrerManche(activePlayers, `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-1`, []))
  }, [activePlayers])

  if (termine) {
    return (
      <SessionRecap
        players={activePlayers}
        penaltyCounts={penalites}
        mode="fauxFrere"
        turns={numeroDeManche}
        onReplay={rejouer}
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
      <BarreDeJeu mode="fauxFrere" quitLabel="Quitter Le Faux Frère et revenir à l'accueil" />

      <header className="flex-shrink-0 mb-4 pt-16 relative z-10">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          Le Faux Frère, manche {numeroDeManche}
        </p>
      </header>

      {/* --- Distribution : le téléphone tourne --- */}
      {etat.phase === 'distribution' && joueurCourant && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
          <h2 className="font-display text-4xl uppercase tracking-tight text-ink">
            {joueurCourant.name}, à toi
          </h2>
          <p className="text-ink-secondary font-sans text-sm max-w-xs">
            Garde le doigt appuyé pour lire ton mot. Personne autour de la table ne doit le voir.
          </p>

          {/* Appui MAINTENU, jamais un basculement : un bouton qui reste ouvert
              laisse le mot visible quand le téléphone change de main, et la
              manche est grillée sans retour possible. `onPointerLeave` couvre
              le doigt qui glisse hors de la cible. */}
          <button
            type="button"
            onPointerDown={saisirLeMot}
            onPointerUp={relacherLeMot}
            onPointerLeave={relacherLeMot}
            onPointerCancel={relacherLeMot}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={`Appuyer et garder pour lire le mot de ${joueurCourant.name}`}
            className={cn(
              'w-full max-w-xs min-h-[180px] rounded-card border-2 select-none touch-none',
              'flex flex-col items-center justify-center gap-3 focus-ring-neon',
              motAffiche
                ? 'bg-surimpression border-sur-surimpression'
                : 'bg-transparent border-filet-clair'
            )}
          >
            {motAffiche ? (
              <>
                <span className="font-mono text-[10px] uppercase tracking-widest text-sur-surimpression">
                  Ton mot
                </span>
                <span className="font-display text-4xl uppercase tracking-tight text-sur-surimpression px-4">
                  {motDuJoueur(etat, joueurCourant.id)}
                </span>
              </>
            ) : (
              <>
                <Icon name="appui" className="w-8 h-8 text-surimpression" aria-hidden="true" />
                <span className="font-display text-2xl uppercase tracking-tight text-ink">
                  Appuie et garde
                </span>
              </>
            )}
          </button>

          <Button
            variant="primary"
            className="w-full max-w-xs"
            disabled={!etat.motVu}
            onClick={passerAuSuivant}
          >
            {etat.indexDistribution + 1 < etat.joueurs.length
              ? `Passer à ${etat.joueurs[etat.indexDistribution + 1].name}`
              : 'Tout le monde a son mot'}
          </Button>

          <p className="text-ink-muted font-sans text-xs max-w-xs">
            Le mot n&apos;est pas lu à voix haute par le lecteur d&apos;écran tant que tu
            n&apos;appuies pas.
          </p>
        </div>
      )}

      {/* --- Tour de parole --- */}
      {etat.phase === 'tour' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
          <Icon name="chut" className="w-16 h-16 text-surimpression" aria-hidden="true" />
          <h2 className="font-display text-4xl uppercase tracking-tight text-ink">
            Un mot chacun
          </h2>
          <p className="text-ink-secondary font-sans text-sm max-w-xs">
            En partant de {etat.joueurs[0]?.name}, chacun dit UN seul mot qui décrit le sien.
            Interdit de prononcer le mot lui-même.
          </p>
          <div className="w-full max-w-xs rounded-card border border-filet-clair p-4 text-left">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Le faux frère
            </p>
            <p className="text-ink font-sans text-sm mt-1">
              Il a un autre mot et il le sait. À lui de suivre sans se faire repérer.
            </p>
          </div>
          <Button variant="primary" className="w-full max-w-xs" onClick={lancerLeVote}>
            Passer au vote
          </Button>
        </div>
      )}

      {/* --- Vote --- */}
      {etat.phase === 'vote' && (
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
          <div className="text-center mb-1">
            <h2 className="font-display text-3xl uppercase tracking-tight text-ink">
              Qui est le faux frère
            </h2>
            <p className="text-ink-secondary font-sans text-sm mt-1">
              Chacun a dit son mot. La tablée désigne, une voix par personne.
            </p>
          </div>

          {etat.joueurs.map((j) => {
            const voix = etat.votes[j.id] ?? 0
            return (
              <div
                key={j.id}
                className={cn(
                  'flex items-center gap-3 rounded-control border p-3',
                  voix > 0 ? 'border-surimpression bg-surimpression/10' : 'border-filet-clair'
                )}
              >
                <span className="flex-1 font-display text-xl uppercase tracking-tight text-ink">
                  {j.name}
                </span>
                <button
                  type="button"
                  onClick={() => { haptic('light'); setEtat((e) => retirerUneVoix(e, j.id)) }}
                  disabled={voix === 0}
                  aria-label={`Retirer une voix à ${j.name}`}
                  className="w-11 h-11 rounded-control border border-ink-muted text-ink disabled:opacity-40 focus-ring-neon"
                >
                  −
                </button>
                <span
                  className="w-8 text-center font-mono tabular-nums text-lg text-ink"
                  aria-label={`${voix} voix`}
                >
                  {voix}
                </span>
                <button
                  type="button"
                  onClick={() => { haptic('light'); setEtat((e) => voter(e, j.id)) }}
                  aria-label={`Donner une voix à ${j.name}`}
                  className="w-11 h-11 rounded-control border border-ink text-ink focus-ring-neon"
                >
                  +
                </button>
              </div>
            )
          })}

          {/* En cas d'égalité le moteur ne tranche PAS : il rend tous les ex
              aequo et laisse la table choisir. Un code qui départagerait à sa
              place volerait la décision au jeu. */}
          {indecis && (
            <p className="text-warning font-sans text-sm text-center">
              Égalité entre {designes.map((id) => etat.joueurs.find((j) => j.id === id)?.name).join(', ')}.
              La tablée tranche à voix haute, puis appuie sur le nom retenu.
            </p>
          )}

          <div className="flex flex-col gap-2 mt-2">
            {designes.map((id) => {
              const j = etat.joueurs.find((x) => x.id === id)
              if (!j) return null
              return (
                <Button key={id} variant="primary" className="w-full" onClick={() => trancher(id)}>
                  Retourner {j.name}
                </Button>
              )
            })}
            {totalDesVoix(etat) === 0 && (
              <p className="text-ink-muted font-sans text-xs text-center">
                Donne au moins une voix pour pouvoir retourner quelqu&apos;un.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Révélation --- */}
      <AnimatePresence>
        {etat.phase === 'revelation' && etat.accuseId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-5"
          >
            <div
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center',
                tableeGagne(etat) ? 'bg-success' : 'bg-danger'
              )}
            >
              <Icon
                name={tableeGagne(etat) ? 'valider' : 'masque'}
                className="w-10 h-10 text-sur-surimpression"
                aria-hidden="true"
              />
            </div>

            <h2 className="font-display text-3xl uppercase tracking-tight text-ink px-4">
              {tableeGagne(etat)
                ? `${etat.joueurs.find((j) => j.id === etat.accuseId)?.name} était le faux frère`
                : `${etat.joueurs.find((j) => j.id === etat.accuseId)?.name} n'était pas le faux frère`}
            </h2>

            <div className="w-full max-w-xs rounded-card border border-filet-clair p-4 text-left">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                Les mots
              </p>
              <p className="font-display text-2xl uppercase tracking-tight text-ink mt-1">
                {etat.duo.commun}
              </p>
              <p className="text-ink-secondary font-sans text-sm mt-1">
                {etat.joueurs.find((j) => j.id === etat.fauxFrereId)?.name} avait{' '}
                <span className="text-surimpression font-bold">{etat.duo.imposteur}</span>.
              </p>
            </div>

            <p className="text-ink-secondary font-sans text-sm max-w-xs">
              {tableeGagne(etat)
                ? 'Il prend 3 pénalités. La tablée est tranquille.'
                : "Il sort, et toute la tablée prend 1 pénalité sauf lui."}
            </p>

            <div className="w-full max-w-xs flex flex-col gap-2">
              <Button variant="primary" className="w-full" onClick={mancheSuivante}>
                Manche suivante
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => { haptic('medium'); setTermine(true) }}>
                Arrêter et voir l&apos;addition
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
