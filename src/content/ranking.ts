// Le Podium - mode embarqué, sans pack de contenu.
// Questions secrètes de classement, 100 % originales. Le juge classe ses potes
// selon l'une d'elles, le groupe doit retrouver la vraie question parmi 4.
// Store-safe : jamais d'alcool nommé.

export interface RankingQuestion {
  id: string
  text: string
}

export const RANKING_QUESTIONS: RankingQuestion[] = [
  { id: 'rk-01', text: 'Du plus susceptible de devenir célèbre au moins susceptible' },
  { id: 'rk-02', text: 'Du plus gros dormeur au plus matinal' },
  { id: 'rk-03', text: 'Du plus dramatique au plus zen' },
  { id: 'rk-04', text: 'Du plus radin au plus dépensier' },
  { id: 'rk-05', text: 'Du plus accro à son téléphone au plus détaché' },
  { id: 'rk-06', text: 'Du plus susceptible de survivre à une apocalypse zombie au premier éliminé' },
  { id: 'rk-07', text: 'Du meilleur danseur au plus grand danger public en soirée' },
  { id: 'rk-08', text: 'Du plus mauvais perdant au plus fair-play' },
  { id: 'rk-09', text: 'Du plus susceptible d\'arriver en retard à son propre mariage au plus ponctuel' },
  { id: 'rk-10', text: 'Du plus grand cœur d\'artichaut au plus difficile à séduire' },
  { id: 'rk-11', text: 'Du plus têtu au plus influençable' },
  { id: 'rk-12', text: 'Du plus susceptible de finir président au plus anarchiste' },
  { id: 'rk-13', text: 'Du plus gourmand au plus difficile à table' },
  { id: 'rk-14', text: 'Du plus maladroit au plus adroit de ses mains' },
  { id: 'rk-15', text: 'Du plus bavard au plus mystérieux' },
  { id: 'rk-16', text: 'Du plus susceptible de pleurer devant un film au plus insensible' },
  { id: 'rk-17', text: 'Du plus aventurier au plus casanier' },
  { id: 'rk-18', text: 'Du plus fort en mytho au plus transparent' },
  { id: 'rk-19', text: 'Du plus stylé au plus « confort avant tout »' },
  { id: 'rk-20', text: 'Du plus susceptible d\'oublier un anniversaire au plus attentionné' },
  { id: 'rk-21', text: 'Du plus compétitif au plus « c\'est juste un jeu »' },
  { id: 'rk-22', text: 'Du plus susceptible de se perdre avec un GPS au meilleur sens de l\'orientation' },
  { id: 'rk-23', text: 'Du plus fêtard au premier à rentrer' },
  { id: 'rk-24', text: 'Du plus susceptible d\'adopter cinq chats au plus allergique aux animaux' },
  { id: 'rk-25', text: 'Du plus beau parleur au plus timide' },
  { id: 'rk-26', text: 'Du plus susceptible de devenir millionnaire au plus fâché avec l\'argent' },
  { id: 'rk-27', text: 'Du plus grand chef cuisinier au roi des pâtes trop cuites' },
  { id: 'rk-28', text: 'Du plus susceptible de faire le tour du monde au plus attaché à sa ville' },
  { id: 'rk-29', text: 'Du plus grand enfant au plus vieux dans sa tête' },
  { id: 'rk-30', text: 'Du plus susceptible de chanter en public au plus discret sous la douche' },
  { id: 'rk-31', text: 'Du plus optimiste au plus pessimiste' },
  { id: 'rk-32', text: 'Du plus susceptible de répondre « oui » à tout au roi du « non »' },
  { id: 'rk-33', text: 'Du plus sportif au plus canapé' },
  { id: 'rk-34', text: 'Du plus susceptible d\'écrire un livre au plus fâché avec les mots' },
  { id: 'rk-35', text: 'Du plus curieux au plus « chacun sa vie »' },
  { id: 'rk-36', text: 'Du plus susceptible de gagner un jeu télévisé au plus distrait' },
  { id: 'rk-37', text: 'Du plus romantique au plus pragmatique' },
  { id: 'rk-38', text: 'Du plus susceptible de parler aux inconnus au plus réservé' },
  { id: 'rk-39', text: 'Du plus grand procrastinateur au plus organisé' },
  { id: 'rk-40', text: 'Du plus susceptible de tout quitter pour élever des chèvres au plus urbain' },
]
