import { PlayingCard } from './PlayingCard'
import { RANKS, SUITS } from '@/core/borderland'
import type { Card } from '@/types'

/**
 * Galerie de debug design : les 52 cartes face visible sur une page.
 * Accessible via `/?cards` - sert à vérifier les dispositions de pips et les
 * figures sans devoir piocher tout le paquet en jeu.
 */
export function CardGallery() {
  return (
    <div className="min-h-dvh bg-bg p-6">
      <h1 className="font-display text-2xl uppercase text-ink mb-6">Galerie des 52 cartes</h1>
      {SUITS.map((suit) => (
        <div key={suit} className="mb-8">
          <div className="flex flex-wrap gap-4">
            {RANKS.map((rank) => {
              const card: Card = {
                id: `${suit}-${rank}`,
                suit,
                rank,
                value: 1,
                unit: 'gorgees',
              }
              return <PlayingCard key={card.id} card={card} size="md" isRevealed />
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
