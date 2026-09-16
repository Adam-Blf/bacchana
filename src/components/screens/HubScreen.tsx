import { useEffect, useState } from 'react'
import { prechargerEcransDuMenu } from '@/utils/ecransDuMenu'
import { motion, AnimatePresence } from 'framer-motion'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'
import { Button, Icon, NomAffiche, type IconName } from '@/components/ui'
import { PremiumPaywallModal } from '@/components/premium'
import { useAppStore, useConsentStore, useEntitlementStore, useGameStore, usePromptStore } from '@/stores'
import { useCustomRulesStore } from '@/stores/customRulesStore'
import { useThemeStore, resolveTheme } from '@/stores/themeStore'
import {
  DEFAULT_BORDERLAND_OPTIONS,
  SUIT_FRENCH_NAMES,
  SUIT_RULES,
  SUIT_SYMBOLS,
  type BorderlandOptions,
} from '@/types'
import { RANKS, SUITS } from '@/core/borderland'
import { PLAYABLE_MODES, PREMIUM_CATALOG } from '@/core/engine/modeRegistry'
import { choisirModeSuivant } from '@/core/engine/sequenceur'
import { seededRng } from '@/core/engine/targeting'
import { useSoireeStore } from '@/stores/soireeStore'
import { useAvisStore, doitDemanderAvis } from '@/stores/avisStore'
import { TransitionSoiree } from '@/components/soiree/TransitionSoiree'
import { SoireeSansMode } from '@/components/soiree/SoireeSansMode'
import { DemandeAvis } from '@/components/avis'
import { FREE_PACKS } from '@/content/paquets'
import type { GameMode } from '@/core/engine/types'
import { track } from '@/lib/analytics'
import { cn } from '@/utils'
import { haptic } from '@/utils/haptic'

// L'arrivee des tuiles ne joue plus sur l'ECHELLE, et l'echelonnement est
// resserre. La grille est uniforme - treize tuiles a 184 points, mesure sur
// sept largeurs d'ecran - mais l'animation d'entree la rendait fausse pendant
// plus d'une seconde : chaque tuile passait de 0,96 a 1, decalee de 80 ms sur
// la precedente, si bien qu'au meme instant deux tuiles voisines n'avaient
// vraiment pas la meme taille. C'est ce que la tablee voit, et c'est ce qui a
// ete signale.
//
// Il reste un fondu et une montee de huit points : assez pour que la grille
// arrive, trop peu pour qu'elle donne une taille a lire.
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.025, delayChildren: 0.05 },
  },
}

const tileVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 26, stiffness: 300 },
  },
}

interface ModeLigneProps {
  /** Rang d'affichage, imprimé en tête de ligne comme un numéro de lot. */
  numero: number
  title: string
  subtitle: string
  glyph: IconName
  /** Teinte du bristol du mode (classe bg-aplat-*), posée en tranche. */
  color?: string
  onClick: () => void
  /** Ouvre les règles du mode sans lancer la partie. */
  onRules: () => void
}

// Chaque jeu est une LIGNE DE LOT, comme la liste des lots d'une affiche de
// salle des fêtes : un grand numéro rouge, le nom en capitales, une ligne de
// texte. La grille de cartons de même taille était une mise en page qu'on
// aurait pu poser sur n'importe quelle application ; une liste hiérarchisée se
// lit de haut en bas, à bout de bras, sans comparer quatorze rectangles.
//
// La couleur du bristol du mode ne remplit plus la ligne : elle en borde la
// tranche, comme la couleur d'un carton se voit sur la pile. Elle reconnaît
// un jeu d'une soirée à l'autre sans rien porter de lisible.
function ModeLigne({ numero, title, subtitle, glyph, color = 'bg-surface', onClick, onRules }: ModeLigneProps) {
  // Le bouton de règles est un FRÈRE du bouton de ligne, jamais un enfant :
  // un contrôle interactif dans un contrôle interactif est invalide en HTML
  // comme en ARIA, et un piège au clavier.
  return (
    <motion.li variants={tileVariants} className="flex items-stretch border-b border-ink/25">
      <span aria-hidden="true" className={cn('w-1.5 shrink-0', color)} />
      <button
        onClick={onClick}
        className="flex-1 min-w-0 min-h-[76px] flex items-center gap-3 pl-3 pr-2 py-3 text-left transition-colors duration-100 ease-out hover:bg-ink/5 active:bg-ink/10 focus-ring-neon"
      >
        <span
          aria-hidden="true"
          className="font-display text-[44px] leading-none text-orange-ink tabular-nums w-[1.15em] shrink-0 text-right"
        >
          {String(numero).padStart(2, '0')}
        </span>
        <span className="min-w-0 flex-1">
          <h3 className="font-display text-[25px] sm:text-[30px] uppercase leading-[0.98] text-ink text-balance">
            {title}
          </h3>
          <span className="block text-ink-secondary font-sans text-sm tv:text-2xl mt-1">{subtitle}</span>
        </span>
        <Icon name={glyph} className="w-6 h-6 text-ink-muted shrink-0" aria-hidden="true" />
      </button>
      {/* Il portait un « ? » nu, qui se lisait comme une décoration : il porte
          désormais son nom, dans sa propre case, séparée d'un filet. */}
      <button
        onClick={onRules}
        aria-label={`Voir les règles de ${title}`}
        className="shrink-0 w-[70px] tv:w-32 flex flex-col items-center justify-center gap-1 border-l border-ink/25 text-ink-secondary hover:text-orange-ink font-sans font-bold text-sm tv:text-2xl uppercase tracking-wider transition-colors focus-ring-neon"
      >
        <Icon name="livre" className="w-4 h-4" aria-hidden="true" />
        Règles
      </button>
    </motion.li>
  )
}

// Une case de la barre du hub : icône au-dessus, libellé dessous, séparée de
// sa voisine par le trait d'une case de carton.
// Les libellés passent à 14 points, plancher de lisibilité du produit. À cette
// taille trois libellés et deux pictogrammes ne tiennent plus sur une ligne de
// 320 points : la case laisse donc le mot passer à la ligne (`leading-tight`,
// `text-balance`) au lieu de rétrécir la police. Une case plus haute coûte
// moins qu'un libellé illisible.
const CASE_MENU =
  'min-h-[52px] tv:min-h-[92px] flex flex-col items-center justify-center gap-1 px-0.5 border-l border-ink first:border-l-0 text-ink font-sans font-bold text-sm tv:text-2xl leading-tight text-balance text-center uppercase tracking-wide transition-colors duration-100 hover:bg-ink/5 active:bg-ink/10 focus-ring-neon'

export function HubScreen() {
  // Les cinq ecrans du menu sont tires DES L'ARRIVEE au hub, au repos du
  // navigateur. Sans ca, `AnimatePresence` en mode `wait` ne monte l'ecran
  // d'arrivee qu'une fois la sortie finie, donc le reseau attendait
  // l'animation au lieu de travailler pendant : 1900 ms a froid contre
  // 1340 ms a chaud. Voir prechargerEcrans.ts.
  useEffect(() => {
    prechargerEcransDuMenu()
  }, [])

  const { navigateTo, setActiveMode, showModeRules } = useAppStore()
  const { players, gameOptions, setGameOptions, initGame } = useGameStore()
  const isPremium = useEntitlementStore((s) => s.isPremium)
  const { startSession } = usePromptStore()
  const consentDecided = useConsentStore((s) => s.hasValidConsent())

  const [pickerMode, setPickerMode] = useState<GameMode | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [borderlandOptionsOpen, setBorderlandOptionsOpen] = useState(false)
  const [draftOptions, setDraftOptions] = useState<BorderlandOptions>({
    ...DEFAULT_BORDERLAND_OPTIONS,
    ...gameOptions,
  })

  // The pack picker overlay closes on hardware back / Escape before leaving the hub.
  useBackClose(pickerMode !== null, () => setPickerMode(null), 'pack-picker')
  useKeyboard({ Escape: () => setPickerMode(null) }, pickerMode !== null)
  useBackClose(borderlandOptionsOpen, () => setBorderlandOptionsOpen(false), 'borderland-options')
  useKeyboard({ Escape: () => setBorderlandOptionsOpen(false) }, borderlandOptionsOpen)

  const pickerDef = pickerMode ? PLAYABLE_MODES.find((m) => m.id === pickerMode) : null
  const pickerFreePacks = pickerMode ? FREE_PACKS.filter((p) => p.pack.mode === pickerMode) : []
  const pickerPremiumEntries = pickerMode
    ? PREMIUM_CATALOG.filter((p) => p.mode === pickerMode)
    : []

  const handlePlayBorderland = () => {
    // Le spread des defaults absorbe les options persistées par d'anciennes versions.
    setDraftOptions({ ...DEFAULT_BORDERLAND_OPTIONS, ...gameOptions })
    setBorderlandOptionsOpen(true)
  }

  // Taille du paquet résultant des options en cours d'édition (0 = combinaison invalide).
  const draftDeckSize =
    (SUITS.length - draftOptions.excludedSuits.length) *
      (RANKS.length - draftOptions.excludedRanks.length) *
      draftOptions.deckCount +
    (draftOptions.jokers ? 2 * draftOptions.deckCount : 0)

  const launchBorderland = () => {
    haptic('medium')
    track({ name: 'mode_started', props: { mode: 'borderland' } })
    setGameOptions(draftOptions)
    setBorderlandOptionsOpen(false)
    // Le Borderland est le SEUL mode qui se reconnaissait a l'ABSENCE de mode
    // actif. Il ne se declarait donc jamais, et le routeur affichait le dernier
    // mode declare : choisir Borderland apres une autre partie ouvrait l'ecran
    // de cette autre partie. Le trou etait comble par la remise a zero au
    // passage sur le hub ; depuis que le mode actif est repris apres un
    // rafraichissement, il ne l'est plus toujours. Un flux qui se deduit d'un
    // trou casse des que quelque chose remplit le trou.
    setActiveMode('borderland')
    // setGameOptions et initGame sont synchrones sur le même store : initGame lit
    // les options fraîches via get().
    initGame()
    navigateTo('game')
  }

  /** Rend vrai quand la partie a REELLEMENT demarre. Voir `lancerSansChoix`. */
  const startPromptMode = (mode: GameMode, packId: string): boolean => {
    const pack = FREE_PACKS.find((p) => p.pack.id === packId)
    if (!pack) return false
    haptic('light')
    track({ name: 'mode_started', props: { mode, pack: packId } })
    // Les règles perso actives pour ce mode se mélangent au deck du pack.
    const customItems = useCustomRulesStore.getState().getPromptItemsFor(mode)
    startSession(mode, pack, players, customItems)
    setActiveMode(mode)
    setPickerMode(null)
    navigateTo('game')
    return true
  }

  // Un jeu qui ne peut pas se lancer avec la tablee actuelle n'est pas affiche du
  // tout : proposer une tuile qui refuse de demarrer est une fausse promesse.
  const tileModes = PLAYABLE_MODES.filter((m) => m.id !== 'borderland')
  const openModes = tileModes.filter((m) => players.length >= m.minPlayers)
  const lockedByPlayers = tileModes.filter((m) => players.length < m.minPlayers)
  const nextUnlockAt = lockedByPlayers.length
    ? Math.min(...lockedByPlayers.map((m) => m.minPlayers))
    : 0

  const handleTileClick = (mode: GameMode) => {
    const def = PLAYABLE_MODES.find((m) => m.id === mode)
    if (!def) return

    if (players.length < def.minPlayers) {
      setWarning(`Il faut au moins ${def.minPlayers} joueurs pour lancer ${def.title}.`)
      return
    }
    setWarning(null)

    if (mode === 'borderland') {
      handlePlayBorderland()
      return
    }

    // Un mode EMBARQUE porte sa logique dans son ecran et n'a aucun pack a
    // choisir : il se lance directement. On le DEDUIT du registre au lieu de
    // l'enumerer - cette condition listait six modes a la main, et Le Faux
    // Frere, ajoute le 2026-08-30, tombait donc dans le chemin des packs,
    // n'en trouvait aucun, et le clic ne faisait RIEN. Pas d'erreur, pas de
    // message : la tuile ne repondait simplement pas.
    const estEmbarque = def.freePackIds.length === 0 && !def.hasPremiumPacks
    if (estEmbarque) {
      haptic('light')
      track({ name: 'mode_started', props: { mode } })
      setActiveMode(mode)
      navigateTo('game')
      return
    }

    const freePacks = FREE_PACKS.filter((p) => p.pack.mode === mode)
    const premiumEntries = PREMIUM_CATALOG.filter((p) => p.mode === mode)

    if (freePacks.length === 1 && premiumEntries.length === 0) {
      startPromptMode(mode, freePacks[0].pack.id)
      return
    }

    setPickerMode(mode)
  }

  const themePreference = useThemeStore((s) => s.preference)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const isDark = resolveTheme(themePreference) === 'dark'

  // ---------------------------------------------------------------- soiree
  const soiree = useSoireeStore()
  const [demandeAvisOuverte, setDemandeAvisOuverte] = useState(false)

  /**
   * Arrete l'enchainement, et c'est le seul endroit ou l'on sait qu'une soiree
   * vient de se terminer.
   *
   * Le seuil de deux modes evite de compter comme « soiree » un enchainement lance
   * puis abandonne aussitot - on ne demande pas une note a quelqu'un qui vient
   * d'ouvrir l'application.
   *
   * PLACE PROVISOIRE. « Choisir nous-memes » est aujourd'hui la seule sortie de
   * l'enchainement, faute d'ecran de fin de soiree : celui-ci arrive avec US2
   * (taches T018 a T021), et le declencheur devra y demenager. Les conditions
   * d'eligibilite, elles, vivent deja dans avisStore et ne bougeront pas.
   */
  const arreterSoiree = () => {
    soiree.arreter()
    if (soiree.modesJoues.length < 2) return

    const avis = useAvisStore.getState()
    avis.soireeTerminee()
    const maintenant = Date.now()
    if (!doitDemanderAvis(useAvisStore.getState(), maintenant)) return
    useAvisStore.getState().demandeAffichee(maintenant)
    setDemandeAvisOuverte(true)
  }

  /**
   * Lance un mode SANS jamais demander de choix. C'est la difference avec
   * `handleTileClick` : quand un mode a plusieurs paquets gratuits, le hub ouvre
   * un selecteur. Au milieu d'un enchainement, ce selecteur serait exactement le
   * frottement que la fonctionnalite supprime, donc on prend le premier paquet
   * accessible.
   */
  const lancerSansChoix = (mode: GameMode): boolean => {
    if (mode === 'borderland') {
      launchBorderland()
      return true
    }
    const paquets = FREE_PACKS.filter((p) => p.pack.mode === mode)
    if (paquets.length > 0) {
      return startPromptMode(mode, paquets[0].pack.id)
    }
    haptic('light')
    track({ name: 'mode_started', props: { mode } })
    setActiveMode(mode)
    navigateTo('game')
    return true
  }

  /**
   * La proposition de l'enchainement est ECRITE dans le magasin, jamais
   * derivee du rendu.
   *
   * Elle vivait dans un `useMemo` dependant de la soiree, de l'effectif et de
   * l'abonnement. Le probleme n'etait pas la memoisation, c'est que ces faits
   * changent PENDANT le lancement : marquer le mode comme joue suffisait a
   * redonner un autre mode, et l'ecran se rendait avec ce nouveau mode a
   * l'instant ou le doigt touchait « On y va ». La tablee lisait un jeu, un
   * autre partait.
   *
   * Cet effet ne calcule que lorsqu'il n'y a RIEN a afficher. Une fois ecrite,
   * la proposition ne bouge que sur un geste explicite.
   */
  useEffect(() => {
    if (!soiree.enchainementActif || soiree.demarreeLe === null) return
    if (soiree.proposition !== null) return

    const choix = choisirModeSuivant(
      {
        demarreeLe: soiree.demarreeLe,
        modesJoues: soiree.modesJoues,
        derniersModes: soiree.derniersModes,
      },
      players.length,
      PLAYABLE_MODES,
      Date.now(),
      // La graine derive de l'avancement reel de la soiree : deux tirages au
      // meme point rendent le meme mode, ce qui rend la sequence rejouable en
      // test sans la rendre previsible d'une soiree a l'autre.
      seededRng(`${soiree.demarreeLe}-${soiree.derniersModes.length}-${soiree.modesJoues.length}`),
      isPremium,
    )

    soiree.proposer(
      choix.type === 'mode'
        ? { id: choix.id, secondTour: choix.secondTour }
        : { id: null, secondTour: false },
      Date.now(),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    soiree.enchainementActif,
    soiree.demarreeLe,
    soiree.proposition,
    soiree.modesJoues,
    soiree.derniersModes,
    players.length,
    isPremium,
  ])

  const proposition = soiree.enchainementActif ? soiree.proposition : null
  const modePropose = proposition?.id
    ? PLAYABLE_MODES.find((m) => m.id === proposition.id) ?? null
    : null

  if (proposition && modePropose) {
    return (
      <TransitionSoiree
        mode={modePropose}
        secondTour={proposition.secondTour}
        rang={soiree.modesJoues.length + 1}
        onDemarrer={() => {
          // On LANCE d'abord, on enregistre ensuite. L'ordre inverse faisait
          // avancer la soiree meme quand le lancement echouait en silence, et
          // l'ecran suivant annoncait alors un autre jeu - sans que le premier
          // ait jamais demarre.
          if (!lancerSansChoix(modePropose.id)) return
          soiree.demarrerMode(modePropose.id, Date.now())
        }}
        onPasser={() => soiree.passerMode(modePropose.id, Date.now())}
        onArreter={arreterSoiree}
      />
    )
  }

  // Aucun mode a proposer, typiquement une tablee d'une personne. Sans cette
  // branche l'enchainement restait actif et le hub se reaffichait a l'identique :
  // le bouton semblait casse. Exigence T016.
  if (proposition && proposition.id === null) {
    return (
      <SoireeSansMode
        effectif={players.length}
        onAjouterJoueurs={() => {
          soiree.arreter()
          navigateTo('welcome')
        }}
        onChoisirSoiMeme={arreterSoiree}
      />
    )
  }

  return (
    // PAS D'ANIMATION DE SORTIE ICI : le cadre de transition d'`App.tsx` en
    // porte deja une. Les deux s'empilaient - deux fondus et deux glissements
    // pour un seul changement d'ecran - et `AnimatePresence` en mode `wait`
    // attend la FIN des deux. Ce ressort-ci, a raideur 200, mettait 470 ms a
    // se poser : c'est lui qui faisait tout le temps d'attente une fois le
    // cadre accelere. Mesure au chronometre dans la page, jalon par jalon.
    // L'animation d'ENTREE reste : elle s'ajoute au cadre sans le retarder.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="h-dvh flex flex-col relative overflow-hidden bg-bg"
    >
      <header className="shrink-0 pt-safe-4 sm:pt-safe-8 pb-3 px-4 sm:px-6 max-w-lg mx-auto w-full relative z-10">
        {/* `flex-wrap` : sous 360 points, le nom d'affiche et le compte de la
            tablée ne tiennent pas sur une ligne, et le compte partait hors du
            cadre. Il passe dessous plutôt que de déborder. */}
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <NomAffiche taille="petit" />
          <button
            type="button"
            onClick={() => navigateTo('welcome')}
            className="min-h-[44px] -mb-1 inline-flex items-center gap-1.5 whitespace-nowrap focus-ring-neon rounded-control"
          >
            <Icon name="joueurs" className="w-4 h-4 text-ink-secondary" aria-hidden="true" />
            <span className="font-mono tabular-nums text-sm font-bold text-ink">
              {/* En francais zero est un singulier : « 0 joueur », pas « 0 joueurs ».
                  Le pluriel commence a 2, d'ou `> 1` et non `!== 1`. */}
              {players.length} joueur{players.length > 1 ? 's' : ''}
            </span>
            <span className="text-ink-muted" aria-hidden="true">-</span>
            <span className="text-orange-ink font-bold text-sm underline underline-offset-2">Modifier</span>
          </button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-ink-secondary font-sans text-sm tv:text-3xl mt-3 text-balance"
        >
          {/* Le compte suit les tuiles REELLEMENT affichees : le Borderland,
              toujours en tete d'affiche, plus les modes ouverts a cette tablee.
              Annoncer la taille du catalogue promettait des jeux que l'ecran ne
              montrait pas. */}
          Au menu ce soir : {openModes.length + 1} jeu{openModes.length > 0 ? 'x' : ''}, servis
          sans modération de mauvaise foi.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-3"
        >
          <nav
            aria-label="Menu du hub"
            className="grid grid-cols-[1fr_1fr_1fr_52px_52px] border-y border-ink"
          >
            <button type="button" onClick={() => navigateTo('custom-rules')} className={CASE_MENU}>
              <Icon name="editer" className="w-4 h-4" aria-hidden="true" />
              Mes règles
            </button>
            {/* Le catalogue. Le hub n'AFFICHE PAS un mode que la tablee ne
                peut pas lancer - bonne regle, mais a deux joueurs six jeux
                n'existaient alors nulle part : ni grises, ni annonces, absents.
                On ne pouvait ni savoir qu'ils existaient, ni lire leurs regles,
                ni apprendre qu'une chaise de plus les ouvrait. */}
            <button type="button" onClick={() => navigateTo('catalogue')} className={CASE_MENU}>
              <Icon name="livre" className="w-4 h-4" aria-hidden="true" />
              Les jeux
            </button>
            {/* Les scores en UN tap depuis le hub.
                Ils vivaient derriere l'engrenage, dans Reglages : deux taps et
                une intention qu'on n'a pas - on ouvre des reglages pour regler
                quelque chose, pas pour demander « on en est ou ? ». C'est la
                question la plus posee autour d'une table, et la seule reponse
                etait l'addition de fin de partie, qu'il fallait attendre. */}
            <button type="button" onClick={() => navigateTo('palmares')} className={CASE_MENU}>
              <Icon name="medaille" className="w-4 h-4" aria-hidden="true" />
              Les scores
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className={CASE_MENU}
            >
              {isDark ? (
                <Icon name="soleil" className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Icon name="lune" className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('settings')}
              aria-label="Réglages"
              className={CASE_MENU}
            >
              <Icon name="reglages" className="w-5 h-5" aria-hidden="true" />
            </button>
          </nav>
        </motion.div>

        {warning && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-warning font-mono text-sm mt-3 uppercase tracking-wide"
          >
            {warning}
          </motion.p>
        )}
      </header>

      {/* Un seul geste, avant les quatorze tuiles. A vingt-trois heures, choisir
          parmi quatorze n'est pas une liberte, c'est un frottement : une tablee
          qui hesite trois minutes devant un menu passe a autre chose.
          Il vit HORS de la zone qui defile : il etait pose sous la grande tuile
          du Borderland, donc sous la ligne de flottaison sur un telephone de
          360 points - l'action principale de l'application demandait de faire
          defiler pour exister. */}
      {openModes.length > 0 && (
        <div className="shrink-0 px-4 sm:px-6 pb-3 max-w-lg mx-auto w-full relative z-10">
          <button
            type="button"
            onClick={() => {
              haptic('medium')
              track({ name: 'soiree_lancee' })
              soiree.demarrer(Date.now())
            }}
            className="w-full min-h-[68px] rounded-control bg-neon text-sur-surimpression font-display uppercase text-[36px] sm:text-[40px] leading-none px-5 shadow-gravure transition-[translate,box-shadow] duration-100 ease-out active:translate-y-0.5 active:shadow-none focus-ring-neon inline-flex items-center justify-between gap-3"
          >
            Lance la soirée
            <Icon name="jouer" className="w-7 h-7" aria-hidden="true" />
          </button>
        </div>
      )}

      <motion.main
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-6 max-w-lg mx-auto w-full relative z-10"
      >
        <motion.div variants={tileVariants} className="mb-4">
          <button
            onClick={() => handleTileClick('borderland')}
            className={cn(
              // Le Borderland est le panneau du BOULIER : le pourpre du logo,
              // sombre dans les trois themes. `contexte-profond` redefinit les
              // jetons dans sa portee, donc tout ce qu'il porte lit ses encres a
              // lui. Le rouge jeton reste au seul bouton « Lance la soiree ».
              'contexte-profond relative overflow-hidden rounded-card text-left w-full',
              'p-5 sm:p-6 transition-[translate] duration-100 ease-out focus-ring-neon',
              'active:translate-y-0.5'
            )}
          >
            {/* Le pique, à l'échelle de l'affiche et coupé par le bord : un seul
                signe très grand plutôt qu'une icône posée au-dessus du titre. */}
            <Icon
              name="pique"
              className="absolute -right-10 -bottom-12 w-52 h-52 text-ink/10 pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10">
              {/* ENCRE `sur-surimpression`, jamais `tile-ink`.
                  L'aplat d'accent n'est pas un aplat fixe : il vaut pourpre
                  #5B2C87 en theme clair et jaune #FFD029 en sombre. L'encre fixe
                  posee dessus donnait #2A1140 sur #5B2C87, soit 1,72:1 - le titre
                  du jeu vedette, en 36 points, illisible sur l'ecran le plus
                  regarde de l'application, et cela dans le theme par defaut.
                  `sur-surimpression` bascule AVEC l'aplat : creme sur le pourpre
                  (9,31:1), encre sombre sur le jaune (11,42:1).
                  La regle etait deja ecrite dans Button.tsx ; c'est cette tuile
                  qui ne l'appliquait pas. `check_tile_ink.mjs` la fait respecter
                  desormais - il classait `bg-neon` parmi les fonds clairs
                  invariants et surveillait donc exactement l'inverse. */}
              <h2 className="font-display text-[58px] sm:text-[68px] uppercase leading-[0.82] text-ink">
                Borderland
              </h2>
              <p className="text-ink-secondary font-mono text-sm mt-3 tabular-nums font-bold">
                52 cartes - 4 règles - 0 pitié.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 min-h-[40px] rounded-control bg-neon text-sur-surimpression font-bold text-sm uppercase tracking-wide">
                <Icon name="jouer" className="w-4 h-4" aria-hidden="true" />
                Jouer
              </div>
            </div>
          </button>

          {/* Le bouton de regles etait DANS le bouton de tuile. React le
              signalait a chaque rendu : « <button> cannot be a descendant of
              <button> ». C'est du HTML invalide, et le `stopPropagation` qui
              tenait l'ensemble ne repare ni le parseur ni le lecteur d'ecran.
              Il est desormais frere de la tuile. */}
          <button
            onClick={() => navigateTo('rules')}
            className="mt-2 min-h-[44px] px-3 inline-flex items-center gap-1.5 text-ink-secondary hover:text-orange-ink font-sans text-sm rounded-control focus-ring-neon transition-colors"
          >
            <Icon name="livre" className="w-4 h-4" aria-hidden="true" />
            Règles du Borderland
          </button>
        </motion.div>

        <ul className="border-t border-ink mb-4">
          {openModes.map((mode, i) => (
            <ModeLigne
              key={mode.id}
              numero={i + 1}
              title={mode.title}
              subtitle={mode.subtitle}
              glyph={mode.icon}
              color={mode.tileColor}
              onClick={() => handleTileClick(mode.id)}
              onRules={() => { haptic('light'); showModeRules(mode.id) }}
            />
          ))}
        </ul>

        {/* Les jeux hors de portee de la tablee ne sont pas affiches : on annonce
            juste combien s'ouvrent, et a partir de combien de joueurs. */}
        {lockedByPlayers.length > 0 && (
          <button
            onClick={() => { haptic('light'); navigateTo('welcome') }}
            className="w-full mb-4 rounded-card border-2 border-dashed border-border-strong/40 px-4 py-3 text-center focus-ring-neon hover:border-neon transition-colors"
          >
            <span className="block font-mono text-sm uppercase tracking-widest text-ink-secondary">
              {lockedByPlayers.length} jeu{lockedByPlayers.length > 1 ? 'x' : ''} de plus
            </span>
            <span className="block font-sans text-sm text-ink mt-0.5">
              à partir de {nextUnlockAt} joueurs - ajouter du monde à la tablée
            </span>
          </button>
        )}

      </motion.main>

      {/* Quatre liens legaux sur deux rangees mangeaient un quart d'un ecran de
          360 points, en permanence, pour des pages qu'on ouvre une fois. Ils
          vivent dans les Reglages, ou ils ont deja leur section, et le hub garde
          la seule ligne qui doit rester sous les yeux de la tablee.
          Rien n'est rendu moins accessible : les Reglages sont a un appui, et le
          bandeau de cookies pointe deja directement la politique. */}
      <footer
        className={cn(
          'shrink-0 py-3 pb-safe-2 text-center relative z-10 px-6',
          // While the cookie banner is on screen, keep the footer links reachable above it.
          !consentDecided && 'pb-64'
        )}
      >
        <p className="text-ink-secondary text-sm font-sans">
          Jouez responsable : Bacchana veille sur sa tablée.{' '}
          <button
            onClick={() => navigateTo('settings')}
            // Mesure a 67 x 17 : un lien de pied de page reste un lien, et se
            // rate au doigt. La zone touchable monte a 44 points de haut sans
            // ecarter la ligne de texte qui l'entoure.
            className="underline underline-offset-2 hover:text-orange-ink transition-colors focus-ring-neon relative after:absolute after:-inset-x-2 after:-inset-y-4 after:content-['']"
          >
            Infos légales
          </button>
        </p>
      </footer>

      {/* Pack picker overlay */}
      <AnimatePresence>
        {pickerMode && pickerDef && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-overlay bg-bg flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={`Choix du pack pour ${pickerDef.title}`}
          >
            <header className="pt-safe-6 px-6 pb-4 flex items-center gap-3 border-b border-border">
              <Button variant="ghost" onClick={() => setPickerMode(null)} aria-label="Retour au hub">
                <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
              </Button>
              <h2 className="font-display text-2xl uppercase tracking-tight text-ink">
                {pickerDef.title}
              </h2>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 max-w-lg mx-auto w-full">
              {pickerFreePacks.map((pack) => (
                <button
                  key={pack.pack.id}
                  onClick={() => startPromptMode(pickerDef.id, pack.pack.id)}
                  className="w-full text-left rounded-card p-5 bg-surface border border-border-strong hover:border-neon/40 transition-colors focus-ring-neon"
                >
                  <h3 className="font-display text-lg uppercase tracking-tight text-ink">
                    {pack.pack.title}
                  </h3>
                  <p className="text-ink-secondary font-sans text-sm mt-1">{pack.pack.subtitle}</p>
                  <p className="text-ink-muted font-mono text-xs mt-2 tabular-nums">
                    {pack.items.length} carte{pack.items.length > 1 ? 's' : ''}
                  </p>
                </button>
              ))}

              {pickerPremiumEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setShowPremiumModal(true)}
                  // opacity-70 sur tout le conteneur assombrissait le TEXTE en même
                  // temps que le fond (dimme les deux vers l'arrière-plan de la
                  // même façon) : ink-secondary tombait à 3.95:1, ink-muted à
                  // 2.76:1, le badge premium à 2.83:1 - tous sous l'AA (audit
                  // visuel 2026-08-05). Le statut "verrouillé" reste lisible sans
                  // opacité : bg-bg-raised (déjà plus sourd que bg-surface des
                  // packs gratuits) + le badge "Premium" suffisent, et le texte
                  // reste à pleine opacité (paires déjà vérifiées, marge réelle).
                  className="w-full text-left rounded-card p-5 bg-bg-raised border border-border relative overflow-hidden focus-ring-neon"
                  aria-label={`${entry.title} - contenu premium verrouillé`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg uppercase tracking-tight text-ink-secondary">
                        {entry.title}
                      </h3>
                      <p className="text-ink-muted font-sans text-sm mt-1">{entry.subtitle}</p>
                      <p className="text-ink-muted font-mono text-xs mt-2 tabular-nums">
                        {entry.itemCount} carte{entry.itemCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-premium/10 border border-premium/40 text-premium text-[10px] font-mono uppercase tracking-widest">
                      <Icon name="cadenas" className="w-3 h-3" aria-hidden="true" />
                      Premium
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options du Borderland : paquets, jokers, mode aléatoire infini (premium) */}
      <AnimatePresence>
        {borderlandOptionsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-overlay bg-black/60 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="Options du Borderland"
            onClick={() => setBorderlandOptionsOpen(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-bg rounded-t-card sm:rounded-card border-t border-border sm:border sm:border-ink shadow-gravure-forte p-5 pb-safe-6"
            >
              <h2 className="font-display text-lg uppercase tracking-tight text-ink mb-4">
                Borderland - options
              </h2>

              <p className="text-ink font-sans font-bold text-sm mb-2 flex items-center gap-2">
                <Icon name="paquets" className="w-4 h-4" aria-hidden="true" />
                Nombre de paquets
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {([1, 2, 3] as const).map((count) => (
                  <button
                    key={count}
                    onClick={() => setDraftOptions({ ...draftOptions, deckCount: count })}
                    aria-pressed={draftOptions.deckCount === count}
                    className={cn(
                      // Le cerne suit le fond, branche par branche : aucun jeton unique
                      // ne tient les deux etats, l'encre disparait sur le jaune en
                      // theme sombre et l'encre de tuile disparait sur la surface.
                      'min-h-[48px] rounded-control border-2 font-mono font-bold tabular-nums transition-colors focus-ring-neon',
                      draftOptions.deckCount === count
                        ? 'bg-aplat-1 text-tile-ink border-tile-ink shadow-gravure'
                        : 'bg-surface text-ink border-ink'
                    )}
                  >
                    {count} <span className="font-sans font-medium text-xs">({count * 52} cartes)</span>
                  </button>
                ))}
              </div>

              <label className="flex items-center justify-between rounded-control bg-surface border border-ink px-4 py-3 mb-3 cursor-pointer min-h-[52px]">
                <span className="font-sans font-bold text-sm text-ink flex items-center gap-2">
                  <Icon name="etincelles" className="w-4 h-4" aria-hidden="true" />
                  Jokers (2 par paquet)
                </span>
                <input
                  type="checkbox"
                  checked={draftOptions.jokers}
                  onChange={(e) => setDraftOptions({ ...draftOptions, jokers: e.target.checked })}
                  className="w-5 h-5 accent-neon"
                  aria-label="Inclure les jokers"
                />
              </label>

              <button
                onClick={() => {
                  if (!isPremium) {
                    setShowPremiumModal(true)
                    return
                  }
                  setDraftOptions({ ...draftOptions, infinite: !draftOptions.infinite })
                }}
                aria-pressed={draftOptions.infinite}
                className={cn(
                  'w-full flex items-center justify-between rounded-control border-2 px-4 py-3 mb-4 min-h-[52px] focus-ring-neon transition-colors',
                  draftOptions.infinite && isPremium
                    ? 'bg-aplat-4 text-tile-ink border-tile-ink shadow-gravure'
                    : 'bg-surface text-ink border-ink'
                )}
              >
                <span className="font-sans font-bold text-sm flex items-center gap-2 text-left">
                  <Icon name="infini" className="w-4 h-4" aria-hidden="true" />
                  Cartes aléatoires à l'infini
                </span>
                {isPremium ? (
                  <span className="font-mono text-xs uppercase">{draftOptions.infinite ? 'Activé' : 'Off'}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-surface border border-ink text-ink text-[10px] font-mono uppercase tracking-widest">
                    <Icon name="cadenas" className="w-3 h-3" aria-hidden="true" />
                    Premium
                  </span>
                )}
              </button>

              {/* Composition du paquet : retirer des couleurs (et leur règle) ou des valeurs */}
              <p className="text-ink font-sans font-bold text-sm mb-2 flex items-center gap-2">
                <Icon name="curseurs" className="w-4 h-4" aria-hidden="true" />
                Composition du paquet
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {SUITS.map((suit) => {
                  const excluded = draftOptions.excludedSuits.includes(suit)
                  const red = suit === 'hearts' || suit === 'diamonds'
                  return (
                    <button
                      key={suit}
                      onClick={() =>
                        setDraftOptions({
                          ...draftOptions,
                          excludedSuits: excluded
                            ? draftOptions.excludedSuits.filter((s) => s !== suit)
                            : [...draftOptions.excludedSuits, suit],
                        })
                      }
                      aria-pressed={!excluded}
                      aria-label={`${excluded ? 'Réintégrer' : 'Retirer'} les ${SUIT_FRENCH_NAMES[suit]}s (règle ${SUIT_RULES[suit].title})`}
                      className={cn(
                        'min-h-[48px] rounded-control border-2 border-ink px-3 flex items-center gap-2 font-sans font-bold text-sm transition-colors focus-ring-neon',
                        excluded ? 'bg-surface opacity-45 line-through' : 'bg-surface shadow-gravure'
                      )}
                    >
                      {/* danger et non card-red : card-red est le pip fixe d'une carte
                          a jouer, juste sur bg-card-face blanc mais a environ 2.5:1
                          sur bg-surface en theme sombre. danger est le rouge
                          semantique theme-aware, identique en clair. */}
                      <span className={cn('text-xl leading-none', red ? 'text-danger' : 'text-ink')} aria-hidden="true">
                        {SUIT_SYMBOLS[suit]}
                      </span>
                      <span className="truncate">{SUIT_RULES[suit].title}</span>
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {RANKS.map((rank) => {
                  const excluded = draftOptions.excludedRanks.includes(rank)
                  return (
                    <button
                      key={rank}
                      onClick={() =>
                        setDraftOptions({
                          ...draftOptions,
                          excludedRanks: excluded
                            ? draftOptions.excludedRanks.filter((r) => r !== rank)
                            : [...draftOptions.excludedRanks, rank],
                        })
                      }
                      aria-pressed={!excluded}
                      aria-label={`${excluded ? 'Réintégrer' : 'Retirer'} les ${rank === 'A' ? 'As' : rank}`}
                      className={cn(
                        'min-w-[40px] min-h-[40px] px-2 rounded-control border-2 font-mono font-bold text-sm tabular-nums transition-colors focus-ring-neon',
                        excluded
                          ? 'bg-surface text-ink border-ink opacity-45 line-through'
                          : 'bg-aplat-1 text-tile-ink border-tile-ink shadow-gravure'
                      )}
                    >
                      {rank}
                    </button>
                  )
                })}
              </div>
              <p className="font-mono text-xs text-ink-muted tabular-nums mb-5" aria-live="polite">
                {draftDeckSize > 0
                  ? `${draftDeckSize} cartes dans le paquet`
                  : 'Paquet vide - réintègre au moins une couleur et une valeur.'}
              </p>

              <Button
                variant="primary"
                size="xl"
                className="w-full"
                onClick={launchBorderland}
                disabled={draftDeckSize === 0}
              >
                <Icon name="jouer" className="w-5 h-5 mr-2 fill-current" aria-hidden="true" />
                C'est parti !
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumPaywallModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

      {/* Demandee seulement a la fin d'une vraie soiree, jamais pendant un mode.
          Ne s'affiche pas du tout tant qu'aucune fiche store n'est configuree. */}
      <DemandeAvis open={demandeAvisOuverte} onFermer={() => setDemandeAvisOuverte(false)} />
    </motion.div>
  )
}
