import { FREE_PACKS } from '@/content'
import premiumCatalogRaw from '@/content/premium-catalog.json'
import { GAME_MODES, type GameMode, type ModeDefinition, type PremiumCatalogEntry } from './types'

export const PREMIUM_CATALOG = premiumCatalogRaw as PremiumCatalogEntry[]

function freePackIdsForMode(mode: GameMode): string[] {
  return FREE_PACKS.filter((p) => p.pack.mode === mode).map((p) => p.pack.id)
}

function hasPremiumPacks(mode: GameMode): boolean {
  return PREMIUM_CATALOG.some((p) => p.mode === mode)
}

/** Registry of every mode the multi-mode engine can run, with a lazy-loaded screen. */
export const MODE_REGISTRY: Record<GameMode, ModeDefinition> = {
  borderland: {
    id: 'borderland',
    title: 'Le Coupe-Gorge',
    subtitle: "52 cartes, 4 règles, 0 pitié : l'arrière-salle des braves.",
    icon: 'Spade',
    tileColor: 'bg-pop-yellow',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/BorderlandScreen').then((m) => ({ default: m.BorderlandScreen })),
    freePackIds: [],
    hasPremiumPacks: false,
    rules: {
      title: 'Le Coupe-Gorge',
      steps: [
        "Une carte arrive face cachée : fais deviner sa valeur avant de la retourner.",
        'Chaque couleur a sa règle : Trèfle devine, Carreau action, Cœur question, Pique contrainte.',
        'Les As tombent en pénalité MAJEURE, gare aux mains tremblantes.',
        'Tu peux contester une carte pour doubler la mise, le suivant accepte ou monte encore.',
        'Le Joker est carte blanche : invente une règle ou annule une pénalité.',
      ],
    },
  },
  quiz: {
    id: 'quiz',
    title: 'Quitte ou Double',
    subtitle: 'Ta culture se paie au comptoir',
    icon: 'Brain',
    tileColor: 'bg-pop-blue',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/QuizScreen').then((m) => ({ default: m.QuizScreen })),
    freePackIds: [],
    hasPremiumPacks: false,
    rules: {
      title: 'Quitte ou Double',
      steps: [
        'Une question de culture G tombe, réponds à voix haute.',
        'Bonne réponse : les points rejoignent ta cagnotte.',
        'Choisis : tu cumules et tu risques tout, ou tu distribues la cagnotte à la table.',
        'Mauvaise réponse : tu perds ta cagnotte entière, plus les points en jeu.',
        'La cagnotte repart à zéro à chaque nouveau tour.',
      ],
    },
  },
  ranking: {
    id: 'ranking',
    title: "Le Tableau d'Honneur",
    subtitle: 'Le taulier classe, la tablée devine',
    icon: 'Medal',
    tileColor: 'bg-pop-blue',
    minPlayers: 4,
    component: () =>
      import('@/components/screens/RankingScreen').then((m) => ({ default: m.RankingScreen })),
    freePackIds: [],
    hasPremiumPacks: false,
    rules: {
      title: "Le Tableau d'Honneur",
      steps: [
        'Le juge découvre une question secrète et classe la table du haut du podium vers le bas.',
        'Le téléphone repasse au centre, personne ne sait ce qui a été jugé.',
        'Le groupe voit le classement et doit deviner la vraie question parmi quatre choix.',
        'Trouvé : le juge prend la pénalité. Raté : tout le groupe prend la pénalité.',
        'On change de juge à chaque manche, personne n\'y échappe.',
      ],
    },
  },
  auction: {
    id: 'auction',
    title: 'La Criée',
    subtitle: 'Surenchéris… ou crie « tu mens ! »',
    icon: 'Megaphone',
    tileColor: 'bg-pop-lime',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/AuctionScreen').then((m) => ({ default: m.AuctionScreen })),
    freePackIds: [],
    hasPremiumPacks: false,
    rules: {
      title: 'La Criée',
      steps: [
        "Un thème s'affiche, à voix haute annonce combien d'exemples tu peux citer en 1 minute.",
        'La table surenchérit tour à tour, ou crie « tu mens ! » pour lancer le défi.',
        'Le dernier enchérisseur a 60 secondes pour citer son compte, la table valide chaque bonne réponse.',
        'Réussi : celui qui a crié « tu mens » prend les pénalités. Raté : c\'est l\'enchérisseur qui prend la pénalité.',
      ],
    },
  },
  picolo: {
    id: 'picolo',
    title: 'Le Taulier',
    subtitle: 'Le patron de la soirée, ses ordres font loi',
    icon: 'Crown',
    tileColor: 'bg-pop-yellow',
    minPlayers: 3,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('picolo'),
    hasPremiumPacks: hasPremiumPacks('picolo'),
    rules: {
      title: 'Le Taulier',
      steps: [
        'Le téléphone tourne, une carte du Taulier tombe pour le joueur affiché.',
        'Certaines cartes distribuent un ordre, un rôle ou une règle qui dure plusieurs tours.',
        'Le joueur exécute ou esquive : appuie sur « Fait » une fois joué, ou prends la pénalité affichée.',
        'Les règles persistantes restent affichées tant qu\'elles courent, respecte-les sous peine de gage.',
      ],
    },
  },
  truthOrDare: {
    id: 'truthOrDare',
    title: 'Action ou Vérité',
    subtitle: 'Aveu au comptoir ou gage, choisis',
    icon: 'Flame',
    tileColor: 'bg-pop-pink',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('truthOrDare'),
    hasPremiumPacks: hasPremiumPacks('truthOrDare'),
    rules: {
      title: 'Action ou Vérité',
      steps: [
        'Le téléphone désigne un joueur et lui propose une vérité ou un gage.',
        'Réponds franchement ou relève le défi devant toute la table.',
        'Tu refuses ou tu craques : appuie sur la pénalité et laisse couler.',
        'Appuie sur « Fait » une fois l\'aveu lâché ou le gage accompli, le tour passe au suivant.',
      ],
    },
  },
  neverHaveIEver: {
    id: 'neverHaveIEver',
    title: "Je n'ai jamais",
    subtitle: 'Les confidences de la tablée',
    icon: 'HandMetal',
    tileColor: 'bg-pop-pink',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('neverHaveIEver'),
    hasPremiumPacks: hasPremiumPacks('neverHaveIEver'),
    rules: {
      title: "Je n'ai jamais",
      steps: [
        'Une confidence du style « je n\'ai jamais... » s\'affiche pour toute la table.',
        'Si tu l\'as déjà fait, tu prends la pénalité affichée en silence ou en assumant.',
        'Si personne à table ne l\'a fait, le tour passe sans pénalité.',
        'Appuie sur « Fait » pour enchaîner sur la confidence suivante.',
      ],
    },
  },
  whoAmong: {
    id: 'whoAmong',
    title: 'Qui de nous',
    subtitle: 'La tablée pointe du doigt',
    icon: 'Users',
    tileColor: 'bg-pop-blue',
    minPlayers: 3,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('whoAmong'),
    hasPremiumPacks: hasPremiumPacks('whoAmong'),
    rules: {
      title: 'Qui de nous',
      steps: [
        'Une question « qui de nous... » s\'affiche à toute la table.',
        'Comptez jusqu\'à trois, chacun pointe du doigt la personne visée en même temps.',
        'Celui ou celle qui récolte le plus de doigts pointés prend la pénalité.',
        'Appuie sur « Fait » pour passer à la question suivante.',
      ],
    },
  },
  wouldYouRather: {
    id: 'wouldYouRather',
    title: 'Tu préfères',
    subtitle: 'Vote, la minorité prend la pénalité',
    icon: 'Scale',
    tileColor: 'bg-pop-lime',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/WouldYouRatherScreen').then((m) => ({
        default: m.WouldYouRatherScreen,
      })),
    freePackIds: [],
    hasPremiumPacks: false,
    rules: {
      title: 'Tu préfères',
      steps: [
        'Un dilemme A ou B s\'affiche, le téléphone tourne de joueur en joueur.',
        'Chacun tape son camp en secret, sans montrer aux autres.',
        'Une fois tout le monde voté, révèle le verdict de la table.',
        'Le camp minoritaire prend la pénalité, égalité ou unanimité : personne n\'est pénalisé.',
      ],
    },
  },
  itsA10But: {
    id: 'itsA10But',
    title: "C'est un 10 mais",
    subtitle: 'Le défaut qui gâche tout',
    icon: 'Heart',
    tileColor: 'bg-pop-blue',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('itsA10But'),
    hasPremiumPacks: hasPremiumPacks('itsA10But'),
    rules: {
      title: "C'est un 10 mais",
      steps: [
        'Une carte « c\'est un 10 mais... » affiche un profil idéal gâché par un défaut.',
        'Le joueur désigné note à voix haute s\'il accepterait quand même, sur 10.',
        'La table débat et vote si le verdict divise.',
        'Appuie sur « Fait » ou prends la pénalité si tu esquives le débat.',
      ],
    },
  },
  sevenSeconds: {
    id: 'sevenSeconds',
    title: '7 Secondes',
    subtitle: 'Réponds avant le dernier grain',
    icon: 'Timer',
    tileColor: 'bg-pop-yellow',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('sevenSeconds'),
    hasPremiumPacks: hasPremiumPacks('sevenSeconds'),
    rules: {
      title: '7 Secondes',
      steps: [
        'Un défi chronométré s\'affiche pour le joueur désigné.',
        'La table compte à voix haute jusqu\'à 7, le joueur doit réussir avant le dernier grain.',
        'Réussi : aucune pénalité. Raté ou trop lent : pénalité immédiate.',
        'Appuie sur « Fait » pour enchaîner sur le défi suivant.',
      ],
    },
  },
  tribunal: {
    // id technique conservé (persistance/analytics) - seul l'affichage est renommé.
    id: 'tribunal',
    title: 'Le Pilori',
    subtitle: 'Un accusé, une tablée, un verdict',
    icon: 'Gavel',
    tileColor: 'bg-pop-pink',
    minPlayers: 3,
    component: () =>
      import('@/components/screens/TribunalScreen').then((m) => ({ default: m.TribunalScreen })),
    freePackIds: [],
    hasPremiumPacks: false,
    rules: {
      title: 'Le Pilori',
      steps: [
        'Chacun écrit une accusation secrète contre la table, ou vous jouez avec celles de l\'app.',
        'Une accusation est tirée au sort, un accusé est désigné.',
        'L\'accusé a 30 secondes pour se défendre devant la cour.',
        'La table vote à main levée : coupable ou non coupable.',
        'Coupable : 1 pénalité pour l\'accusé. Non coupable : libéré, procès suivant.',
      ],
    },
  },
  roulette: {
    id: 'roulette',
    title: 'La Roue du Destin',
    subtitle: 'Fais-la tourner, assume le sort',
    icon: 'Disc3',
    tileColor: 'bg-pop-yellow',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/RouletteScreen').then((m) => ({ default: m.RouletteScreen })),
    freePackIds: [],
    hasPremiumPacks: false,
    rules: {
      title: 'La Roue du Destin',
      steps: [
        'Lance la roue et regarde le sort tomber sur un segment.',
        'Le gage ou la pénalité affichés s\'appliquent au joueur qui a lancé.',
        'La table peut relancer autant de fois que voulu, chacun son tour.',
        'Termine la partie quand la table a son compte de tours de roue.',
      ],
    },
  },
}

/** All mode definitions in canonical hub order. */
export const PLAYABLE_MODES: ModeDefinition[] = GAME_MODES.map((mode) => MODE_REGISTRY[mode])

export function getModeDefinition(mode: GameMode): ModeDefinition {
  return MODE_REGISTRY[mode]
}
