# BlackOut / Abel Labs - checkpoint de session

Plan complet : `~/.claude/plans/keen-prancing-quail.md`

## Livre (2026-08-01)
- [x] M1 fondations v0.2.0, M2 contenu v1.1.0 (12 packs store-safe), M3 rebranding Neo-Tokyo v0.3.0 + logo, sobriete v0.4.x, M4-M5 moteur 10 modes v0.5.0, dos de carte v0.5.1 - TOUT deploye blackout.beloucif.com
- [x] blackout-android (51 tests, APK debug OK) + blackout-ios (CI macos verte, 24 tests) - repos prives
- [x] Pack legal blackout-content/legal/ + store-assets/ (screens ios 6.7 + android)
- [x] PostHog : projet EU 238190 renomme "BlackOut", cle publique phc_ dans black-out/.env.local
- [x] RevenueCat : projet "BlackOut" (2b8d469c), entitlement "BlackOut Pro", offering Monthly/Yearly/Lifetime, cle Test Store dans .env.local. Cles secretes collees en chat par Adam -> stockees .env.local, ROTATION a proposer
- [ ] EN COURS (agent) : M6 web v0.6.0 - pages legales, bandeau cookies, PostHog consenti, RevenueCat Web sandbox + paywall

## Auto-entreprise ABEL LABS (INPI en pause, brouillon 41165109)
- Fait : micro-entrepreneur Oui, identite (NIR saisi par Adam), domicile 6 imp. Edouard Vaillant publie OK, activites Edition de logiciels (principale) + Organisation d'evenements, domaine abellabs.fr declare, versement liberatoire Non, ACRE a demander apres (eligible 18-25)
- Docs generes 00_Sensible/ : attestation non-condamnation (Mohand/Nawel, Paris 14e) A SIGNER, attestation hebergement A FAIRE SIGNER par Mohand + sa CNI + sa facture <3mois (RIB refuse comme justificatif), fiche ACRE
- Reste : upload pieces (Adam), etape 8-9, signature + paiement greffe ~25 euros (Adam)
- Apres : ACRE sous 45j, achat abellabs.fr (OVH, accord Adam), depot marque Abel Labs (190 euros, classes 9/41/42)

## Bloque sur Adam
- Signature + soumission INPI, comptes Apple Developer (99$/an) + Play Console (25$), SIRET pour activer les paiements, connexion Stripe dans RevenueCat (OAuth), rotation des cles sk_/phx_ collees en chat

## Ports / infra
- black-out preview : 4310. Vercel linke. RC projet 2b8d469c, PostHog projet 238190 EU.
