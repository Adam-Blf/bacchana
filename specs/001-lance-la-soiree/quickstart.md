# Phase 1 - Guide de validation

Comment prouver que la fonctionnalite marche. La derniere section est la seule qui
compte vraiment, et elle ne s'automatise pas.

## Prerequis

```bash
npm ci
```

---

## Niveau 1 - Le sequenceur, sans navigateur

```bash
npm run test:run
npm run check:sequenceur   # garde du registre
npm run check:alcohol      # lexique, principe I
```

**Attendu** : tout vert. Le corpus du sequenceur couvre les sept invariants du
contrat. Les deux plus importants :

| Test | Ce qu'il protege |
|---|---|
| 20 enchainements, tablee de 3 | Zero mode exigeant plus de joueurs. SC-003 |
| 20 enchainements, sans premium | Zero mode inaccessible, zero occasion d'achat. SC-004 |

Ces deux tests ne sont possibles que parce que le sequenceur est pur et recoit sa
graine. Avec un aleatoire non injectable, ils seraient non deterministes et
finiraient desactives.

**Preuve de la garde** : conformement au principe V, retirez `dureeIndicative` d'un
mode du registre et relancez `npm run check:sequenceur`. Elle doit nommer le mode
et sortir en erreur. Remettez ensuite le registre en etat.

---

## Niveau 2 - Le parcours, dans un navigateur

```bash
npm run dev
```

Parcours a derouler, dans cet ordre :

1. Declarer une tablee de 4, appuyer sur le bouton unique. **Un mode demarre sans
   ecran de choix.** Chronometrer : moins de 10 secondes depuis l'ouverture, SC-001.
2. Terminer le mode. Le suivant s'annonce puis demarre, sans passer par le menu.
3. Enchainer jusqu'a 4 modes differents sans toucher a la navigation, SC-002.
4. Passer un mode en cours : un autre demarre, et le mode passe ne revient pas.
5. Arreter l'enchainement : retour au choix manuel, **tablee et scores intacts**.
6. Terminer un mode choisi manuellement : la reprise de l'enchainement est
   proposee, pas relancee d'office.
7. Fermer l'application, la rouvrir : la reprise est proposee avec le mode en cours
   nomme, SC-005.
8. Passer en mode avion avant d'appuyer sur le bouton : tout fonctionne
   a l'identique. Principe IV.

---

## Niveau 3 - Ce qui ne s'automatise pas

### Le test de la table

Poser le telephone au centre d'une table, se reculer d'un bras, et lire l'ecran
d'annonce du mode suivant.

**Attendu** : le nom du mode se lit sans se pencher. Si quelqu'un doit prendre le
telephone en main pour savoir a quoi on joue, l'ecran est a refaire. C'est le
principe III, et aucun test automatise ne le mesure.

### Le test de la piece sombre

Meme chose, lumiere baissee, ecran a faible luminosite.

### Le test du tunnel de vente

Derouler une soiree complete avec un compte sans premium.

**Attendu** : **zero** ecran de paiement, zero mention d'un mode verrouille, zero
incitation. Une seule occurrence rompt le principe IV et bloque la mise en ligne.
C'est la tension identifiee dans le plan, et c'est la que la tentation reviendra.

### Le test de la vraie soiree

Six personnes, un samedi, apres 22h, sans que personne sache que c'est un test.

**Attendu** : la tablee ne demande jamais a quoi on joue ensuite. C'est le critere
SC-006, et c'est le seul qui dit si la fonctionnalite a resolu le probleme observe
plutot que celui qu'on imaginait.

---

## Definition de fini

- [ ] Niveau 1 vert, dont les 7 invariants du contrat
- [ ] Niveau 2 vert, les 8 etapes
- [ ] Test de la table passe
- [ ] Test du tunnel de vente passe, zero occurrence
- [ ] Une soiree reelle deroulee avec de vrais joueurs
- [ ] Garde du sequenceur vue rouge au moins une fois
- [ ] README et CHANGELOG a jour, version incrementee
