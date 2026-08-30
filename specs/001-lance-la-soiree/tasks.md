---
description: "Liste de taches, fonctionnalite Lance la soiree"
---

# Tasks: Lance la soiree

**Input**: documents de conception dans `/specs/001-lance-la-soiree/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: inclus et non optionnels. Le sequenceur est du metier pur, et le
principe V impose que chaque garde ait ete vue rouge avant d'etre crue.

**Organization**: groupees par user story. Chaque groupe est livrable seul.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallelisable, fichiers distincts
- **[Story]** : US1 a US4, ou FOND, FINAL

---

## Phase 1: Fondations

**But** : la donnee et la decision. Aucune interface a ce stade.

**CRITIQUE** : aucune story ne demarre avant la fin de cette phase.

- [x] T001 [FOND] Ajouter `dureeIndicative` et `demandeExplication` au type de mode dans `src/core/engine/types.ts`
- [x] T002 [FOND] Renseigner les deux attributs pour les 13 modes de `src/core/engine/modeRegistry.ts`. **Valeurs provisoires posees, deduites de la mecanique de chaque mode et marquees comme telles dans le registre. Restent a confirmer en soiree reelle**
- [x] T003 [FOND] Ecrire `scripts/check_sequenceur.mjs`, cinq controles, avec sa section sur ce qu'elle ne voit pas
- [x] T004 [FOND] **Garde vue rouge**, deux fois : `dureeIndicative` retiree d'un mode, puis plus aucun mode court. Script branche sur `npm run check:sequenceur`
- [x] T005 [FOND] Tests du sequenceur ecrits AVANT l'implementation, vus rouges
- [x] T006 [FOND] `src/core/engine/sequenceur.ts` implemente, fonction pure
- [x] T007 [FOND] 20 enchainements simules a 3 joueurs sur le **registre reel**. SC-003
- [x] T008 [FOND] 20 enchainements simules sans premium sur le registre reel. SC-004
- [x] T009 [FOND] `src/stores/soireeStore.ts` cree, **non persiste**, voir la note ci-dessous
- [x] T010 [FOND] 7 tests du store, dont FR-017, FR-008 et FR-009

**Point de controle atteint** : build vert, 258 tests verts dont 18 pour cette
fonctionnalite, garde du sequenceur verte, lint sans erreur. Le sequenceur decide
correctement sans qu'aucun ecran n'existe.

### Deux ecarts au plan, trouves en implementant

**1. Le stockage n'est pas persiste, contrairement au plan.** `nightStore` suit
deja les modes joues de la soiree et porte ce commentaire : « volontairement non
persiste : la session se remet a zero a chaque lancement, regle produit tout doit
etre reset ».

L'US4, reprendre une soiree interrompue, contredit donc une regle produit
existante. Elle n'a pas ete implementee en douce. Le store est non persiste comme
son voisin, et **la question est remontee a Adam** : soit la regle produit change,
soit l'US4 sort du perimetre. Voir la phase 5, mise en attente.

**2. Les modes joues ne sont pas dupliques.** Le plan prevoyait `modesJoues` dans
le nouveau store. `nightStore.modesPlayed` fait deja exactement cela. Deux verites
sur le meme fait divergent au premier oubli, donc le sequenceur lit celle qui
existe deja.

**3. La fin de soiree prime sur l'ouverture.** Les tests ont revele que les deux
regles de rythme pouvaient se contredire. Arbitrage retenu : une tablee qui joue
depuis deux heures n'a pas besoin qu'on lui pose les regles d'un mode long. C'est
documente dans `phaseDeSoiree`.

---

## Phase 2: US1 - Commencer sans avoir a choisir (P1)

**Test independant** : ouvrir, appuyer sur le bouton unique, un mode demarre ; a la
fin, un second s'enchaine sans passer par le menu.

- [x] T011 [US1] Ajouter le bouton de demarrage a l'ecran d'accueil existant. Une seule action visible, pas un bouton de plus a cote de 13 tuiles
- [x] T012 [US1] Creer `src/components/screens/TransitionScreen.tsx` : nom du mode qui arrive, lisible a bout de bras dans une piece sombre
  - Livre sous le nom `src/components/soiree/TransitionSoiree.tsx`. Le dossier `soiree/`
    regroupe les ecrans de l'enchainement, `screens/` porte les modes de jeu.
- [x] T017 verifie au niveau du sequenceur : `choisirModeSuivant` filtre les modes premium,
      et `lancerSansChoix` n'ouvre jamais le selecteur de paquet ni le paywall. Le controle
      de bout en bout reste a faire en T032, qui est bloquant.
- [ ] T013 [US1] Declencher l'import paresseux du mode suivant **pendant** l'affichage de la transition, jamais apres. Voir D5
- [x] T014 [US1] Brancher la fin d'un mode sur la transition puis sur le mode suivant, sans repasser par le menu
- [x] T015 [P] [US1] Cas du second tour : quand les modes eligibles sont epuises, l'annoncer clairement au lieu de vider la liste en silence
- [x] T016 [P] [US1] Cas d'aucun mode eligible, par exemple une tablee d'une personne : message clair, retour au choix manuel
- [x] T017 [US1] Verifier que **aucun ecran de paiement** n'apparait pendant un enchainement, quel que soit l'etat premium. C'est la tension identifiee au plan

**Point de controle** : US1 livrable seule. Une tablee lance une soiree d'un geste
et enchaine sans toucher au menu.

---

## Phase 3: US2 - Garder la main (P2)

**Test independant** : passer un mode, puis arreter l'enchainement, et verifier que
la tablee et les scores survivent.

- [ ] T018 [US2] Action passer le mode en cours, le mode passe ne revient pas dans la meme soiree
- [ ] T019 [US2] Action arreter l'enchainement, retour au choix manuel **sans perdre** la composition de la tablee ni les scores
- [ ] T020 [P] [US2] A la fin d'un mode choisi manuellement, proposer de reprendre l'enchainement sans le relancer d'office
- [ ] T021 [US2] Tests de parcours sur ces trois actions

---

## Phase 4: US3 - S'adapter a la tablee et a l'heure (P3)

**Test independant** : dérouler deux enchainements, l'un a l'ouverture, l'autre
apres une heure simulee, et constater que la sequence differe.

- [ ] T022 [US3] Regle d'ouverture : au moins un mode a explications parmi les trois premiers. FR-011
- [ ] T023 [US3] Regle de fin de soiree : privilegier les modes courts au dela du seuil. FR-010
- [ ] T024 [US3] Sortir le seuil horaire en constante nommee, avec un commentaire disant que c'est un point de depart a caler en soiree reelle et non une valeur mesuree
- [ ] T025 [US3] Reevaluer l'eligibilite entre deux modes quand la tablee change, jamais pendant un mode. FR-016

---

## Phase 5: US4 - Reprendre une soiree interrompue (P3)

**Decision produit tranchee le 2026-08-14 : compromis, reprise courte sans
l'ardoise.**

Le conflit etait reel. `nightStore` est volontairement non persiste au nom d'une
regle produit, la session repart de zero a chaque lancement. Trois issues avaient
ete posees, Adam a retenu la troisieme.

Ce qui est retenu : **l'enchainement est persiste, l'ardoise non.** Un telephone
verrouille deux minutes ne renvoie plus la tablee au menu des treize modes, ce qui
est exactement le probleme que la fonctionnalite corrige. En contrepartie les
scores repartent de zero, et c'est un ecart assume.

**Consequence non negociable pour l'interface** : l'ecran de reprise DOIT dire que
les scores repartent a zero. Sans cela, la tablee croira a un bug en voyant son
ardoise vide, et c'est nous qui aurons cree la confusion.


**Test independant** : lancer, fermer l'application, rouvrir, la reprise est
proposee avec le mode en cours nomme.

- [x] T026a [US4] Persister l'enchainement sous la cle `bacchana-soiree`, sans toucher a la chaine de migration
- [x] T026b [US4] `estReprenable` et `SEUIL_REPRISE_MS`, expiration calculee sur la **derniere activite** et non sur le debut, sinon une longue soiree encore active expirerait
- [x] T026c [US4] 5 tests d'expiration, avec instant injecte et non avec une attente reelle
- [ ] T027 [US4] Creer `src/components/screens/RepriseScreen.tsx`. **Il doit dire que les scores repartent a zero**
- [ ] T028 [US4] Detecter une soiree reprenable a l'ouverture et proposer la reprise

---

## Phase 6: Finition et validation

- [ ] T029 [FINAL] Verifier hors ligne, mode avion, tout le parcours
- [ ] T030 [P] [FINAL] Contrastes et cibles tactiles des trois nouveaux ecrans, garde `check:contrast`
- [ ] T031 [FINAL] **Test de la table** : telephone au centre, lecture a un bras de distance, lumiere baissee
- [ ] T032 [FINAL] **Test du tunnel de vente** : soiree complete sans premium, zero ecran de paiement, zero mention de mode verrouille. Bloquant
- [ ] T033 [FINAL] Garde du lexique alcool sur tous les textes ajoutes. Principe I
- [ ] T034 [FINAL] `npm run check:dead-code` vert
- [ ] T035 [FINAL] Soiree reelle, six personnes, apres 22h, sans annoncer que c'est un test. SC-006
- [ ] T036 [FINAL] README, CHANGELOG, version semver incrementee

---

## Dependances

```
Fondations (T001-T010)   <-- bloquant
   |
   +-- US1 (T011-T017)   <-- MVP livrable seul
         |
         +-- US2 (T018-T021)
         +-- US3 (T022-T025)
         +-- US4 (T026-T028)
                 |
              Finition (T029-T036)
```

US2, US3 et US4 sont independantes entre elles une fois US1 livree.

## Notes

- **T002 depend d'un jugement humain.** Les durees indicatives ne se deduisent
  d'aucune donnee du depot. Les inventer produirait un rythme faux que personne ne
  remarquerait avant une vraie soiree.
- **T004 et la validation en rouge** ne sont pas une formalite. Sur ce depot,
  plusieurs defauts de gardes n'ont ete trouves que par regression volontaire,
  aucun par relecture.
- **T032 est bloquant.** L'enchainement est l'endroit le plus tentant du produit
  pour vendre, et c'est exactement pour cela que le plan l'interdit.
- **T035 est le seul test qui dit si le probleme observe a ete resolu.** Les 34
  autres disent seulement que le code fait ce qu'on lui a demande.
