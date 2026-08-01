# La Tournée — User stories

Personas :
- **Léa, 24 ans, l'organisatrice** : c'est toujours elle qui reçoit. Elle veut lancer un jeu en moins de 30 secondes, sans expliquer de règles.
- **Karim, 27 ans, l'invité** : il découvre l'app sur le téléphone d'un pote. Si un écran le bloque, il décroche.
- **Jade, 22 ans, la créative** : elle invente des gages perso et veut les retrouver à la soirée suivante.

## Premier lancement & navigation

- **US-01** — En tant que Karim, quand j'ouvre l'app pour la première fois, je saisis les prénoms de la table et j'arrive sur l'accueil en moins de 30 secondes, sans créer de compte.
- **US-02** — En tant que Karim, quand j'appuie sur le bouton retour de mon Android, je reviens à l'écran précédent — l'app ne se ferme jamais sans prévenir (toast « Appuie encore pour quitter » sur l'accueil).
- **US-03** — En tant que Léa, si une modale est ouverte (choix de pack, contestation, paywall, cookies), le bouton retour ferme d'abord la modale, pas l'écran.
- **US-04** — En tant que Karim, aucun écran ne peut me piéger : l'écran joueurs a un bouton retour dès qu'une liste valide existe, et aucun chemin ne mène à un écran noir.
- **US-05** — En tant que Léa sur iPhone, tous les boutons « quitter » restent sous l'encoche, tapables à 100 %.
- **US-06** — En tant que Karim en pleine partie de Borderland, si j'appuie sur retour par accident, on me demande confirmation avant de perdre la partie.

## Le Borderland (jeu de cartes)

- **US-10** — En tant que Léa, avant de lancer, je choisis 1, 2 ou 3 paquets (52 à 156 cartes) et j'active ou non les jokers.
- **US-10b** — En tant que Léa, je compose mon paquet : je retire les couleurs que je ne veux pas jouer (leur règle disparaît avec) et les valeurs de mon choix (par exemple sans figures, ou sans As) ; le nombre de cartes s'affiche en direct et je ne peux pas lancer un paquet vide.
- **US-11** — En tant que joueur, chaque carte arrive **face cachée** : impossible de deviner sa couleur avant de la retourner (le Guess reste un vrai pari).
- **US-12** — En tant que joueur, chaque carte a un visuel unique : vraies dispositions de symboles du 2 au 10, figures V/D/R illustrées, jokers étoilés.
- **US-13** — En tant que joueur qui tire un Joker, j'obtiens une carte blanche : j'invente une règle de table ou j'annule une pénalité.
- **US-14** — En tant qu'abonné Premium, je débloque le mode « cartes aléatoires à l'infini » : le paquet ne s'épuise jamais.
- **US-15** — En tant que joueur, je peux contester une carte révélée et escalader (x2, x4) ; les pénalités du perdant sont réellement comptées au récap.

## Les nouveaux modes

- **US-20 (Quitte ou Trinque)** — En tant que joueur, je réponds à une question de culture G qui vaut 1 à 3 points ; si je réponds juste, je choisis entre cumuler ma cagnotte (et tout risquer) ou la distribuer ; si je me trompe, je prends ma cagnotte + les points en jeu.
- **US-21 (Le Podium)** — En tant que juge, je découvre une question secrète et je classe mes potes ; en tant que groupe, je vois le podium et je dois retrouver la vraie question parmi 4 propositions — le perdant trinque.
- **US-22 (L'Enchère)** — En tant que joueur, je surenchéris (« je peux en citer 7 ! ») jusqu'au « tu mens ! » ; le chrono de 60 s se lance et la table compte mes bonnes réponses.
- **US-23 (Le Procès)** — En tant que joueur, j'écris une accusation secrète en début de partie ; les accusations sont tirées au hasard, l'accusé se défend, la table vote à main levée.

## Mes règles (personnalisation)

- **US-30** — En tant que Jade, je crée ma propre règle (texte + pénalité + jetons {player}/{player2}) et je choisis si elle s'injecte dans les jeux de cartes ou dans la roulette.
- **US-31** — En tant que Jade, mes règles sont sauvegardées **sur mon téléphone** et se retrouvent à la soirée suivante, même hors ligne.
- **US-32** — En tant que Jade, je peux activer/désactiver une règle sans la supprimer, la modifier, et prévisualiser son rendu interpolé avant d'enregistrer.

## Confiance & commercialisation

- **US-40** — En tant qu'utilisateur, l'app n'envoie aucune donnée avant mon choix de cookies, et refuser est aussi simple qu'accepter.
- **US-41** — En tant qu'utilisateur, l'app ne me pousse jamais à consommer de l'alcool : elle distribue des « pénalités » abstraites, la table décide du reste.
- **US-42** — En tant que Léa, je peux installer l'app sur mon écran d'accueil (PWA iOS/Android, icônes dédiées) et jouer sans réseau.
- **US-43** — En tant qu'utilisateur curieux, le paywall Premium me montre exactement ce que je débloque, avec le vrai prix, et « Plus tard » est toujours disponible.

## Matrice « bouton retour »

| Contexte | Retour matériel / navigateur |
|---|---|
| Accueil (hub) | Toast « Appuie encore pour quitter », 2ᵉ appui = sortie |
| Écran de jeu (prompt, roulette, procès, quiz…) | Retour à l'accueil |
| Borderland, partie entamée | Confirmation « Quitter la partie ? » |
| Modale / picker / paywall / panneau cookies ouvert | Ferme l'overlay, reste sur l'écran |
| Écran joueurs (liste valide existante) | Retour à l'accueil |
| Écran joueurs (première visite) | Toast de sortie (c'est la racine) |
