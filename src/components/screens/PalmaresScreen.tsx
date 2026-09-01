import { motion } from 'framer-motion'
import { Button, ConfirmDialog, Icon } from '@/components/ui'
import { useAppStore } from '@/stores'
import {
  classementPalmares,
  meneursExAequo,
  rangsPalmares,
  usePalmaresStore,
  type LignePalmares as LignePalmaresType,
} from '@/stores/palmaresStore'
import { enumerer } from '@/core/text/francais'
import { getModeDefinition } from '@/core/engine/modeRegistry'
import { useState } from 'react'

/**
 * Une ligne du palmares. Le premier a son aplat, les autres leur surface.
 *
 * Les deux etats sont ecrits en BRANCHES SEPAREES et non en classes
 * conditionnelles, et ce n'est pas une preference de style. L'aplat ambre est
 * FIXE dans les trois themes ; la surface, elle, s'inverse. Melanger les deux
 * dans un meme `cn()` y fait cohabiter `text-tile-ink` et `text-ink-secondary`,
 * et plus rien - ni la relecture, ni `check_tile_ink` - ne peut dire lequel
 * atterrit sur quel fond. La garde signalait cet ecran a juste titre.
 *
 * Deux sous-arbres, chacun avec son fond et ses encres, coutent quinze lignes
 * et rendent la faute impossible a ecrire.
 */
function LignePalmares({
  ligne,
  rang,
  exAequo,
}: {
  ligne: LignePalmaresType
  rang: number
  exAequo: boolean
}) {
  const modes = ligne.modes.map((m) => getModeDefinition(m).title).join(', ')
  /**
   * Le signe egal devant le rang est la convention des classements sportifs :
   * il dit « ils sont plusieurs a cette place ». Le rang seul ne le dit pas, et
   * deux lignes numerotees 1 sans explication passent pour un bogue d'affichage.
   */
  const marque = exAequo ? `=${rang}` : `${rang}`
  const lecture = exAequo ? `${rang}e place, à égalité` : `${rang}e place`
  const detail = (
    <>
      {ligne.parties} partie{ligne.parties > 1 ? 's' : ''} - {ligne.modes.length} jeu
      {ligne.modes.length > 1 ? 'x' : ''}
      {ligne.palmes > 0 && (
        <>
          {' '}
          - {ligne.palmes} palme{ligne.palmes > 1 ? 's' : ''}
        </>
      )}
    </>
  )

  if (rang === 1) {
    return (
      <li className="rounded-card border border-tile-ink bg-aplat-1 text-tile-ink shadow-gravure px-4 py-3 flex items-center gap-3">
        <span className="font-mono font-bold tabular-nums text-sm w-6 shrink-0" aria-label={lecture}>
          {marque}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg uppercase tracking-tight truncate">{ligne.nom}</p>
          <p className="font-sans text-xs text-tile-ink/80">{detail}</p>
          {modes && <p className="font-sans text-[11px] mt-0.5 truncate text-tile-ink/70">{modes}</p>}
        </div>
        <span className="font-mono font-bold tabular-nums text-2xl shrink-0">{ligne.penalites}</span>
      </li>
    )
  }

  return (
    <li className="rounded-card border border-border-strong bg-surface text-ink px-4 py-3 flex items-center gap-3">
      <span className="font-mono font-bold tabular-nums text-sm w-6 shrink-0" aria-label={lecture}>
        {marque}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-display text-lg uppercase tracking-tight truncate">{ligne.nom}</p>
        <p className="font-sans text-xs text-ink-secondary">{detail}</p>
        {modes && <p className="font-sans text-[11px] mt-0.5 truncate text-ink-muted">{modes}</p>}
      </div>
      <span className="font-mono font-bold tabular-nums text-2xl shrink-0">{ligne.penalites}</span>
    </li>
  )
}

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
  const rangs = rangsPalmares(classement)
  const meneurs = meneursExAequo(rangs)
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

            {meneurs.length > 0 && (
              <p className="rounded-card border border-border-strong bg-surface text-ink font-sans text-sm px-4 py-3 mb-3">
                <span className="font-display uppercase tracking-tight">Égalité en tête.</span>{' '}
                {enumerer(meneurs.map((l) => l.nom))} se partagent la première place, à{' '}
                <span className="tabular-nums">{meneurs[0].penalites}</span> pénalité
                {meneurs[0].penalites > 1 ? 's' : ''} chacun. C&apos;est à la tablée de
                départager.
              </p>
            )}

            <ol className="space-y-2">
              {rangs.map(({ ligne, rang, exAequo }) => (
                <LignePalmares key={ligne.nom} ligne={ligne} rang={rang} exAequo={exAequo} />
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
