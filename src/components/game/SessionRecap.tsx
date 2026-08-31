import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Player } from '@/types'
import type { GameMode } from '@/core/engine/types'
import { track } from '@/lib/analytics'
import { nightRanking, useNightStore } from '@/stores/nightStore'
import { oublierManche, useEtatDeManche } from '@/stores/partieStore'
import { usePalmaresStore } from '@/stores/palmaresStore'
import { dessinerTicket } from '@/lib/ticketImage'
import { enumerer } from '@/core/text/francais'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'
import { Icon } from '../ui/Icon'

interface SessionRecapProps {
  players: Player[]
  onReplay: () => void
  onQuit: () => void
  /**
   * Generic penalty counts keyed by player id, used by the prompt-based modes (picolo,
   * truth or dare, etc). When provided, overrides the Borderland-specific
   * drinksGorgees/drinksShots ranking so every mode can reuse this same recap screen.
   */
  penaltyCounts?: Record<string, number>
  /** Mode id for the session_completed analytics event. Defaults to 'borderland'. */
  mode?: GameMode
  /** Number of turns played this session, for the session_completed analytics event. */
  turns?: number
}

/** Ligne pointillée de ticket, réutilisée entre chaque section. */
function ReceiptRule() {
  return <div className="border-t-1 border-dashed border-[#b9b0a2] my-3" aria-hidden="true" />
}

/**
 * L'addition - le récap de fin de partie est imprimé comme un ticket de
 * caisse : papier blanc cassé fixe (objet physique, identique dans les deux
 * thèmes), Space Mono, bords crantés, faux code-barres. Élément signature de
 * l'écran de fin.
 */
export function SessionRecap({
  players,
  onReplay,
  onQuit,
  penaltyCounts,
  mode = 'borderland',
  turns = 0,
}: SessionRecapProps) {
  /**
   * L'ardoise ne compte la partie QU'UNE FOIS, meme apres un rechargement.
   *
   * Ce marqueur est ecrit avec la manche, donc il survit avec elle. Depuis que
   * la manche et l'ardoise sont toutes deux ecrites sur l'appareil, recharger
   * la page sur l'ecran d'addition remontait le meme recap, relançait cet
   * effet, et ajoutait une seconde fois les memes penalites au cumul de la
   * soiree. Le classement de fin de soiree devenait faux, sans que rien ne le
   * signale - il suffisait d'un rechargement mal place.
   */
  const [dejaComptee, setDejaComptee] = useEtatDeManche(mode, players, 'ardoiseComptee', () => false)

  useEffect(() => {
    if (dejaComptee) return
    setDejaComptee(true)
    track({ name: 'session_completed', props: { mode, turns } })

    // Le palmares se remplit au meme moment que l'ardoise, et sous la meme
    // garde : la partie ne compte qu'une fois, meme apres un rechargement.
    // Difference de duree de vie assumee - l'ardoise mesure une soiree et
    // s'efface avec elle, le palmares ne mesure que le temps long.
    usePalmaresStore.getState().enregistrer(
      mode,
      ranked.map((p) => ({
        nom: p.name,
        penalites: p.total,
        palme: !aucunScore && p.total === meilleurTotal,
      })),
    )

    useNightStore.getState().record(
      mode,
      players.map((p) => ({
        id: p.id,
        name: p.name,
        total: penaltyCounts
          ? (penaltyCounts[p.id] ?? 0)
          : (p.drinksGorgees ?? 0) + (p.drinksShots ?? 0) * 5,
      }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const night = useNightStore()
  const nightRanked = nightRanking(night.ledger)
  const nightTotal = nightRanked.reduce((s, e) => s + e.total, 0)

  const ranked = [...players]
    .map((p) => ({
      ...p,
      total: penaltyCounts
        ? (penaltyCounts[p.id] ?? 0)
        : (p.drinksGorgees ?? 0) + (p.drinksShots ?? 0) * 5,
    }))
    .sort((a, b) => b.total - a.total)


  const totalGorgees = penaltyCounts
    ? players.reduce((s, p) => s + (penaltyCounts[p.id] ?? 0), 0)
    : players.reduce((s, p) => s + (p.drinksGorgees ?? 0), 0)
  const totalShots = players.reduce((s, p) => s + (p.drinksShots ?? 0), 0)
  const grandTotal = penaltyCounts ? totalGorgees : totalGorgees + totalShots * 5

  /**
   * Certains modes ne comptent RIEN, et le ticket l'affichait quand meme.
   *
   * La Roue du Destin ne designe personne nommement : elle passe des penalites
   * vides, et l'addition sortait une colonne de zeros, un total a zero, et
   * sacrait « champion de la tablee » le premier de la liste - c'est-a-dire
   * n'importe qui. Un chiffre qui ne mesure rien n'informe pas, il decredibilise
   * ce qui l'entoure.
   *
   * Quand rien n'a ete distribue, le ticket garde son en-tete, son horodatage
   * et le nombre de tours, et se tait sur le reste.
   */
  const aucunScore = ranked.every((p) => p.total === 0) && totalShots === 0

  /**
   * Les vainqueurs, au PLURIEL, et sans accord de genre.
   *
   * Deux defauts au meme endroit. Le premier : rien ne gerait l'ex aequo, donc
   * a egalite le titre revenait au premier de la liste, c'est-a-dire a l'ordre
   * de saisie des prenoms - un depart sur un critere que personne ne connait.
   * Le second : « est elu champion » etait fige au masculin, alors que
   * l'application DEMANDE le genre de chaque joueur au moment du setup, en le
   * presentant comme un moyen d'avoir des jeux plus personnalises. Collecter
   * une information puis l'ignorer la ou elle compte est pire que ne pas la
   * demander.
   *
   * La formule retenue ne porte aucun nom de personne genre : c'est la palme
   * qui est feminine, pas celui ou celle qui la rafle. Elle marche donc pour
   * tous les genres, renseignes ou non, et au pluriel sans retouche - ce qui
   * vaut mieux qu'un accord a maintenir a trois endroits.
   */
  const meilleurTotal = ranked.length > 0 ? ranked[0].total : 0
  const vainqueurs = aucunScore ? [] : ranked.filter((p) => p.total === meilleurTotal)
  const mentionVainqueurs =
    vainqueurs.length === 0
      ? null
      : `${enumerer(vainqueurs.map((p) => p.name))} ${vainqueurs.length > 1 ? 'raflent' : 'rafle'} la palme de la tablée`

  const now = new Date()
  const stamp = `${now.toLocaleDateString('fr-FR')}  ${now
    .getHours()
    .toString()
    .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  /**
   * Le texte du partage - il accompagne l'image, il ne la remplace pas.
   *
   * Une image seule n'est lisible ni par un lecteur d'écran ni par une
   * application qui refuse les fichiers : le texte reste donc joint, et sert
   * aussi de repli quand l'image ne peut pas être produite.
   */
  const texteDuPartage = () => {
    if (aucunScore) {
      return `Bacchana - l'addition\n\n${turns} tour${turns > 1 ? 's' : ''} joué${turns > 1 ? 's' : ''}, aucune pénalité distribuée : tablée irréprochable.\nbacchana.beloucif.com`
    }
    const lines = ranked.map((p, i) =>
      penaltyCounts
        ? `${i + 1}. ${p.name} - ${penaltyCounts[p.id] ?? 0} pénalité${(penaltyCounts[p.id] ?? 0) > 1 ? 's' : ''}`
        : `${i + 1}. ${p.name} - ${p.drinksGorgees ?? 0} pénalités + ${p.drinksShots ?? 0} majeures`
    )
    return `Bacchana - l'addition\n\n${lines.join('\n')}\n\nTotal : ${totalGorgees} pénalités${
      penaltyCounts ? '' : `, ${totalShots} majeures`
    } distribuées.\nbacchana.beloucif.com`
  }

  /**
   * Partage l'ADDITION, pas son résumé.
   *
   * Le bouton envoyait un classement en lignes de texte. Le ticket de caisse est
   * l'élément signature de l'écran de fin - papier crème, bords crantés, points
   * de conduite, code-barres - et c'est lui qu'on veut montrer : il restait à
   * l'écran pendant qu'on partageait une liste.
   *
   * Trois niveaux de repli, du plus riche au toujours-possible : l'image avec le
   * texte, le texte seul, le presse-papiers. Aucun appareil ne se retrouve sans
   * rien.
   */
  const handleShare = async () => {
    haptic('light')
    const text = texteDuPartage()

    try {
      const image = await dessinerTicket({
        horodatage: stamp,
        effectif: players.length,
        lignes: aucunScore
          ? []
          : ranked.map((p, i) => ({
              nom: `${i + 1}. ${p.name}`,
              valeur: penaltyCounts
                ? String(penaltyCounts[p.id] ?? 0)
                : `${p.drinksGorgees ?? 0}${(p.drinksShots ?? 0) > 0 ? ` +${p.drinksShots} MAJ` : ''}`,
            })),
        total: aucunScore ? null : grandTotal,
        mention: mentionVainqueurs ?? "Tablée irréprochable : l'ardoise est vierge",
        ardoise:
          night.gamesPlayed > 1
            ? {
                titre: `Ardoise de la soirée - ${night.gamesPlayed} parties`,
                lignes: nightRanked.slice(0, 6).map((e) => ({ nom: e.name, valeur: String(e.total) })),
              }
            : undefined,
      })

      if (image) {
        const fichier = new File([image], 'bacchana-addition.png', { type: 'image/png' })
        if (navigator.canShare?.({ files: [fichier] })) {
          await navigator.share({ files: [fichier], title: "Bacchana - L'addition", text })
          return
        }
      }

      if (navigator.share) {
        await navigator.share({ title: "Bacchana - L'addition", text })
        return
      }

      await navigator.clipboard.writeText(text)
      alert('Addition copiée dans le presse-papiers')
    } catch {
      // Partage annulé par l'utilisateur, ou canevas indisponible - rien à faire.
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 pt-safe pb-safe bg-bg text-ink"
    >
      {/* Le ticket : papier fixe, légère rotation d'objet posé sur la table. */}
      <motion.div
        initial={{ opacity: 0, y: -240 }}
        animate={{ opacity: 1, y: 0, rotate: -1.2 }}
        transition={{ type: 'spring', damping: 18, stiffness: 120, delay: 0.15 }}
        className="w-full max-w-sm bg-[#FBF7EE] text-[#1c1a17] font-receipt shadow-gravure mb-8 relative"
        style={{
          // Bords crantés haut et bas, découpe de ticket.
          clipPath:
            'polygon(0 8px, 4% 0, 8% 8px, 12% 0, 16% 8px, 20% 0, 24% 8px, 28% 0, 32% 8px, 36% 0, 40% 8px, 44% 0, 48% 8px, 52% 0, 56% 8px, 60% 0, 64% 8px, 68% 0, 72% 8px, 76% 0, 80% 8px, 84% 0, 88% 8px, 92% 0, 96% 8px, 100% 0, 100% calc(100% - 8px), 96% 100%, 92% calc(100% - 8px), 88% 100%, 84% calc(100% - 8px), 80% 100%, 76% calc(100% - 8px), 72% 100%, 68% calc(100% - 8px), 64% 100%, 60% calc(100% - 8px), 56% 100%, 52% calc(100% - 8px), 48% 100%, 44% calc(100% - 8px), 40% 100%, 36% calc(100% - 8px), 32% 100%, 28% calc(100% - 8px), 24% 100%, 20% calc(100% - 8px), 16% 100%, 12% calc(100% - 8px), 8% 100%, 4% calc(100% - 8px), 0 100%)',
        }}
      >
        <div className="px-5 pt-7 pb-8 text-[13px] leading-relaxed">
          {/* En-tête maison */}
          <div className="text-center">
            <div className="font-bold text-lg tracking-wide uppercase">Bacchana</div>
            <div className="text-[11px] text-[#6e6759]">Au coin du comptoir - Chevilly-Larue</div>
            <div className="text-[11px] text-[#6e6759]">bacchana.beloucif.com</div>
          </div>

          <ReceiptRule />

          <div className="flex justify-between text-[11px] text-[#6e6759]">
            <span>{stamp}</span>
            <span className="uppercase">Table de {players.length}</span>
          </div>

          <ReceiptRule />

          {/* Lignes du ticket : un joueur = un article */}
          {aucunScore ? (
            <p className="text-center text-[12px] py-2">
              Aucune pénalité distribuée.{turns > 0 ? ` ${turns} tour${turns > 1 ? 's' : ''} joué${turns > 1 ? 's' : ''}.` : ''}
            </p>
          ) : (
          <>
          <div className="uppercase text-[11px] text-[#6e6759] flex justify-between">
            <span>Article</span>
            <span>Pénalités</span>
          </div>
          <div className="mt-1 space-y-1">
            {ranked.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + 0.08 * i }}
                className={cn('flex items-baseline gap-2', i === 0 && 'font-bold')}
              >
                <span className="whitespace-nowrap">
                  {i + 1}. {p.name}
                  {i === 0 && ' *'}
                </span>
                <span className="flex-1 overflow-hidden text-[#b9b0a2] select-none" aria-hidden="true">
                  {'.'.repeat(60)}
                </span>
                <span className="tabular-nums whitespace-nowrap">
                  {penaltyCounts ? (
                    (penaltyCounts[p.id] ?? 0)
                  ) : (
                    <>
                      {p.drinksGorgees ?? 0}
                      {(p.drinksShots ?? 0) > 0 && (
                        <span className="text-[#8E1F26]"> +{p.drinksShots} MAJ</span>
                      )}
                    </>
                  )}
                </span>
              </motion.div>
            ))}
          </div>

          <ReceiptRule />

          <div className="flex items-baseline justify-between font-bold text-base">
            <span className="uppercase">Total</span>
            <span className="tabular-nums">{grandTotal}</span>
          </div>
          {!penaltyCounts && (
            <div className="flex items-baseline justify-between text-[11px] text-[#6e6759]">
              <span>dont pénalités majeures</span>
              <span className="tabular-nums">{totalShots}</span>
            </div>
          )}
          </>
          )}

          {/* L'ardoise de la soirée : cumul cross-jeux, visible dès la 2e partie. */}
          {night.gamesPlayed > 1 && (
            <>
              <ReceiptRule />
              <div className="uppercase text-[11px] text-[#6e6759] flex justify-between">
                <span>Ardoise de la soirée</span>
                <span>
                  {night.gamesPlayed} parties - {night.modesPlayed.length} jeu
                  {night.modesPlayed.length > 1 ? 'x' : ''}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {nightRanked.slice(0, 6).map((e, i) => (
                  <div key={e.id} className={cn('flex items-baseline gap-2', i === 0 && 'font-bold')}>
                    <span className="whitespace-nowrap">{e.name}</span>
                    <span className="flex-1 overflow-hidden text-[#b9b0a2] select-none" aria-hidden="true">
                      {'.'.repeat(60)}
                    </span>
                    <span className="tabular-nums whitespace-nowrap">{e.total}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-baseline justify-between text-[11px] text-[#6e6759] mt-1">
                <span>cumul de la maison</span>
                <span className="tabular-nums">{nightTotal}</span>
              </div>
            </>
          )}

          <ReceiptRule />

          <div className="text-center text-[11px]">
            {mentionVainqueurs ? (
              <div>
                * {enumerer(vainqueurs.map((p) => p.name))}{' '}
                <span className="font-bold uppercase text-[#8E1F26]">
                  {vainqueurs.length > 1 ? 'raflent' : 'rafle'} la palme de la tablée
                </span>
              </div>
            ) : (
              <div>Tablée irréprochable : l&apos;ardoise est vierge.</div>
            )}
            {night.gamesPlayed > 1 && nightRanked[0] && (
              <div className="mt-0.5">
                {nightRanked[0].name} mène l&apos;ardoise de la soirée ({nightRanked[0].total})
              </div>
            )}
            <div className="mt-1 text-[#6e6759]">Ici, tout le monde règle l&apos;addition.</div>
          </div>

          {/* Faux code-barres */}
          <div className="mt-4 flex items-end justify-center gap-[2px] h-9" aria-hidden="true">
            {ranked
              .flatMap((p) => [p.total % 4, (p.total + 2) % 3, 1, p.total % 2, 2])
              .concat([1, 3, 0, 2, 1, 3, 2, 0, 1, 2])
              .slice(0, 36)
              .map((w, i) => (
                <span
                  key={i}
                  className="inline-block bg-[#1c1a17]"
                  style={{ width: `${1 + w}px`, height: i % 5 === 4 ? '70%' : '100%' }}
                />
              ))}
          </div>
          <div className="text-center text-[10px] tracking-[0.3em] text-[#6e6759] mt-1">
            MERCI DE VOTRE VISITE
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-md">
        <button
          onClick={handleShare}
          className="flex-1 min-w-[140px] min-h-[44px] bg-neon text-sur-surimpression font-semibold px-5 py-3 rounded-pill hover:bg-neon-soft transition-colors inline-flex items-center justify-center gap-2 focus-ring-neon"
        >
          <Icon name="partager" className="w-4 h-4" aria-hidden="true" /> Partager
        </button>
        <button
          onClick={() => { haptic('light'); oublierManche(mode); onReplay() }}
          className="flex-1 min-w-[140px] min-h-[44px] bg-surface border border-border-strong text-ink font-semibold px-5 py-3 rounded-pill hover:border-neon/50 hover:text-neon transition-colors inline-flex items-center justify-center gap-2 focus-ring-neon"
        >
          <Icon name="recommencer" className="w-4 h-4" aria-hidden="true" /> Revanche
        </button>
        <button
          onClick={() => { haptic('medium'); oublierManche(mode); onQuit() }}
          className="w-full min-h-[44px] bg-transparent border border-border-strong text-ink-secondary px-5 py-3 rounded-pill hover:bg-surface/60 transition-colors inline-flex items-center justify-center gap-2 focus-ring-neon"
        >
          <Icon name="accueil" className="w-4 h-4" aria-hidden="true" /> Retour à l'accueil
        </button>
      </div>

      <p className="mt-8 text-xs font-mono text-ink-muted text-center">
        Jouez responsable : Bacchana veille sur sa tablée.
      </p>
    </motion.div>
  )
}
