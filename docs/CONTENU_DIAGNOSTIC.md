# Contenu de jeu - diagnostic du 2026-08-30

Adam : « les questions sont du niveau quelle est la couleur du cheval blanc
d'Henri IV ». Trois agents ont lu le contenu reel. Le probleme n'est pas
« quelques cartes faibles », c'est un defaut de FABRICATION qui touche des
paquets entiers.

## Le constat qui resume tout

| Paquet | Cartes | Attaque de phrase |
|---|---|---|
| `sept-secondes-classique.json` | 80 | **80 sur 80** commencent par « Cite 3 » |
| `qui-de-nous-classique.json` | 80 | **80 sur 80** par « Qui est le plus susceptible de » |
| `cest-un-10-classique.json` | 80 | **80 sur 80** par « C'est un 10 mais » |
| `never-classique.json` | 80 | **80 sur 80** par « Je n'ai jamais » |

320 cartes, quatre phrases. Une tablee arrete de lire une phrase dont elle
connait la premiere moitie : au troisieme tour elle ne lit plus que les cinq
derniers mots. Ce n'est pas une question de style, c'est mecanique.

## La garde : `npm run check:contenu`

Sept controles SYNTAXIQUES. Elle ne juge pas le gout - une garde qui pretend
dire si une carte est drole serait fausse une fois sur deux, et une garde qui
crie a tort finit desactivee.

**Etat initial : 393 defauts sur 480 cartes. Apres reecriture : 34.**

| Controle | Avant | Apres | Ce qu'il attrape |
|---|---|---|---|
| barre trop basse | 80 | **1** | « Cite 3 » en 7 secondes : taux d'echec proche de zero. Un chrono que personne ne rate n'est plus un chrono |
| quasi-doublon | 76 | **21** | Plus de 70 % de mots communs avec une autre carte du meme paquet |
| longueur | 61 | **9** | Hors des bornes 28 a 140 signes, la limite de lecture a voix haute en piece bruyante |
| hors perimetre | 20 | **2** | Pompes et squats, appels et messages vers des absents, vrais debats de societe, ingestion forcee |
| attaque repetee | 3 | **0** | Les quatre premiers mots au-dela de 15 % du paquet, APRES retrait de la formule du mode |
| litige non arbitre | 2 | **0** | « si c'est nul », « le groupe decide si », sans juge nomme |
| ne designe personne | - | **1** | Une carte qui DECLARE viser quelqu'un d'autre sans le nommer dans son texte |

**Elle n'est PAS branchee en CI aujourd'hui.** La brancher bloquerait chaque
build jusqu'a la reecriture complete, et une garde qui bloque tout se fait
desactiver. Elle y entre quand le compte descend sous 20, et ce seuil est la
definition de « le lot contenu est fini ».

## Le calibrage, et ce qu'il a coute

**Trois recalibrages en une journee, tous pour la meme raison : la garde
accusait des cartes justes.** C'est la panne la plus couteuse d'un outil de
controle, parce qu'elle ne se voit pas - un chiffre eleve ressemble a un
corpus mauvais, pas a un instrument fausse.

1. **629 defauts, dont 355 sur un seul controle.** Il exigeait un pivot de
   designation sur chaque carte, y compris « Je n'ai jamais X », qui interroge
   toute la table par sa MECANIQUE. Un controle qui echoue sur 74 % d'un corpus
   ne mesure plus le corpus, il mesure sa propre erreur.
2. **Puis 84 sur ce meme controle**, parce qu'il accusait encore les verites
   adressees au joueur dont c'est le tour - le mode designe deja qui repond. Il
   ne se prononce desormais que sur ce qu'il peut PROUVER : une carte qui
   DECLARE viser quelqu'un d'autre (`chosen`, `pair`, `all`) sans le nommer.
   Partout ailleurs la donnee manque, et accuser sur une donnee absente rend un
   controle faux.
3. **« Attaque repetee » reclamait l'impossible.** Il comptait 100 % sur
   « Je n'ai jamais » et « C'est un 10 mais » - mais ces formules SONT le nom
   du jeu. Exiger 80 ouvertures differentes revenait a demander de casser le
   mode, et une garde qui reclame l'impossible se fait contourner, pas
   corriger. Elle retire maintenant la formule dominante et mesure la
   repetition de ce qui SUIT, la ou le defaut vit vraiment.

Plus un ajustement simple : plancher de longueur descendu de 40 a 28 signes,
parce qu'a 40 il rejetait « C'est qui ton crush secret ici ? », une vraie bonne
question breve.

**422 cartes sur 480 ne declarent pas de champ `targets`.** La garde le dit en
information, pas en defaut : on ne reproche pas a une carte de ne pas declarer
un champ que le schema n'exige pas encore. Le rendre obligatoire est le
prochain pas, et c'est ce qui rendra le controle 3 voyant sur tout le corpus.

## Ce qui reste a faire, dans l'ordre

1. ~~Reecrire les quatre paquets a attaque unique.~~ **FAIT** le 2026-08-30 :
   quatre agents en parallele, un par paquet, fichiers disjoints. Exemple du
   geste : « Cite 3 capitales europeennes » est devenu « Cite 5 capitales,
   aucune deja tombee ce soir, la tablee compte a voix haute ».
2. ~~Retirer les cartes hors perimetre.~~ **FAIT**, de 20 a 2. Le sport exclut,
   un appel implique un absent qui n'a rien accepte, et `pic-073` sanctionnait
   le refus de boire - ce dernier attirait aussi l'oeil d'un examinateur de
   magasin sur toute la mecanique de penalite.
3. **Finir les 34 defauts restants** : 21 quasi-doublons, 9 longueurs, 2 hors
   perimetre, 1 « cite 3 », 1 cible declaree sans designation.
4. **Ajouter un champ d'intensite AU NIVEAU DE L'ITEM.** Il n'existe
   aujourd'hui que sur le paquet : rien n'empeche une carte dure de tomber au
   deuxieme tour sur une tablee qui n'y est pas prete.
5. **Ajouter une memoire entre parties.** `promptSession.ts` melange une fois
   au lancement et ne retient rien : la deuxieme soiree du meme groupe repioche
   dans le meme paquet. C'est ce que 11 repondants sur 16 de l'etude beta
   citent comme l'irritant numero un du marche.

## Ce que l'etude beta dit, et ce qu'elle ne dit pas

`docs/ETUDE_BETA_2026-08.md` : **16 repondants sur 16 n'avaient pas teste
l'app**. Elle ne dit donc RIEN sur la qualite d'une consigne precise. Ce
qu'elle etablit : la fraicheur du contenu est le moteur de retour (6 verbatims
sur 8), et il manque une mecanique de bluff ou d'imposteur (9 mentions sur 16)
- ce dernier point est couvert par « Le Faux Frere », deja dessine dans la
maquette Figma.
