import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Icon, NomAffiche } from '@/components/ui'
import { useAppStore, useConsentStore, useGameStore } from '@/stores'
import { cn } from '@/utils'
import { ouvertureDeTablee } from '@/core/engine/modeRegistry'
import { haptic } from '@/utils/haptic'
import type { PlayerGender, PlayerRelationship } from '@/types'

/** One row of the player roster before it becomes a real `Player` (no id yet). */
interface PlayerEntry {
  name: string
  gender?: PlayerGender
  relationship?: PlayerRelationship
}

const GENDER_OPTIONS: { value: PlayerGender; label: string }[] = [
  { value: 'm', label: 'Homme' },
  { value: 'f', label: 'Femme' },
  { value: 'x', label: 'Autre' },
]

const RELATIONSHIP_OPTIONS: { value: PlayerRelationship; label: string }[] = [
  { value: 'single', label: 'Célibataire' },
  { value: 'couple', label: 'En couple' },
]

/** Same sanitization as gameStore.setPlayers - kept aligned so indices match after Enter. */
function sanitizeName(name: string): string {
  return name.trim().slice(0, 20).replace(/[<>]/g, '')
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 20, stiffness: 150 },
  },
}

const floatVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 200,
    },
  },
}

const playerInputVariants = {
  hidden: { opacity: 0, x: -40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 25, stiffness: 200 },
  },
  exit: {
    opacity: 0,
    x: 60,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

export function WelcomeScreen() {
  const { goToHub } = useAppStore()
  const { players, setPlayers, setPlayerAttributes, hasPlayers } = useGameStore()
  const consentDecided = useConsentStore((s) => s.hasValidConsent())

  const [entries, setEntries] = useState<PlayerEntry[]>(() =>
    players.length > 0
      ? players.map((p) => ({ name: p.name, gender: p.gender, relationship: p.relationship }))
      : [{ name: '' }, { name: '' }]
  )
  // Un seul panneau d'attributs ouvert à la fois - reste compact, jamais imposé.
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const addName = () => {
    if (entries.length < 8) {
      setEntries([...entries, { name: '' }])
    }
  }

  const removeName = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index))
      setExpandedIndex(null)
    }
  }

  const updateName = (index: number, value: string) => {
    setAvertiDesVides(false)
    setEntries(entries.map((e, i) => (i === index ? { ...e, name: value } : e)))
  }

  const updateGender = (index: number, gender: PlayerGender | undefined) => {
    setEntries(entries.map((e, i) => (i === index ? { ...e, gender } : e)))
  }

  const updateRelationship = (index: number, relationship: PlayerRelationship | undefined) => {
    setEntries(entries.map((e, i) => (i === index ? { ...e, relationship } : e)))
  }

  const validEntries = entries
    .map((e) => ({ ...e, name: sanitizeName(e.name) }))
    .filter((e) => e.name.length > 0)
  const canEnter = validEntries.length >= 2
  const ouverture = ouvertureDeTablee(validEntries.length)

  /**
   * Les cases restees vides, et l'avertissement qui va avec.
   *
   * Une case vide etait silencieusement JETEE : on pouvait pousser la porte
   * avec trois noms saisis sur quatre chaises, et le quatrieme joueur
   * n'existait tout simplement pas de la soiree. Rien ne le disait, et c'est
   * bien plus souvent un oubli de frappe qu'une chaise qu'on retire.
   *
   * Le premier appui AVERTIT et ne part pas ; le second confirme. On ne bloque
   * pas - il est legitime d'ajouter une chaise puis de changer d'avis - mais on
   * ne laisse plus partir sans l'avoir dit.
   */
  const nomsVides = entries.filter((e) => sanitizeName(e.name).length === 0).length

  /**
   * Les prenoms en double.
   *
   * Le reste de la validation etait soigne - deux joueurs minimum, espaces
   * seuls ignores, vingt caracteres - mais deux « Alice » passaient sans un
   * mot. Or les jeux DESIGNENT les joueurs par leur prenom : « Alice, la table
   * t'attend » devient intranchable a table, et l'addition finale affiche deux
   * lignes identiques.
   *
   * Comparaison en minuscules et sans espaces superflus : « alice » et
   * « Alice  » sont le meme prenom pour une tablee, quoi qu'en dise la chaine.
   */
  const cle = (nom: string) => sanitizeName(nom).toLowerCase()
  const comptes = new Map<string, number>()
  for (const e of entries) {
    const k = cle(e.name)
    if (k.length === 0) continue
    comptes.set(k, (comptes.get(k) ?? 0) + 1)
  }
  const nomsEnDouble = [...comptes.values()].filter((n) => n > 1).length

  const [avertiDesVides, setAvertiDesVides] = useState(false)

  const retirerLesVides = () => {
    setEntries(entries.filter((e) => sanitizeName(e.name).length > 0))
    setAvertiDesVides(false)
    setExpandedIndex(null)
  }

  /**
   * Numerote les doublons : « Alice » et « Alice 2 ».
   *
   * On corrige plutot que de bloquer. Deux personnes qui portent le meme
   * prenom, ca arrive a toutes les tablees ; ce que l'application doit
   * empecher, c'est de ne plus pouvoir les distinguer a l'ecran.
   */
  const numeroterLesDoublons = () => {
    const vus = new Map<string, number>()
    setEntries(
      entries.map((e) => {
        const k = cle(e.name)
        if (k.length === 0) return e
        const rang = (vus.get(k) ?? 0) + 1
        vus.set(k, rang)
        return rang === 1 ? e : { ...e, name: `${sanitizeName(e.name)} ${rang}`.slice(0, 20) }
      }),
    )
    setAvertiDesVides(false)
  }

  const handleEnter = () => {
    if (!canEnter) return
    if ((nomsVides > 0 || nomsEnDouble > 0) && !avertiDesVides) {
      haptic('medium')
      setAvertiDesVides(true)
      return
    }
    setPlayers(validEntries.map((e) => e.name))

    // setPlayers crée des joueurs frais (nouveaux ids) dans le même ordre que
    // validEntries (même sanitization) - on peut donc reporter genre/statut par index.
    const created = useGameStore.getState().players
    validEntries.forEach((entry, index) => {
      const player = created[index]
      if (player && (entry.gender || entry.relationship)) {
        setPlayerAttributes(player.id, { gender: entry.gender, relationship: entry.relationship })
      }
    })

    // LA PORTE OUVRE LE HUB. Elle ne recule pas d'un cran.
    //
    // Ce bouton a rate sa destination DEUX FOIS, et les deux fois pour la meme
    // raison de fond : il PARIAIT sur ce qui se trouve sous l'accueil.
    //
    // Il a d'abord parie sur `hasPlayers()` - « on n'arrive ici avec une tablee
    // que depuis le hub ». Faux, parce que les joueurs sont PERSISTES : a la
    // deuxieme ouverture, la tablee de la veille est encore la, l'accueil est
    // la RACINE de l'historique, et le retour tombait sur la trappe de sortie.
    // L'APPLICATION SE FERMAIT, sur le bouton le plus important du produit.
    //
    // Il a ensuite parie sur `peutRemonter()` - « s'il y a un ecran dessous,
    // c'est le hub ». Faux aussi, et signale depuis la production : l'accueil
    // s'atteint depuis les reglages, depuis le catalogue, apres un aller-retour
    // par les regles. Le retour rendait alors CET ecran-la. « Pousser la porte »
    // ramenait a la page d'avant.
    //
    // La lecon des deux essais est la meme : il n'y a rien a deduire. La porte a
    // une destination NOMMEE, le hub, et `navHome()` l'atteint depuis n'importe
    // ou - il reecrit la racine sur le hub puis deroule tout ce qui est au
    // dessus. A la racine il remplace, donc aucune entree en double ; plus bas
    // il deroule, donc aucun ecran intermediaire ne subsiste.
    goToHub()
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        'min-h-dvh flex flex-col items-center justify-center px-6 pt-safe pb-safe relative overflow-hidden bg-bg',
        // Keep the main CTA reachable above the cookie banner on first launch.
        !consentDecided && 'pb-64'
      )}
    >
      {/* Retour au hub - seulement quand une tablee valide existe deja, pour que
          cet ecran ne devienne jamais une impasse.

          `goToHub()` et pas `goBack()`, pour la meme raison que la porte
          ci-dessus : reculer d'un cran depuis l'accueil ne tombe sur le hub que
          si l'on vient d'en sortir. */}
      {hasPlayers() && (
        <button
          onClick={() => goToHub()}
          aria-label="Revenir au hub"
          className={cn(
            'fixed top-safe left-4 z-controls',
            'w-11 h-11 rounded-control',
            'bg-surface border border-border-strong',
            'flex items-center justify-center',
            'text-ink-secondary hover:text-orange-ink hover:border-neon/50',
            'transition-colors duration-200 focus-ring-neon'
          )}
        >
          <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
        </button>
      )}

      {/* Le nom en tête d'affiche, calé à gauche sur la colonne du formulaire :
          premier écran vu, le mot se lit avant tout le reste. */}
      <motion.div variants={titleVariants} className="w-full max-w-md mt-16 sm:mt-0 mb-8 relative z-10">
        <NomAffiche />
        <p className="text-ink-secondary font-sans text-base mt-5 max-w-[24ch]">
          Les meilleurs jeux de soirée, servis au comptoir.
        </p>
      </motion.div>

      {/* La feuille d'inscription de la tablée */}
      <motion.div
        variants={floatVariants}
        className="w-full max-w-md relative z-10 bg-surface border border-ink rounded-card p-6 sm:p-8"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3 mb-5">
            <h2 className="font-display text-3xl uppercase leading-none text-ink">La tablée</h2>
            {/* Le compte est un coup de tampon, comme sur une planche de loto
                validée à l'entrée : encre rouge, cadre, légèrement de biais. */}
            <motion.div
              initial={{ opacity: 0, transform: 'rotate(-2deg) scale(1.08)' }}
              animate={{ opacity: 1, transform: 'rotate(-2deg) scale(1)' }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1], delay: 0.35 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 border-2 border-neon text-orange-ink"
            >
              <Icon name="joueurs" className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-mono tabular-nums font-bold uppercase tracking-wide">
                {validEntries.length} à la tablée
              </span>
            </motion.div>
          </div>

          {/* Player inputs */}
          <div className="space-y-3 mb-2">
            <AnimatePresence mode="popLayout">
              {entries.map((entry, index) => {
                const isExpanded = expandedIndex === index
                const hasAttributes = Boolean(entry.gender || entry.relationship)

                return (
                  <motion.div
                    key={index}
                    variants={playerInputVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="flex flex-col gap-2"
                  >
                    <div className="flex gap-3 items-center">
                      {/* Le numéro du joueur est un pion de tirage blond, chiffre rouge. */}
                      <span
                        aria-hidden="true"
                        className="jeton flex-shrink-0 w-9 h-9 text-xl"
                      >
                        {index + 1}
                      </span>

                      {/* Input */}
                      <label htmlFor={`player-${index}`} className="sr-only">
                        Nom du joueur {index + 1}
                      </label>
                      <input
                        id={`player-${index}`}
                        type="text"
                        value={entry.name}
                        onChange={(e) => updateName(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && canEnter) {
                            handleEnter()
                          }
                        }}
                        placeholder={`Joueur ${index + 1}`}
                        maxLength={20}
                        className={cn(
                          // min-w-0 : un input possede une largeur intrinseque (~20
                          // caracteres) qui empeche flex-1 de retrecir et fait
                          // deborder la ligne sur mobile.
                          'flex-1 min-w-0 min-h-[44px] px-4 rounded-control',
                          'bg-bg-raised border border-border text-ink font-sans',
                          'placeholder:text-ink-muted',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:border-neon',
                          'transition-colors'
                        )}
                      />

                      {/* Genre + statut - optionnel, replié par défaut */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                        aria-label={`Genre et statut de Joueur ${index + 1}, facultatif`}
                        aria-expanded={isExpanded}
                        className={cn(
                          'flex-shrink-0 w-11 h-11 rounded-control border transition-colors flex items-center justify-center focus-ring-neon',
                          // La pastille garde ses 36 points, la ZONE TOUCHABLE
                          // deborde par un pseudo-element. Meme motif que la
                          // pastille de regles des tuiles du hub. Ces deux
                          // boutons etaient les plus petits de l'application,
                          // sur l'ecran ou l'on tape des prenoms debout, une
                          // main occupee ; les grossir aurait alourdi une ligne
                          // deja dense.
                          // 44 POINTS POUR DE VRAI, et plus de pseudo-element.
                          // Le debord visait 44 depuis un dessin de 36 ; mesure
                          // au quart de point par `check_cibles`, la prise
                          // reelle plafonnait a 42,75 quoi qu'on elargisse -
                          // parce que les deux boutons de la ligne sont
                          // VOISINS et que leurs debords se volent la place
                          // l'un a l'autre. Empiler une rustine de plus ne
                          // pouvait pas marcher. Le champ est `flex-1`, il
                          // absorbe les huit points rendus aux deux pastilles.
                          isExpanded || hasAttributes
                            ? 'bg-neon/10 border-neon/50 text-orange-ink'
                            : 'bg-transparent border-border text-ink-muted hover:text-orange-ink hover:border-neon/50'
                        )}
                      >
                        <Icon name="curseurs" className="w-4 h-4" aria-hidden="true" />
                      </motion.button>

                      {/* Remove button */}
                      {entries.length > 2 && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeName(index)}
                          aria-label={`Retirer le joueur ${index + 1}`}
                          className="flex-shrink-0 w-11 h-11 rounded-control bg-transparent border border-border text-ink-muted hover:text-orange-ink hover:border-neon/50 transition-colors flex items-center justify-center focus-ring-neon"
                        >
                          <Icon name="fermer" className="w-4 h-4" aria-hidden="true" />
                        </motion.button>
                      )}
                    </div>

                    {/* Panneau genre / statut relationnel - facultatif et local */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-12"
                        >
                          <div className="flex flex-wrap gap-1.5 pb-1">
                            <div
                              role="group"
                              aria-label={`Genre de Joueur ${index + 1}`}
                              className="flex flex-wrap gap-1.5"
                            >
                              {GENDER_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() =>
                                    updateGender(index, entry.gender === opt.value ? undefined : opt.value)
                                  }
                                  aria-pressed={entry.gender === opt.value}
                                  aria-label={`Genre ${opt.label}, Joueur ${index + 1}`}
                                  className={cn(
                                    'min-h-[44px] px-3 rounded-pill border font-sans text-xs font-semibold transition-colors focus-ring-neon',
                                    entry.gender === opt.value
                                      ? 'bg-neon/15 border-neon text-orange-ink'
                                      : 'bg-bg-raised border-border text-ink-muted hover:border-neon/40'
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            <div
                              role="group"
                              aria-label={`Statut relationnel de Joueur ${index + 1}`}
                              className="flex flex-wrap gap-1.5"
                            >
                              {RELATIONSHIP_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() =>
                                    updateRelationship(
                                      index,
                                      entry.relationship === opt.value ? undefined : opt.value
                                    )
                                  }
                                  aria-pressed={entry.relationship === opt.value}
                                  aria-label={`Statut ${opt.label}, Joueur ${index + 1}`}
                                  className={cn(
                                    'min-h-[44px] px-3 rounded-pill border font-sans text-xs font-semibold transition-colors focus-ring-neon',
                                    entry.relationship === opt.value
                                      ? 'bg-neon/15 border-neon text-orange-ink'
                                      : 'bg-bg-raised border-border text-ink-muted hover:border-neon/40'
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <p className="text-ink-secondary text-sm font-sans mb-4">
            Genre et statut sont facultatifs, juste pour des jeux plus personnalisés. Rien ne
            quitte ton téléphone.
          </p>

          {/* Add player button */}
          {entries.length < 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* La chaise qu'on ajoute est une LIGNE VIERGE de la feuille, pas
                  un cadre en pointillés - le pointillé est l'affordance « + »
                  de n'importe quelle interface, et il ne dit rien d'un carnet
                  de tablée. Le pion vide tient la place du numéro à venir. */}
              <Button
                variant="ghost"
                onClick={addName}
                className="w-full mb-6 justify-start gap-3 border-b border-ink/25 rounded-none text-ink"
              >
                <span
                  aria-hidden="true"
                  className="jeton w-9 h-9 text-xl opacity-40"
                >
                  {entries.length + 1}
                </span>
                Une chaise de plus
              </Button>
            </motion.div>
          )}

          <div className="h-px bg-border-strong mb-6" />

          {avertiDesVides && (nomsVides > 0 || nomsEnDouble > 0) && (
            <div
              role="alert"
              className="mb-4 rounded-control border-2 border-warning bg-surface px-4 py-3 space-y-3"
            >
              {nomsVides > 0 && (
                <div>
                  <p className="font-sans font-bold text-sm text-ink flex items-center gap-2">
                    <Icon name="info" className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {nomsVides > 1
                      ? `${nomsVides} chaises sont restées sans nom`
                      : 'Une chaise est restée sans nom'}
                  </p>
                  <p className="text-ink-secondary font-sans text-xs mt-1">
                    {nomsVides > 1
                      ? 'Ces joueurs ne seront pas de la partie. Complète les cases, ou retire-les.'
                      : 'Ce joueur ne sera pas de la partie. Complète la case, ou retire-la.'}
                  </p>
                  <button
                    type="button"
                    onClick={retirerLesVides}
                    className="mt-2 min-h-[44px] px-3 inline-flex items-center gap-1.5 rounded-control border border-ink bg-surface font-sans font-bold text-xs text-ink focus-ring-neon"
                  >
                    <Icon name="supprimer" className="w-3.5 h-3.5" aria-hidden="true" />
                    {nomsVides > 1 ? 'Retirer ces chaises' : 'Retirer cette chaise'}
                  </button>
                </div>
              )}

              {nomsEnDouble > 0 && (
                <div>
                  <p className="font-sans font-bold text-sm text-ink flex items-center gap-2">
                    <Icon name="joueurs" className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {nomsEnDouble > 1
                      ? `${nomsEnDouble} prénoms sont en double`
                      : 'Deux joueurs portent le même prénom'}
                  </p>
                  <p className="text-ink-secondary font-sans text-xs mt-1">
                    Les jeux désignent les joueurs par leur prénom : à table, la consigne
                    devient intranchable.
                  </p>
                  <button
                    type="button"
                    onClick={numeroterLesDoublons}
                    className="mt-2 min-h-[44px] px-3 inline-flex items-center gap-1.5 rounded-control border border-ink bg-surface font-sans font-bold text-xs text-ink focus-ring-neon"
                  >
                    <Icon name="editer" className="w-3.5 h-3.5" aria-hidden="true" />
                    Numéroter les doublons
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Enter button */}
          <Button
            variant="primary"
            size="xl"
            onClick={handleEnter}
            disabled={!canEnter}
            className="w-full"
          >
            {avertiDesVides && (nomsVides > 0 || nomsEnDouble > 0)
              ? 'Continuer quand même'
              : 'Pousser la porte'}
            <Icon name="suivant" className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>

          {/* CE QUE LA TABLEE OUVRE, et ce qu'il lui manque.
              Cette ligne annoncait « Minimum 2 joueurs, maximum 8 » : vrai, et
              inutile. Une tablee de deux entrait en croyant avoir tout le jeu
              et trouvait un hub incomplet - le hub n'AFFICHE PAS un mode qu'on
              ne peut pas lancer, donc il manquait des jeux qu'on n'avait jamais
              vus, sans un mot d'explication nulle part. Le seuil est calcule,
              pas ecrit : voir ouvertureDeTablee. */}
          <p className="text-ink-muted text-sm text-center mt-4 font-sans" aria-live="polite">
            {!canEnter ? (
              'Ajoute au moins 2 joueurs pour continuer'
            ) : ouverture.manquants === 0 ? (
              <>
                <span className="text-ink font-bold">Les {ouverture.total} jeux sont ouverts.</span>{' '}
                Jusqu&apos;à 8 à la tablée.
              </>
            ) : (
              <>
                <span className="tabular-nums">
                  {ouverture.ouverts} jeux sur {ouverture.total}
                </span>{' '}
                avec cette tablée.{' '}
                <span className="text-ink font-bold">
                  {ouverture.manquants === 1
                    ? 'Une chaise de plus et ils s\u2019ouvrent tous.'
                    : `Encore ${ouverture.manquants} et ils s\u2019ouvrent tous.`}
                </span>
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.div variants={floatVariants} className="mt-8 text-center relative z-10">
        <p className="text-ink-secondary text-sm font-sans">
          Ces noms seront utilisés pour tous les jeux
        </p>
      </motion.div>
    </motion.div>
  )
}
