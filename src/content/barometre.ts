// Le Baromètre - mode embarqué, sans pack de contenu.
//
// L'aiguilleur voit une cible cachée posée sur un axe entre deux extrêmes, et
// n'a qu'UN mot pour la faire deviner à la tablée. Mécanique reprise du jeu
// « GetMe - Guess your friends » et rhabillée pour le comptoir : chez nous
// l'écart ne rapporte pas des points, il distribue des pénalités.
//
// Ce qui fait un bon axe, et pourquoi ce n'est pas une liste de contraires
// pris au hasard :
//
//   - Les deux bouts doivent être GRADUABLES. « Vivant / Mort » n'a pas de
//     milieu, donc aucune cible à 43 % n'a de sens et le mot ne peut rien dire.
//   - L'axe doit se juger SANS connaissance : « Soluble / Insoluble » demande
//     un cours de chimie, « Ringard / Stylé » demande seulement de se connaître.
//     C'est tout le jeu : le même mot ne tombe pas au même endroit selon qui
//     l'entend.
//   - Rien qui vise un trait subi, et rien qui sorte de la pièce. Même règle
//     que les paquets de cartes, pour la même raison.
//
// Store-safe : jamais d'alcool nommé, aucune pénalité formulée en boisson.

export interface AxeBarometre {
  id: string
  /** L'extrême de gauche, à 0 sur le cadran. */
  gauche: string
  /** L'extrême de droite, à 100 sur le cadran. */
  droite: string
}

export const AXES_BAROMETRE: AxeBarometre[] = [
  { id: 'bm-01', gauche: 'Glacial', droite: 'Brûlant' },
  { id: 'bm-02', gauche: 'Ringard', droite: 'Stylé' },
  { id: 'bm-03', gauche: 'Inutile', droite: 'Indispensable' },
  { id: 'bm-04', gauche: 'Surcoté', droite: 'Sous-coté' },
  { id: 'bm-05', gauche: 'Silencieux', droite: 'Assourdissant' },
  { id: 'bm-06', gauche: 'Radin', droite: 'Flambeur' },
  { id: 'bm-07', gauche: 'Banal', droite: 'Mémorable' },
  { id: 'bm-08', gauche: 'Pardonnable', droite: 'Impardonnable' },
  { id: 'bm-09', gauche: 'Timide', droite: 'Cash' },
  { id: 'bm-10', gauche: 'Gratuit', droite: 'Hors de prix' },
  { id: 'bm-11', gauche: 'Interdit', droite: 'Autorisé' },
  { id: 'bm-12', gauche: 'Minuscule', droite: 'Énorme' },
  { id: 'bm-13', gauche: 'Triste', droite: 'Réjouissant' },
  { id: 'bm-14', gauche: 'Facile', droite: 'Impossible' },
  { id: 'bm-15', gauche: 'Discret', droite: 'Voyant' },
  { id: 'bm-16', gauche: 'Fragile', droite: 'Incassable' },
  { id: 'bm-17', gauche: 'Assommant', droite: 'Passionnant' },
  { id: 'bm-18', gauche: 'Démodé', droite: 'Moderne' },
  { id: 'bm-19', gauche: 'Sucré', droite: 'Salé' },
  { id: 'bm-20', gauche: 'Léger', droite: 'Lourd' },
  { id: 'bm-21', gauche: 'Calme', droite: 'Chaotique' },
  { id: 'bm-22', gauche: 'Poli', droite: 'Grossier' },
  { id: 'bm-23', gauche: 'Tiède', droite: 'Épicé' },
  { id: 'bm-24', gauche: 'Prudent', droite: 'Casse-cou' },
  { id: 'bm-25', gauche: 'Matinal', droite: 'Noctambule' },
  { id: 'bm-26', gauche: 'Naze', droite: 'Culte' },
  { id: 'bm-27', gauche: 'Kitsch', droite: 'Chic' },
  { id: 'bm-28', gauche: 'Innocent', droite: 'Coupable' },
  { id: 'bm-29', gauche: 'Mignon', droite: 'Effrayant' },
  { id: 'bm-30', gauche: 'Simple', droite: 'Usine à gaz' },
  { id: 'bm-31', gauche: 'Pratique', droite: 'Encombrant' },
  { id: 'bm-32', gauche: 'Poétique', droite: 'Cru' },
  { id: 'bm-33', gauche: 'Intime', droite: 'Sur la place publique' },
  { id: 'bm-34', gauche: 'Reposant', droite: 'Stressant' },
  { id: 'bm-35', gauche: 'Amical', droite: 'Hostile' },
  { id: 'bm-36', gauche: 'Périmé', droite: 'Tout frais' },
  { id: 'bm-37', gauche: 'Minimaliste', droite: 'Extravagant' },
  { id: 'bm-38', gauche: 'Courageux', droite: 'Lâche' },
  { id: 'bm-39', gauche: 'Normal', droite: 'Perturbant' },
  { id: 'bm-40', gauche: 'Canapé', droite: 'Marathon' },
  { id: 'bm-41', gauche: 'Enfantin', droite: 'Très adulte' },
  { id: 'bm-42', gauche: 'Délicat', droite: 'Brutal' },
  { id: 'bm-43', gauche: 'Avouable', droite: 'Inavouable' },
  { id: 'bm-44', gauche: 'Oubliable', droite: 'Traumatisant' },
]
