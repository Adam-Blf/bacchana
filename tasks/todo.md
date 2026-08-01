# La Tournée (ex-BlackOut) / Abel Labs - checkpoint de session

## Livré (2026-08-01, branche feat/la-tournee-rebrand, v0.7.0)
- [x] M1-M6 historiques (fondations, contenu, moteur 10 modes, légal/RGPD/PostHog consenti/RevenueCat sandbox v0.6.0) - déployés
- [x] **Rebranding « La Tournée »** : néobrutalisme (crème #FFF9F0 / encre #111 / orange #FF5C00 / aplats pop), typo Archivo Black + Archivo + Space Mono auto-hébergées, logo verres qui trinquent, dos de carte rayé, jeu complet d'icônes iOS/Android + maskable, migration localStorage blackout-* → la-tournee-*
- [x] **Navigation réparée** : couche history/popstate (retour matériel in-app, plus de fermeture sauvage), modales fermées au retour, zéro écran noir, bouton retour sur l'écran joueurs, safe-area sur tous les contrôles fixes, z-index tokenisé
- [x] **Fix trèfle** : toutes les cartes face cachée (Le Guess non déductible), mise du contest masquée avant révélation, pénalités du contest créditées au récap
- [x] **52 cartes uniques** : pips réels 2-10, figures V/D/R en miroir, jokers étoilés
- [x] **Borderland options** : 1-3 paquets, jokers (2/paquet, carte blanche), mode cartes aléatoires ∞ (premium)
- [x] **4 nouveaux modes** : Quitte ou Trinque (quiz cagnotte, 60 questions), Le Podium (classement secret + vraie question parmi 4, 40 questions), L'Enchère (surenchères + « tu mens ! » 60 s, 50 thèmes), Le Procès (accusations écrites par les joueurs)
- [x] **Mes règles** : règles perso persistées sur l'appareil, injectées dans les modes à prompts + segments roulette
- [x] Orthographe : ~35 corrections (UI + packs), textes humanisés, 100 % store-safe
- [x] A11y : zoom réactivé, cibles 44px, aria-live, Escape partout, contrastes AA
- [x] Docs agence : design-system/la-tournee/MASTER.md (brand book), docs/USER_STORIES.md, docs/STORE_LISTING.md, README + CHANGELOG 0.7.0
- 103 tests Vitest verts (dont history, quizSession, rankingSession, customRulesStore), lint propre, build PWA OK

## À reporter dans les repos frères
- blackout-content : répercuter les corrections orthographiques des packs JSON (sync-content écrase src/content/packs)
- blackout-android / blackout-ios : reprendre le rebranding La Tournée (nom, icônes, couleurs)
- PostHog projet 238190 + RevenueCat 2b8d469c : renommer « La Tournée » côté dashboards ; l'entitlement « BlackOut Pro » NE DOIT PAS être renommé (id technique référencé dans billing.ts)
- DNS : créer CNAME latournee.beloucif.com (l'app référence ce domaine), rediriger blackout.beloucif.com

## Auto-entreprise ABEL LABS (INPI en pause, brouillon 41165109)
- Fait : micro-entrepreneur Oui, identité (NIR saisi par Adam), domicile 6 imp. Edouard Vaillant publié OK, activités Édition de logiciels (principale) + Organisation d'événements, domaine abellabs.fr déclaré, versement libératoire Non, ACRE à demander après (éligible 18-25)
- Docs générés 00_Sensible/ : attestation non-condamnation (Mohand/Nawel, Paris 14e) À SIGNER, attestation hébergement À FAIRE SIGNER par Mohand + sa CNI + sa facture <3 mois (RIB refusé comme justificatif), fiche ACRE
- Reste : upload pièces (Adam), étapes 8-9, signature + paiement greffe ~25 euros (Adam)
- Après : ACRE sous 45 j, achat abellabs.fr (OVH, accord Adam), dépôt de marque (190 euros, classes 9/41/42) - vérifier la disponibilité de « La Tournée » en classe 9/41 avant dépôt

## Bloqué sur Adam
- Signature + soumission INPI, comptes Apple Developer (99 $/an) + Play Console (25 $), SIRET pour activer les paiements, connexion Stripe dans RevenueCat (OAuth), rotation des clés sk_/phx_ collées en chat

## Ports / infra
- Preview : 4173 (vite preview). Vercel linké. RC projet 2b8d469c, PostHog projet 238190 EU.
