import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, ConfirmDialog, Icon } from '@/components/ui'
import { useAppStore } from '@/stores'
import {
  classementPalmares,
  usePalmaresStore,
  type LignePalmares,
} from '@/stores/palmaresStore'
import { useNightStore } from '@/stores/nightStore'
import { marqueDeRang, meneurs, rangsDuClassement, type Rang } from '@/core/classement'
import { enumerer } from '@/core/text/francais'
import { cn } from '@/utils'
import { getModeDefinition } from '@/core/engine/modeRegistry'

/**
 * L'écran des scores - refait le 2026-09-14.
 *
 * CE QU'IL REMPLACE, ET POURQUOI. Il n'affichait qu'un seul registre, le
 * palmarès de toujours, et trois défauts s'y cumulaient :
 *
 *  1. UN SEUL CHIFFRE, ET ON NE SAVAIT PAS LEQUEL. Le gros nombre à droite
 *     était l'ardoise - les pénalités. Sous un titre qui dit « palmarès » et à
 *     côté d'un rang « 1 », rien ne disait si la première place se gagnait ou
 *     se subissait. Les palmes, qui sont la seule chose qui se GAGNE, étaient
 *     noyées dans une ligne de texte entre deux tirets.
 *  2. LE CRITÈRE DE CLASSEMENT ÉTAIT INVISIBLE. Deux lignes à « 19 » côte à
 *     côte, numérotées 2 et 3, sans qu'aucun mot n'explique que c'est le
 *     nombre de parties qui départage. Ça se lit comme un bogue d'affichage,
 *     et c'est exactement ce que l'ex aequo avait été ajouté pour éviter.
 *  3. LA SOIRÉE EN COURS N'ÉTAIT NULLE PART. L'ardoise du soir existe dans le
 *     magasin depuis toujours, mais ne s'affichait qu'une fois, sur l'addition
 *     de fin de partie. Au milieu d'une soirée, « on en est où ? » n'avait
 *     aucune réponse - la question la plus posée autour d'une table.
 *
 * D'où DEUX REGISTRES et un chiffre nommé. « Ce soir » ouvre par défaut quand
 * une soirée est en cours : c'est ce qu'on vient chercher.
 *
 * CE QUE CET ÉCRAN NE FAIT PAS. Pas de podium. Le classement se fait à
 * l'ardoise, donc un podium couronnerait celui qui a le plus bu - ce que la
 * règle 1.4.3 de l'App Store interdit d'encourager, et ce que `check_alcohol`
 * surveille dans le texte sans pouvoir le voir dans une mise en page. Le
 * meneur est signalé, pas célébré.
 */

type Registre = 'soir' | 'toujours'

/** Une ligne d'ardoise du soir, mise à la forme que le classement sait ranger. */
interface LigneSoir {
  id: string
  nom: string
  penalites: number
  parties: number
}

function classementDuSoir(ledger: Record<string, { name: string; total: number; games: number }>): LigneSoir[] {
  return Object.entries(ledger)
    .map(([id, e]) => ({ id, nom: e.name, penalites: e.total, parties: e.games }))
    .sort((a, b) => b.penalites - a.penalites || b.parties - a.parties || a.nom.localeCompare(b.nom, 'fr'))
}

/** Le chiffre et son nom, toujours ensemble. Un nombre nu ne dit pas ce qu'il compte. */
function Chiffre({
  valeur,
  legende,
  surAplat,
  fort = false,
}: {
  valeur: number
  legende: string
  surAplat: boolean
  fort?: boolean
}) {
  return (
    <div className="text-center shrink-0">
      <p className={cn('font-mono font-bold tabular-nums leading-none', fort ? 'text-2xl' : 'text-lg')}>
        {valeur}
      </p>
      <p
        className={cn(
          'font-mono uppercase tracking-widest text-[9px] mt-1',
          surAplat ? 'text-tile-ink/70' : 'text-ink-muted'
        )}
      >
        {legende}
      </p>
    </div>
  )
}

/**
 * Une ligne de classement.
 *
 * Les deux états - en tête sur aplat, ou sur surface - sont écrits en BRANCHES
 * SÉPARÉES et non en classes conditionnelles. Ce n'est pas une préférence de
 * style : l'aplat ambre est FIXE dans les deux thèmes, la surface s'inverse.
 * Mélanger les deux dans un même `cn()` y fait cohabiter `text-tile-ink` et
 * `text-ink-secondary`, et plus rien - ni la relecture, ni `check_tile_ink` -
 * ne peut dire lequel atterrit sur quel fond.
 */
function LigneDeScore({
  nom,
  rang,
  exAequo,
  penalites,
  palmes,
  parties,
  detail,
  ouverte,
  onBascule,
}: {
  nom: string
  rang: number
  exAequo: boolean
  penalites: number
  palmes?: number
  parties: number
  detail?: React.ReactNode
  ouverte?: boolean
  onBascule?: () => void
}) {
  const enTete = rang === 1
  const lecture = exAequo ? `${rang}e place, à égalité` : `${rang}e place`

  const corps = (surAplat: boolean) => (
    <>
      <span className="font-mono font-bold tabular-nums text-sm w-7 shrink-0" aria-label={lecture}>
        {marqueDeRang(rang, exAequo)}
      </span>
      <div className="flex-1 min-w-0 text-left">
        <p className="font-display text-lg uppercase tracking-tight truncate">{nom}</p>
        <p className={cn('font-sans text-xs', surAplat ? 'text-tile-ink/80' : 'text-ink-secondary')}>
          {parties} partie{parties > 1 ? 's' : ''}
        </p>
      </div>
      {palmes !== undefined && <Chiffre valeur={palmes} legende="palmes" surAplat={surAplat} />}
      <Chiffre valeur={penalites} legende="ardoise" surAplat={surAplat} fort />
      {onBascule && (
        <Icon
          name={ouverte ? 'moins' : 'plus'}
          className="w-4 h-4 shrink-0 opacity-60"
          aria-hidden="true"
        />
      )}
    </>
  )

  const commun = 'w-full px-4 py-3 flex items-center gap-3 rounded-card text-left min-h-[44px]'
  const surAplat = 'border border-tile-ink bg-aplat-1 text-tile-ink shadow-gravure'
  const surSurface = 'border border-border-strong bg-surface text-ink'

  // Sans destination, pas d'affordance : une carte qui a l'air d'un bouton et
  // ne répond à rien passe pour un écran cassé. L'ardoise du soir n'a rien à
  // déplier, elle reste donc un simple élément de liste.
  if (!onBascule) {
    return (
      <li className={cn(commun, enTete ? surAplat : surSurface)}>{corps(enTete)}</li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={onBascule}
        aria-expanded={ouverte}
        className={cn(commun, 'focus-ring-neon', enTete ? surAplat : surSurface)}
      >
        {corps(enTete)}
      </button>
      <AnimatePresence initial={false}>
        {ouverte && detail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-2 pb-1 text-ink-secondary font-sans text-xs">{detail}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

/** Le bandeau d'onglets. Deux registres, jamais plus : un segment de plus et on scrolle. */
function Onglets({ actif, sur }: { actif: Registre; sur: (r: Registre) => void }) {
  const bouton = (r: Registre, libelle: string) => (
    <button
      key={r}
      type="button"
      onClick={() => sur(r)}
      aria-pressed={actif === r}
      className={cn(
        'flex-1 min-h-[44px] px-3 rounded-control font-display uppercase tracking-tight text-sm',
        'transition-colors focus-ring-neon border',
        actif === r
          ? 'bg-ink text-bg border-ink'
          : 'bg-transparent text-ink-secondary border-border-strong hover:text-ink'
      )}
    >
      {libelle}
    </button>
  )
  return (
    <div className="flex gap-2 mb-4" role="group" aria-label="Registre affiché">
      {bouton('soir', 'Ce soir')}
      {bouton('toujours', 'Toujours')}
    </div>
  )
}

function Vide({ icone, titre, texte }: { icone: 'medaille' | 'ticket'; titre: string; texte: string }) {
  return (
    <div className="text-center py-14">
      <Icon name={icone} className="w-10 h-10 mx-auto mb-4 text-ink-muted" aria-hidden="true" />
      <p className="font-display text-2xl uppercase tracking-tight text-ink">{titre}</p>
      <p className="text-ink-secondary font-sans text-sm mt-2 max-w-xs mx-auto">{texte}</p>
    </div>
  )
}

/** La règle du classement, écrite. Elle était appliquée sans être dite. */
function ReglementDuClassement({ avecPalmes }: { avecPalmes: boolean }) {
  return (
    <p className="text-ink-muted font-sans text-xs mt-4 leading-relaxed">
      <span className="font-display uppercase tracking-tight text-ink-secondary">
        Classé à l&apos;ardoise
      </span>{' '}
      - le plus chargé en tête. À ardoise égale, c&apos;est le nombre de parties qui départage :
      dix pénalités en deux parties ne racontent pas la même soirée que dix en huit.
      {avecPalmes && ' Les palmes, elles, se gagnent - elles ne classent pas.'}
    </p>
  )
}

export function PalmaresScreen() {
  const goBack = useAppStore((s) => s.goBack)
  const lignes = usePalmaresStore((s) => s.lignes)
  const effacerPalmares = usePalmaresStore((s) => s.effacer)
  const ledger = useNightStore((s) => s.ledger)
  const partiesDuSoir = useNightStore((s) => s.gamesPlayed)
  const modesDuSoir = useNightStore((s) => s.modesPlayed)
  const remettreArdoise = useNightStore((s) => s.reset)

  const soir = classementDuSoir(ledger)
  const soireeEnCours = soir.length > 0

  // « Ce soir » par défaut quand une soirée est en cours : c'est ce qu'on vient
  // chercher au milieu d'une partie. Sinon le palmarès, qui lui a du contenu.
  const [registre, setRegistre] = useState<Registre>(soireeEnCours ? 'soir' : 'toujours')
  const [ouverte, setOuverte] = useState<string | null>(null)
  const [aEffacer, setAEffacer] = useState<null | 'soir' | 'toujours'>(null)

  const rangsSoir = rangsDuClassement(soir)

  const classement = classementPalmares(lignes)
  const rangsToujours = rangsDuClassement(classement)
  const enTeteToujours = meneurs<LignePalmares>(rangsToujours)
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
          <h1 className="font-display text-xl uppercase tracking-tight text-ink">Les scores</h1>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain max-w-lg mx-auto w-full px-4 py-5 pb-safe-6">
        <Onglets actif={registre} sur={setRegistre} />

        {registre === 'soir' && (
          <>
            {soir.length === 0 ? (
              <Vide
                icone="ticket"
                titre="La soirée n'a pas commencé"
                texte="L'ardoise se remplit dès la première partie terminée, et elle se vide toute seule au petit matin."
              />
            ) : (
              <>
                <p className="text-ink-muted font-mono text-xs uppercase tracking-widest mb-4 tabular-nums">
                  {partiesDuSoir} partie{partiesDuSoir > 1 ? 's' : ''} - {modesDuSoir.length} jeu
                  {modesDuSoir.length > 1 ? 'x' : ''} - {soir.length} à la tablée
                </p>
                <ol className="space-y-2">
                  {rangsSoir.map(({ ligne, rang, exAequo }: Rang<LigneSoir>) => (
                    <LigneDeScore
                      key={ligne.id}
                      nom={ligne.nom}
                      rang={rang}
                      exAequo={exAequo}
                      penalites={ligne.penalites}
                      parties={ligne.parties}
                    />
                  ))}
                </ol>
                <ReglementDuClassement avecPalmes={false} />
                <p className="text-ink-muted font-sans text-xs mt-3">
                  L&apos;ardoise ne compte que ce soir. Elle s&apos;efface d&apos;elle-même quatre
                  heures après la dernière partie - le palmarès, lui, garde la trace.
                </p>
                <Button variant="ghost" className="w-full mt-4" onClick={() => setAEffacer('soir')}>
                  <Icon name="recommencer" className="w-4 h-4 mr-2" aria-hidden="true" />
                  Remettre l&apos;ardoise à zéro
                </Button>
              </>
            )}
          </>
        )}

        {registre === 'toujours' && (
          <>
            {classement.length === 0 ? (
              <Vide
                icone="medaille"
                titre="Le registre est vierge"
                texte="Termine une partie et le palmarès se remplit tout seul. Il reste sur ce téléphone, et il ne s'efface pas au petit matin."
              />
            ) : (
              <>
                <p className="text-ink-muted font-mono text-xs uppercase tracking-widest mb-4 tabular-nums">
                  {classement.length} prénom{classement.length > 1 ? 's' : ''} - {totalParties} partie
                  {totalParties > 1 ? 's' : ''} comptée{totalParties > 1 ? 's' : ''}
                </p>

                {enTeteToujours.length > 0 && (
                  <p className="rounded-card border border-border-strong bg-surface text-ink font-sans text-sm px-4 py-3 mb-3">
                    <span className="font-display uppercase tracking-tight">Égalité en tête.</span>{' '}
                    {enumerer(enTeteToujours.map((l) => l.nom))} se partagent la première place, à{' '}
                    <span className="tabular-nums">{enTeteToujours[0].penalites}</span> pénalité
                    {enTeteToujours[0].penalites > 1 ? 's' : ''} chacun. C&apos;est à la tablée de
                    départager.
                  </p>
                )}

                <ol className="space-y-2">
                  {rangsToujours.map(({ ligne, rang, exAequo }: Rang<LignePalmares>) => (
                    <LigneDeScore
                      key={ligne.nom}
                      nom={ligne.nom}
                      rang={rang}
                      exAequo={exAequo}
                      penalites={ligne.penalites}
                      palmes={ligne.palmes}
                      parties={ligne.parties}
                      ouverte={ouverte === ligne.nom}
                      onBascule={() => setOuverte((n) => (n === ligne.nom ? null : ligne.nom))}
                      detail={
                        <>
                          <span className="font-display uppercase tracking-tight text-ink">
                            {ligne.modes.length} jeu{ligne.modes.length > 1 ? 'x' : ''}
                          </span>{' '}
                          : {ligne.modes.map((m) => getModeDefinition(m).title).join(', ')}.
                          <br />
                          <span className="font-mono uppercase tracking-widest text-[11px] text-ink-muted">
                            Dernière partie le{' '}
                            {new Date(ligne.derniereFois).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </>
                      }
                    />
                  ))}
                </ol>

                <ReglementDuClassement avecPalmes />

                <p className="text-ink-muted font-sans text-xs mt-3">
                  Le palmarès vit sur ce téléphone et n&apos;en sort jamais. Deux personnes qui
                  portent le même prénom partagent une ligne - numérote-les à la saisie pour les
                  séparer.
                </p>

                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => setAEffacer('toujours')}
                >
                  <Icon name="supprimer" className="w-4 h-4 mr-2" aria-hidden="true" />
                  Effacer le palmarès
                </Button>
              </>
            )}
          </>
        )}
      </main>

      <ConfirmDialog
        open={aEffacer === 'soir'}
        id="ardoise-remettre-a-zero"
        title="Remettre l'ardoise à zéro ?"
        message="Le compte de la soirée repart de zéro pour tout le monde. Le palmarès, lui, garde les parties déjà terminées."
        confirmLabel="Remettre à zéro"
        onConfirm={() => {
          remettreArdoise()
          setAEffacer(null)
        }}
        onClose={() => setAEffacer(null)}
      />

      <ConfirmDialog
        open={aEffacer === 'toujours'}
        id="palmares-effacer"
        title="Effacer le palmarès ?"
        message="Tout l'historique des soirées est perdu, sur ce téléphone comme ailleurs - il n'existe nulle part d'autre."
        confirmLabel="Effacer"
        onConfirm={() => {
          effacerPalmares()
          setAEffacer(null)
        }}
        onClose={() => setAEffacer(null)}
      />
    </motion.div>
  )
}
