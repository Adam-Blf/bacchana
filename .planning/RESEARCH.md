# Research: Bacchus

Constats **verifies** lors de la session du 5 aout 2026. Chaque ligne dit comment elle
a ete etablie. Ce document existe pour eviter qu'une planification ulterieure refasse
la recherche a vide, et pour qu'aucune de ces conclusions ne soit reprise sur parole.

## Etat de la monetisation, interroge par API

Interrogation de l'API RevenueCat v2 sur le projet en place :

| Element | Etat reel |
|---|---|
| Applications declarees | 1, nommee `Test Store`. Aucune application App Store ni Play Store |
| Produits | **0** |
| Offres | 1, `default`, vide puisqu'il n'existe aucun produit |
| Entitlements | 2, `La Tournee Pro` orphelin et `Meskova Pro` |

**Consequence** : aucun achat ne peut aboutir sur mobile aujourd'hui, quoi que fasse
le code. Ce n'est pas un reglage de confort, c'est la monetisation entiere.

**Fenetre a saisir** : un identifiant d'entitlement RevenueCat est **immuable** apres
creation. Comme il n'existe aujourd'hui aucun produit et aucun achat, c'est le seul
moment ou l'entitlement peut etre renomme proprement en `Bacchus Pro` sans casser
quoi que ce soit. Passe la premiere vente, ce sera definitif.

## Etat de l'identite visuelle

`public/icon.svg` porte dans son propre commentaire la mention "deux verres qui
trinquent" et dessine l'eclat du choc. Tous les derives PNG en sont issus :
`apple-touch-icon` et ses trois tailles, `favicon`, `apple-splash`, la famille PWA
complete, ainsi que les icones Android et iOS.

**Consequence** : un reviewer Apple voit l'imagerie alcool avant meme d'ouvrir
l'application. C'est le risque de rejet 1.4.3 le plus direct du projet, devant tout
texte. Une copie de l'ancien logo est archivee, le porteur l'a demandee.

## Registre visuel retenu, et pourquoi

Bacchus est le dieu du **theatre** autant que du vin. Le masque de theatre, la
couronne de laurier et le thyrse sont ses attributs classiques. Ce registre est le
seul qui soit a la fois fidele au nom et totalement exempt de connotation alcoolique.
Il donne au nom une lecture defendable devant un reviewer.

Verification faite via le catalogue Icons8 : le masque de theatre est bien la
metaphore standard de ce champ, categorie Cinema, sous-categorie Theatre.

### Lecons de dessin deja payees

Trois iterations ont ete rendues et regardees a taille reelle. Ce qui a echoue, et
pourquoi, pour ne pas le refaire :

1. **Des yeux avec pupilles donnent un visage**, donc un smiley, donc un rendu
   generique. Les yeux et la bouche d'un masque doivent etre **ajoures**, des formes
   pleines en encre, des vides. Ce seul detail fait basculer la lecture.
2. **Une silhouette ovale se lit comme un visage.** Un masque a un front large, une
   machoire marquee, un menton effile.
3. **Des feuilles en lentille arrondie se lisent comme des grains de cafe.** Une
   feuille de laurier a une pointe franche et une nervure, et elle pousse sur une tige
   visible.
4. **Une couronne trop dense se lit comme une chenille noire.** Il faut espacer et
   garder le remplissage colore lisible.
5. **Une composition avec le sujet en bas et du vide en haut est bancale.** Centrer
   optiquement, prevoir la marge de securite du rognage.

Le test qui compte est le rendu a **48 pixels**, taille reelle dans une liste
d'applications. Un sujet trop detaille y devient une bouillie : la silhouette doit
porter le sens seule.

## Langage visuel existant, a conserver

Releve dans l'ancienne identite, a garder pour que la bascule ne se lise pas comme un
changement de produit : fond creme `#FFF9F0`, encre `#111111` a 12 d'epaisseur sur un
viewBox 512, jonctions arrondies, ombres dures obtenues en dupliquant la forme en noir
decalee de 14 pixels, palette jaune `#FFD029`, orange `#FF5C00`, rose `#FF6FB2`,
bleu `#2F6BFF`.

Polices : Anton, Bricolage Grotesque et Space Mono, toutes auto-hebergees en `woff2`.
Aucun CDN, ce qui est une regle du projet et une condition de fonctionnement hors ligne.

## Securite, etat au 5 aout 2026

Audit complet des cinq depots : **aucun constat critique**. Trois constats de gravite
elevee, six moyens, sept faibles, huit acquis verifies.

**Tous les constats des cinq depots ont ete corriges et merges sur integration continue
verte.** Ce qui a ete etabli, avec sa preuve :

- **Historique propre** : scan des motifs de cles sur les cinq depots, **zero
  correspondance sur 305 commits**.
- **En-tetes de securite en ligne**, verifies par requete HTTP sur le domaine de
  production : politique de securite du contenu a 12 directives sans `unsafe-inline`
  sur les scripts, plus les sept autres en-tetes.
- **Dependances de production** : `npm audit --omit=dev` passe de 14 vulnerabilites a
  **zero**, apres reclassement de `vite-plugin-pwa` qui, declare en production,
  tirait Vite et ses failles de serveur de developpement dans l'arbre de production.
- **Chaine de publication** : actions epinglees sur empreintes de commit sur les cinq
  depots, jetons en lecture seule, scan de secrets partout, surveillance des
  dependances activee.
- **Acces payant** : la falsification decrite par l'audit a ete **rejouee dans un
  navigateur sur l'application reelle**, elle est refusee.

### Pieges rencontres, valables pour la suite

- **`permissions: contents: read` casse gitleaks.** Le bloc au niveau workflow retire
  le scope implicite `pull-requests`, et l'action meurt en 403 avant de scanner. Il
  faut rendre `pull-requests: read` sur le seul job de scan. Ce piege s'est presente
  sur les quatre depots, independamment.
- **Une politique de securite du contenu doit etre exercee dans un navigateur avant
  d'etre deployee.** Deux casses reelles ont ete trouvees ainsi, invisibles autrement :
  RevenueCat poste sa telemetrie sur `e.revenue.cat`, domaine different de son API, et
  PostHog charge sa configuration et son module de sondages comme **scripts tiers**.
  Le second a ete regle en desactivant ces fonctions inutilisees plutot qu'en ouvrant
  la politique, ce qui preserve `script-src 'self'`.
- **Le service worker d'une application progressive ressert l'ancienne politique**
  depuis son cache, ce qui donne l'illusion qu'un correctif n'a pas pris.

## Reste bloquant, et qui peut le lever

| Point | Qui |
|---|---|
| Rotation des trois identifiants d'administration | Le porteur seul |
| Comptes Apple Developer et Play Console | Le porteur seul |
| Connexion Stripe vers RevenueCat | Le porteur seul, conditionne par les comptes |
| Declaration des applications et produits RevenueCat | Conditionne par les comptes |
| Choix de la direction de marque | Le porteur, sur propositions rendues |
