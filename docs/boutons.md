# Boutons des écrans d'entrée

Passe du 9 octobre 2026 (version 0.67.0). Périmètre : porte d'âge, introduction, saisie de la tablée, fenêtre Premium. Les boutons de jeu sont fonctionnels : seuls leurs contrastes sont vérifiés.

Public : des groupes d'amis majeurs, qui ouvrent l'application pour lancer une partie. Loi Evin : aucun libellé n'incite à boire, `npm run check:alcohol` reste vert. L'application distribue des pénalités abstraites, la table décide.

| Écran | Avant | Après | Pourquoi |
|---|---|---|---|
| Porte d'âge | Oui, j'ai 18 ans ou plus / Non, j'ai moins de 18 ans | inchangés | Réponse légale, factuelle, deux cibles de même taille |
| Introduction, dernier panneau | Entrer chez Bacchana | Composer ma tablée | Le clic mène à la saisie des prénoms |
| Introduction | Suivant, Passer, Retour | inchangés | Navigation |
| Tablée | Pousser la porte | Choisir notre premier jeu | Le clic ouvre le hub des jeux. « Continuer quand même » et « Une chaise de plus » restent : gestes de saisie |
| Fenêtre Premium | Débloquer Bacchana Premium | inchangé | Dit déjà ce que l'on gagne. « Plus tard » et « Restaurer mes achats » restent : gestes de fermeture et de reprise |

Les commentaires de code qui racontent l'ancien bug de « Pousser la porte » gardent le nom d'époque : ils décrivent un fait passé. La maquette Figma (`scripts/maquettes/maquette_lot_1_parcours.py`) porte encore les anciens libellés : à régénérer.

## Contrastes mesurés

Rendu réel à 390 px, trois thèmes (clair, sombre, daltonien), états repos, survol et focus, sur la porte d'âge, l'introduction, la tablée et la fenêtre Premium. Texte 4,5:1, fond ou bordure 3:1 contre la page.

- Boutons pleins (principal) : texte 9,31 clair, 11,42 sombre, 14,04 daltonien ; fond contre la page 6,64 à 10,33.
- Boutons à contour : bordure 3,13 à 16,49 selon le thème.
- Boutons sans cadre (Non, Passer, Plus tard, Restaurer) : texte 4,62 à 14,77. Le fond de survol (`ink/5`) est une aide, pas ce qui désigne le bouton.

Corrigé : le survol de « Une chaise de plus » et de la pastille Genre et statut passait la bordure à `neon/50`, soit 2,65:1 en clair et 2,74:1 en sombre. Elle passe à `neon` plein, 6,6:1 et plus.

La fenêtre Premium s'ouvre ici avec le paiement désactivé (« Bientôt disponible ») : un bouton désactivé n'est pas soumis au seuil.

## À trancher

- Le commentaire de `PremiumPaywallModal` annonce 12,99 EUR, le site 14,99 EUR. Le prix affiché vient du magasin, mais le commentaire ment.
- Le panneau « Ta table décide » dit « jouable avec ou sans alcool ». Ce n'est pas un bouton, mais la phrase mérite l'avis de `legal-advisor` au regard de la loi Evin.
