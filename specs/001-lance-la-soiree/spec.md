# Feature Specification: Lance la soiree

**Feature Branch**: `001-lance-la-soiree`

**Created**: 2026-08-14

**Status**: Prete pour la planification.

**Input**: User description: "Bouton Lance la soiree propose a l'audit produit :
enchainement automatique des modes, pour ne plus demander un choix parmi 13 a 23h."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Commencer sans avoir a choisir (Priority: P1)

Une tablee de six personnes ouvre l'application a 23h. Personne n'a envie de lire
13 descriptions ni de se mettre d'accord. Quelqu'un appuie sur un seul bouton et
le jeu commence. Quand un mode se termine, le suivant s'enchaine tout seul.

**Why this priority**: c'est le probleme observe. A cette heure et dans ce
contexte, le choix n'est pas une liberte, c'est un frottement. Une tablee qui
hesite trois minutes devant un menu passe a autre chose. Cette tranche, livree
seule, remplace deja le menu par un geste.

**Independent Test**: ouvrir l'application avec un groupe declare, appuyer sur le
bouton unique, et verifier qu'un mode demarre sans autre interaction, puis qu'un
deuxieme s'enchaine a la fin du premier sans revenir au menu.

**Acceptance Scenarios**:

1. **Given** une tablee declaree, **When** quelqu'un appuie sur le bouton unique,
   **Then** un mode demarre immediatement, sans ecran de choix intermediaire.
2. **Given** un mode en cours lance par l'enchainement, **When** ce mode se
   termine, **Then** le suivant demarre sans repasser par le menu, et une
   transition annonce lequel arrive.
3. **Given** un enchainement en cours, **When** trois modes se sont succede,
   **Then** aucun ne s'est repete.
4. **Given** une tablee de trois personnes, **When** l'enchainement selectionne un
   mode qui exige davantage de joueurs, **Then** ce mode est ecarte sans que la
   tablee en soit informee par une erreur.
5. **Given** une tablee sans premium, **When** l'enchainement se deroule, **Then**
   seuls des modes accessibles sont proposes, et aucun ecran de paiement
   n'interrompt la partie.

---

### User Story 2 - Garder la main a tout moment (Priority: P2)

L'enchainement propose, il n'impose pas. La tablee peut passer un mode qui ne
prend pas, revenir a un choix manuel, ou arreter l'enchainement sans quitter la
soiree en cours.

**Why this priority**: un enchainement dont on ne peut pas sortir est vecu comme
une contrainte, exactement le defaut qu'il pretend corriger. Sans cette tranche, la
premiere ne serait pas defendable, mais elle reste testable et utile seule.

**Independent Test**: pendant un enchainement, passer un mode et verifier qu'un
autre demarre ; arreter l'enchainement et verifier qu'on revient au choix manuel
sans perdre l'etat de la tablee.

**Acceptance Scenarios**:

1. **Given** un mode en cours, **When** la tablee demande a passer, **Then** un
   autre mode demarre et le mode passe n'est pas represente dans la meme soiree.
2. **Given** un enchainement en cours, **When** la tablee l'arrete, **Then** elle
   revient au choix manuel, la composition de la tablee et les scores en cours
   sont conserves.
3. **Given** un mode choisi manuellement, **When** il se termine, **Then**
   l'application propose de reprendre l'enchainement, sans le relancer d'office.

---

### User Story 3 - S'adapter a la tablee et a l'heure (Priority: P3)

L'enchainement tient compte de la composition du groupe et de la duree deja
ecoulee. Les modes longs et explicatifs viennent tot, les modes courts et
physiques plus tard.

**Why this priority**: c'est ce qui fait la difference entre un tirage au hasard et
une soiree qui a un rythme. Priorite basse parce qu'un tirage aleatoire simple
delivre deja l'essentiel de la valeur.

**Independent Test**: derouler deux enchainements, l'un demarre a l'ouverture,
l'autre apres une heure de jeu simulee, et verifier que la sequence proposee
differe selon la regle attendue.

**Acceptance Scenarios**:

1. **Given** un enchainement qui demarre, **When** les trois premiers modes sont
   tires, **Then** au moins un mode a regles explicatives figure parmi eux.
2. **Given** une soiree entamee depuis plus d'une heure, **When** le mode suivant
   est tire, **Then** un mode court est privilegie.
3. **Given** une tablee de deux personnes, **When** l'enchainement se deroule,
   **Then** seuls des modes jouables a deux sont proposes.

---

### User Story 4 - Reprendre une soiree interrompue (Priority: P3)

Le telephone se verrouille, l'application passe en arriere-plan, la batterie
tombe. En revenant, la tablee retrouve l'enchainement la ou il en etait.

**Why this priority**: cela arrive a chaque soiree. Sans cette tranche, une
coupure renvoie au menu, c'est a dire exactement au probleme d'origine.

**Independent Test**: lancer un enchainement, fermer l'application, la rouvrir, et
verifier que la reprise propose le mode en cours et non le menu.

**Acceptance Scenarios**:

1. **Given** un enchainement en cours, **When** l'application est fermee puis
   rouverte, **Then** la reprise est proposee avec le mode en cours nomme.
2. **Given** une soiree vieille de plusieurs jours, **When** l'application est
   rouverte, **Then** la reprise n'est pas proposee et la tablee repart a neuf.

---

### Edge Cases

- Que se passe-t-il si tous les modes jouables ont deja ete joues dans la soiree ?
  L'enchainement recommence un cycle en annoncant clairement qu'il fait un second
  tour, plutot que de s'arreter sans explication.
- Que se passe-t-il si la tablee change en cours de soiree, un joueur arrive ou
  part ? Le filtre sur le nombre de joueurs est reevalue au mode suivant, jamais au
  milieu d'un mode en cours.
- Que se passe-t-il si un mode necessite du contenu premium que la tablee n'a pas ?
  Il est ecarte du tirage. L'enchainement n'est jamais un vecteur de mise en avant
  du paiement, cela transformerait le jeu en tunnel de vente.
- Que se passe-t-il hors ligne ? Rien de particulier. L'enchainement ne consulte
  aucun service distant, conformement au principe IV de la constitution.
- Que se passe-t-il si la tablee appuie deux fois sur le bouton ? Le second appui
  ne relance pas une nouvelle soiree par-dessus la premiere.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le systeme MUST proposer, depuis l'ecran d'accueil, une action unique
  qui demarre une soiree sans passer par un choix de mode.
- **FR-002**: Le systeme MUST enchainer automatiquement un mode suivant a la fin du
  mode courant, sans revenir au menu.
- **FR-003**: Le systeme MUST annoncer le mode qui arrive, de facon lisible a bout
  de bras, avant de le demarrer.
- **FR-004**: Le systeme MUST NOT repeter un mode deja joue tant que tous les modes
  eligibles n'ont pas ete joues.
- **FR-005**: Le systeme MUST ecarter du tirage tout mode dont le nombre de joueurs
  requis n'est pas satisfait par la tablee declaree.
- **FR-006**: Le systeme MUST ecarter du tirage tout mode dont le contenu n'est pas
  accessible a la tablee, et MUST NOT afficher d'ecran de paiement pendant un
  enchainement.
- **FR-007**: Les joueurs MUST pouvoir passer le mode en cours et obtenir un autre
  mode.
- **FR-008**: Les joueurs MUST pouvoir arreter l'enchainement et revenir au choix
  manuel, sans perdre la composition de la tablee ni les scores en cours.
- **FR-009**: Le systeme MUST proposer de reprendre l'enchainement a la fin d'un
  mode choisi manuellement, sans le relancer automatiquement.
- **FR-010**: Le systeme MUST tenir compte de la duree ecoulee depuis le debut de
  la soiree pour privilegier les modes courts en fin de soiree.
- **FR-011**: Le systeme MUST placer au moins un mode a regles explicatives dans
  les premiers modes d'un enchainement.
- **FR-012**: Le systeme MUST conserver l'etat de l'enchainement sur l'appareil et
  proposer une reprise apres fermeture de l'application.
- **FR-013**: Le systeme MUST abandonner la reprise d'une soiree trop ancienne et
  repartir a neuf.
- **FR-014**: Le systeme MUST fonctionner sans reseau pour toute cette
  fonctionnalite.
- **FR-015**: Le systeme MUST NOT nommer l'alcool dans les textes de transition,
  d'annonce ou d'arret, conformement au principe I de la constitution.
- **FR-016**: Le systeme MUST reevaluer l'eligibilite des modes entre deux modes et
  jamais pendant un mode en cours.
- **FR-017**: Un second appui sur l'action de demarrage MUST NOT ecraser une soiree
  deja en cours.

### Key Entities

- **Soiree** : une session de jeu. Porte la tablee, l'instant de debut, la liste
  des modes deja joues, le mode en cours et l'etat de l'enchainement, actif ou
  arrete. Reside sur l'appareil.
- **Tablee** : les joueurs declares. Sert au filtre d'eligibilite. Existe deja dans
  le produit.
- **Mode** : un jeu du catalogue. Porte un nombre de joueurs minimal, une duree
  indicative, un drapeau indiquant s'il exige des explications de regles, et son
  niveau d'acces. Le catalogue existe deja, ces attributs sont a completer.
- **Sequence** : l'ordre des modes retenus pour la soiree, recalcule a chaque
  transition plutot que fixe au depart, puisque la tablee et l'heure evoluent.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: le temps entre l'ouverture de l'application et le premier mode joue
  passe sous 10 secondes, contre un parcours actuel qui exige de lire et de choisir
  parmi 13 entrees.
- **SC-002**: une soiree lancee par l'enchainement enchaine au moins 4 modes
  differents sans aucune interaction de navigation entre eux.
- **SC-003**: sur 20 enchainements simules avec une tablee de 3 joueurs, zero mode
  exigeant davantage de joueurs n'est propose.
- **SC-004**: sur 20 enchainements simules sans premium, zero ecran de paiement
  n'apparait et zero mode inaccessible n'est propose.
- **SC-005**: apres fermeture et reouverture de l'application, la reprise est
  proposee dans 100 pour cent des cas ou la soiree date de moins de quelques
  heures.
- **SC-006**: 8 testeurs sur 10 declarent, apres une soiree reelle, qu'ils n'ont
  pas eu a se demander a quoi jouer ensuite.
- **SC-007**: aucun texte introduit par cette fonctionnalite ne declenche la garde
  du lexique alcool.

## Assumptions

- Le catalogue des 13 modes existe et est deja decrit dans le registre des modes.
  Les attributs manquants, duree indicative et besoin d'explication, sont a
  ajouter, pas a inventer depuis rien.
- La composition de la tablee est deja saisie avant de jouer, cette fonctionnalite
  ne la remplace pas.
- Un seul telephone anime la soiree. Aucune synchronisation entre appareils n'est
  supposee, conformement au principe IV.
- Le mode manuel reste disponible et inchange. Cette fonctionnalite ajoute un
  chemin, elle n'en supprime aucun.
- Les scores et l'etat interne de chaque mode restent geres par le mode lui-meme.
  L'enchainement orchestre, il ne rejoue pas la logique des modes.
- Aucune mesure d'usage nominative n'est supposee. Les criteres de succes qui
  parlent de testeurs se mesurent en test utilisateur, pas par telemetrie.
