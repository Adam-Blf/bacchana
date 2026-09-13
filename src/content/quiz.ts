// Quitte ou Double - mode embarqué, sans pack de contenu.
// Questions de culture générale 100 % originales, vérification orale par la table.
// Store-safe : jamais d'alcool nommé, uniquement des « pénalités ».
//
// TROIS DÉFAUTS CORRIGÉS LE 2026-09-13, tous remontés de la même soirée de test.
//
// 1. LA RÉPONSE ÉTAIT DANS LA QUESTION. « Combien y a-t-il de films dans la saga
//    Le Seigneur des anneaux (trilogie originale) ? » : le mot « trilogie »
//    répond à la place du joueur. Même défaut sur « Quel instrument joue
//    principalement un batteur ? » (la batterie), sur « Quelle pâtisserie porte
//    le nom d'un éclair de génie ? » (l'éclair), et sur « Quel ROI DE LA POP a
//    inventé le moonwalk ? ». Une question qui se répond toute seule n'est pas
//    facile, elle est vide : la tablée n'a rien à jouer.
//
// 2. CERTAINES QUESTIONS N'AVAIENT PAS DE SENS. « Quel légume est la base du
//    guacamole ? » avec pour réponse « l'avocat (techniquement un fruit) » : la
//    question se corrige elle-même dans sa réponse. « Quel animal est le plus
//    rapide du monde en pointe ? » répondait « le faucon pèlerin, accepté : le
//    guépard » - deux réponses justes veut dire aucune, et c'est la table qui se
//    dispute à 23 h.
//
// 3. LE VRAI ÉTAIT APPROXIMATIF. La carbonara ne se fait pas au parmesan, et
//    « dans quel sport parle-t-on de grand chelem ? » vaut pour le tennis, le
//    rugby, le golf et le baseball. Une question de culture générale qui se
//    trompe décrédibilise les cinquante-neuf autres.
//
// Le paquet passe de 60 à 120 questions au passage : à quinze cartes par
// manche, soixante questions revenaient dès la quatrième partie de la soirée.
//
// `src/content/quiz.test.ts` verrouille ces trois défauts. La règle de fond :
// AUCUN mot de la réponse ne doit apparaître dans la question, et une réponse
// n'a jamais deux variantes acceptées.

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
  { id: 'qz-005', category: 'Histoire-géo', question: 'Quel océan borde la Californie ?', answer: 'Le Pacifique' },
  { id: 'qz-006', category: 'Histoire-géo', question: 'Qui était le premier président de la Ve République française ?', answer: 'Charles de Gaulle' },
  { id: 'qz-007', category: 'Histoire-géo', question: 'Quelle est la plus haute montagne d\'Afrique ?', answer: 'Le Kilimandjaro' },
  { id: 'qz-008', category: 'Histoire-géo', question: 'Dans quel pays se trouve le Machu Picchu ?', answer: 'Au Pérou' },
  { id: 'qz-009', category: 'Histoire-géo', question: 'Quelle mer sépare l\'Europe de l\'Afrique ?', answer: 'La Méditerranée' },
  { id: 'qz-010', category: 'Histoire-géo', question: 'En quelle année a eu lieu le premier pas sur la Lune ?', answer: '1969' },
  { id: 'qz-061', category: 'Histoire-géo', question: 'Quel pays compte le plus d\'habitants au monde ?', answer: 'L\'Inde (elle a dépassé la Chine en 2023)' },
  { id: 'qz-062', category: 'Histoire-géo', question: 'Quel détroit sépare la France de l\'Angleterre ?', answer: 'Le pas de Calais' },
  { id: 'qz-063', category: 'Histoire-géo', question: 'En quelle année a commencé la Première Guerre mondiale ?', answer: '1914' },
  { id: 'qz-064', category: 'Histoire-géo', question: 'Quel empereur français a fini sa vie en exil à Sainte-Hélène ?', answer: 'Napoléon Ier' },
  { id: 'qz-065', category: 'Histoire-géo', question: 'Quelle est la plus grande île du monde ?', answer: 'Le Groenland' },
  { id: 'qz-066', category: 'Histoire-géo', question: 'Quel pays a pour capitale Ottawa ?', answer: 'Le Canada' },
  { id: 'qz-067', category: 'Histoire-géo', question: 'Quel monument parisien a été bâti pour l\'Exposition universelle de 1889 ?', answer: 'La tour Eiffel' },
  { id: 'qz-068', category: 'Histoire-géo', question: 'Quel fleuve traverse Le Caire ?', answer: 'Le Nil' },
  { id: 'qz-069', category: 'Histoire-géo', question: 'Combien d\'États comptent les États-Unis ?', answer: '50' },
  { id: 'qz-070', category: 'Histoire-géo', question: 'Quelle chaîne de montagnes sépare l\'Espagne de la France ?', answer: 'Les Pyrénées' },

  // Culture G
  { id: 'qz-012', category: 'Culture G', question: 'Quel est le symbole chimique de l\'or ?', answer: 'Au' },
  { id: 'qz-013', category: 'Culture G', question: 'Combien de dents possède un adulte, dents de sagesse comprises ?', answer: '32' },
  { id: 'qz-014', category: 'Culture G', question: 'Quelle planète est la plus proche du Soleil ?', answer: 'Mercure' },
  { id: 'qz-015', category: 'Culture G', question: 'Qui a peint « La Nuit étoilée » ?', answer: 'Vincent van Gogh' },
  { id: 'qz-019', category: 'Culture G', question: 'Quel écrivain a créé le personnage d\'Arsène Lupin ?', answer: 'Maurice Leblanc' },
  { id: 'qz-020', category: 'Culture G', question: 'De quelle couleur est le sang d\'une pieuvre ?', answer: 'Bleu' },
  // Reformulée : deux réponses étaient « acceptées », donc aucune ne l'était.
  { id: 'qz-017', category: 'Culture G', question: 'Quel est l\'animal terrestre le plus rapide ?', answer: 'Le guépard (environ 110 km/h)' },
  { id: 'qz-071', category: 'Culture G', question: 'Quel est l\'os le plus long du corps humain ?', answer: 'Le fémur' },
  { id: 'qz-072', category: 'Culture G', question: 'Quel gaz les plantes absorbent-elles pour leur photosynthèse ?', answer: 'Le dioxyde de carbone' },
  { id: 'qz-073', category: 'Culture G', question: 'Combien de temps met la lumière du Soleil pour nous parvenir ?', answer: 'Environ 8 minutes' },
  { id: 'qz-074', category: 'Culture G', question: 'Quel organe produit l\'insuline ?', answer: 'Le pancréas' },
  { id: 'qz-075', category: 'Culture G', question: 'Combien d\'os compte le squelette d\'un adulte ?', answer: '206' },
  { id: 'qz-076', category: 'Culture G', question: 'Quelle est la plus grosse planète du système solaire ?', answer: 'Jupiter' },
  { id: 'qz-077', category: 'Culture G', question: 'Qui a formulé la théorie de la relativité ?', answer: 'Albert Einstein' },
  { id: 'qz-078', category: 'Culture G', question: 'Quel métal reste liquide à température ambiante ?', answer: 'Le mercure' },
  { id: 'qz-079', category: 'Culture G', question: 'Quelle langue compte le plus de locuteurs natifs au monde ?', answer: 'Le mandarin' },
  { id: 'qz-080', category: 'Culture G', question: 'Qui a écrit « Les Misérables » ?', answer: 'Victor Hugo' },
  { id: 'qz-081', category: 'Culture G', question: 'Quel est le plus petit pays du monde par sa superficie ?', answer: 'Le Vatican' },
  { id: 'qz-082', category: 'Culture G', question: 'Combien de secondes compte une journée ?', answer: '86 400' },
  { id: 'qz-083', category: 'Culture G', question: 'Qui a découvert la pénicilline ?', answer: 'Alexander Fleming' },

  // Sport
  { id: 'qz-021', category: 'Sport', question: 'Combien de joueurs composent une équipe de football sur le terrain ?', answer: '11' },
  { id: 'qz-022', category: 'Sport', question: 'Tous les combien d\'années ont lieu les Jeux olympiques d\'été ?', answer: '4 ans' },
  // Reformulée : « grand chelem » se dit aussi au rugby, au golf et au baseball.
  { id: 'qz-023', category: 'Sport', question: 'Combien de tournois composent le Grand Chelem de tennis ?', answer: '4 (Open d\'Australie, Roland-Garros, Wimbledon, US Open)' },
  { id: 'qz-024', category: 'Sport', question: 'Combien de points vaut un essai au rugby ?', answer: '5' },
  { id: 'qz-025', category: 'Sport', question: 'Quelle est la distance officielle d\'un marathon ?', answer: '42,195 km' },
  { id: 'qz-026', category: 'Sport', question: 'Quel pays a remporté la Coupe du monde de football 2018 ?', answer: 'La France' },
  { id: 'qz-027', category: 'Sport', question: 'Dans quel sport s\'illustre Teddy Riner ?', answer: 'Le judo' },
  { id: 'qz-028', category: 'Sport', question: 'Combien de manches faut-il gagner pour remporter un match masculin en Grand Chelem de tennis ?', answer: '3' },
  { id: 'qz-029', category: 'Sport', question: 'Quelle course cycliste se termine traditionnellement sur les Champs-Élysées ?', answer: 'Le Tour de France' },
  { id: 'qz-030', category: 'Sport', question: 'Au basket, combien de points vaut un panier marqué derrière la ligne ?', answer: '3' },
  { id: 'qz-084', category: 'Sport', question: 'Dans quel sport utilise-t-on un volant ?', answer: 'Le badminton' },
  { id: 'qz-085', category: 'Sport', question: 'Combien de joueurs une équipe de volley aligne-t-elle sur le terrain ?', answer: '6' },
  { id: 'qz-086', category: 'Sport', question: 'Quel nageur a remporté le plus de titres olympiques ?', answer: 'Michael Phelps' },
  { id: 'qz-087', category: 'Sport', question: 'Combien de trous compte un parcours de golf complet ?', answer: '18' },
  { id: 'qz-088', category: 'Sport', question: 'Quelle sélection nationale de football a gagné le plus de Coupes du monde ?', answer: 'Le Brésil (5 titres)' },
  { id: 'qz-089', category: 'Sport', question: 'Dans quel sport décerne-t-on le Ballon d\'or ?', answer: 'Le football' },
  { id: 'qz-090', category: 'Sport', question: 'Combien de minutes dure un match de football, prolongations non comprises ?', answer: '90' },
  { id: 'qz-091', category: 'Sport', question: 'Quel maillot porte le meilleur grimpeur sur le Tour de France ?', answer: 'Le blanc à pois rouges' },
  { id: 'qz-092', category: 'Sport', question: 'Dans quel sport s\'affrontent les All Blacks ?', answer: 'Le rugby' },
  { id: 'qz-093', category: 'Sport', question: 'Combien de joueurs compte une équipe de handball sur le terrain ?', answer: '7, gardien compris' },

  // Musique
  { id: 'qz-031', category: 'Musique', question: 'Combien de cordes possède une guitare classique ?', answer: '6' },
  { id: 'qz-032', category: 'Musique', question: 'Quel groupe anglais a chanté « Bohemian Rhapsody » ?', answer: 'Queen' },
  { id: 'qz-033', category: 'Musique', question: 'Quel chanteur belge a popularisé « Ne me quitte pas » ?', answer: 'Jacques Brel' },
  { id: 'qz-034', category: 'Musique', question: 'Combien de touches possède un piano standard ?', answer: '88' },
  { id: 'qz-035', category: 'Musique', question: 'Quelle chanteuse française est surnommée « la Môme » ?', answer: 'Édith Piaf' },
  { id: 'qz-037', category: 'Musique', question: 'De quel pays vient le groupe ABBA ?', answer: 'La Suède' },
  { id: 'qz-038', category: 'Musique', question: 'Quel duo français a sorti l\'album « Deux frères » ?', answer: 'PNL' },
  { id: 'qz-039', category: 'Musique', question: 'Combien y a-t-il de notes dans une gamme majeure classique, sans l\'octave ?', answer: '7' },
  // Reformulée : « le roi de la pop » nommait la réponse dans la question.
  { id: 'qz-040', category: 'Musique', question: 'Qui a rendu le moonwalk célèbre en 1983, en dansant sur « Billie Jean » ?', answer: 'Michael Jackson' },
  { id: 'qz-094', category: 'Musique', question: 'Quel instrument Miles Davis a-t-il rendu célèbre ?', answer: 'La trompette' },
  { id: 'qz-095', category: 'Musique', question: 'Combien de musiciens composaient les Beatles ?', answer: '4' },
  { id: 'qz-096', category: 'Musique', question: 'Quel compositeur allemand, devenu sourd, a écrit la Neuvième Symphonie ?', answer: 'Ludwig van Beethoven' },
  { id: 'qz-097', category: 'Musique', question: 'Qui chante « Rolling in the Deep » ?', answer: 'Adele' },
  { id: 'qz-098', category: 'Musique', question: 'De quel pays vient le reggae ?', answer: 'La Jamaïque' },
  { id: 'qz-099', category: 'Musique', question: 'Quel artiste belge a chanté « Alors on danse » ?', answer: 'Stromae' },
  { id: 'qz-100', category: 'Musique', question: 'Combien de cordes compte un violon ?', answer: '4' },
  { id: 'qz-101', category: 'Musique', question: 'Dans quelle ville de Bretagne se tient le festival des Vieilles Charrues ?', answer: 'Carhaix' },
  { id: 'qz-102', category: 'Musique', question: 'Quelle note suit le sol dans la gamme ?', answer: 'Le la' },
  { id: 'qz-103', category: 'Musique', question: 'Quel groupe britannique a sorti « The Dark Side of the Moon » ?', answer: 'Pink Floyd' },
  { id: 'qz-104', category: 'Musique', question: 'Qui a composé « Les Quatre Saisons » ?', answer: 'Antonio Vivaldi' },

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
  // Remplace la question dont l'énoncé disait « trilogie » et attendait « 3 ».
  { id: 'qz-105', category: 'Ciné & séries', question: 'Dans quelle contrée vivent les Hobbits chez Tolkien ?', answer: 'La Comté' },
  { id: 'qz-106', category: 'Ciné & séries', question: 'Quelle réplique de Dark Vador révèle son lien avec Luke ?', answer: '« Je suis ton père »' },
  { id: 'qz-107', category: 'Ciné & séries', question: 'Quel acteur autrichien a joué Terminator ?', answer: 'Arnold Schwarzenegger' },
  { id: 'qz-108', category: 'Ciné & séries', question: 'Quelle série suit la famille Shelby à Birmingham ?', answer: 'Peaky Blinders' },
  { id: 'qz-109', category: 'Ciné & séries', question: 'Comment s\'appelle le lionceau héros du dessin animé de Disney sorti en 1994 ?', answer: 'Simba' },
  { id: 'qz-110', category: 'Ciné & séries', question: 'Quel réalisateur a signé « Inception » et « Interstellar » ?', answer: 'Christopher Nolan' },
  { id: 'qz-111', category: 'Ciné & séries', question: 'Quel studio japonais a produit « Mon voisin Totoro » ?', answer: 'Ghibli' },
  { id: 'qz-112', category: 'Ciné & séries', question: 'Dans quel État américain se déroule « Stranger Things » ?', answer: 'L\'Indiana' },
  { id: 'qz-113', category: 'Ciné & séries', question: 'Quel acteur français partage l\'affiche d\'« Intouchables » avec François Cluzet ?', answer: 'Omar Sy' },
  { id: 'qz-114', category: 'Ciné & séries', question: 'Quel film de Steven Spielberg a vidé les plages en 1975 ?', answer: 'Les Dents de la mer' },
  { id: 'qz-115', category: 'Ciné & séries', question: 'Comment s\'appelle le majordome de Batman ?', answer: 'Alfred (Pennyworth)' },

  // À table
  { id: 'qz-051', category: 'À table', question: 'Quel fromage italien est l\'ingrédient star du tiramisu ?', answer: 'Le mascarpone' },
  { id: 'qz-052', category: 'À table', question: 'De quel pays vient la paella ?', answer: 'L\'Espagne' },
  // Reformulée : la réponse corrigeait la question, qui parlait de légume.
  { id: 'qz-053', category: 'À table', question: 'Quel fruit est la base du guacamole ?', answer: 'L\'avocat' },
  { id: 'qz-055', category: 'À table', question: 'Quel est l\'ingrédient principal du houmous ?', answer: 'Les pois chiches' },
  { id: 'qz-056', category: 'À table', question: 'De quelle région française vient la quiche ?', answer: 'La Lorraine' },
  { id: 'qz-057', category: 'À table', question: 'Quel fruit sec est à la base du Nutella, avec le cacao ?', answer: 'La noisette' },
  // Reformulée : la recette romaine se fait au pecorino, jamais au parmesan.
  { id: 'qz-058', category: 'À table', question: 'Quelle sauce italienne se prépare avec des œufs, du fromage et du poivre, sans crème ?', answer: 'La carbonara' },
  { id: 'qz-059', category: 'À table', question: 'Quelle épice donne sa couleur jaune au curry ?', answer: 'Le curcuma' },
  { id: 'qz-060', category: 'À table', question: 'Quel pays a inventé les sushis ?', answer: 'Le Japon' },
  // Remplace la question dont l'énoncé nommait déjà « un éclair ».
  { id: 'qz-116', category: 'À table', question: 'Quelle pâtisserie française assemble deux coques d\'amande et une ganache ?', answer: 'Le macaron' },
  { id: 'qz-117', category: 'À table', question: 'Quel fromage français aux veines bleues vient de l\'Aveyron ?', answer: 'Le roquefort' },
  { id: 'qz-118', category: 'À table', question: 'De quel arbre vient le chocolat ?', answer: 'Le cacaoyer' },
  { id: 'qz-119', category: 'À table', question: 'Quel légume donne sa couleur rouge au bortsch ?', answer: 'La betterave' },
  { id: 'qz-120', category: 'À table', question: 'Quelle céréale sert de base au risotto ?', answer: 'Le riz' },
  { id: 'qz-121', category: 'À table', question: 'De quel pays vient le kimchi ?', answer: 'La Corée' },
  { id: 'qz-122', category: 'À table', question: 'Quel fromage fond sur une vraie pizza margherita ?', answer: 'La mozzarella' },
  { id: 'qz-123', category: 'À table', question: 'Combien de minutes faut-il pour cuire un œuf à la coque ?', answer: 'Environ 3' },
  { id: 'qz-124', category: 'À table', question: 'Quel pain italien plat se parfume à l\'huile d\'olive et au romarin ?', answer: 'La focaccia' },
  { id: 'qz-125', category: 'À table', question: 'Quelle sauce accompagne traditionnellement les frites en Belgique ?', answer: 'La mayonnaise' },
  { id: 'qz-126', category: 'À table', question: 'Quel agrume donne son goût au ceviche ?', answer: 'Le citron vert' },
]
