# RevenueCat - etat reel du projet Bacchana, releve le 2026-08-30

Releve dans le tableau de bord, projet `896fa1e2`. **Rien n'a ete modifie** :
tout ce qui suit est un constat, et les deux decisions a prendre sont a la fin.

> **Deux identifiants de projet RevenueCat circulent dans cette documentation**, et
> un seul peut etre le bon : `896fa1e2` ici, `2b8d469c` dans `OBSERVABILITE.md`.
> Deux projets, ce sont deux jeux de cles et deux catalogues de produits. Le mode
> de defaillance est le pire possible : la cle du build pointe un projet, les
> produits vivent dans l'autre, le paiement aboutit et l'entitlement n'arrive
> jamais - sans qu'aucune erreur ne soit levee.
>
> **A trancher dans le tableau de bord avant tout cablage**, et non ici. Ne
> recopier aucun de ces deux identifiants depuis une page de documentation.

## Ce qui existe

| Boutique | Produits | Etat |
|---|---|---|
| **Stripe** | `bacchana_lifetime`, `bacchana_lifetime_minus2` a `minus5`, `bacchana_pack_action_verite_extreme`, `bacchana_pack_never_hot`, `bacchana_pack_cest_un_10_redflags`, `bacchana_pack_picolo_chaos` | **Tous « Not found »** |
| **Test Store** | `lifetime` (« A Vie »), non consommable | Actif |

Aucune application Apple ni Google n'est configuree dans le projet.

## Les quatre constats

1. **La facturation de production n'existe pas.** Les neuf produits Stripe sont
   declares dans RevenueCat mais introuvables chez Stripe - c'est ce que dit
   « Not found ». Rien ne peut etre vendu en l'etat, sur aucune plateforme.

2. **Le prix de la boutique de test est de 99,99 USD**, pas 12,99 EUR. C'est ce
   que l'application afficherait aujourd'hui : `src/lib/billing.ts` lit
   `VITE_REVENUECAT_TEST_STORE_KEY`, donc c'est bien ce produit-la qui alimente
   le paywall.

3. **Ce prix ne peut pas etre modifie.** RevenueCat l'ecrit dans son propre
   formulaire : « Saved pricing can't be edited afterwards, but you can add new
   currencies later ». Verifie dans le document : la page du produit n'offre
   que trois actions - modifier le TITRE, attacher un entitlement, supprimer le
   produit. Aucun controle d'ajout de devise n'existe sur un produit deja cree.

4. **La boutique de test est en dollars.** Le formulaire de creation n'offre
   que « USD (default) ». Supprimer et recreer le produit donnerait donc
   **12,99 USD**, pas 12,99 EUR - c'est-a-dire toujours pas ce que le paywall
   doit afficher.

Detail au passage : l'entitlement attache s'appelle **`Bacchus Pro`**, un nom de
produit abandonne avant « Bacchana ». Il est rattache a l'offering `default`.

## Pourquoi je me suis arrete

Supprimer le produit `lifetime` detacherait son entitlement et son offering,
pour retomber sur un prix en dollars qui n'est pas le bon. Le gain ne paie pas
le geste, et surtout il donnerait l'impression que le sujet est regle alors que
la facturation de production, elle, n'est pas cablee du tout.

## Les deux decisions, pour Adam

1. **La devise de la boutique de test.** Si elle peut passer en EUR (parametres
   de l'app Test Store), alors recreer `lifetime` a 12,99 EUR a du sens et je
   peux le faire : il faudra rattacher `Bacchus Pro` et l'offering `default`,
   je sais lesquels. Le produit n'a AUCUNE transaction, l'operation est sans
   risque.
2. **La facturation de production.** Les neuf produits Stripe doivent etre
   crees chez Stripe, ou les produits Apple et Google declares une fois les
   applications ajoutees au projet. C'est ce qui bloque reellement la vente, et
   c'est un chantier a part.

Tant que ce n'est pas fait, le prix de 12,99 EUR est juste PARTOUT ailleurs -
code, documentation, maquette, tests, tableau de bord - et faux au seul endroit
qui encaisse.
