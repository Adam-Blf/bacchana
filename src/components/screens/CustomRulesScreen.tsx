import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, Icon } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import { useCustomRulesStore } from '@/stores/customRulesStore'
import { PROMPT_MODES, type GameMode } from '@/core/engine/types'
import { getModeDefinition } from '@/core/engine/modeRegistry'
import { interpolate } from '@/core/engine/interpolate'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'
import type { CustomRule, CustomRuleKind } from '@/core/engine/customRules'
import { cn } from '@/utils'

const PREVIEW_PLAYERS = [
  { id: 'p1', name: 'Alex', active: true },
  { id: 'p2', name: 'Sam', active: true },
]

interface EditorState {
  ruleId: string | null
  kind: CustomRuleKind
  text: string
  modes: GameMode[]
  sips: number
}

const EMPTY_EDITOR: EditorState = { ruleId: null, kind: 'prompt', text: '', modes: [], sips: 1 }

/**
 * « Mes règles » - création, édition et activation de règles personnalisées,
 * sauvegardées sur l'appareil. Les règles « carte » se mélangent aux decks des
 * modes à prompts, les règles « roulette » deviennent des segments de la roue.
 */
export function CustomRulesScreen() {
  const { goBack } = useAppStore()
  const { players } = useGameStore()
  const rules = useCustomRulesStore((s) => s.rules)
  const { add, update, remove, toggle } = useCustomRulesStore()

  const [editor, setEditor] = useState<EditorState | null>(null)

  const editorOpen = editor !== null
  useBackClose(editorOpen, () => setEditor(null), 'custom-rule-editor')
  useKeyboard({ Escape: () => setEditor(null) }, editorOpen)

  const previewPlayers = players.length >= 2 ? players : PREVIEW_PLAYERS
  const preview = useMemo(() => {
    if (!editor || !editor.text.trim()) return ''
    return interpolate(editor.text, previewPlayers, previewPlayers[0])
  }, [editor, previewPlayers])

  const openCreate = () => setEditor({ ...EMPTY_EDITOR })
  const openEdit = (rule: CustomRule) =>
    setEditor({
      ruleId: rule.id,
      kind: rule.kind,
      text: rule.text,
      modes: rule.modes ?? [],
      sips: rule.penalty?.sips ?? 1,
    })

  const handleSave = () => {
    if (!editor || !editor.text.trim()) return
    if (editor.ruleId) {
      update(editor.ruleId, {
        kind: editor.kind,
        text: editor.text.trim(),
        modes: editor.kind === 'prompt' && editor.modes.length > 0 ? editor.modes : undefined,
        penalty: editor.sips > 0 ? { sips: editor.sips } : undefined,
      })
    } else {
      add({
        kind: editor.kind,
        text: editor.text,
        modes: editor.kind === 'prompt' ? editor.modes : undefined,
        sips: editor.sips,
      })
    }
    setEditor(null)
  }

  const toggleMode = (mode: GameMode) => {
    if (!editor) return
    setEditor({
      ...editor,
      modes: editor.modes.includes(mode)
        ? editor.modes.filter((m) => m !== mode)
        : [...editor.modes, mode],
    })
  }

  const insertToken = (token: string) => {
    if (!editor) return
    setEditor({ ...editor, text: `${editor.text}${editor.text.endsWith(' ') || editor.text === '' ? '' : ' '}${token}` })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-dvh bg-bg"
    >
      <header className="sticky top-0 pt-safe z-30 bg-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => goBack()} className="mr-3" aria-label="Revenir à l'accueil">
            <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
          </Button>
          <h1 className="font-display text-xl uppercase tracking-tight text-ink">Mes règles</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-safe-24">
        <p className="text-ink-secondary font-sans text-sm mb-5">
          Crée tes propres règles : elles se glissent dans les jeux de cartes ou s'ajoutent
          à la roulette, et restent enregistrées sur ton téléphone.
        </p>

        {rules.length === 0 && (
          <div className="rounded-card bg-surface border border-dashed border-ink/40 p-8 text-center">
            <Icon name="des" className="w-8 h-8 mx-auto mb-3 text-ink-muted" aria-hidden="true" />
            <p className="font-display uppercase tracking-tight text-ink">Aucune règle pour l'instant</p>
            <p className="text-ink-secondary font-sans text-sm mt-1">
              Ta première règle est à un tap d'ici.
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className={cn(
                'rounded-card bg-surface border border-ink shadow-gravure p-4',
                !rule.enabled && 'opacity-50'
              )}
            >
              <div className="flex items-start gap-3">
                <label className="flex items-center min-w-[44px] min-h-[44px] justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggle(rule.id)}
                    aria-label={rule.enabled ? 'Désactiver cette règle' : 'Activer cette règle'}
                    className="w-5 h-5 accent-neon"
                  />
                </label>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-ink leading-snug break-words">{rule.text}</p>
                  <p className="text-ink-muted font-mono text-[11px] uppercase tracking-wide mt-1.5">
                    {rule.kind === 'roulette'
                      ? 'Roulette'
                      : !rule.modes || rule.modes.length === 0
                        ? 'Tous les jeux de cartes'
                        : rule.modes.map((m) => getModeDefinition(m).title).join(', ')}
                    {rule.penalty?.sips ? ` - ${rule.penalty.sips} pénalité${rule.penalty.sips > 1 ? 's' : ''}` : ''}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => openEdit(rule)}
                    aria-label="Modifier cette règle"
                    className="w-11 h-11 rounded-control flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-ink/5 focus-ring-neon"
                  >
                    <Icon name="editer" className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => remove(rule.id)}
                    aria-label="Supprimer cette règle"
                    className="w-11 h-11 rounded-control flex items-center justify-center text-ink-secondary hover:text-danger hover:bg-danger/10 focus-ring-neon"
                  >
                    <Icon name="supprimer" className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Button variant="primary" size="lg" className="w-full mt-6" onClick={openCreate}>
          <Icon name="plus" className="w-5 h-5 mr-2" aria-hidden="true" />
          Nouvelle règle
        </Button>
      </main>

      {/* Éditeur en bottom sheet */}
      <AnimatePresence>
        {editor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal bg-black/60 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={editor.ruleId ? 'Modifier la règle' : 'Nouvelle règle'}
            onClick={() => setEditor(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-bg border-t-2 sm:border border-ink sm:rounded-card sm:shadow-gravure-forte p-5 pb-safe-6 max-h-[88vh] overflow-y-auto"
            >
              <h2 className="font-display text-lg uppercase tracking-tight text-ink mb-4">
                {editor.ruleId ? 'Modifier la règle' : 'Nouvelle règle'}
              </h2>

              {/* Type de règle */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(
                  [
                    { kind: 'prompt' as const, label: 'Carte de jeu' },
                    { kind: 'roulette' as const, label: 'Roulette' },
                  ]
                ).map(({ kind, label }) => (
                  <button
                    key={kind}
                    onClick={() => setEditor({ ...editor, kind })}
                    aria-pressed={editor.kind === kind}
                    className={cn(
                      'min-h-[44px] rounded-control border-2 font-sans font-bold text-sm transition-colors focus-ring-neon',
                      editor.kind === kind
                        ? 'bg-aplat-1 text-tile-ink border-tile-ink shadow-gravure'
                        : 'bg-surface text-ink border-ink'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Texte */}
              <label htmlFor="rule-text" className="block text-ink font-sans font-bold text-sm mb-1.5">
                Texte de la règle
              </label>
              <textarea
                id="rule-text"
                value={editor.text}
                onChange={(e) => setEditor({ ...editor, text: e.target.value.slice(0, 280) })}
                rows={3}
                placeholder="Ex. : Le joueur imite un animal choisi par un autre joueur, sinon 2 pénalités."
                className="w-full rounded-control bg-surface border-2 border-ink p-3 font-sans text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-neon resize-none"
              />
              {/* Les deux boutons affichaient `{player}` et `{player2}`, tels
                  quels. Ça se lit comme une variable d'environnement, pas comme
                  une phrase, et rien ne disait ce que ça allait devenir à
                  l'écran. Le bouton porte désormais ce qu'il REMPLACE ; le
                  jeton, lui, reste inséré dans le texte, où l'aperçu juste
                  en dessous montre déjà le nom réel d'un joueur de la tablée. */}
              <div className="flex gap-2 mt-2 mb-1">
                {[
                  { jeton: '{player}', libelle: 'Le joueur' },
                  { jeton: '{player2}', libelle: 'Un autre joueur' },
                ].map(({ jeton, libelle }) => (
                  <button
                    key={jeton}
                    onClick={() => insertToken(jeton)}
                    aria-label={`Insérer ${libelle.toLowerCase()} dans le texte de la règle`}
                    className="px-3 min-h-[36px] rounded-pill bg-surface border border-ink hover:border-tile-ink font-sans font-bold text-xs text-ink hover:bg-aplat-1 hover:text-tile-ink focus-ring-neon"
                  >
                    + {libelle}
                  </button>
                ))}
                <span className="ml-auto text-ink-muted font-mono text-xs self-center tabular-nums">
                  {editor.text.length}/280
                </span>
              </div>
              {preview && (
                <p className="text-ink-secondary font-sans text-sm bg-surface rounded-control border border-border px-3 py-2 mb-3">
                  Aperçu : {preview}
                </p>
              )}

              {/* Modes ciblés (cartes uniquement) */}
              {editor.kind === 'prompt' && (
                <>
                  <p className="text-ink font-sans font-bold text-sm mb-1.5 mt-3">
                    Jeux concernés <span className="font-normal text-ink-muted">(aucun = tous)</span>
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PROMPT_MODES.map((mode) => (
                      <button
                        key={mode}
                        onClick={() => toggleMode(mode)}
                        aria-pressed={editor.modes.includes(mode)}
                        className={cn(
                          'px-3 min-h-[36px] rounded-pill border font-sans text-xs font-medium focus-ring-neon',
                          editor.modes.includes(mode)
                            ? 'bg-aplat-4 text-tile-ink border-tile-ink'
                            : 'bg-surface text-ink border-ink'
                        )}
                      >
                        {getModeDefinition(mode).title}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Pénalité */}
              <div className="flex items-center justify-between mt-3 mb-5">
                <span className="text-ink font-sans font-bold text-sm">Pénalités en cas d'échec</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditor({ ...editor, sips: Math.max(0, editor.sips - 1) })}
                    aria-label="Moins de pénalités"
                    className="w-11 h-11 rounded-control bg-surface border-2 border-ink font-bold text-lg focus-ring-neon"
                  >
                    -
                  </button>
                  <span className="font-mono tabular-nums font-bold text-lg w-6 text-center" aria-live="polite">
                    {editor.sips}
                  </span>
                  <button
                    onClick={() => setEditor({ ...editor, sips: Math.min(5, editor.sips + 1) })}
                    aria-label="Plus de pénalités"
                    className="w-11 h-11 rounded-control bg-surface border-2 border-ink font-bold text-lg focus-ring-neon"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="primary" className="w-full" onClick={handleSave} disabled={!editor.text.trim()}>
                  {editor.ruleId ? 'Enregistrer' : 'Ajouter la règle'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setEditor(null)}>
                  Annuler
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
