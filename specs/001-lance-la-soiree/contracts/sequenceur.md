# Contrat - interface du sequenceur

Le sequenceur est la seule piece nouvelle qui contient une decision. Tout le reste
de la fonctionnalite est de l'affichage et du stockage.

## Signature

```
choisirModeSuivant(soiree, tablee, registre, maintenant, rng) -> Choix
```

Cinq parametres, aucun implicite.

`maintenant` et `rng` sont des parametres et non des appels au systeme. Sans cela,
aucun test ne peut affirmer qu'une sequence respecte une regle de rythme, puisque
chaque execution differerait. Le depot utilise deja ce motif dans
`src/core/engine/targeting.ts`.

## Sortie

```
Choix =
  | { type: 'mode', id, phase, secondTour: boolean }
  | { type: 'aucun', raison }
```

Le second tour est **porte par la sortie**, pas gere en interne en silence. C'est
ce qui permet a l'ecran d'annonce de le dire a la tablee, comme l'exige le cas
limite de la specification.

`{ type: 'aucun' }` n'arrive que si aucun mode n'est eligible du tout, par exemple
une tablee d'une seule personne. La raison est une valeur enumeree, jamais un texte
d'affichage.

## Ce que l'interface interdit

- **Aucun acces au stockage, au reseau, a l'horloge ou a React.** Le sequenceur
  recoit tout et ne rend qu'une decision.
- **Aucune chaine destinee a l'affichage.** Il rend des identifiants et des valeurs
  enumerees. Les textes vivent dans les composants, ou la garde du lexique alcool
  les voit.
- **Aucun effet de bord sur la soiree.** Il ne marque pas le mode comme joue, c'est
  au store de le faire. Une fonction qui choisit et qui mute est une fonction qu'on
  ne peut pas appeler deux fois pour comparer.

## Invariants verifiables

Chacun correspond a une exigence de la specification et doit avoir son test.

1. **Effectif respecte.** Aucun mode dont `minPlayers` depasse l'effectif n'est
   jamais rendu. FR-005, SC-003.
2. **Accessibilite respectee.** Aucun mode inaccessible n'est jamais rendu, et le
   sequenceur n'a aucun moyen de signaler une occasion d'achat. FR-006, SC-004.
3. **Pas de repetition.** Tant que des modes eligibles restent non joues, aucun
   mode deja joue n'est rendu. FR-004.
4. **Second tour annonce.** Quand la liste est epuisee, la sortie porte
   `secondTour: true`. Cas limite de la specification.
5. **Explication tot.** Sur les trois premiers appels d'une soiree neuve, au moins
   un mode `demandeExplication` est rendu. FR-011.
6. **Modes courts tard.** Au dela du seuil horaire, un mode `court` est privilegie
   quand il en existe un d'eligible. FR-010.
7. **Determinisme.** A graine et etat identiques, deux appels rendent le meme
   choix. C'est la condition des simulations demandees par SC-003 et SC-004.

## Garde associee

`scripts/check_sequenceur.mjs` verifie le **registre**, pas le sequenceur :

- Chaque mode porte `dureeIndicative` et `demandeExplication`.
- Au moins un mode est jouable a deux joueurs, sinon une petite tablee ne peut
  jamais lancer de soiree.
- Au moins un mode `court` existe, sinon la regle de fin de soiree ne peut jamais
  s'appliquer.

Cette garde attrape le mode ajoute plus tard sans ses attributs, qui serait sinon
ecarte ou mal place en silence. Comme toute garde de ce depot, elle doit avoir ete
vue rouge avant d'etre acceptee verte.

### Ce que la garde ne voit pas

Elle ne juge pas si une duree indicative est **juste**. Declarer Borderland comme
court alors qu'il dure quarante minutes passera. Cette valeur releve du jugement de
quelqu'un qui a fait tourner les modes en soiree, et aucun script ne la remplacera.
