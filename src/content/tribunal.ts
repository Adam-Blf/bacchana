// Le Pilori - mode embarqué, sans pack de contenu (pas de fichier JSON source).
// Chefs d'accusation store-safe : jamais d'alcool nommé, uniquement des griefs de soirée.

export interface TribunalCharge {
  id: string
  text: string
}

export const TRIBUNAL_CHARGES: TribunalCharge[] = [
  { id: 'tri-01', text: 'Complot de silence : avoir laissé un pote se faire accuser sans lever le petit doigt.' },
  { id: 'tri-02', text: 'Usage abusif du téléphone en pleine partie, au vu et au su de la table.' },
  { id: 'tri-03', text: 'Trahison caractérisée : avoir voté contre son propre binôme au tour précédent.' },
  { id: 'tri-04', text: 'Rire suspect en pleine question sérieuse, laissant planer le doute.' },
  { id: 'tri-05', text: "Fuite d'information : avoir soufflé une réponse à voix (trop) basse." },
  { id: 'tri-06', text: 'Triche présumée sur un pierre-feuille-ciseaux disputé.' },
  { id: 'tri-07', text: "Abandon de poste : s'être levé sans prévenir la cour." },
  { id: 'tri-08', text: 'Mensonge flagrant sur son propre score de la soirée.' },
  { id: 'tri-09', text: 'Complicité de retard général en ayant proposé une pause non votée.' },
  { id: 'tri-10', text: "Détournement d'attention : avoir changé de sujet pour éviter une pénalité." },
  { id: 'tri-11', text: 'Avoir juré "juste une dernière manche" au moins cinq fois dans la soirée.' },
  { id: 'tri-12', text: "Monopolisation de la parole : n'avoir laissé personne finir une phrase." },
  { id: 'tri-13', text: "Avoir ri de sa propre blague avant même de l'avoir racontée." },
  { id: 'tri-14', text: "Sabotage d'ambiance : avoir baissé la musique sans consulter la cour." },
  { id: 'tri-15', text: 'Avoir prétendu connaître les règles pour mieux les inventer au fil du jeu.' },
  { id: 'tri-16', text: 'Favoritisme flagrant envers un joueur pour éviter de se faire accuser.' },
  { id: 'tri-17', text: 'Avoir consulté ses messages en plein vote décisif.' },
  { id: 'tri-18', text: 'Trahison gastronomique : avoir fini le dernier morceau sans le proposer.' },
  { id: 'tri-19', text: 'Avoir contesté chaque décision de la cour depuis le début de la partie.' },
  { id: 'tri-20', text: "Retard à l'allumage : avoir mis trois tours à comprendre la consigne." },
  { id: 'tri-21', text: 'Avoir soudoyé un juré avec un compliment clairement intéressé.' },
  { id: 'tri-22', text: 'Diffamation de comptoir : avoir inventé un ragot sur un absent.' },
  { id: 'tri-23', text: "Avoir feint l'innocence avec un sourire qui trahit tout." },
  { id: 'tri-24', text: 'Chantage amical : avoir menacé de tout révéler pour éviter une pénalité.' },
  { id: 'tri-25', text: 'Avoir changé les règles en cours de route à son seul avantage.' },
  { id: 'tri-26', text: "Absentéisme : s'être éclipsé au moment crucial du vote." },
  { id: 'tri-27', text: 'Avoir juré ses grands dieux ne pas avoir triché, preuve du contraire à la clé.' },
  { id: 'tri-28', text: 'Provocation en règle : avoir défié la cour de le condamner.' },
  { id: 'tri-29', text: "Avoir feint de ne pas entendre la question pour gagner du temps." },
  { id: 'tri-30', text: 'Népotisme : avoir systématiquement voté pour épargner son meilleur pote.' },
  { id: 'tri-31', text: "Avoir tenté de retourner la table contre l'accusé précédent pour se blanchir." },
  { id: 'tri-32', text: "Faux témoignage : avoir juré avoir vu ce que personne d'autre n'a vu." },
  { id: 'tri-33', text: 'Avoir gardé le meilleur siège toute la soirée sans jamais le céder.' },
  { id: 'tri-34', text: "Manipulation d'ambiance : avoir relancé un sujet gênant exprès." },
  { id: 'tri-35', text: "Avoir sous-estimé la cour en pensant s'en tirer avec un clin d'œil." },
  { id: 'tri-36', text: 'Récidive : deuxième passage au pilori dans la même soirée.' },
  { id: 'tri-37', text: "Avoir promis un service qu'il n'avait aucune intention de rendre." },
  { id: 'tri-38', text: "Complicité passive : avoir vu la triche et n'avoir rien dit." },
  { id: 'tri-39', text: 'Avoir monopolisé le rôle de meneur sans jamais le partager.' },
  { id: 'tri-40', text: "Outrage à la cour : avoir levé les yeux au ciel pendant le réquisitoire." },
]
