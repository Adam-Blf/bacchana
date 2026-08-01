// Quitte ou Trinque - mode embarqué, sans pack de contenu.
// Questions de culture générale 100 % originales, vérification orale par la table.
// Store-safe : jamais d'alcool nommé, uniquement des « pénalités ».

export type QuizCategory =
  | 'Culture G'
  | 'Sport'
  | 'Musique'
  | 'Ciné & séries'
  | 'À table'
  | 'Histoire-géo'

export interface QuizQuestion {
  id: string
  category: QuizCategory
  question: string
  answer: string
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Histoire-géo
  { id: 'qz-001', category: 'Histoire-géo', question: 'Quelle est la capitale de l\'Australie ?', answer: 'Canberra (et non Sydney)' },
  { id: 'qz-002', category: 'Histoire-géo', question: 'En quelle année est tombé le mur de Berlin ?', answer: '1989' },
  { id: 'qz-003', category: 'Histoire-géo', question: 'Quel est le plus long fleuve de France ?', answer: 'La Loire' },
  { id: 'qz-004', category: 'Histoire-géo', question: 'Combien y a-t-il de pays frontaliers de la France métropolitaine ?', answer: '8 (Belgique, Luxembourg, Allemagne, Suisse, Italie, Monaco, Espagne, Andorre)' },
  { id: 'qz-005', category: 'Histoire-géo', question: 'Quel océan borde la Californie ?', answer: 'L\'océan Pacifique' },
  { id: 'qz-006', category: 'Histoire-géo', question: 'Qui était le premier président de la Ve République française ?', answer: 'Charles de Gaulle' },
  { id: 'qz-007', category: 'Histoire-géo', question: 'Quelle est la plus haute montagne d\'Afrique ?', answer: 'Le Kilimandjaro' },
  { id: 'qz-008', category: 'Histoire-géo', question: 'Dans quel pays se trouve le Machu Picchu ?', answer: 'Au Pérou' },
  { id: 'qz-009', category: 'Histoire-géo', question: 'Quelle mer sépare l\'Europe de l\'Afrique ?', answer: 'La mer Méditerranée' },
  { id: 'qz-010', category: 'Histoire-géo', question: 'En quelle année a eu lieu le premier pas sur la Lune ?', answer: '1969' },

  // Culture G
  { id: 'qz-011', category: 'Culture G', question: 'Combien de côtés possède un hexagone ?', answer: '6' },
  { id: 'qz-012', category: 'Culture G', question: 'Quel est le symbole chimique de l\'or ?', answer: 'Au' },
  { id: 'qz-013', category: 'Culture G', question: 'Combien de dents possède un adulte (dents de sagesse comprises) ?', answer: '32' },
  { id: 'qz-014', category: 'Culture G', question: 'Quelle planète est la plus proche du Soleil ?', answer: 'Mercure' },
  { id: 'qz-015', category: 'Culture G', question: 'Qui a peint « La Nuit étoilée » ?', answer: 'Vincent van Gogh' },
  { id: 'qz-016', category: 'Culture G', question: 'Combien de temps met la Terre pour faire le tour du Soleil ?', answer: 'Environ 365 jours (un an)' },
  { id: 'qz-017', category: 'Culture G', question: 'Quel animal est le plus rapide du monde en pointe ?', answer: 'Le faucon pèlerin (en piqué) - accepté : le guépard sur terre' },
  { id: 'qz-018', category: 'Culture G', question: 'Combien y a-t-il de lettres dans l\'alphabet français ?', answer: '26' },
  { id: 'qz-019', category: 'Culture G', question: 'Quel écrivain a créé le personnage d\'Arsène Lupin ?', answer: 'Maurice Leblanc' },
  { id: 'qz-020', category: 'Culture G', question: 'De quelle couleur est le sang d\'une pieuvre ?', answer: 'Bleu' },

  // Sport
  { id: 'qz-021', category: 'Sport', question: 'Combien de joueurs composent une équipe de football sur le terrain ?', answer: '11' },
  { id: 'qz-022', category: 'Sport', question: 'Tous les combien d\'années ont lieu les Jeux olympiques d\'été ?', answer: 'Tous les 4 ans' },
  { id: 'qz-023', category: 'Sport', question: 'Dans quel sport parle-t-on de « grand chelem » ?', answer: 'Le tennis (accepté : rugby, baseball)' },
  { id: 'qz-024', category: 'Sport', question: 'Combien de points vaut un essai au rugby ?', answer: '5 points' },
  { id: 'qz-025', category: 'Sport', question: 'Quelle est la distance officielle d\'un marathon ?', answer: '42,195 km' },
  { id: 'qz-026', category: 'Sport', question: 'Quel pays a remporté la Coupe du monde de football 2018 ?', answer: 'La France' },
  { id: 'qz-027', category: 'Sport', question: 'Dans quel sport s\'illustre Teddy Riner ?', answer: 'Le judo' },
  { id: 'qz-028', category: 'Sport', question: 'Combien de sets faut-il gagner pour remporter un match de tennis en Grand Chelem chez les hommes ?', answer: '3 sets' },
  { id: 'qz-029', category: 'Sport', question: 'Quelle course cycliste se termine traditionnellement sur les Champs-Élysées ?', answer: 'Le Tour de France' },
  { id: 'qz-030', category: 'Sport', question: 'Au basket, combien de points vaut un panier marqué derrière la ligne ?', answer: '3 points' },

  // Musique
  { id: 'qz-031', category: 'Musique', question: 'Combien de cordes possède une guitare classique ?', answer: '6' },
  { id: 'qz-032', category: 'Musique', question: 'Quel groupe anglais a chanté « Bohemian Rhapsody » ?', answer: 'Queen' },
  { id: 'qz-033', category: 'Musique', question: 'Quel chanteur belge a popularisé « Ne me quitte pas » ?', answer: 'Jacques Brel' },
  { id: 'qz-034', category: 'Musique', question: 'Combien de touches possède un piano standard ?', answer: '88' },
  { id: 'qz-035', category: 'Musique', question: 'Quelle chanteuse française est surnommée « la Môme » ?', answer: 'Édith Piaf' },
  { id: 'qz-036', category: 'Musique', question: 'Quel instrument joue principalement un batteur ?', answer: 'La batterie' },
  { id: 'qz-037', category: 'Musique', question: 'De quel pays vient le groupe ABBA ?', answer: 'La Suède' },
  { id: 'qz-038', category: 'Musique', question: 'Quel rappeur français a sorti l\'album « Deux frères » ?', answer: 'PNL' },
  { id: 'qz-039', category: 'Musique', question: 'Combien y a-t-il de notes dans une gamme majeure classique (sans l\'octave) ?', answer: '7' },
  { id: 'qz-040', category: 'Musique', question: 'Quel roi de la pop a inventé le moonwalk (ou l\'a rendu célèbre) ?', answer: 'Michael Jackson' },

  // Ciné & séries
  { id: 'qz-041', category: 'Ciné & séries', question: 'Quel réalisateur a signé « Pulp Fiction » ?', answer: 'Quentin Tarantino' },
  { id: 'qz-042', category: 'Ciné & séries', question: 'Comment s\'appelle l\'école de sorciers dans Harry Potter ?', answer: 'Poudlard' },
  { id: 'qz-043', category: 'Ciné & séries', question: 'Quel acteur incarne Jack dans « Titanic » ?', answer: 'Leonardo DiCaprio' },
  { id: 'qz-044', category: 'Ciné & séries', question: 'Dans quelle ville se déroule la série « Friends » ?', answer: 'New York' },
  { id: 'qz-045', category: 'Ciné & séries', question: 'Quel est le prénom du héros de « Retour vers le futur » ?', answer: 'Marty (McFly)' },
  { id: 'qz-046', category: 'Ciné & séries', question: 'Quel studio d\'animation a créé « Toy Story » ?', answer: 'Pixar' },
  { id: 'qz-047', category: 'Ciné & séries', question: 'Comment s\'appelle le vaisseau de Han Solo dans Star Wars ?', answer: 'Le Faucon Millenium' },
  { id: 'qz-048', category: 'Ciné & séries', question: 'Quelle série espagnole met en scène un braquage de la Fabrique de la monnaie ?', answer: 'La Casa de Papel' },
  { id: 'qz-049', category: 'Ciné & séries', question: 'Quel personnage vert et grincheux vit dans un marais ?', answer: 'Shrek' },
  { id: 'qz-050', category: 'Ciné & séries', question: 'Combien y a-t-il de films dans la saga « Le Seigneur des anneaux » (trilogie originale) ?', answer: '3' },

  // À table
  { id: 'qz-051', category: 'À table', question: 'Quel fromage italien est l\'ingrédient star du tiramisu ?', answer: 'Le mascarpone' },
  { id: 'qz-052', category: 'À table', question: 'De quel pays vient la paella ?', answer: 'L\'Espagne' },
  { id: 'qz-053', category: 'À table', question: 'Quel légume est la base du guacamole ?', answer: 'L\'avocat (techniquement un fruit - accepté)' },
  { id: 'qz-054', category: 'À table', question: 'Quelle pâtisserie française porte le nom d\'un éclair de génie ? Indice : chocolat ou café.', answer: 'L\'éclair' },
  { id: 'qz-055', category: 'À table', question: 'Quel est l\'ingrédient principal du houmous ?', answer: 'Les pois chiches' },
  { id: 'qz-056', category: 'À table', question: 'De quelle région française vient la quiche ?', answer: 'La Lorraine' },
  { id: 'qz-057', category: 'À table', question: 'Quel fruit sec est à la base du Nutella (avec le cacao) ?', answer: 'La noisette' },
  { id: 'qz-058', category: 'À table', question: 'Comment appelle-t-on un plat de pâtes aux œufs, lardons et parmesan ?', answer: 'Une carbonara' },
  { id: 'qz-059', category: 'À table', question: 'Quelle épice donne sa couleur jaune au curry ?', answer: 'Le curcuma' },
  { id: 'qz-060', category: 'À table', question: 'Quel pays a inventé les sushis ?', answer: 'Le Japon' },
]
