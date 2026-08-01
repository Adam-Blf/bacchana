// La Roulette - mode embarqué, sans pack de contenu (pas de fichier JSON source).
// 8 segments store-safe : uniquement des pénalités abstraites, jamais d'alcool nommé.

export interface RouletteSegment {
  id: string
  label: string
  detail: string
}

export const ROULETTE_SEGMENTS: RouletteSegment[] = [
  { id: 'rou-01', label: '1 pénalité', detail: 'Le sort est plutôt clément.' },
  { id: 'rou-02', label: '2 pénalités', detail: 'Un petit rappel à l\'ordre.' },
  { id: 'rou-03', label: '3 pénalités', detail: 'La roue ne fait pas de cadeau.' },
  { id: 'rou-04', label: 'PÉNALITÉ MAJEURE', detail: 'Le pire tirage possible.' },
  { id: 'rou-05', label: 'Distribue 2', detail: 'Choisis deux joueurs qui prennent 1 pénalité chacun.' },
  { id: 'rou-06', label: 'Immunité', detail: 'Aucune pénalité au prochain tour, quoi qu\'il arrive.' },
  { id: 'rou-07', label: 'Tout le monde', detail: 'Toute la table prend 1 pénalité.' },
  { id: 'rou-08', label: 'Rejoue', detail: 'Relance la roue immédiatement.' },
]
