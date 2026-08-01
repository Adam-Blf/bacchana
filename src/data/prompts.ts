import type { PromptGameType, PromptGameConfig } from '@/types'

// ============================================
// JE N'AI JAMAIS (Never Have I Ever)
// ============================================

export const neverHaveIEver: string[] = [
  // Originaux
  "Je n'ai jamais menti à un ami pour éviter une soirée",
  "Je n'ai jamais stalké un ex sur les réseaux",
  "Je n'ai jamais fait semblant d'aimer un cadeau",
  "Je n'ai jamais envoyé un message à la mauvaise personne",
  "Je n'ai jamais simulé une excuse pour quitter un date",
  "Je n'ai jamais mangé quelque chose tombé par terre",
  "Je n'ai jamais pleuré devant un film pour enfants",
  "Je n'ai jamais fait un ghosting à quelqu'un",
  "Je n'ai jamais menti sur mon âge",
  "Je n'ai jamais fait semblant de connaître une chanson",
  // Relations amoureuses
  "Je n'ai jamais embrassé quelqu'un dès le premier soir",
  "Je n'ai jamais eu le crush sur le/la meilleur(e) ami(e) de mon ex",
  "Je n'ai jamais dit 'je t'aime' sans le penser",
  "Je n'ai jamais trompé quelqu'un",
  "Je n'ai jamais repris contact avec un ex à 3h du matin",
  // Soirées
  "Je n'ai jamais vomi en soirée",
  "Je n'ai jamais fait un blackout complet",
  "Je n'ai jamais embrassé quelqu'un que je regrette",
  "Je n'ai jamais dansé sur une table",
  "Je n'ai jamais fini une soirée chez des inconnus",
  // Secrets embarrassants
  "Je n'ai jamais fouillé dans le téléphone de quelqu'un",
  "Je n'ai jamais menti à mes parents sur où j'étais",
  "Je n'ai jamais fait semblant d'être malade pour sécher",
  "Je n'ai jamais pété en public et accusé quelqu'un d'autre",
  "Je n'ai jamais fait un achat que j'ai caché à tout le monde",
  // Réseaux sociaux
  "Je n'ai jamais supprimé une photo parce qu'elle n'avait pas assez de likes",
  "Je n'ai jamais créé un faux compte pour espionner quelqu'un",
  "Je n'ai jamais unfollowed quelqu'un par jalousie",
  "Je n'ai jamais envoyé un DM embarrassant à une célébrité",
  "Je n'ai jamais regretté une story postée en soirée",
]

// ============================================
// ACTION OU VÉRITÉ (Truth or Dare)
// ============================================

export const truthOrDare = {
  truth: [
    // Originaux
    "Quelle est ta plus grande honte ?",
    "Quel est le mensonge le plus gros que tu aies dit ?",
    "C'est qui ton crush secret ici ?",
    "Quelle est la chose la plus bizarre que tu aies googlée ?",
    "Quel est ton plus gros regret amoureux ?",
    "Quelle est ta pire habitude cachée ?",
    "Quel secret tu n'as jamais dit à tes parents ?",
    "Quelle est la chose la plus embarrassante dans ton téléphone ?",
    "Tu as déjà trahi la confiance de quelqu'un ici ?",
    "Quel est ton fantasme le plus inavouable ?",
    // Nouveaux - Secrets
    "Quelle est la chose la plus chère que tu aies volée ?",
    "Quel est ton plus gros mensonge sur ton CV ?",
    "Quelle rumeur as-tu déjà lancée sur quelqu'un ?",
    "Quelle est la chose la plus méchante que tu aies pensée de quelqu'un ici ?",
    "Quel secret gardes-tu de ton/ta meilleur(e) ami(e) ?",
    // Nouveaux - Relations
    "Combien de personnes as-tu embrassées ce mois-ci ?",
    "Quelle est la pire raison pour laquelle tu as quitté quelqu'un ?",
    "As-tu déjà eu des sentiments pour quelqu'un dans cette pièce ?",
    "Quelle est la chose la plus bizarre que tu aies faite pour attirer l'attention de quelqu'un ?",
    "Quel est le pire date que tu aies eu ?",
  ],
  dare: [
    // Originaux
    "Fais 10 pompes maintenant",
    "Imite quelqu'un dans la pièce jusqu'à ce qu'on devine",
    "Envoie un message embarrassant à ton dernier contact",
    "Poste une story avec une grimace",
    "Appelle un ex et raccroche après 3 secondes",
    "Laisse quelqu'un écrire un message depuis ton téléphone",
    "Fais un compliment gênant à quelqu'un ici",
    "Montre ta dernière photo dans ta galerie",
    "Danse pendant 30 secondes sans musique",
    "Fais une déclaration d'amour à un objet de la pièce",
    // Nouveaux - Physiques
    "Fais 20 squats maintenant",
    "Tiens la position de la planche pendant 30 secondes",
    "Fais ton meilleur moonwalk",
    "Fais une roue (ou essaie)",
    "Garde un glaçon dans ta main jusqu'à ce qu'il fonde",
    // Nouveaux - Téléphone & Social
    "Like les 3 dernières photos d'un ex",
    "Envoie 'Tu me manques' au 5ème contact de ta liste",
    "Change ta photo de profil pour une photo gênante pendant 1h",
    "Appelle ta mère et dis-lui que tu l'aimes très fort",
    "Laisse le groupe choisir ta prochaine story",
  ],
}

// ============================================
// TU PRÉFÈRES (Would You Rather)
// ============================================

export const wouldYouRather: string[] = [
  // Originaux
  "Tu préfères perdre tous tes souvenirs ou ne jamais pouvoir en créer de nouveaux ?",
  "Tu préfères être invisible ou savoir lire dans les pensées ?",
  "Tu préfères ne plus jamais manger de sucre ou ne plus jamais manger de salé ?",
  "Tu préfères revivre la même journée pendant 1 an ou avancer de 10 ans dans ta vie ?",
  "Tu préfères avoir trop chaud pour toujours ou trop froid pour toujours ?",
  "Tu préfères être riche et seul ou pauvre et entouré d'amis ?",
  "Tu préfères savoir comment tu vas mourir ou quand tu vas mourir ?",
  "Tu préfères ne plus jamais utiliser les réseaux sociaux ou ne plus jamais regarder de films/séries ?",
  "Tu préfères parler toutes les langues ou parler aux animaux ?",
  "Tu préfères revivre ta pire journée ou ne jamais revivre ta meilleure ?",
  // Super-pouvoirs
  "Tu préfères pouvoir voler ou être super rapide ?",
  "Tu préfères pouvoir arrêter le temps ou voyager dans le temps ?",
  "Tu préfères être immortel ou avoir 9 vies ?",
  "Tu préfères pouvoir respirer sous l'eau ou ne jamais avoir besoin de dormir ?",
  "Tu préfères avoir une force surhumaine ou une intelligence surhumaine ?",
  // Dilemmes impossibles
  "Tu préfères ne plus jamais pouvoir mentir ou entendre tous les mensonges des autres ?",
  "Tu préfères oublier qui tu es ou que tout le monde t'oublie ?",
  "Tu préfères vivre 1000 ans dans le passé ou 1000 ans dans le futur ?",
  "Tu préfères être le plus beau/belle mais bête ou le plus intelligent(e) mais moche ?",
  "Tu préfères ne jamais pouvoir quitter ton pays ou ne jamais pouvoir y revenir ?",
  // Situations absurdes
  "Tu préfères avoir des mains à la place des pieds ou des pieds à la place des mains ?",
  "Tu préfères devoir chanter tout ce que tu dis ou danser partout où tu vas ?",
  "Tu préfères avoir un nez de clown permanent ou des oreilles d'elfe ?",
  "Tu préfères sentir le poisson ou avoir l'haleine d'ail pour toujours ?",
  "Tu préfères ne pouvoir manger que des aliments bleus ou ne porter que des vêtements roses ?",
  // Social
  "Tu préfères que tout le monde lise tes pensées ou que tout le monde voie ton historique de recherche ?",
  "Tu préfères perdre ton meilleur ami ou tous tes autres amis ?",
  "Tu préfères ne plus jamais pouvoir dire non ou ne plus jamais pouvoir dire oui ?",
  "Tu préfères être détesté par tout le monde ou oublié par tout le monde ?",
  "Tu préfères être célèbre pour quelque chose d'embarrassant ou rester anonyme toute ta vie ?",
]

// ============================================
// LE PLUS SUSCEPTIBLE DE (Most Likely To)
// ============================================

export const mostLikelyTo: string[] = [
  // Originaux
  "Qui est le plus susceptible de devenir célèbre ?",
  "Qui est le plus susceptible de pleurer à un mariage ?",
  "Qui est le plus susceptible d'oublier un anniversaire ?",
  "Qui est le plus susceptible de finir en prison ?",
  "Qui est le plus susceptible de devenir millionnaire ?",
  "Qui est le plus susceptible de faire une bêtise ce soir ?",
  "Qui est le plus susceptible de se marier en premier ?",
  "Qui est le plus susceptible de dormir le premier ce soir ?",
  "Qui est le plus susceptible de gagner une bagarre ?",
  "Qui est le plus susceptible de perdre son téléphone ?",
  // Soirées
  "Qui est le plus susceptible de finir la tête dans les toilettes ?",
  "Qui est le plus susceptible de danser sur la table ?",
  "Qui est le plus susceptible de faire un discours embarrassant ?",
  "Qui est le plus susceptible de draguer le/la mauvais(e) personne ?",
  "Qui est le plus susceptible de commander de la bouffe à 4h du mat' ?",
  // Relations
  "Qui est le plus susceptible de retourner avec son ex ?",
  "Qui est le plus susceptible de tomber amoureux ce soir ?",
  "Qui est le plus susceptible de ghosté quelqu'un ?",
  "Qui est le plus susceptible d'envoyer un message à un ex ce soir ?",
  "Qui est le plus susceptible de se faire larguer par SMS ?",
  // Traits de caractère
  "Qui est le plus susceptible de mentir pour éviter les problèmes ?",
  "Qui est le plus susceptible de pleurer devant un film Disney ?",
  "Qui est le plus susceptible de garder un secret jusqu'à la mort ?",
  "Qui est le plus susceptible de dire exactement ce qu'il pense ?",
  "Qui est le plus susceptible de tout annuler à la dernière minute ?",
  // Succès/Échecs
  "Qui est le plus susceptible de devenir influenceur ?",
  "Qui est le plus susceptible de gagner au loto et tout dépenser en 1 mois ?",
  "Qui est le plus susceptible de vivre jusqu'à 100 ans ?",
  "Qui est le plus susceptible de créer sa propre entreprise ?",
  "Qui est le plus susceptible de tout plaquer pour voyager ?",
]

// ============================================
// C'EST UN 10 MAIS (It's a 10 But)
// ============================================

export const itsA10But: string[] = [
  // Originaux
  "C'est un 10 mais... il/elle ronfle comme un tracteur",
  "C'est un 10 mais... il/elle met du ketchup sur les pâtes",
  "C'est un 10 mais... il/elle a un poster de son ex dans sa chambre",
  "C'est un 10 mais... il/elle ne se lave les dents qu'une fois par jour",
  "C'est un 10 mais... il/elle parle à voix haute au cinéma",
  "C'est un 10 mais... il/elle like toutes les photos de son ex",
  "C'est un 10 mais... il/elle met de la mayo dans son café",
  "C'est un 10 mais... il/elle t'appelle par le prénom de son ex",
  "C'est un 10 mais... il/elle porte des Crocs à chaque date",
  "C'est un 10 mais... il/elle ne rit jamais à tes blagues",
  // Red flags relationnels
  "C'est un 10 mais... il/elle texte son ex tous les jours",
  "C'est un 10 mais... il/elle a encore les photos de ses ex sur son téléphone",
  "C'est un 10 mais... il/elle pense que la jalousie c'est romantique",
  "C'est un 10 mais... il/elle n'a jamais dit 'je t'aime' à qui que ce soit",
  "C'est un 10 mais... il/elle vérifie ton téléphone en cachette",
  // Habitudes bizarres
  "C'est un 10 mais... il/elle mange ses crottes de nez",
  "C'est un 10 mais... il/elle ne tire jamais la chasse en pleine nuit",
  "C'est un 10 mais... il/elle garde la même serviette depuis 3 semaines",
  "C'est un 10 mais... il/elle dort avec 15 peluches",
  "C'est un 10 mais... il/elle parle tout seul à voix haute",
  // Deal-breakers hilarants
  "C'est un 10 mais... il/elle met de l'ananas sur la pizza",
  "C'est un 10 mais... il/elle ne regarde jamais de séries",
  "C'est un 10 mais... il/elle pense que la Terre est plate",
  "C'est un 10 mais... il/elle écoute de l'ASMR à fond",
  "C'est un 10 mais... il/elle refuse de prendre l'avion",
  // Social awkward
  "C'est un 10 mais... il/elle répond aux vocaux par des vocaux de 10 minutes",
  "C'est un 10 mais... il/elle n'a aucun ami proche",
  "C'est un 10 mais... il/elle ne connaît pas les réseaux sociaux",
  "C'est un 10 mais... il/elle dit 'on' au lieu de 'je' quand il parle de lui",
  "C'est un 10 mais... il/elle pose un lapin une fois sur deux",
]

// ============================================
// 7 SECONDES
// ============================================

export const sevenSeconds: string[] = [
  // Originaux
  "Cite 3 capitales européennes",
  "Cite 3 marques de voitures",
  "Cite 3 films de Leonardo DiCaprio",
  "Cite 3 pays commençant par la lettre A",
  "Cite 3 fruits exotiques",
  "Cite 3 rappeurs français",
  "Cite 3 séries Netflix",
  "Cite 3 joueurs de foot",
  "Cite 3 couleurs en anglais",
  "Cite 3 applications sur ton téléphone",
  // Culture générale
  "Cite 3 océans",
  "Cite 3 planètes du système solaire",
  "Cite 3 pays d'Amérique du Sud",
  "Cite 3 fleuves français",
  "Cite 3 présidents américains",
  // Pop culture
  "Cite 3 personnages de Disney",
  "Cite 3 chansons de Beyoncé",
  "Cite 3 acteurs Marvel",
  "Cite 3 jeux vidéo sortis ces 5 ans",
  "Cite 3 séries HBO",
  // Divers
  "Cite 3 marques de luxe",
  "Cite 3 fromages français",
  "Cite 3 sports olympiques",
  "Cite 3 animaux qui commencent par C",
  "Cite 3 saveurs de glace",
  // Fun
  "Cite 3 emojis que tu utilises souvent",
  "Cite 3 excuses pour arriver en retard",
  "Cite 3 trucs qu'on trouve dans un sac à main",
  "Cite 3 marques de fast-food",
  "Cite 3 réseaux sociaux",
]

// ============================================
// CONFIGURATION DES JEUX POUR LE HUB
// ============================================

export const PROMPT_GAMES: PromptGameConfig[] = [
  {
    id: 'neverHaveIEver',
    title: "Je n'ai jamais",
    subtitle: 'Never Have I Ever',
    description: 'Bois si tu l\'as déjà fait',
    icon: 'Wine',
  },
  {
    id: 'truthOrDare',
    title: 'Action ou Vérité',
    subtitle: 'Truth or Dare',
    description: 'Choisis ton poison',
    icon: 'Flame',
  },
  {
    id: 'wouldYouRather',
    title: 'Tu préfères',
    subtitle: 'Would You Rather',
    description: 'Fais ton choix impossible',
    icon: 'Scale',
  },
  {
    id: 'mostLikelyTo',
    title: 'Le plus susceptible',
    subtitle: 'Most Likely To',
    description: 'Désigne le coupable',
    icon: 'Users',
  },
  {
    id: 'itsA10But',
    title: "C'est un 10 mais",
    subtitle: "It's a 10 But",
    description: 'Le deal-breaker ultime',
    icon: 'Heart',
  },
  {
    id: 'sevenSeconds',
    title: '7 Secondes',
    subtitle: 'Seven Seconds',
    description: 'Réponds vite ou prends une pénalité',
    icon: 'Timer',
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get prompts array by game type
 */
export function getPromptsByType(type: PromptGameType): string[] {
  switch (type) {
    case 'neverHaveIEver':
      return neverHaveIEver
    case 'truthOrDare':
      // Combine truth and dare with prefixes
      return [
        ...truthOrDare.truth.map((t) => `VÉRITÉ: ${t}`),
        ...truthOrDare.dare.map((d) => `ACTION: ${d}`),
      ]
    case 'wouldYouRather':
      return wouldYouRather
    case 'mostLikelyTo':
      return mostLikelyTo
    case 'itsA10But':
      return itsA10But
    case 'sevenSeconds':
      return sevenSeconds
    default:
      return []
  }
}

/**
 * Get game config by type
 */
export function getGameConfig(type: PromptGameType): PromptGameConfig | undefined {
  return PROMPT_GAMES.find((game) => game.id === type)
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
