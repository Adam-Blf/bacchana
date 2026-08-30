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

Etat au 2026-08-30 : **393 defauts sur 480 cartes**.

| Controle | Defauts | Ce qu'il attrape |
|---|---|---|
| barre trop basse | 80 | « Cite 3 » en 7 secondes : taux d'echec proche de zero. Un chrono que personne ne rate n'est plus un chrono |
| quasi-doublon | 76 | Plus de 70 % de mots communs avec une autre carte du meme paquet |
| longueur | 61 | Hors des bornes 28 a 140 signes, la limite de lecture a voix haute en piece bruyante |
| hors perimetre | 20 | Pompes et squats, appels et messages vers des absents, vrais debats de societe, ingestion forcee |
| attaque repetee | 3 | Les quatre premiers mots au-dela de 15 % du paquet |
| litige non arbitre | 2 | « si c'est nul », « le groupe decide si », sans juge nomme |

**Elle n'est PAS branchee en CI aujourd'hui.** La brancher bloquerait chaque
build jusqu'a la reecriture complete, et une garde qui bloque tout se fait
desactiver. Elle y entre quand le compte descend sous 20, et ce seuil est la
definition de « le lot contenu est fini ».

## Le calibrage, et ce qu'il a coute

Premiere version : 629 defauts, dont **355 sur le seul controle « ne vise
personne »**. Un controle qui echoue sur 74 % du corpus ne mesure plus le
corpus, il mesure sa propre erreur. Deux corrections :

- Exemption des modes collectifs PAR MECANIQUE. « Je n'ai jamais X » interroge
  toute la table a la fois : y exiger un pivot de designation etait un
  pleonasme.
- Plancher de longueur descendu de 40 a 28 signes. A 40, il rejetait « C'est
  qui ton crush secret ici ? », une vraie bonne question breve.

## Ce qui reste a faire, dans l'ordre

1. **Reecrire les quatre paquets a attaque unique.** Vingt reecritures modeles
   ont ete produites par le directeur de creation, elles montrent le geste :
   « Cite 3 capitales europeennes » devient « Cite 5 capitales, aucune deja
   tombee ce soir, la tablee compte a voix haute ».
2. **Retirer les 20 cartes hors perimetre.** Elles ne se reecrivent pas, elles
   se suppriment : le sport exclut, un appel implique un absent qui n'a rien
   accepte, et `pic-073` sanctionne le refus de boire - ce dernier attire aussi
   l'oeil d'un examinateur de magasin sur toute la mecanique de penalite.
3. **Ajouter un champ d'intensite AU NIVEAU DE L'ITEM.** Il n'existe
   aujourd'hui que sur le paquet : rien n'empeche une carte dure de tomber au
   deuxieme tour sur une tablee qui n'y est pas prete.
4. **Ajouter une memoire entre parties.** `promptSession.ts` melange une fois
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
