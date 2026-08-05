# Requirements: Bacchus

Exigences du chantier de rebranding et de mise en publication. Chaque exigence est
verifiable, sinon elle n'est pas une exigence.

## Marque

- **REQ-01** L'identite visuelle ne contient **aucune** imagerie d'alcool : ni verre,
  ni bouteille, ni raisin, ni vigne, ni tonneau, ni bulle. Verifiable par revue de
  chaque asset livre.
- **REQ-02** Le logo est lisible et identifiable a **48 pixels**, taille reelle d'une
  icone dans une liste d'applications. Verifiable par rendu PNG a 48 pixels.
- **REQ-03** Le logo existe en declinaison **monochrome**, exigence Android pour
  l'icone themee, et cette declinaison reste comprehensible sans couleur.
- **REQ-04** Le logo respecte les zones de securite des deux magasins : rognage en
  carre arrondi sur iOS, en cercle sur Android.
- **REQ-05** L'identite conserve le langage visuel existant, fond creme, encre epaisse,
  ombres dures, palette jaune, orange, rose, bleu, pour que la bascule ne se lise pas
  comme un changement de produit.
- **REQ-06** Aucun asset ne depend d'un CDN ni d'une ressource distante. Verifiable :
  une recherche de `https://` dans le frontend ne remonte rien hors commentaires.

## Nom et declinaison

- **REQ-07** Le nom **Bacchus** remplace les cinq noms anterieurs dans tout texte
  visible des cinq depots, hors entrees historiques de CHANGELOG qu'on ne reecrit
  jamais.
- **REQ-08** Les cles de stockage local sont renommees en `bacchus-` **avec une chaine
  de migration complete** depuis chaque prefixe historique. Aucun maillon supprime :
  un utilisateur peut arriver de n'importe quelle version.
- **REQ-09** Le titre de la page en production affiche Bacchus. Verifiable par requete
  HTTP sur le domaine de production.

## Monetisation

- **REQ-10** RevenueCat declare une application App Store et une application Play
  Store reelles. Constat au 5 aout 2026 : une seule application declaree, nommee
  Test Store.
- **REQ-11** RevenueCat declare les produits payants. Constat au 5 aout 2026 :
  **zero produit**, donc aucun achat ne peut aboutir sur mobile.
- **REQ-12** L'entitlement se nomme `Bacchus Pro`. Les entitlements orphelins
  `La Tournee Pro` et `Meskova Pro` sont supprimes. Faisable sans risque tant qu'il
  n'existe aucun achat.
- **REQ-13** Stripe est connecte a RevenueCat en production. Sans cette connexion,
  aucun revenu n'est possible.
- **REQ-14** Le contenu payant n'est **jamais** embarque dans le paquet web, seules
  ses metadonnees le sont. C'est la protection reelle de la monetisation cote client.

## Conformite

- **REQ-15** Le paywall exige un double consentement non pre-coche avant paiement,
  avec preuve horodatee rattachee a la version des CGU. Article L221-28 du code de la
  consommation.
- **REQ-16** Les mentions legales, la politique de confidentialite et les CGV sont a
  jour et nomment le mediateur de la consommation. L'omission de la mention du
  mediateur est passible de 3 000 euros d'amende, article L641-1.
- **REQ-17** Le bandeau de consentement laisse le refus aussi accessible que
  l'acceptation, la mesure d'audience est desactivee par defaut, et le consentement
  expire a six mois. Recommandation CNIL.
- **REQ-18** Aucune donnee personnelle ne quitte l'appareil. Verifiable : aucun appel
  reseau ecrit a la main dans le code source.
- **REQ-19** Le lexique alcool reste absent du code, garde par une verification
  d'integration continue qui casse la CI a la premiere reapparition.

## Securite

- **REQ-20** Les trois identifiants d'administration exposes au contexte de
  compilation sont revoques et regeneres. **Seul le porteur peut le faire.**
- **REQ-21** Les cinq depots portent un scan de secrets sur l'historique complet, des
  actions epinglees sur empreintes de commit, des jetons en lecture seule et une
  surveillance des dependances. **Fait le 5 aout 2026.**
- **REQ-22** L'application publique sert des en-tetes de securite, dont une politique
  de securite du contenu sans `unsafe-inline` sur les scripts. **Fait et verifie en
  production le 5 aout 2026.**
- **REQ-23** L'acces payant n'est pas indefiniment falsifiable cote client.
  **Fait, borne a sept jours, falsification rejouee et refusee.**

## Publication

- **REQ-24** Les comptes Apple Developer et Google Play Console sont ouverts et
  valides. **Seul le porteur peut le faire**, et cela conditionne REQ-10 a REQ-13.
- **REQ-25** Les fiches magasin evitent le lexique alcool, se positionnent sur le
  registre jeu de soiree, et sont accompagnees de notes au reviewer documentant la
  mecanique propre du jeu, parade a la guideline 4.3 sur le spam.
- **REQ-26** Les captures d'ecran des deux magasins sont produites a partir de
  l'application reelle, pas de maquettes.
