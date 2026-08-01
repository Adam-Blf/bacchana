// Le Tribunal - mode embarqué, sans pack de contenu (pas de fichier JSON source).
// Chefs d'accusation store-safe : jamais d'alcool nommé, uniquement des pénalités.

export interface TribunalCharge {
  id: string
  text: string
}

export const TRIBUNAL_CHARGES: TribunalCharge[] = [
  { id: 'tri-01', text: 'Complot de silence : ne pas avoir défendu {player} pendant la dernière manche.' },
  { id: 'tri-02', text: 'Usage abusif du téléphone en pleine partie, au vu et au su de la table.' },
  { id: 'tri-03', text: 'Trahison caractérisée : avoir voté contre son propre binôme au tour précédent.' },
  { id: 'tri-04', text: 'Rire suspect en pleine question sérieuse, laissant planer le doute.' },
  { id: 'tri-05', text: "Fuite d'information : avoir soufflé une réponse à voix (trop) basse." },
  { id: 'tri-06', text: 'Triche présumée sur un pierre-feuille-ciseaux disputé.' },
  { id: 'tri-07', text: "Abandon de poste : s'être levé sans prévenir la cour." },
  { id: 'tri-08', text: 'Mensonge flagrant sur son propre score de la soirée.' },
  { id: 'tri-09', text: 'Complicité de retard général en ayant proposé une pause non votée.' },
  { id: 'tri-10', text: "Détournement d'attention : avoir changé de sujet pour éviter une pénalité." },
]
