# Phase 0 - Recherche

Aucun marqueur `NEEDS CLARIFICATION` ne subsistait a l'entree de cette phase. Les
points ci-dessous sont des choix a arreter avant d'ecrire du code, chacun avec sa
raison et ce qui a ete ecarte.

---

## D1. Ou vit la decision du mode suivant

**Decision** : une fonction pure dans `src/core/engine/sequenceur.ts`, qui recoit
l'etat de la soiree et le registre, et rend un identifiant de mode. Aucune
connaissance de React, du stockage ni du temps systeme : l'instant courant est un
parametre.

**Rationale** : les criteres SC-003 et SC-004 demandent 20 enchainements simules
chacun. Une logique melee au composant ou au store exigerait un rendu ou un
environnement pour chaque simulation. Une fonction pure les execute en quelques
millisecondes, ce qui rend le critere reellement verifiable plutot que
theoriquement verifiable.

**Alternatives ecartees** :
- Logique dans le store Zustand : melerait decision et persistance, et rendrait le
  tirage dependant de l'ordre des actions.
- Logique dans le composant de transition : impossible a tester sans rendu, et
  dupliquee des qu'un second point d'entree apparaitra.

---

## D2. Comment le rythme de soiree est represente

**Decision** : deux attributs ajoutes a chaque mode du registre. Une duree
indicative a trois valeurs, court, moyen, long. Et un drapeau indiquant que le mode
demande des explications de regles avant de commencer.

**Rationale** : trois valeurs suffisent a exprimer la regle voulue, les modes longs
tot et les modes courts tard, et se decident a l'oeil par quelqu'un qui connait le
jeu. Une duree en minutes donnerait une fausse precision que personne ne saurait
renseigner honnetement.

Le besoin d'explication pourrait etre deduit du nombre d'etapes dans `rules.steps`,
qui existe deja. C'est tentant et c'est un piege : un mode peut avoir cinq etapes
courtes et se comprendre en dix secondes. L'attribut est donc explicite.

**Alternative ecartee** : deduire le rythme de la longueur du contenu. Correlation
faible, et une donnee derivee d'une autre finit toujours par mentir.

---

## D3. Quel aleatoire

**Decision** : tirage aleatoire pondere, avec une graine injectable. Le sequenceur
recoit sa source d'aleatoire en parametre, comme le fait deja `targeting.ts` dans
ce depot avec son type `Rng`.

**Rationale** : sans graine injectable, aucun test ne peut affirmer qu'une sequence
respecte une regle de rythme, puisque chaque execution differe. Avec elle, le
corpus de tests devient deterministe et les 20 simulations demandees par les
criteres de succes sont reproductibles.

Le depot a deja ce motif, il n'y a donc rien a inventer.

**Alternative ecartee** : `Math.random` appele directement dans la fonction. Rend
tout le corpus non deterministe et fait echouer les tests au hasard, ce qui les
fait desactiver au bout de deux semaines.

---

## D4. Comment eviter les repetitions

**Decision** : la soiree porte la liste des modes deja joues. Le tirage exclut
cette liste. Quand elle couvre tous les modes eligibles, elle est videe et un
message annonce clairement un second tour.

**Rationale** : c'est le comportement attendu par le scenario 3 de la premiere
user story. Vider silencieusement donnerait l'impression d'un bug, et s'arreter
mettrait fin a la soiree au pire moment.

**Alternative ecartee** : une file melangee calculee une fois au demarrage. Simple,
mais incompatible avec la reevaluation de l'eligibilite quand la tablee change en
cours de soiree, exigee par FR-016.

---

## D5. Quand charger le mode suivant

**Decision** : declencher l'import paresseux du composant du mode suivant pendant
l'affichage de l'ecran d'annonce, pas apres.

**Rationale** : le registre charge deja les ecrans en paresseux. Si le chargement
commence a la fin de l'annonce, la tablee voit un ecran vide au moment precis ou
elle attend le jeu. L'annonce dure de toute facon quelques secondes, autant s'en
servir.

---

## D6. Ou vit l'etat de la soiree

**Decision** : un store Zustand persiste, avec un prefixe de cle nouveau, ajoute a
cote des prefixes existants et sans toucher a la chaine de migration.

**Rationale** : le principe II de la constitution interdit de toucher aux cles
historiques, dont depend la migration des donnees des utilisateurs installes de
longue date. Une nouvelle fonctionnalite ajoute sa cle, elle ne renomme rien.

**Point de vigilance** : la reprise doit expirer. Une soiree vieille de trois jours
proposee au reveil serait absurde. Le seuil retenu est de quelques heures, valeur
exacte a caler en test utilisateur, et il est verifie par un test avec un instant
injecte.

---

## D7. Ce qui n'est pas tranche ici

- **La duree exacte de l'ecran d'annonce.** Trop court, personne ne lit. Trop long,
  ca casse le rythme. A caler en soiree reelle, pas au bureau.
- **Le seuil de bascule vers les modes courts.** Une heure est un point de depart
  raisonnable, pas une valeur mesuree.
- **Les valeurs de duree indicative par mode.** Elles demandent le jugement de
  quelqu'un qui a fait tourner les 13 modes en soiree. Elles ne se devinent pas
  depuis le code.
