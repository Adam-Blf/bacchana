// La Roue du Destin - mode embarqué, sans pack de contenu (pas de fichier JSON source).
// Segments store-safe : pénalités abstraites, défis d'ambiance, mimes, votes et gages
// soft. Jamais d'alcool nommé, jamais de consigne dangereuse.

export interface RouletteSegment {
  id: string
  label: string
  detail: string
}

export const ROULETTE_SEGMENTS: RouletteSegment[] = [
  { id: 'rou-01', label: '1 pénalité', detail: 'Le sort est clément, une seule et on n\'en parle plus.' },
  { id: 'rou-02', label: '2 pénalités', detail: 'La roue hausse le ton, tu en prends deux.' },
  { id: 'rou-03', label: '3 pénalités', detail: 'Trois d\'un coup, la note grimpe au comptoir.' },
  { id: 'rou-04', label: 'Pénalité majeure', detail: 'Le pire tirage de la roue, encaisse sans broncher.' },
  { id: 'rou-05', label: 'Distribue 2', detail: 'Désigne deux convives, chacun prend une pénalité.' },
  { id: 'rou-06', label: 'Immunité', detail: 'Blindé au prochain tour, plus rien ne t\'atteint.' },
  { id: 'rou-07', label: 'Toute la table', detail: 'Personne n\'est épargné, une pénalité pour chacun.' },
  { id: 'rou-08', label: 'Rejoue', detail: 'Relance la roue immédiatement, le sort n\'a pas fini.' },
  { id: 'rou-09', label: 'Mime muet', detail: 'Mime un métier, la tablée devine en trente secondes.' },
  { id: 'rou-10', label: 'Grand accent', detail: 'Raconte ta soirée avec l\'accent que la table t\'impose.' },
  { id: 'rou-11', label: 'Statue', detail: 'Reste figé comme une statue jusqu\'à ton prochain passage.' },
  { id: 'rou-12', label: 'Vote express', detail: 'La table vote : qui a le plus de culot ce soir ?' },
  { id: 'rou-13', label: 'Duel de regards', detail: 'Fixe ton voisin, le premier qui rit prend une pénalité.' },
  { id: 'rou-14', label: 'Compliment', detail: 'Fais un vrai compliment à la personne à ta gauche.' },
  { id: 'rou-15', label: 'Anecdote', detail: 'Balance une anecdote gênante en moins d\'une minute.' },
  { id: 'rou-16', label: 'Imitation', detail: 'Imite un convive, il doit deviner de qui il s\'agit.' },
  { id: 'rou-17', label: 'Refrain', detail: 'Chante le refrain que la table te souffle.' },
  { id: 'rou-18', label: 'Grimace', detail: 'Tiens la grimace la plus laide pendant dix secondes.' },
  { id: 'rou-19', label: 'Silence d\'or', detail: 'Interdit de parler jusqu\'à ton prochain passage.' },
  { id: 'rou-20', label: 'Slogan', detail: 'Invente un slogan pour la soirée, la table juge.' },
  { id: 'rou-21', label: 'Capitaine', detail: 'Tu mènes le prochain tour, tes règles font loi.' },
  { id: 'rou-22', label: 'Chaises musicales', detail: 'Change de siège avec la personne assise en face.' },
  { id: 'rou-23', label: 'Main faible', detail: 'Fais tout de la main gauche jusqu\'au prochain tour.' },
  { id: 'rou-24', label: 'Confession', detail: 'Réponds franchement à une question de la table.' },
  { id: 'rou-25', label: 'Vérité ou double', detail: 'Réponds vrai ou prends deux pénalités à la place.' },
  { id: 'rou-26', label: 'Ovation', detail: 'Lève-toi et salue, la table t\'offre une ovation.' },
  { id: 'rou-27', label: 'Roulement', detail: 'Tape la table en rythme, tout le monde doit suivre.' },
  { id: 'rou-28', label: 'Pause fraîcheur', detail: 'Rapporte un verre d\'eau à la personne de ton choix.' },
  { id: 'rou-29', label: 'Question piège', detail: 'Pose une colle à la table, le premier bloqué prend une pénalité.' },
  { id: 'rou-30', label: 'Photo souvenir', detail: 'Prends la pose, la table improvise une photo de groupe.' },
  { id: 'rou-31', label: 'Deux pas', detail: 'Improvise deux pas de danse au choix de la table.' },
  { id: 'rou-32', label: 'Accent voyage', detail: 'Parle avec un accent étranger jusqu\'au prochain tour.' },
  { id: 'rou-33', label: 'Éloge', detail: 'Fais l\'éloge exagéré de ton voisin de droite.' },
  { id: 'rou-34', label: 'Pénalité partagée', detail: 'Toi et ton voisin prenez une pénalité ensemble.' },
  { id: 'rou-35', label: 'Renversement', detail: 'La personne à ta droite prend ta pénalité à ta place.' },
  { id: 'rou-36', label: 'Défi minute', detail: 'La table te lance un défi soft à réaliser sur-le-champ.' },
  { id: 'rou-37', label: 'Chef de chœur', detail: 'Fais chanter la table trois secondes, à toi de lancer.' },
  { id: 'rou-38', label: 'Roue clémente', detail: 'Rien ne se passe, savoure ta chance et passe la main.' },
  { id: 'rou-39', label: 'Meneur du soir', detail: 'Choisis le thème du prochain tour, la table te suit.' },
  { id: 'rou-40', label: 'Double ou rien', detail: 'Relance : gros lot de pénalités ou immunité, la roue tranche.' },
]
