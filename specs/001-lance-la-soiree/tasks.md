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

- [ ] T001 [FOND] Ajouter `dureeIndicative` et `demandeExplication` au type de mode dans `src/core/engine/types.ts`
- [ ] T002 [FOND] Renseigner les deux attributs pour les 13 modes de `src/core/engine/modeRegistry.ts`. **Valeurs a demander a quelqu'un qui a fait tourner les modes en soiree**, elles ne se devinent pas depuis le code
- [ ] T003 [FOND] Ecrire `scripts/check_sequenceur.mjs` : chaque mode porte les deux attributs, au moins un mode jouable a deux, au moins un mode court. Documenter en tete ce qu'elle NE voit PAS, notamment qu'elle ne juge pas si une duree declaree est juste
- [ ] T004 [FOND] **Voir la garde rouge** : retirer `dureeIndicative` d'un mode, constater l'echec nommant le mode, remettre en etat. Ajouter le script a `package.json`
- [ ] T005 [FOND] Ecrire les tests du sequenceur dans `src/core/engine/sequenceur.test.ts` AVANT l'implementation, un test par invariant du contrat, les sept
- [ ] T006 [FOND] Implementer `src/core/engine/sequenceur.ts` : fonction pure, `maintenant` et `rng` en parametres, sortie discriminee mode ou aucun, `secondTour` porte par la sortie
- [ ] T007 [FOND] Test des 20 enchainements simules avec une tablee de 3, zero mode exigeant plus de joueurs. SC-003
- [ ] T008 [FOND] Test des 20 enchainements simules sans premium, zero mode inaccessible. SC-004
- [ ] T009 [FOND] Créer `src/stores/soireeStore.ts`, persiste avec un **nouveau prefixe de cle**, sans toucher a la chaine de migration existante
- [ ] T010 [FOND] Tests du store dans `src/stores/soireeStore.test.ts` : un second demarrage ne recree pas de soiree, arreter l'enchainement ne detruit ni tablee ni scores, une soiree expiree n'est pas reprise

**Point de controle** : `npm run test:run` et `npm run check:sequenceur` verts. Le
sequenceur decide correctement sans qu'aucun ecran n'existe.

---

## Phase 2: US1 - Commencer sans avoir a choisir (P1)

**Test independant** : ouvrir, appuyer sur le bouton unique, un mode demarre ; a la
fin, un second s'enchaine sans passer par le menu.

- [ ] T011 [US1] Ajouter le bouton de demarrage a l'ecran d'accueil existant. Une seule action visible, pas un bouton de plus a cote de 13 tuiles
- [ ] T012 [US1] Creer `src/components/screens/TransitionScreen.tsx` : nom du mode qui arrive, lisible a bout de bras dans une piece sombre
- [ ] T013 [US1] Declencher l'import paresseux du mode suivant **pendant** l'affichage de la transition, jamais apres. Voir D5
- [ ] T014 [US1] Brancher la fin d'un mode sur la transition puis sur le mode suivant, sans repasser par le menu
- [ ] T015 [P] [US1] Cas du second tour : quand les modes eligibles sont epuises, l'annoncer clairement au lieu de vider la liste en silence
- [ ] T016 [P] [US1] Cas d'aucun mode eligible, par exemple une tablee d'une personne : message clair, retour au choix manuel
- [ ] T017 [US1] Verifier que **aucun ecran de paiement** n'apparait pendant un enchainement, quel que soit l'etat premium. C'est la tension identifiee au plan

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

**Test independant** : lancer, fermer l'application, rouvrir, la reprise est
proposee avec le mode en cours nomme.

- [ ] T026 [US4] Creer `src/components/screens/RepriseScreen.tsx`
- [ ] T027 [US4] Detecter une soiree reprenable a l'ouverture et proposer la reprise
- [ ] T028 [US4] Expiration : au dela du seuil, ne pas proposer et repartir a neuf. Test avec instant injecte, pas avec une attente reelle

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
