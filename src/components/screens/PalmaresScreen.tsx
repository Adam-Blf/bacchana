import { useState } from 'react'
import { motion } from 'framer-motion'
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
 * LA FICHE DE SCORE - refaite le 2026-09-16.
 *
 * CE QU'ELLE REMPLACE. Une pile de cartons identiques, un par joueur, chacun
 * portant son grand nombre et, SOUS CHAQUE NOMBRE, son libellé en petites
 * capitales : à quatre joueurs, « ARDOISE » et « PALMES » étaient imprimés huit
 * fois. Le meneur était un aplat jaune plein. Le même écran aurait servi
 * n'importe quel classement de n'importe quelle application.
 *
 * L'OBJET DONT ELLE PART, et ce ne sont pas des souvenirs :
 *  - La FEUILLE DE MARQUE des jeux de cartes français. On écrit les prénoms en
 *    TÊTE DES COLONNES, une ligne par manche, et le total se pose en bas
 *    (carnets de score universels ; tonscore.fr ; becometheartist.com). Une
 *    feuille de belote porte « plusieurs colonnes : le nom, la progression à
 *    chaque manche, et le score final » (exoty.com ; tournois-apps.com).
 *  - L'ARDOISE. Le mot n'est pas une métaphore inventée ici : l'ardoise sur
 *    laquelle le cafetier tenait les comptes a DONNÉ SON NOM au compte ouvert
 *    au client (tableau noir, Wikipédia ; Retif ; Exaprint).
 *
 * CE QUI EN DÉCOULE :
 *  1. UN LIBELLÉ S'IMPRIME UNE FOIS, en tête de colonne.
 *  2. LA LIGNE DE TOTAL EXISTE. Une feuille de marque sans total n'en est pas
 *     une ; le ticket de l'addition avait déjà la sienne.
 *  3. LE MENEUR EST SOULIGNÉ, pas repeint. Le classement se faisant à
 *     l'ardoise, un podium couronnerait celui qui a le plus bu - ce que la
 *     règle 1.4.3 de l'App Store interdit d'encourager.
 *  4. C'est un vrai <table> : les en-têtes de colonne se lisent au lecteur
 *     d'écran, ce qu'une liste de cartons ne donnait pas.
 *
 * TROIS AGENCEMENTS, PAS UN SEUL MIS À L'ÉCHELLE (2026-09-16).
 *  - TÉLÉPHONE : une colonne, la feuille réduite à ce qui se lit à bout de bras
 *    - rang, prénom, parties, ardoise. Les palmes passent dans le détail. Le
 *    règlement et l'action de remise à zéro tombent SOUS la feuille, donc dans
 *    le pouce.
 *  - ORDINATEUR : deux dimensions. La feuille prend la colonne large, le
 *    règlement et l'action vivent dans une colonne latérale, et la colonne des
 *    palmes réapparaît. La largeur sert à poser deux choses côte à côte, pas à
 *    étirer une ligne de texte.
 *  - TÉLÉVISION : on lit à trois mètres. Le titre passe à l'échelle de
 *    l'affiche, les chiffres doublent, les notes secondaires disparaissent - il
 *    ne reste que la feuille - et les marges s'écartent des bords parce qu'un
 *    téléviseur rogne l'image. Aucun survol n'est nécessaire.
 *    La classe ne se déduit PAS d'une largeur : un téléviseur rend en 1920 ou
 *    en 1280, comme un bureau 1080p et comme un portable. Le variant `tv` teste
 *    donc l'entrée - pas de survol, pointeur grossier - et garde le très grand
 *    écran comme second cas (tailwind.config.js).
 *
 * Les seuils viennent de ~/.claude/design/classes-ecrans.md, section 10 : un
 * seuil se pose dans un TROU de largeurs réelles. `pliant` vaut 600 et `deuxcol`
 * 860 AVEC une condition de hauteur, sans quoi un téléphone tourné (844 x 390)
 * passerait à deux colonnes faute de hauteur pour les porter.
 * Le même DOM porte les trois : la colonne latérale est le second membre d'une
 * grille, elle passe dessous quand la grille n'a qu'une colonne. Rien n'est
 * dupliqué, donc rien n'est lu deux fois par un lecteur d'écran.
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

/** Les filets de la feuille : trait plein sur le pourtour, trait léger entre les cases. */
const FILET = 'border-ink/25'
const CELLULE = 'px-2 py-2.5 tv:px-5 tv:py-5 align-middle'
/** Le titre de la feuille, à l'échelle de chaque classe d'écran. */
const TITRE = 'font-display uppercase leading-[0.85] text-ink text-[40px] pliant:text-[52px] deuxcol:text-[64px] tv:text-[112px]'

/**
 * L'en-tête d'une colonne. Imprimé UNE fois, en réserve sur l'encre, comme la
 * ligne de titre d'un carton. La graisse condensée d'affiche tient un libellé
 * lisible en 16 points dans une colonne étroite, là où une grotesque normale
 * aurait imposé une abréviation.
 */
function TeteDeColonne({
  children,
  className,
  title,
}: {
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <th
      scope="col"
      title={title}
      className={cn(
        'font-display uppercase text-base tv:text-3xl text-bg',
        'px-2 py-2 tv:px-5 tv:py-4 text-right whitespace-nowrap',
        className
      )}
    >
      {children}
    </th>
  )
}

/** Un nombre de la feuille : chiffres tabulaires, jamais de libellé sous lui. */
function Nombre({
  valeur,
  fort = false,
  meneur = false,
}: {
  valeur: number
  fort?: boolean
  meneur?: boolean
}) {
  return (
    <span
      className={cn(
        'font-mono tabular-nums leading-none',
        fort ? 'font-bold text-xl pliant:text-2xl tv:text-5xl' : 'text-base tv:text-3xl',
        meneur && fort ? 'text-orange-ink' : 'text-ink'
      )}
    >
      {valeur}
    </span>
  )
}

function Vide({ icone, titre, texte }: { icone: 'medaille' | 'ticket'; titre: string; texte: string }) {
  return (
    <div className="border border-ink px-5 py-12 text-center">
      <Icon name={icone} className="w-9 h-9 tv:w-16 tv:h-16 mx-auto mb-4 text-ink-muted" aria-hidden="true" />
      <p className="font-display text-3xl tv:text-6xl uppercase leading-none text-ink">{titre}</p>
      <p className="text-ink-secondary font-sans text-base tv:text-2xl mt-3 max-w-md mx-auto leading-relaxed">
        {texte}
      </p>
    </div>
  )
}

/** La règle du classement, écrite. Elle était appliquée sans être dite. */
function ReglementDuClassement({ avecPalmes }: { avecPalmes: boolean }) {
  return (
    <p className="text-ink-secondary font-sans text-sm tv:text-2xl leading-relaxed">
      <span className="font-display uppercase text-ink">Classé à l&apos;ardoise</span> - le plus
      chargé en tête. À ardoise égale, c&apos;est le nombre de parties qui départage : dix pénalités
      en deux parties ne racontent pas la même soirée que dix en huit.
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
  const cumulSoir = soir.reduce((n, l) => n + l.penalites, 0)

  const classement = classementPalmares(lignes)
  const rangsToujours = rangsDuClassement(classement)
  const enTeteToujours = meneurs<LignePalmares>(rangsToujours)
  const totalParties = classement.reduce((n, l) => n + l.parties, 0)
  const cumulToujours = classement.reduce((n, l) => n + l.penalites, 0)
  const totalPalmes = classement.reduce((n, l) => n + l.palmes, 0)

  const onglet = (r: Registre, libelle: string) => (
    <button
      key={r}
      type="button"
      onClick={() => setRegistre(r)}
      aria-pressed={registre === r}
      className={cn(
        // Les deux onglets d'un registre, séparés par le filet de la reliure :
        // l'actif est imprimé en réserve, l'autre reste sur le papier.
        'flex-1 min-h-[44px] tv:min-h-[76px] px-3 font-display uppercase text-lg tv:text-4xl',
        'transition-colors duration-100 focus-ring-neon',
        'border border-ink',
        registre === r ? 'bg-ink text-bg' : 'bg-transparent text-ink-secondary hover:text-ink',
        r === 'toujours' && 'border-l-0'
      )}
    >
      {libelle}
    </button>
  )

  const estSoir = registre === 'soir'
  const vide = estSoir ? soir.length === 0 : classement.length === 0

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
      <header className="shrink-0 sticky top-0 pt-safe z-30 bg-bg border-b border-ink/25">
        <div className="max-w-lg deuxcol:max-w-5xl tv:max-w-[2200px] mx-auto px-4 deuxcol:px-8 tv:px-24 py-3 flex items-center">
          <Button variant="ghost" onClick={goBack} className="mr-2" aria-label="Retour">
            <Icon name="retour" className="w-5 h-5 tv:w-9 tv:h-9" aria-hidden="true" />
          </Button>
          <span className="font-sans font-bold text-sm tv:text-2xl uppercase tracking-widest text-ink-secondary">
            Les scores
          </span>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {/* Les marges s'écartent par classe. Sur un téléviseur elles tiennent
            compte du rognage : une image cadrée au bord y perd ses premiers
            points, donc la feuille n'y touche jamais le bord. */}
        <div className="max-w-lg deuxcol:max-w-5xl tv:max-w-[2200px] mx-auto w-full px-4 deuxcol:px-8 tv:px-24 py-5 tv:py-14 pb-safe-6">
          <div className="flex" role="group" aria-label="Registre affiché">
            {onglet('soir', 'Ce soir')}
            {onglet('toujours', 'Toujours')}
          </div>

          {/* La grille des deux compositions : une colonne sur téléphone et sur
              téléviseur, deux sur ordinateur. La colonne latérale n'est pas un
              duplicata, c'est le second membre de la même grille. */}
          <div className="mt-5 grid gap-8 deuxcol:grid-cols-[minmax(0,1fr)_19rem] deuxcol:gap-12 tv:grid-cols-1">
            <section className="min-w-0">
              <h1 className={TITRE}>
                {estSoir ? (
                  <>
                    Ardoise
                    <br />
                    du soir
                  </>
                ) : (
                  <>
                    Registre
                    <br />
                    de la maison
                  </>
                )}
              </h1>

              {vide ? (
                <div className="mt-5">
                  {estSoir ? (
                    <Vide
                      icone="ticket"
                      titre="La soirée n'a pas commencé"
                      texte="L'ardoise se remplit dès la première partie terminée, et elle se vide toute seule au petit matin."
                    />
                  ) : (
                    <Vide
                      icone="medaille"
                      titre="Le registre est vierge"
                      texte="Termine une partie et le palmarès se remplit tout seul. Il reste sur ce téléphone, et il ne s'efface pas au petit matin."
                    />
                  )}
                </div>
              ) : (
                <>
                  <p className="text-ink-secondary font-sans text-sm tv:text-2xl uppercase tracking-widest mt-2 mb-4 tabular-nums">
                    {estSoir ? (
                      <>
                        {partiesDuSoir} partie{partiesDuSoir > 1 ? 's' : ''} - {modesDuSoir.length}{' '}
                        jeu{modesDuSoir.length > 1 ? 'x' : ''} - {soir.length} à la tablée
                      </>
                    ) : (
                      <>
                        {classement.length} prénom{classement.length > 1 ? 's' : ''} - {totalParties}{' '}
                        partie{totalParties > 1 ? 's' : ''} comptée{totalParties > 1 ? 's' : ''}
                      </>
                    )}
                  </p>

                  {!estSoir && enTeteToujours.length > 0 && (
                    <p className="border-l-2 border-orange-ink pl-3 text-ink font-sans text-sm tv:text-2xl mb-4 leading-relaxed">
                      <span className="font-display uppercase">Égalité en tête.</span>{' '}
                      {enumerer(enTeteToujours.map((l) => l.nom))} se partagent la première place, à{' '}
                      <span className="tabular-nums">{enTeteToujours[0].penalites}</span> pénalité
                      {enTeteToujours[0].penalites > 1 ? 's' : ''} chacun. C&apos;est à la tablée de
                      départager.
                    </p>
                  )}

                  <table className="w-full border border-ink border-collapse">
                    <caption className="sr-only">
                      {estSoir
                        ? 'Ardoise de la soirée, du plus chargé au plus épargné'
                        : 'Palmarès de toujours, du plus chargé au plus épargné'}
                    </caption>
                    <thead>
                      <tr className="bg-ink">
                        <TeteDeColonne className="w-9 tv:w-20 text-center">
                          <span aria-hidden="true">#</span>
                          <span className="sr-only">Rang</span>
                        </TeteDeColonne>
                        <TeteDeColonne className={cn('text-left border-l', FILET)}>
                          Prénom
                        </TeteDeColonne>
                        <TeteDeColonne
                          className={cn('w-12 tv:w-28 border-l', FILET)}
                          title="Parties jouées"
                        >
                          Part.
                        </TeteDeColonne>
                        {/* Les palmes ne tiennent pas sur un téléphone sans serrer
                            le prénom : elles réapparaissent dès l'ordinateur, et
                            restent lisibles dans le détail d'une ligne. */}
                        {!estSoir && (
                          <TeteDeColonne className={cn('hidden pliant:table-cell w-16 tv:w-32 border-l', FILET)}>
                            Palmes
                          </TeteDeColonne>
                        )}
                        <TeteDeColonne className={cn('w-16 tv:w-36 border-l', FILET)}>
                          Ardoise
                        </TeteDeColonne>
                      </tr>
                    </thead>

                    <tbody>
                      {estSoir
                        ? rangsSoir.map(({ ligne, rang, exAequo }: Rang<LigneSoir>) => {
                            const meneur = rang === 1
                            return (
                              <tr key={ligne.id} className={cn('border-t', FILET)}>
                                <td
                                  className={cn(
                                    CELLULE,
                                    'text-center font-mono font-bold text-base tv:text-3xl tabular-nums',
                                    meneur ? 'text-orange-ink' : 'text-ink-secondary'
                                  )}
                                >
                                  <span>{marqueDeRang(rang, exAequo)}</span>
                                  <span className="sr-only">
                                    {exAequo ? `${rang}e place, à égalité` : `${rang}e place`}
                                  </span>
                                </td>
                                <td className={cn(CELLULE, 'border-l min-w-0', FILET)}>
                                  {/* Le meneur est SOULIGNÉ, comme sur une feuille
                                      tenue à la main - la ligne n'est pas repeinte. */}
                                  <span
                                    className={cn(
                                      'block truncate font-display text-xl pliant:text-2xl tv:text-5xl uppercase leading-none text-ink',
                                      meneur &&
                                        'underline decoration-orange-ink decoration-2 tv:decoration-4 underline-offset-4'
                                    )}
                                  >
                                    {ligne.nom}
                                  </span>
                                </td>
                                <td className={cn(CELLULE, 'text-right border-l', FILET)}>
                                  <Nombre valeur={ligne.parties} />
                                </td>
                                <td className={cn(CELLULE, 'text-right border-l', FILET)}>
                                  <Nombre valeur={ligne.penalites} fort meneur={meneur} />
                                </td>
                              </tr>
                            )
                          })
                        : rangsToujours.flatMap(({ ligne, rang, exAequo }: Rang<LignePalmares>) => {
                            const meneur = rang === 1
                            const estOuverte = ouverte === ligne.nom
                            const rangees = [
                              <tr key={ligne.nom} className={cn('border-t', FILET)}>
                                <td
                                  className={cn(
                                    CELLULE,
                                    'text-center font-mono font-bold text-base tv:text-3xl tabular-nums',
                                    meneur ? 'text-orange-ink' : 'text-ink-secondary'
                                  )}
                                >
                                  <span>{marqueDeRang(rang, exAequo)}</span>
                                  <span className="sr-only">
                                    {exAequo ? `${rang}e place, à égalité` : `${rang}e place`}
                                  </span>
                                </td>
                                <td className={cn('border-l p-0 min-w-0', FILET)}>
                                  {/* Le nom est la poignée du détail : le « + » nu,
                                      dans sa propre colonne, ne disait pas ce qu'il
                                      ouvrait, et mangeait une colonne de largeur. */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOuverte((n) => (n === ligne.nom ? null : ligne.nom))
                                    }
                                    aria-expanded={estOuverte}
                                    className="w-full min-h-[44px] tv:min-h-[84px] px-2 py-2.5 tv:px-5 tv:py-5 flex items-center gap-2 text-left focus-ring-neon"
                                  >
                                    <span
                                      className={cn(
                                        'min-w-0 truncate font-display text-xl pliant:text-2xl tv:text-5xl uppercase leading-none text-ink',
                                        meneur &&
                                          'underline decoration-orange-ink decoration-2 tv:decoration-4 underline-offset-4'
                                      )}
                                    >
                                      {ligne.nom}
                                    </span>
                                    <Icon
                                      name={estOuverte ? 'moins' : 'plus'}
                                      className="w-4 h-4 tv:w-8 tv:h-8 shrink-0 text-ink-secondary"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </td>
                                <td className={cn(CELLULE, 'text-right border-l', FILET)}>
                                  <Nombre valeur={ligne.parties} />
                                </td>
                                <td
                                  className={cn(
                                    CELLULE,
                                    'hidden pliant:table-cell text-right border-l',
                                    FILET
                                  )}
                                >
                                  <Nombre valeur={ligne.palmes} />
                                </td>
                                <td className={cn(CELLULE, 'text-right border-l', FILET)}>
                                  <Nombre valeur={ligne.penalites} fort meneur={meneur} />
                                </td>
                              </tr>,
                            ]
                            if (estOuverte) {
                              rangees.push(
                                <tr key={`${ligne.nom}-detail`} className={cn('border-t', FILET)}>
                                  <td colSpan={5} className="px-3 py-3 tv:px-6 tv:py-6 bg-surface">
                                    <p className="text-ink-secondary font-sans text-sm tv:text-2xl leading-relaxed">
                                      <span className="font-display uppercase text-ink">
                                        {ligne.palmes} palme{ligne.palmes > 1 ? 's' : ''}
                                      </span>{' '}
                                      -{' '}
                                      <span className="font-display uppercase text-ink">
                                        {ligne.modes.length} jeu{ligne.modes.length > 1 ? 'x' : ''}
                                      </span>{' '}
                                      : {ligne.modes.map((m) => getModeDefinition(m).title).join(', ')}.
                                    </p>
                                    <p className="font-sans text-sm tv:text-2xl text-ink-secondary mt-1">
                                      Dernière partie le{' '}
                                      {new Date(ligne.derniereFois).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                      })}
                                    </p>
                                  </td>
                                </tr>
                              )
                            }
                            return rangees
                          })}
                    </tbody>

                    {/* LA LIGNE DE TOTAL. Double filet au-dessus, comme un report
                        de compte. Le mot vient du ticket de l'addition. */}
                    <tfoot>
                      <tr className="border-t-2 border-ink bg-surface">
                        <td />
                        <td
                          className={cn(
                            CELLULE,
                            'border-l font-display uppercase text-base pliant:text-xl tv:text-4xl text-ink',
                            FILET
                          )}
                        >
                          {estSoir ? 'Cumul de la maison' : 'Report'}
                        </td>
                        <td className={cn(CELLULE, 'text-right border-l', FILET)}>
                          {estSoir ? null : <Nombre valeur={totalParties} />}
                        </td>
                        {!estSoir && (
                          <td
                            className={cn(
                              CELLULE,
                              'hidden pliant:table-cell text-right border-l',
                              FILET
                            )}
                          >
                            <Nombre valeur={totalPalmes} />
                          </td>
                        )}
                        <td className={cn(CELLULE, 'text-right border-l', FILET)}>
                          <Nombre valeur={estSoir ? cumulSoir : cumulToujours} fort />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </>
              )}
            </section>

            {/* LA COLONNE LATÉRALE. Sous la feuille au téléphone - donc dans le
                pouce - à côté d'elle sur un ordinateur. Sur un téléviseur, le
                règlement reste (c'est la règle du jeu, lue de loin) et les deux
                notes de fonctionnement disparaissent : on ne lit pas une note de
                bas de page à trois mètres. */}
            <aside className="min-w-0 deuxcol:pt-24 tv:pt-8">
              <ReglementDuClassement avecPalmes={!estSoir} />

              <p className="text-ink-secondary font-sans text-sm mt-3 leading-relaxed tv:hidden">
                {estSoir
                  ? "L'ardoise ne compte que ce soir. Elle s'efface d'elle-même quatre heures après la dernière partie - le palmarès, lui, garde la trace."
                  : "Le palmarès vit sur ce téléphone et n'en sort jamais. Deux personnes qui portent le même prénom partagent une ligne - numérote-les à la saisie pour les séparer."}
              </p>

              {!vide && (
                <Button
                  variant="ghost"
                  className="w-full mt-4 tv:hidden"
                  onClick={() => setAEffacer(estSoir ? 'soir' : 'toujours')}
                >
                  <Icon
                    name={estSoir ? 'recommencer' : 'supprimer'}
                    className="w-4 h-4 mr-2"
                    aria-hidden="true"
                  />
                  {estSoir ? "Remettre l'ardoise à zéro" : 'Effacer le palmarès'}
                </Button>
              )}
            </aside>
          </div>
        </div>
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
