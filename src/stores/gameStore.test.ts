import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'
import { useEntitlementStore } from './entitlementStore'
import { DEFAULT_BORDERLAND_OPTIONS } from '@/types'

function resetStores() {
  useGameStore.setState({
    players: [],
    gameOptions: DEFAULT_BORDERLAND_OPTIONS,
    deck: [],
    discardPile: [],
    currentPlayerIndex: 0,
    currentCard: null,
    isCardRevealed: false,
    contestState: { active: false, level: 0, baseCard: null, challenger: null },
    gamePhase: 'setup',
  })
  useEntitlementStore.setState({ isPremium: false, hasChecked: false })
}

beforeEach(() => {
  resetStores()
  window.localStorage.clear()
})

/**
 * P1b - le mode "cartes aleatoires a l'infini" est un avantage premium. `gameOptions`
 * vit dans localStorage (partialize) et est donc editable a la main hors app : le
 * runtime doit revalider `infinite` contre l'entitlement reel, jamais faire confiance
 * au seul rendu du bouton du hub.
 */
describe('gameStore - infinite mode entitlement enforcement', () => {
  it('setGameOptions strips infinite:true when the player is not premium', () => {
    useGameStore.getState().setGameOptions({ infinite: true })

    expect(useGameStore.getState().gameOptions.infinite).toBe(false)
  })

  it('setGameOptions keeps infinite:true when the player is premium', () => {
    useEntitlementStore.setState({ isPremium: true })

    useGameStore.getState().setGameOptions({ infinite: true })

    expect(useGameStore.getState().gameOptions.infinite).toBe(true)
  })

  it('initGame neutralizes a tampered localStorage entry (infinite:true, no premium)', () => {
    useGameStore.setState({
      players: [],
      gameOptions: { ...DEFAULT_BORDERLAND_OPTIONS, infinite: true },
    })
    useEntitlementStore.setState({ isPremium: false })

    useGameStore.getState().initGame(['Alice', 'Bob'])

    expect(useGameStore.getState().gameOptions.infinite).toBe(false)
  })

  it('initGame preserves infinite:true for a premium player', () => {
    useGameStore.setState({
      players: [],
      gameOptions: { ...DEFAULT_BORDERLAND_OPTIONS, infinite: true },
    })
    useEntitlementStore.setState({ isPremium: true })

    useGameStore.getState().initGame(['Alice', 'Bob'])

    expect(useGameStore.getState().gameOptions.infinite).toBe(true)
  })
})

/**
 * P1d - une contestation opposait toujours le joueur courant a lui-meme ("Adam VS
 * Adam") et la penalite retombait systematiquement sur lui. `resolveContest` accepte
 * deja un joueur arbitraire : ce test verifie que le perdant credite peut etre le
 * contestataire (challenger), distinct du joueur defie.
 */
describe('gameStore - contest resolves to an arbitrary loser, not always the current player', () => {
  it('credits the challenger (not the challenged current player) when they lose the contest', () => {
    useGameStore.getState().initGame(['Adam', 'Nawel'])
    const [adam, nawel] = useGameStore.getState().players
    useGameStore.setState({
      currentCard: { id: 'c1', suit: 'hearts', rank: '5', value: 5, unit: 'gorgees' },
      isCardRevealed: true,
    })

    // Nawel conteste la carte d'Adam (le joueur courant) - le challenger est bien
    // distinct du joueur defie, plus jamais le meme identifiant des deux cotes.
    useGameStore.getState().startContest(nawel)
    const { contestState } = useGameStore.getState()
    expect(contestState.challenger?.id).toBe(nawel.id)
    expect(contestState.challenger?.id).not.toBe(adam.id)

    // Nawel perd la contestation : c'est bien elle qui est creditee, pas Adam par defaut.
    const penalty = useGameStore.getState().resolveContest(nawel)

    expect(penalty).not.toBeNull()
    const updatedNawel = useGameStore.getState().players.find((p) => p.id === nawel.id)
    const updatedAdam = useGameStore.getState().players.find((p) => p.id === adam.id)
    expect(updatedNawel?.contestsLost).toBe(1)
    expect(updatedAdam?.contestsLost ?? 0).toBe(0)
  })

  it('can also credit the challenged current player when they are the real loser', () => {
    useGameStore.getState().initGame(['Adam', 'Nawel'])
    const [adam, nawel] = useGameStore.getState().players
    useGameStore.setState({
      currentCard: { id: 'c1', suit: 'hearts', rank: '5', value: 5, unit: 'gorgees' },
      isCardRevealed: true,
    })

    useGameStore.getState().startContest(nawel)
    useGameStore.getState().resolveContest(adam)

    const updatedAdam = useGameStore.getState().players.find((p) => p.id === adam.id)
    expect(updatedAdam?.contestsLost).toBe(1)
  })
})
