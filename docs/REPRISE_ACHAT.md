# Retrouver un achat payé

Bacchana se paie une fois, à vie, sans compte. C'est un parti pris, et il crée un
problème que ce document nomme entièrement : **sans compte, il n'y a pas d'identifiant
qui suit le joueur.** Un achat est attaché à quelque chose, et ce quelque chose doit
survivre à un vidage de cache, à un changement de navigateur, à un nouveau téléphone.

Écrit le 2026-08-30, après le relevé du défaut. Aucune vente réelle n'a encore eu lieu :
tout ce qui suit est encore corrigeable, et cesserait de l'être au premier encaissement.

---

## 1. Le défaut trouvé, et pourquoi il ne se voyait pas

`getOrCreateAnonymousAppUserId()` posait un `crypto.randomUUID()` comme identifiant
d'appareil. Le SDK Web teste littéralement le préfixe :

```js
// node_modules/@revenuecat/purchases-js/dist/Purchases.es.js, version 1.51.0
isAnonymous() { return this._appUserId.startsWith("$RCAnonymousID:") }
```

Un UUID nu ne porte pas ce préfixe. RevenueCat classait donc chaque acheteur comme
**identifié**. Or `RedemptionInfo` est documenté ainsi dans le SDK : elle donne accès aux
données de reprise « when the purchase can be redeemed to a mobile user, **like in the
case of anonymous users** ». Un acheteur identifié ne reçoit aucun lien : `redemptionInfo`
arrive à `null`.

**Conséquence :** le seul mécanisme officiel de récupération d'un achat web était coupé à
la source, sans message, sans erreur, sans test rouge. L'achat aboutissait, l'entitlement
était accordé, tout paraissait normal. Il aurait fallu un achat RÉEL pour voir l'absence
du lien - c'est-à-dire trop tard, puisqu'un achat encaissé sous un identifiant non anonyme
reste attaché à cet identifiant et n'est pas rattrapable côté client.

Corrigé, et verrouillé par `src/lib/billing.test.ts`, garde vue rouge sur l'ancien code.

---

## 2. Ce qui est couvert maintenant, et ce qui ne l'est pas

| Trajet | Couvert | Par quoi |
|---|---|---|
| Même navigateur, cache expiré ou hors ligne | oui | « Restaurer mes achats », qui relit l'entitlement de l'appareil |
| Achat web puis application mobile | oui | le **lien de reprise** rendu à l'achat |
| Achat dans l'App Store ou le Play Store, sur un autre appareil | oui | le compte du magasin, restauration native |
| **Achat web puis un autre navigateur** | **NON** | rien. Voir plus bas. |

Le lien de reprise est affiché deux fois : sur l'écran de succès, et dans les Réglages
sous « Restaurer mes achats » - parce qu'un onglet se ferme, et que le lien doit survivre
à ça. La documentation RevenueCat l'annonce valable **60 minutes** ; on ne l'efface pas
au-delà, on avertit. Un lien périmé permet à l'application de dire « ce lien a expiré »,
alors qu'un lien effacé ne laisse rien du tout.

---

## 3. Le trou restant : web vers un autre navigateur

Le SDK Web n'a **aucune** restauration entre appareils, et ce n'est pas un manque à coder :
sans identifiant détenu de notre côté, il n'y a rien à quoi rattacher l'achat. Trois voies,
et une seule est honnête.

### Voie A - ne pas vendre sur le web

Le PWA reste gratuit ou en démonstration, la vente se fait dans les magasins. Sur l'App
Store et le Play Store, **le compte du magasin EST l'identifiant de reprise** : la
restauration est un appel du SDK, elle marche entre appareils, et Apple comme Google
l'exigent de toute façon. Zéro ligne de code, zéro litige de paiement, et le défaut
disparaît au lieu d'être géré.

Coût : pas de revenu web.

### Voie B - vendre sur le web avec un service à nous

Une fonction sans serveur chez Vercel plus un envoi de courriel :

1. à l'achat, le client envoie `{ courriel, identifiantAnonyme }` ;
2. la fonction **vérifie côté serveur**, avec la clé secrète de l'API v2 RevenueCat, que
   cet identifiant possède réellement l'entitlement - sinon n'importe qui s'attribue
   l'achat d'un autre en postant son adresse ;
3. elle stocke `empreinte(courriel) → identifiantAnonyme` ;
4. « Restaurer » demande l'adresse, envoie un lien à usage unique, et le clic réinstalle
   l'identifiant dans le navigateur.

Coût réel : une fonction, un stockage, un service d'envoi, une clé secrète à protéger, et
une adresse de courriel qui devient une donnée personnelle - donc une entrée dans la
politique de confidentialité, une base légale (exécution du contrat) et une durée de
conservation. C'est un chantier, pas un correctif.

### Voie C - dériver l'identifiant du courriel : **à ne pas faire**

Techniquement séduisant : `identifiant = empreinte(courriel)`, aucun serveur, la
restauration devient « tape ton adresse ». Le défaut est structurel : le courriel est un
secret que tout le monde connaît. N'importe qui connaissant l'adresse d'un acheteur
récupère son achat, et un achat récupéré n'est pas retiré à son propriétaire - donc rien
ne se voit.

Et le public de Bacchana rend le risque maximal : ce sont des groupes d'amis, qui
connaissent tous l'adresse les uns des autres. Un achat par bande, au lieu d'un achat par
personne. Une fuite de recette, pas un cas limite.

---

## 4. La décision, et son échéance

**Recommandation : voie A pour le lancement.** Les magasins résolvent le problème par
construction, les ports iOS et Android existent déjà, et cela retire une classe entière de
litige avant la première vente.

La voie B reste ouverte ensuite, quand le volume la justifie. Ce qui n'est pas ouvert,
c'est de vendre sur le web sans l'une des deux : ce serait encaisser un achat à vie tout
en sachant qu'un simple changement de téléphone le détruit.

**Ce qui doit être fait avant tout encaissement, quelle que soit la voie :** le correctif
de l'identifiant anonyme de ce document. Il est déjà livré, et il ne se rejoue pas après.
