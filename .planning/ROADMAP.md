# Roadmap: Bacchus

## Overview

Le produit est fonctionnellement pret et desormais durci sur le plan securite, mais il
porte encore le quatrieme de ses cinq noms et une icone qui represente deux verres qui
trinquent. Le chemin jusqu'a la publication passe donc par une identite refaite, une
declinaison propre sur les cinq depots, une chaine de monetisation qui n'existe pas
encore cote magasins, puis les fiches et la soumission.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Identite de marque** - Logo definitif, systeme de marque, maquette Figma
- [ ] **Phase 2: Declinaison** - Nom et assets propages sur les cinq depots
- [ ] **Phase 3: Monetisation** - Chaine d'achat reelle sur les deux magasins
- [ ] **Phase 4: Fiches et conformite** - ASO, captures, notes reviewer, corpus legal
- [ ] **Phase 5: Soumission** - Depot sur App Store et Play Store

## Phase Details

### Phase 1: Identite de marque
**Goal**: Une identite Bacchus complete, sans aucune imagerie d'alcool, validee par le porteur avant toute propagation
**Depends on**: Nothing (first phase)
**Requirements**: REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06
**Success Criteria** (what must be TRUE):
  1. Le porteur a choisi une direction parmi plusieurs propositions rendues et comparees a taille reelle
  2. Le logo reste identifiable a 48 pixels, prouve par rendu et non par affirmation
  3. Une declinaison monochrome existe et reste comprehensible sans couleur
  4. Aucun asset ne contient de verre, de bouteille, de raisin ou de vigne
  5. Une maquette Figma presente l'identite appliquee aux ecrans principaux
**Plans**: 3 plans

Plans:
- [ ] 01-01: Explorer trois directions de marque en parallele, rendre en 512 et 48 pixels, faire choisir le porteur
- [ ] 01-02: Decliner la direction retenue en famille complete d'icones, dont maskable Android et monochrome
- [ ] 01-03: Produire la maquette Figma et mettre a jour le systeme de marque documente

### Phase 2: Declinaison
**Goal**: Le nom Bacchus et la nouvelle identite presents partout, sans casser les utilisateurs existants
**Depends on**: Phase 1
**Requirements**: REQ-07, REQ-08, REQ-09
**Success Criteria** (what must be TRUE):
  1. Aucun des cinq noms anterieurs ne subsiste dans un texte visible, hors historique de CHANGELOG
  2. Un utilisateur venant de n'importe quelle version anterieure conserve ses donnees, chaine de migration complete
  3. Le titre de la page en production affiche Bacchus, verifie par requete HTTP
  4. Les integrations continues des cinq depots restent vertes
**Plans**: 3 plans

Plans:
- [ ] 02-01: Renommer le depot web, migrer les cles de stockage, remplacer la famille d'icones
- [ ] 02-02: Renommer les depots Android, iOS, contenu et site vitrine
- [ ] 02-03: Renommer les projets Sentry et PostHog, les depots GitHub et les sous-domaines

### Phase 3: Monetisation
**Goal**: Un achat peut reellement aboutir, ce qui n'est pas le cas aujourd'hui
**Depends on**: Phase 2
**Requirements**: REQ-10, REQ-11, REQ-12, REQ-13, REQ-14, REQ-24
**Success Criteria** (what must be TRUE):
  1. RevenueCat declare une application App Store et une application Play Store reelles
  2. Les produits payants existent et sont rattaches a une offre courante
  3. L'entitlement se nomme Bacchus Pro et les orphelins sont supprimes
  4. Un achat de test aboutit de bout en bout sur au moins une plateforme
**Plans**: 2 plans

Plans:
- [ ] 03-01: Ouvrir les comptes magasins, declarer les applications et les produits, connecter Stripe
- [ ] 03-02: Verifier la chaine d'achat de bout en bout et supprimer les entitlements orphelins

### Phase 4: Fiches et conformite
**Goal**: Des fiches magasin qui passent la review, et un corpus legal a jour
**Depends on**: Phase 3
**Requirements**: REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-25, REQ-26
**Success Criteria** (what must be TRUE):
  1. Les fiches evitent le lexique alcool et se positionnent sur le registre jeu de soiree
  2. Des notes au reviewer documentent la mecanique propre du jeu, parade a la guideline 4.3
  3. Les captures viennent de l'application reelle, pas de maquettes
  4. Le corpus legal nomme le mediateur et porte les bonnes mentions d'editeur
**Plans**: 2 plans

Plans:
- [ ] 04-01: Rediger les fiches ASO des deux magasins et les notes au reviewer
- [ ] 04-02: Produire les captures depuis l'application reelle et verifier le corpus legal

### Phase 5: Soumission
**Goal**: L'application est deposee sur les deux magasins
**Depends on**: Phase 4
**Requirements**: REQ-20, REQ-21, REQ-22, REQ-23
**Success Criteria** (what must be TRUE):
  1. Les trois identifiants d'administration ont ete revoques et regeneres
  2. Une version signee est deposee sur chaque magasin
  3. Aucune verification de securite n'est restee ouverte
**Plans**: 1 plan

Plans:
- [ ] 05-01: Rotation des identifiants, build signe, depot sur les deux magasins

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Identite de marque | 0/3 | In progress | - |
| 2. Declinaison | 0/3 | In progress | - |
| 3. Monetisation | 0/2 | Not started | - |
| 4. Fiches et conformite | 0/2 | Not started | - |
| 5. Soumission | 0/1 | Not started | - |
