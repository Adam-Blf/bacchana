# Meskova (ex-La Taverne) / BLF Labs - checkpoint de session

## Session 2026-08-04 (branche feat/meskova-rebrand-dark-theme)
- [x] Renommage produit La Taverne -> Meskova : app, manifest PWA, ecrans,
  pages legales, migration localStorage (nouvelle etape meskova- ajoutee a
  la chaine historique), design-system/meskova/MASTER.md (succede a
  design-system/la-taverne/MASTER.md, garde comme archive). Entitlement
  RevenueCat `La Taverne Pro` volontairement inchange (id technique non
  renommable) - seul le libelle affiche devient "Meskova Premium".
- [x] Refonte theme sombre (retour "fait fade") : nouvelle rampe d'elevation
  a 4 paliers mesures (1.14:1/1.31:1/1.57:1 vs bg, contre 1.09-1.20:1 avant),
  alpha bordure sombre 0.20 -> 0.38, ink-muted eclairci, nouveau token
  `danger` separe de `card-red` (7 ecrans corriges), animation glow-pulse
  morte supprimee. Documentation complete : docs/DESIGN_TOKENS.md (pour
  portage Android/iOS).
- [x] v0.31.0 : 165 tests Vitest verts, build + lint verts.
- Reste cote Adam : decider si un domaine meskova.beloucif.com est cree ou
  si lataverne.beloucif.com reste le domaine technique (references legales
  et manifest laissees inchangees dans cette session, pas de DNS touche).

## Session 2026-08-04 (branche feat/survey-pricing-blf-labs)
- [x] Étude bêta n=16 : docs/ETUDE_BETA_2026-08.md (pricing 14,99 lifetime,
  abos supprimés, packs 1,99, features priorisées, outils gratuits)
- [x] Rebrand studio BLF Labs : STORE_ACCOUNTS.md (ex-ABEL LABS), BRAND.md
  (section éditeur + pricing révisé), MASTER.md, STORE_LISTING.md (champ
  développeur), LICENSE, README, package.json (author), index.html (meta)
- [ ] Écrans manquants (agent en cours) : règles des 13 modes, onboarding,
  fin de session Criée/Roue/Tu préfères
- [ ] Fixes bugs P0/P1 (rapport d'audit du jour) : RGPD toggle analytics,
  entitlement infini forçable, CTA paywall inerte, billing offline
- [ ] Maquette Figma (agent en cours, création du fichier)
- Côté Adam : appliquer le nouveau pricing dans RevenueCat (lifetime 14,99,
  retirer mensuel/annuel de l'offering default, promo lancement 9,99),
  TestFlight prioritaire (13/16 répondants iPhone), répercuter BLF Labs
  dans les repos frères (content/android/ios : LICENSE, README, legal/)

## Livré (2026-08-01, branche feat/la-taverne-rebrand, v0.7.0)
- [x] M1-M6 historiques (fondations, contenu, moteur 10 modes, légal/RGPD/PostHog consenti/RevenueCat sandbox v0.6.0) - déployés
- [x] **Rebranding « La Taverne »** : néobrutalisme (crème #FFF9F0 / encre #111 / orange #FF5C00 / aplats pop), typo Montserrat Black + Poppins auto-hébergées, logo verres qui trinquent, dos de carte rayé, jeu complet d'icônes iOS/Android + maskable, migration localStorage lataverne-* → la-taverne-*
- [x] **Navigation réparée** : couche history/popstate (retour matériel in-app, plus de fermeture sauvage), modales fermées au retour, zéro écran noir, bouton retour sur l'écran joueurs, safe-area sur tous les contrôles fixes, z-index tokenisé
- [x] **Fix trèfle** : toutes les cartes face cachée (Le Guess non déductible), mise du contest masquée avant révélation, pénalités du contest créditées au récap
- [x] **52 cartes uniques** : pips réels 2-10, figures V/D/R en miroir, jokers étoilés
- [x] **Borderland options** : 1-3 paquets, jokers (2/paquet, carte blanche), mode cartes aléatoires ∞ (premium)
- [x] **4 nouveaux modes** : Quitte ou Trinque (quiz cagnotte, 60 questions), Le Podium (classement secret + vraie question parmi 4, 40 questions), L'Enchère (surenchères + « tu mens ! » 60 s, 50 thèmes), Le Procès (accusations écrites par les joueurs)
- [x] **Mes règles** : règles perso persistées sur l'appareil, injectées dans les modes à prompts + segments roulette
- [x] Orthographe : ~35 corrections (UI + packs), textes humanisés, 100 % store-safe
- [x] A11y : zoom réactivé, cibles 44px, aria-live, Escape partout, contrastes AA
- [x] Docs agence : design-system/la-taverne/MASTER.md (brand book), docs/USER_STORIES.md, docs/STORE_LISTING.md, README + CHANGELOG 0.7.0
- 103 tests Vitest verts (dont history, quizSession, rankingSession, customRulesStore), lint propre, build PWA OK

## 2026-08-02 - Renommage La Taverne (v0.8.0) + RevenueCat / PostHog

Fait ce jour :
- Renommage complet **La Tournée -> La Taverne** sur les 4 repos (code, assets, docs, chemins).
  Packages Kotlin `com.beloucif.lataverne`, cibles et dossiers Xcode `LaTaverne`, dossier
  `design-system/la-taverne`, domaine `lataverne.beloucif.com`.
- Dépôts GitHub renommés : `la-taverne`, `la-taverne-content`, `la-taverne-android`,
  `la-taverne-ios`. Remotes, dossiers locaux et registre de ports mis à jour.
  4 PR mergées, toutes les CI vertes (dont build Kotlin et xcodebuild sur runner macOS).
- Migration `localStorage` : préfixe `la-taverne-`, les deux préfixes historiques
  (`blackout-`, `la-tournee-`) restent dans la table, aucune partie sauvegardée orpheline.
- RevenueCat : projet renommé « La Taverne », 3 produits créés (premium_monthly 4,99 /
  premium_yearly 19,99 / premium_lifetime 34,99 EUR, aucun essai gratuit), nouvel entitlement
  `La Taverne Pro` (l'identifiant d'un entitlement n'étant pas modifiable, l'ancien
  `BlackOut Pro` a été recréé sous le bon nom puis supprimé), 6 produits rattachés,
  offering `default` complété sur les 3 packages.
- PostHog : projet renommé, tableau de bord `Produit - activation et conversion premium`
  (dashboard 867195) avec entonnoir paywall, modes joués, DAU, consentement RGPD.
- Vercel : projet renommé `la-taverne`.
- Flake corrigé dans `src/core/navigation/history.test.ts` (délai de traversée porté à 100 ms
  après deux échecs observés).

## Fait (session 2026-08-02, suite)
- Audit d'équipe en 5 volets (docs/AUDIT_EQUIPE.md) puis 3 lots de corrections livrés :
  v0.19.0 (mode sombre retiré, écrans légaux atteignables, médiopoints), v0.20.0
  (précache 2 Mo -> 1049 ko, PostHog dynamique, ardoise par id, code mort),
  v0.21.0 (fin de session pour Le Pilori, La Criée, La Roue).
- Icônes des jeux vendorisées (Icons8 Hatch) en v0.18.0, hub filtré par nombre de
  joueurs en v0.17.0.
- Questionnaire Google Forms refait par script (API Apps Script, 7 pages, 33 questions,
  https://forms.gle/EkXunVuGsw9TJGZHA) + bannière et thème orange.

## Fait (session 2026-08-02)
- v0.12.0 : purge typo - Anton (display) + Bricolage Grotesque (UI) remplacent Montserrat/Poppins, docs/DESIGN.md realigne sur MASTER.md (plus aucune mention Neo-Tokyo ni IBM Plex), prod verifiee (Anton en ligne, Poppins 404).
- la-taverne-content v1.5.0 : marketing facon happn (mockup iPhone, tout en mode clair), tokens.json v2 synchronise sur la DA taverne, guidelines stores integrees (captions < 20 %, feature graphic zone sure).
- Purge Neo-Tokyo terminee sur les 4 repos : la-taverne-android v0.2.0 et la-taverne-ios v0.2.0 mergees (palette light taverne, Le Coupe-Gorge, icone iOS regeneree). Seuls les historiques de CHANGELOG gardent la mention (archive).
- v0.11.0 : tirage du Coupe-Gorge en touchant le paquet (pile de dos de cartes + compteur), PR #21 mergée, prod vérifiée.
- la-taverne-content v1.4.0 (PR #4) : 10 captures fraîches + 10 compositions marketing néobrutalistes taverne, icône Play, feature graphic, textures Unsplash supprimées.
- Tâches #5/#6/#7 requalifiées : code fini côté web, blocages administratifs côté Adam ; parité contenu à porter sur Android/iOS.

## Prochaine feature demandée
- (fait en 0.13.0) La Criée : thèmes de la tablée persistés sur l'appareil (customThemesStore).

## Reste à faire côté Adam
- Vérifier la disponibilité de « La Taverne » (INPI classes 9/41) avant tout dépôt de marque.

## À reporter dans les repos frères
- la-taverne-content : répercuter les corrections orthographiques des packs JSON (sync-content écrase src/content/packs)
- la-taverne-android / la-taverne-ios : reprendre le rebranding La Taverne (nom, icônes, couleurs)
- PostHog projet 238190 + RevenueCat 2b8d469c : renommer « La Taverne » côté dashboards ; l'entitlement « La Taverne Pro » NE DOIT PAS être renommé (id technique référencé dans billing.ts)
- DNS : créer CNAME lataverne.beloucif.com (l'app référence ce domaine), rediriger lataverne.beloucif.com

## Micro-entreprise (INPI, brouillon 41165109) - nom commercial BLF Labs
- Immatriculation au patronyme **Adam Beloucif**, nom commercial retenu :
  **BLF Labs** (verrouillé le 2026-08-03, domaine blflabs.com ; les anciens
  noms Abel Studio / ABEL LABS sont abandonnés). Fait : micro-entrepreneur Oui, identité (NIR saisi par Adam), domicile 6 imp. Édouard Vaillant, activités Édition de logiciels (principale) + Organisation d'événements, versement libératoire Non, ACRE à demander après (éligible 18-25)
- Pièces prêtes dans `00_Sensible/` (2026-08-03, générées par scripts/gen_pieces_inpi.py, jamais versionnées) :
  `01_declaration_non_condamnation.pdf` (à signer avec la mention « Lu et approuvé »),
  `02_attestation_hebergement.pdf` (à faire signer par **Nawel Beloucif**, qui héberge),
  `03_attestation_filiation.pdf`. Marche à suivre complète : `00_Sensible/00_A_IMPRIMER_INPI.md`.
- État civil des pièces : né le 20/06/2004 à Paris 14e, père Mohand Beloucif, mère Nawel Boukachabia épouse Beloucif.
- Nawel doit fournir : sa signature, sa CNI, et un justificatif de domicile à son nom de moins de 3 mois (RIB refusé).
- Étape 8/9 : consentement prospection = **Non**, destinataire = L'entreprise.
- Reste : imprimer et signer les 3 pièces, les déposer (étape 7/9), étapes 8-9, signature + paiement greffe (Adam)
- Après : ACRE sous 45 j, dépôt de marque (190 euros, classes 9/41/42) - vérifier la disponibilité de « La Taverne » en classes 9/41 avant dépôt

## Bloqué sur Adam
- Signature + soumission INPI, comptes Apple Developer (99 $/an) + Play Console (25 $), SIRET pour activer les paiements, connexion Stripe dans RevenueCat (OAuth), rotation des clés sk_/phx_ collées en chat

## Ports / infra
- Preview : 4173 (vite preview). Vercel linké. RC projet 2b8d469c, PostHog projet 238190 EU.
