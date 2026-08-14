# Phase 1 - Modele de donnees

Tout reside sur l'appareil. Aucune entite ne quitte le telephone, conformement au
principe IV de la constitution.

---

## Etendu, sur l'existant

### ModeDefinition

Le registre `src/core/engine/modeRegistry.ts` porte deja ce qu'il faut pour le
filtre d'eligibilite. Deux attributs manquent pour le rythme.

| Champ | Etat | Role dans cette fonctionnalite |
|---|---|---|
| `id`, `title`, `subtitle` | existe | Affiches sur l'ecran d'annonce |
| `minPlayers` | **existe** | Filtre d'eligibilite, FR-005 |
| `freePackIds`, `hasPremiumPacks` | **existe** | Filtre d'accessibilite, FR-006 |
| `component` | existe | Import paresseux declenche pendant l'annonce, D5 |
| `rules.steps` | existe | Sert a l'ecran de regles, pas au rythme, voir D2 |
| `dureeIndicative` | **a ajouter** | `court`, `moyen` ou `long` |
| `demandeExplication` | **a ajouter** | Booleen explicite, non deduit de `rules` |

**Regle de validation** : tout mode du registre doit porter les deux nouveaux
attributs. Un mode ajoute plus tard sans eux serait ecarte ou mal place
silencieusement. Une garde le verifie.

---

## Nouveau

### Soiree

Etat persiste, un seul a la fois.

| Champ | Type | Regle |
|---|---|---|
| `demarreeLe` | horodatage | Sert au calcul du temps ecoule et a l'expiration de la reprise |
| `modesJoues` | liste d'identifiants | Videe et annoncee quand tous les modes eligibles sont epuises, D4 |
| `modeCourant` | identifiant ou vide | Ce qui est en train d'etre joue |
| `enchainementActif` | booleen | Faux quand la tablee est repassee en manuel, FR-008 |
| `derniereActiviteLe` | horodatage | Base de l'expiration, pas `demarreeLe` : une soiree longue reste valide tant qu'on joue |

**Regles de validation**

- Un second demarrage alors qu'une soiree est active ne cree pas de nouvelle
  soiree, il reprend l'existante. FR-017.
- Arreter l'enchainement met `enchainementActif` a faux **sans effacer** la soiree.
  La tablee et les scores survivent, FR-008.
- Une soiree dont `derniereActiviteLe` depasse le seuil n'est plus proposee a la
  reprise et est remplacee a la premiere action, FR-013.

### Tablee

Existe deja dans le produit, non modifiee. Seul son effectif est lu, pour le filtre
d'eligibilite. Elle peut changer entre deux modes, jamais pendant un mode, FR-016.

---

## Calcule, jamais persiste

### Eligibilite

Un mode est eligible si toutes ces conditions sont vraies :

1. `minPlayers` est satisfait par l'effectif courant de la tablee.
2. Le contenu du mode est accessible a la tablee.
3. Le mode ne figure pas dans `modesJoues`.

Les trois se reevaluent a chaque transition, pas une fois au demarrage.

### Phase de soiree

Derivee du temps ecoule depuis `demarreeLe`.

| Phase | Condition | Effet sur le tirage |
|---|---|---|
| Ouverture | premiers modes de la soiree | Au moins un mode `demandeExplication`, FR-011 |
| Croisiere | entre les deux | Aucune contrainte particuliere |
| Fin de soiree | au dela du seuil horaire | Les modes `court` sont privilegies, FR-010 |

Le seuil n'est pas un fait mesure, c'est un point de depart a caler en soiree
reelle. Il est donc une constante nommee et non un nombre perdu dans une condition.

---

## Ce que le modele n'a volontairement pas

| Absent | Raison |
|---|---|
| Une file de modes calculee a l'avance | Incompatible avec la reevaluation quand la tablee change, D4 |
| Un identifiant de joueur | Le telephone tourne, l'application ne suit personne individuellement |
| Une trace d'usage envoyee | Les criteres de succes qui parlent de testeurs se mesurent en test utilisateur, pas par telemetrie |
| Un etat de progression par mode | Chaque mode reste maitre du sien. Le sequenceur orchestre, il ne rejoue pas la logique des modes |
