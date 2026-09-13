# Implementation Plan: Lance la soiree

**Branch**: `001-lance-la-soiree` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-lance-la-soiree/spec.md`

## Summary

Ajouter un chemin unique qui demarre une soiree et enchaine les modes tout seul,
sans jamais passer par le menu des 13 entrees.

L'approche tient en une decision : **un sequenceur pur, separe des modes**.
L'enchainement choisit le mode suivant a partir de faits observables, la tablee,
l'heure ecoulee, l'historique de la soiree, et ne rejoue aucune logique de jeu.
Chaque mode reste maitre de son propre deroulement, comme aujourd'hui. Le
sequenceur n'a donc besoin d'aucun ecran, ce qui le rend testable sans navigateur.

Le registre des modes porte deja `minPlayers`, `freePackIds` et `hasPremiumPacks`.
L'essentiel du filtrage d'eligibilite existe donc en donnee, il reste a l'exploiter
et a completer deux attributs manquants.

## Technical Context

**Language/Version**: TypeScript, React 19, Vite. Meme chaine que le reste du
depot, aucune nouvelle technologie introduite.

**Primary Dependencies**: Zustand pour l'etat de la soiree, aligne sur les stores
existants. Aucune dependance ajoutee.

**Storage**: `localStorage` via la persistance Zustand deja en place, avec le
prefixe courant. La reprise de soiree n'a pas besoin d'autre chose.

**Testing**: Vitest. Le sequenceur est une fonction pure, il se teste sans rendu.
Les parcours d'enchainement se testent au niveau du store.

**Target Platform**: application web progressive installable, telephone tenu a la
main et pose sur une table.

**Project Type**: application web monopage, un seul projet.

**Performance Goals**: la transition entre deux modes reste sous 300 millisecondes
ressenties. Le chargement du mode suivant est deja paresseux dans le registre, il
faut le declencher pendant l'ecran d'annonce et non apres.

**Constraints**: aucun reseau, aucun compte, aucune publicite, aucun ecran de
paiement pendant une soiree. Lisible a bout de bras dans une piece sombre.

**Scale/Scope**: 13 modes, une tablee de 2 a une douzaine de joueurs, une soiree
de quelques heures. Environ 3 ecrans nouveaux et un module de logique.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluation contre `.specify/memory/constitution.md` version 1.0.0.

| Principe | Verdict | Comment le plan s'y conforme |
|---|---|---|
| I. Conformite stores | PASSE | Les seuls textes ajoutes sont des annonces de transition et un libelle de bouton. Ils passent la garde du lexique comme le reste du contenu. |
| II. Univers narratif | PASSE | Le vocabulaire des annonces reste celui du comptoir. Aucune cle de stockage historique n'est touchee, un nouveau prefixe est ajoute a cote. |
| III. Un telephone, une piece sombre | PASSE | C'est la raison d'etre de la fonctionnalite. L'ecran d'annonce est concu pour etre lu a distance, et le bouton unique remplace un menu de 13 entrees. |
| IV. Hors ligne, sans compte, achat unique | PASSE | Le sequenceur est local et deterministe. **Aucun ecran de paiement pendant un enchainement**, voir la tension ci-dessous. |
| V. Garde vue rouge | PASSE | Deux gardes sont prevues et seront validees par regression volontaire avant d'etre acceptees. |

### Une tension resolue, et non contournee

**L'enchainement est une occasion commerciale evidente.** Proposer un mode premium
au milieu d'une soiree, au moment ou la tablee est engagee, convertirait mieux que
n'importe quel ecran de paiement. C'est precisement pour cela que le plan
l'interdit.

Le principe IV promet une application sans publicite et un achat unique. Interrompre
une partie pour vendre transformerait le jeu en tunnel de conversion, romprait la
promesse affichee publiquement, et abimerait la seule chose qui fait revenir une
tablee : que ca ne s'arrete pas.

**Decision : les modes inaccessibles sont ecartes du tirage, silencieusement.** La
mise en avant du premium reste ou elle est aujourd'hui, dans le menu et l'ecran
dedie, jamais dans le fil d'une soiree.

Aucune violation a justifier. La section Complexity Tracking reste vide.

## Project Structure

### Documentation (this feature)

```text
specs/001-lance-la-soiree/
├── plan.md              # Ce fichier
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── sequenceur.md    # Interface du sequenceur
└── tasks.md             # Phase 2
```

### Source Code (repository root)

```text
src/core/engine/
├── sequenceur.ts             # NOUVEAU. Choix du mode suivant, fonction pure
├── sequenceur.test.ts        # NOUVEAU. Corpus d'eligibilite et de rythme
├── modeRegistry.ts           # ETENDU. Deux attributs ajoutes par mode
└── types.ts                  # ETENDU. Duree indicative et besoin d'explication

src/stores/
├── soireeStore.ts            # NOUVEAU. Etat de la soiree, persiste
└── soireeStore.test.ts       # NOUVEAU

src/components/screens/
├── TransitionScreen.tsx      # NOUVEAU. Annonce du mode qui arrive
└── RepriseScreen.tsx         # NOUVEAU. Proposition de reprise

src/components/
└── ... bouton de demarrage ajoute a l'ecran d'accueil existant

scripts/
└── check_sequenceur.mjs      # NOUVEAU. Garde d'eligibilite sur le registre
```

**Structure Decision**: la logique va dans `src/core/engine/`, aux cotes des
sessions de modes existantes, parce que c'est deja la ou vit le metier pur et
teste. L'etat va dans `src/stores/`, aux cotes des stores existants. Aucune
nouvelle couche n'est introduite : cette fonctionnalite orchestre l'existant, elle
ne le remplace pas.

Le sequenceur ne connait ni React ni le stockage. Il recoit un etat et rend un
choix. C'est ce qui permet de tester 20 enchainements simules en quelques
millisecondes, ce que demandent les criteres SC-003 et SC-004.

## Complexity Tracking

Aucune violation constitutionnelle a justifier.
