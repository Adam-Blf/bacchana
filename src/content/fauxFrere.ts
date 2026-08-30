// Le Faux Frère - mode embarqué, sans pack de contenu (pas de fichier JSON source).
//
// La mécanique la plus demandée de l'étude bêta : le bluff et l'imposteur
// reviennent dans 9 réponses sur 16, et aucun des treize autres modes ne le
// couvre. C'est le seul type de jeu où personne ne peut rester spectateur -
// chacun doit soupçonner ou mentir à son voisin, tour après tour.
//
// LE PRINCIPE : toute la tablée reçoit le même mot, sauf un. Chacun décrit son
// mot en UN seul mot. Le faux frère doit deviner ce que les autres ont sans se
// faire repérer ; la tablée doit le démasquer.

/**
 * Un duo de mots. `commun` va à toute la tablée, `imposteur` au faux frère.
 *
 * LA RÈGLE DE FABRICATION, et c'est tout le jeu : les deux mots doivent être
 * assez PROCHES pour qu'une description à un mot puisse coller aux deux, et
 * assez DIFFÉRENTS pour qu'une description précise trahisse. Un duo trop
 * éloigné (« chat » / « hélicoptère ») grille le faux frère au premier tour ;
 * un duo trop proche (« chat » / « chatte ») rend la partie indécidable et la
 * tablée vote au hasard.
 *
 * Test de rejet en dix secondes : écris UN mot qui décrit les deux. Si tu n'y
 * arrives pas, le duo est trop éloigné. Si tu peux en écrire cinq, il est trop
 * proche.
 */
export interface DuoDeMots {
  id: string
  commun: string
  imposteur: string
  /** Ce qui rend le duo jouable, pour qui reprend le fichier et veut en ajouter. */
  note?: string
}

/**
 * Les duos, groupés par famille. Aucun ne nomme d'alcool ni de marque :
 * contrainte de publication sur les magasins, pas de style. Aucun ne porte non
 * plus sur un trait subi (physique, âge, origine) - un mot qui désigne une
 * personne de la tablée sortirait du périmètre du jeu.
 */
export const DUOS_DE_MOTS: DuoDeMots[] = [
  // --- La table et la maison ---
  { id: 'ff-001', commun: 'Fourchette', imposteur: 'Cuillère', note: 'Décrire « couvert » colle aux deux, « piquer » trahit.' },
  { id: 'ff-002', commun: 'Assiette', imposteur: 'Plateau' },
  { id: 'ff-003', commun: 'Canapé', imposteur: 'Fauteuil', note: 'Le nombre de places est le seul écart.' },
  { id: 'ff-004', commun: 'Rideau', imposteur: 'Store' },
  { id: 'ff-005', commun: 'Bougie', imposteur: 'Lampe' },
  { id: 'ff-006', commun: 'Douche', imposteur: 'Baignoire' },
  { id: 'ff-007', commun: 'Oreiller', imposteur: 'Coussin' },
  { id: 'ff-008', commun: 'Placard', imposteur: 'Tiroir' },
  { id: 'ff-009', commun: 'Balai', imposteur: 'Aspirateur' },
  { id: 'ff-010', commun: 'Miroir', imposteur: 'Fenêtre', note: 'Les deux renvoient une image, un seul laisse passer.' },

  // --- La ville et les déplacements ---
  { id: 'ff-011', commun: 'Métro', imposteur: 'Tramway' },
  { id: 'ff-012', commun: 'Vélo', imposteur: 'Trottinette' },
  { id: 'ff-013', commun: 'Aéroport', imposteur: 'Gare' },
  { id: 'ff-014', commun: 'Trottoir', imposteur: 'Passage piéton' },
  { id: 'ff-015', commun: 'Ascenseur', imposteur: 'Escalator' },
  { id: 'ff-016', commun: 'Parking', imposteur: 'Garage' },
  { id: 'ff-017', commun: 'Autoroute', imposteur: 'Rocade' },
  { id: 'ff-018', commun: 'Feu rouge', imposteur: 'Rond-point' },
  { id: 'ff-019', commun: 'Taxi', imposteur: 'Bus' },
  { id: 'ff-020', commun: 'Pont', imposteur: 'Tunnel', note: 'On passe par-dessus ou par-dessous : « traverser » colle aux deux.' },

  // --- Le travail et l'école ---
  { id: 'ff-021', commun: 'Réunion', imposteur: 'Entretien' },
  { id: 'ff-022', commun: 'Stage', imposteur: 'Alternance' },
  { id: 'ff-023', commun: 'Examen', imposteur: 'Concours' },
  { id: 'ff-024', commun: 'Cantine', imposteur: 'Cafétéria' },
  { id: 'ff-025', commun: 'Amphithéâtre', imposteur: 'Salle de classe' },
  { id: 'ff-026', commun: 'Diplôme', imposteur: 'Attestation' },
  { id: 'ff-027', commun: 'Patron', imposteur: 'Collègue' },
  { id: 'ff-028', commun: 'Bureau', imposteur: 'Open space' },
  { id: 'ff-029', commun: 'Congé', imposteur: 'Jour férié', note: 'Un se demande, l\'autre tombe tout seul.' },
  { id: 'ff-030', commun: 'Rentrée', imposteur: 'Vacances' },

  // --- Le sport et le jeu ---
  { id: 'ff-031', commun: 'Football', imposteur: 'Rugby' },
  { id: 'ff-032', commun: 'Piscine', imposteur: 'Plage' },
  { id: 'ff-033', commun: 'Marathon', imposteur: 'Sprint' },
  { id: 'ff-034', commun: 'Arbitre', imposteur: 'Entraîneur' },
  { id: 'ff-035', commun: 'Échecs', imposteur: 'Dames' },
  { id: 'ff-036', commun: 'Cartes', imposteur: 'Dominos' },
  { id: 'ff-037', commun: 'Tennis', imposteur: 'Badminton', note: 'Raquette et filet des deux côtés, seul le projectile change.' },
  { id: 'ff-038', commun: 'Vestiaire', imposteur: 'Tribune' },
  { id: 'ff-039', commun: 'Médaille', imposteur: 'Trophée' },
  { id: 'ff-040', commun: 'Escalade', imposteur: 'Randonnée' },

  // --- Les écrans et la culture ---
  { id: 'ff-041', commun: 'Cinéma', imposteur: 'Théâtre' },
  { id: 'ff-042', commun: 'Série', imposteur: 'Film' },
  { id: 'ff-043', commun: 'Podcast', imposteur: 'Radio' },
  { id: 'ff-044', commun: 'Concert', imposteur: 'Festival' },
  { id: 'ff-045', commun: 'Musée', imposteur: 'Galerie' },
  { id: 'ff-046', commun: 'Roman', imposteur: 'Bande dessinée' },
  { id: 'ff-047', commun: 'Casque', imposteur: 'Écouteurs' },
  { id: 'ff-048', commun: 'Playlist', imposteur: 'Album' },
  { id: 'ff-049', commun: 'Générique', imposteur: 'Bande-annonce', note: 'Un ouvre, l\'autre annonce : « avant » colle aux deux.' },
  { id: 'ff-050', commun: 'Documentaire', imposteur: 'Reportage' },

  // --- Le téléphone et les réseaux ---
  { id: 'ff-051', commun: 'Message', imposteur: 'Appel' },
  { id: 'ff-052', commun: 'Notification', imposteur: 'Alarme' },
  { id: 'ff-053', commun: 'Selfie', imposteur: 'Portrait' },
  { id: 'ff-054', commun: 'Mot de passe', imposteur: 'Code' },
  { id: 'ff-055', commun: 'Chargeur', imposteur: 'Batterie externe' },
  { id: 'ff-056', commun: 'Capture d\'écran', imposteur: 'Photo' },
  { id: 'ff-057', commun: 'Groupe', imposteur: 'Conversation' },
  { id: 'ff-058', commun: 'Filtre', imposteur: 'Retouche' },
  { id: 'ff-059', commun: 'Abonné', imposteur: 'Ami' },
  { id: 'ff-060', commun: 'Mode avion', imposteur: 'Silencieux', note: 'Les deux coupent le bruit, un seul coupe le réseau.' },

  // --- La nature et les bêtes ---
  { id: 'ff-061', commun: 'Chat', imposteur: 'Chien' },
  { id: 'ff-062', commun: 'Corbeau', imposteur: 'Pigeon' },
  { id: 'ff-063', commun: 'Requin', imposteur: 'Dauphin' },
  { id: 'ff-064', commun: 'Abeille', imposteur: 'Guêpe', note: 'Une pique et meurt, l\'autre recommence.' },
  { id: 'ff-065', commun: 'Forêt', imposteur: 'Parc' },
  { id: 'ff-066', commun: 'Orage', imposteur: 'Averse' },
  { id: 'ff-067', commun: 'Montagne', imposteur: 'Colline' },
  { id: 'ff-068', commun: 'Rivière', imposteur: 'Canal' },
  { id: 'ff-069', commun: 'Neige', imposteur: 'Grêle' },
  { id: 'ff-070', commun: 'Désert', imposteur: 'Plage' },

  // --- La soirée et la tablée ---
  { id: 'ff-071', commun: 'Anniversaire', imposteur: 'Crémaillère' },
  { id: 'ff-072', commun: 'Playlist', imposteur: 'Karaoké' },
  { id: 'ff-073', commun: 'Voisin', imposteur: 'Colocataire' },
  { id: 'ff-074', commun: 'Invitation', imposteur: 'Convocation', note: 'Une se refuse, l\'autre non.' },
  { id: 'ff-075', commun: 'Dernier métro', imposteur: 'Taxi de nuit' },
  { id: 'ff-076', commun: 'Photo de groupe', imposteur: 'Vidéo souvenir' },
  { id: 'ff-077', commun: 'Cadeau', imposteur: 'Souvenir' },
  { id: 'ff-078', commun: 'Retard', imposteur: 'Absence' },
  { id: 'ff-079', commun: 'Surprise', imposteur: 'Blague' },
  { id: 'ff-080', commun: 'Comptoir', imposteur: 'Terrasse' },

  // --- Les objets qui se ressemblent ---
  { id: 'ff-081', commun: 'Clé', imposteur: 'Badge' },
  { id: 'ff-082', commun: 'Parapluie', imposteur: 'Capuche' },
  { id: 'ff-083', commun: 'Montre', imposteur: 'Bracelet' },
  { id: 'ff-084', commun: 'Portefeuille', imposteur: 'Trousse' },
  { id: 'ff-085', commun: 'Valise', imposteur: 'Sac à dos' },
  { id: 'ff-086', commun: 'Stylo', imposteur: 'Crayon', note: 'Un s\'efface, l\'autre non : « écrire » colle aux deux.' },
  { id: 'ff-087', commun: 'Carnet', imposteur: 'Agenda' },
  { id: 'ff-088', commun: 'Lunettes', imposteur: 'Masque' },
  { id: 'ff-089', commun: 'Ticket', imposteur: 'Reçu' },
  { id: 'ff-090', commun: 'Enveloppe', imposteur: 'Colis' },

  // --- Les lieux du quotidien ---
  { id: 'ff-091', commun: 'Boulangerie', imposteur: 'Pâtisserie' },
  { id: 'ff-092', commun: 'Marché', imposteur: 'Supermarché' },
  { id: 'ff-093', commun: 'Pharmacie', imposteur: 'Laboratoire' },
  { id: 'ff-094', commun: 'Coiffeur', imposteur: 'Barbier' },
  { id: 'ff-095', commun: 'Bibliothèque', imposteur: 'Librairie', note: 'On emprunte d\'un côté, on achète de l\'autre.' },
  { id: 'ff-096', commun: 'Hôtel', imposteur: 'Auberge' },
  { id: 'ff-097', commun: 'Restaurant', imposteur: 'Cantine' },
  { id: 'ff-098', commun: 'Poste', imposteur: 'Banque' },
  { id: 'ff-099', commun: 'Salle d\'attente', imposteur: 'File d\'attente' },
  { id: 'ff-100', commun: 'Ascenseur', imposteur: 'Cabine d\'essayage', note: 'Petit, fermé, on y est seul : le duo le plus retors du paquet.' },
]

/** Nombre de duos disponibles - utile aux tests et à l'écran de règles. */
export const NOMBRE_DE_DUOS = DUOS_DE_MOTS.length
