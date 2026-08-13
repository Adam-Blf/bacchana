# Comptes développeur Apple + Google Play - BLF Labs

Version 1.1.0 - 2026-08-11

> **Décision du 11/08/2026** : création d'une **SASU BLF Labs**, donc comptes Organisation des
> deux côtés. Le plan de création est dans [creation-sasu-blf-labs.md](creation-sasu-blf-labs.md).
> Corollaire : ne rien ouvrir au nom de l'EI, attendre le Kbis puis le D-U-N-S de la société.

Base légale du dossier : entreprise individuelle **Adam Beloucif**, SIREN **108386855**,
forme juridique **Entrepreneur individuel** (micro-BNC), NAF **62.01Z** programmation
informatique, formalité INPI J00270129620 validée le 04/08/2026 (INSEE + URSSAF, hors RCS).
Nom commercial visé : **BLF Labs**.

---

## 1. Le point bloquant, à lire avant tout

| Store | Compte Organisation possible avec une EI ? | Conséquence |
| --- | --- | --- |
| Apple | **Non** | Apple exige une personne morale (société). Sole proprietorship, DBA, nom commercial et succursale sont explicitement refusés. Enrôlement en **Individual**, et le nom vendeur affiché sur l'App Store sera **Adam Beloucif**, pas BLF Labs. |
| Google Play | **Oui, si D-U-N-S obtenu** | Google ne demande pas de personne morale, il demande un numéro D-U-N-S qui matche les données D&B. En France, D&B/Altares attribue un D-U-N-S à partir du SIREN, y compris pour une EI. Le nom affiché (developer name) peut être **BLF Labs**. |

Conséquences pratiques :

- Apple : soit on accepte "Adam Beloucif" comme éditeur, soit on crée une **SASU/EURL BLF Labs**
  et on enrôle en Organisation. Le passage Individual → Organization est possible plus tard
  (demande à Apple Developer Support), mais il faut la personne morale et un D-U-N-S.
- Google Play : un compte **Organisation** exempte de la règle des **12 testeurs / 14 jours**
  imposée aux comptes personnels créés après le 13/11/2023. Gain de temps majeur, c'est
  l'argument numéro un pour passer par le D-U-N-S.

---

## 2. Chemin critique : le D-U-N-S

À lancer en premier, c'est le seul délai non compressible.

1. Chercher un D-U-N-S existant : le SIREN étant diffusé à l'INSEE, un identifiant peut déjà
   exister (lookup D&B, ou Verif/Altares côté France).
2. Sinon, demander la création gratuite chez Dun & Bradstreet.
3. Délais : ~5 jours ouvrés annoncés côté Apple/D&B, jusqu'à **30 jours** en pratique en France.
   Option payante Verif (~39 €) pour obtenir le rapport immédiatement.
4. Les données déclarées doivent être **identiques** à l'INPI/INSEE : dénomination
   (Adam Beloucif, éventuellement enseigne BLF Labs), adresse, activité.

Risque connu : certaines sources indiquent que D&B refuse ou tarde sur les entreprises
individuelles. Plan de repli si refus → compte Google Play **personnel** + parcours 12 testeurs.

---

## 3. Prérequis communs à préparer

- Avis de situation SIRENE / document de synthèse INPI (justificatif d'immatriculation).
- Pièce d'identité au nom légal exact **Adam Beloucif** (les stores vérifient le nom légal).
- Carte bancaire au nom légal (Google vérifie la carte, Apple facture l'abonnement).
- RIB professionnel pour les reversements.
- **Adresse** : boîte postale refusée par Apple. Voir section 6 sur la publication publique.
- Site web **blflabs.com** en ligne et fonctionnel + email pro **@blflabs.com**
  (obligatoire seulement pour un compte Organisation Apple, mais utile partout).
- Compte Apple dédié avec **2FA** activée, et compte Google dédié (ex. dev@blflabs.com).
- Numéro de **TVA intracommunautaire** (voir section 6).

---

## 4. Apple Developer Program - étapes

1. Créer/utiliser un Apple Account dédié, 2FA activée, prénom et nom = état civil exact.
2. Aller sur developer.apple.com/programs/enroll (ou l'app Apple Developer sur iPhone).
3. Choisir **Individual / Sole proprietor**. Aucun D-U-N-S requis dans ce cas.
4. Renseigner nom légal, email, téléphone, adresse postale physique.
5. Accepter l'Apple Developer Program License Agreement.
6. Payer **99 USD par an** (tarif affiché en devise locale à l'inscription, ~99 € en France),
   facturé par Apple Distribution International (Irlande).
7. Une fois le compte actif, dans App Store Connect :
   - déclarer le **statut de trader (DSA)** - obligatoire pour distribuer dans l'UE,
     sinon l'app est retirée des 27 pays de l'UE ;
   - remplir les formulaires fiscaux (W-8BEN) et bancaires dans Agreements, Tax and Banking ;
   - renseigner l'URL de politique de confidentialité de chaque app.

Délai typique : quelques heures à quelques jours pour la validation d'identité.

---

## 5. Google Play Console - étapes

1. Créer un compte Google dédié (jamais le compte perso).
2. S'inscrire sur play.google.com/console/signup, avoir 18 ans minimum.
3. Accepter le Google Play Developer Distribution Agreement.
4. Payer les **25 USD de frais d'inscription, une seule fois**.
5. Choisir le type de compte : **Organisation** (nécessite le D-U-N-S).
   Informations demandées : nom de l'organisation, adresse, téléphone, site web,
   D-U-N-S, nom du contact, email et téléphone du contact, nom développeur affiché.
6. Vérifications d'identité : pièce d'identité officielle, carte bancaire au nom légal,
   codes à usage unique sur téléphone et email. Tout doit rester valide dans la durée.
7. Créer le **profil de paiement Google** (nom légal + adresse) pour la monétisation.
8. Déclarer le statut de trader (DSA) et les informations réglementaires.
9. Si finalement compte **personnel** : prévoir **12 testeurs opt-in pendant 14 jours
   consécutifs** en test fermé avant de demander l'accès à la production.

---

## 6. Conformité française à ne pas rater

- **Adresse publiée**. Sous le DSA, le nom, l'adresse, le téléphone et l'email du trader sont
  affichés publiquement sur la fiche App Store et sur Google Play (adresse complète dès qu'il y a
  monétisation). L'adresse du siège étant le domicile, prévoir une **domiciliation commerciale**
  si on ne veut pas publier le domicile. Apple refuse les boîtes postales, il faut une adresse
  physique. Le changement d'adresse se fait ensuite au guichet unique INPI.
- **TVA intracommunautaire**. Même en franchise en base, un micro-entrepreneur qui achète des
  prestations de services à un prestataire UE (Apple Distribution International et Google
  Ireland) doit demander un numéro de TVA intracommunautaire à son SIE, autoliquider la TVA et
  la déclarer via CA3. À faire avant les premiers paiements aux stores.
- **Micro-BNC**. Les revenus des stores sont des BNC. Surveiller le seuil de franchise en base
  et le seuil du régime micro.
- **RGPD**. Politique de confidentialité en ligne obligatoire pour les deux stores, plus la
  déclaration Data Safety côté Play et App Privacy côté Apple.
- **Mentions légales** du site blflabs.com : nom, statut EI, SIREN, adresse, contact, hébergeur.

---

## 7. Coûts et délais

| Poste | Coût | Délai |
| --- | --- | --- |
| D-U-N-S | gratuit (39 € en express via Verif) | 5 à 30 jours |
| Apple Developer Program | 99 USD par an | quelques heures à quelques jours |
| Google Play Console | 25 USD une fois | 1 à 3 jours de vérification |
| Domiciliation commerciale (optionnel) | ~15 à 30 € par mois | quelques jours |
| SASU/EURL BLF Labs (si nom éditeur Apple exigé) | ~250 à 500 € de création | 1 à 3 semaines |

---

## 8. Ordre d'exécution recommandé

1. Demander le D-U-N-S (chemin critique).
2. Demander le numéro de TVA intracommunautaire au SIE.
3. Trancher la question de l'adresse publiée (domicile ou domiciliation).
4. Ouvrir le compte Apple en Individual, payer, déclarer le trader status.
5. Dès D-U-N-S reçu, ouvrir le compte Google Play en Organisation.
6. Décider plus tard si une SASU BLF Labs est nécessaire pour le nom éditeur Apple.

## Sources

- developer.apple.com/programs/enroll, developer.apple.com/help/account/membership/program-enrollment
- developer.apple.com/support/D-U-N-S
- support.google.com/googleplay/android-developer answers 6112435, 13628312, 13634885, 14151465
- developer.apple.com/help/app-store-connect/manage-compliance-information (DSA trader)
- impots.gouv.fr, TVA des micro-entrepreneurs et autoliquidation intracommunautaire
