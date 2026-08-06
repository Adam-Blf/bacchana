# Comptes développeur stores - runbook Adam

Rédigé le 2026-08-02. Ces étapes sont des actes juridiques, financiers et
d'identité : elles se font à la main par Adam, personne d'autre. Tout ce qui
peut être préparé autour (listing, assets, builds, tracks de test) est déjà
prêt ou se prépare sur demande.

## Décision préalable : personnel ou organisation ?

| | Compte personnel | Compte organisation |
|---|---|---|
| Prérequis | Pièce d'identité | SIRET (BLF Lab's, INPI en pause) + D-U-N-S |
| Play : exigences de test | **12 testeurs pendant 14 jours** en test fermé avant toute prod | Aucune exigence de ce type |
| Apple | 99 USD/an, nom = « Adam Beloucif » sur le store | 99 USD/an, nom = « BLF Lab's », D-U-N-S requis |
| Migration plus tard | Possible (transfert d'apps) mais fastidieuse | - |

**Reco** : tant que BLF Lab's est en pause, ouvrir les deux comptes en
**personnel** pour ne pas bloquer le lancement. Le nom d'éditeur sera
« Adam Beloucif » ; le transfert vers un compte organisation BLF Lab's se fera
après immatriculation (procédure de transfert d'app supportée par les deux
stores). Alternative : finir l'INPI d'abord, mais cela retarde tout de
plusieurs semaines et le test fermé Play de 14 jours peut tourner en attendant.

## Play Console (25 USD, une fois)

1. play.google.com/console/signup avec le compte Google choisi -
   **adambeloucif@gmail.com** (consumer) plutôt que les adresses école/travail,
   c'est un compte à vie.
2. Accepter le Contrat de distribution développeur (lecture rapide : clauses
   de retrait d'app et de suspension de compte).
3. Payer les 25 USD (carte au nom d'Adam).
4. Type de compte : **personnel** (cf. décision ci-dessus).
5. Vérification d'identité : pièce officielle (CNI ou passeport), adresse.
   Le nom légal vérifié devient public si des achats intégrés existent
   (obligation de coordonnées de contact marchand UE - voir aussi le statut
   de commerçant DSA qui demandera à terme le SIRET pour vendre).
6. **Exigence de test (compte perso)** : avant de publier en production,
   l'app doit tourner en **test fermé avec 12 testeurs opt-in pendant
   14 jours**. Plan : créer la track de test fermé dès le premier upload AAB,
   recruter 12 amis/famille (liste mail), lancer le chrono tout de suite -
   il court pendant qu'on finit la parité Android.
7. Ensuite : fiche store (textes ASO de docs/STORE_LISTING.md, assets de
   bacchana-content/store-assets), questionnaire de classification IARC
   (répondre honnêtement : thèmes matures légers, pas d'alcool nommé),
   Data Safety (aucune collecte hors PostHog opt-in : le déclarer tel quel).

## Apple Developer (99 USD/an)

1. Un **Apple ID** dédié ou existant avec **2FA activée** (obligatoire),
   idéalement adambeloucif@gmail.com aussi.
2. developer.apple.com/programs/enroll - s'inscrire en **individuel**
   (l'inscription organisation exige un D-U-N-S BLF Lab's, non disponible).
   L'inscription via l'app « Apple Developer » sur iPhone est la voie la plus
   rapide (vérification d'identité par scan de pièce directement dans l'app).
3. Payer les 99 USD/an.
4. Une fois actif : App Store Connect - créer l'app (bundle id
   com.beloucif.lataverne, déjà celui du repo iOS), remplir la fiche
   (STORE_LISTING.md), screenshots 1290x2796 (store-assets/marketing-ios).
5. **App Store Small Business Program** : une fois le compte actif, s'inscrire
   au programme (CA < 1 M USD) pour passer la commission de 30 % à **15 %**.
   Google fait automatiquement 15 % sur le premier million (Play).
6. Classification 17+/18, questionnaire confidentialité (App Privacy) aligné
   sur PostHog opt-in, disclaimer conso responsable en bas de fiche.
7. TestFlight : pas d'exigence de durée côté Apple - la review TestFlight
   externe (~1 j) peut servir de répétition avant la vraie review.

## Ce qui est déjà prêt (rien à refaire)

- Textes ASO FR aux limites exactes : `docs/STORE_LISTING.md`.
- 10 screenshots device-mockup + icône Play 512 + feature graphic :
  `bacchana-content/store-assets/`.
- Pack légal (mentions, confidentialité, CGU avec essai gratuit) :
  `bacchana-content/legal/`.
- RevenueCat : produits, entitlement, essai 7 j - il ne manque que les
  liaisons Play Billing / StoreKit une fois les comptes ouverts.

## Ordre optimal (résumé)

1. Aujourd'hui : Play Console perso (25 USD) + Apple individuel (99 USD).
2. Dès le compte Play actif : upload AAB en test fermé + 12 testeurs -
   le chrono de 14 jours tourne pendant la fin de la parité Android.
3. Small Business Program Apple dès activation.
4. Après INPI BLF Lab's : envisager le transfert vers des comptes
   organisation (optionnel, purement cosmétique côté nom d'éditeur).
