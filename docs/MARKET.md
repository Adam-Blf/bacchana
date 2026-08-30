# Bacchana - Audit de niche et de concurrence

Audit du 2026-08-02, mené par deux analyses parallèles (marché + concurrents),
sources web citées en fin. Sert de base au positionnement store et au backlog
growth.

## La niche en bref

- Party games (physique + digital) : 12 à 15 Md$ en 2025, CAGR ~7 %. Le mobile
  global croît à peine (+1,3 %) : la bataille se joue sur la rétention et le
  revenu par utilisateur, pas sur l'acquisition brute.
- Picolo, leader FR : 5 à 8 M de téléchargements Android cumulés, ~12 k
  installs/30 j actuellement. Les « dizaines de millions » sont du marketing.
- Saisonnalité structurelle : pics été et fêtes de fin d'année - caler le
  calendrier de contenu dessus.
- **Signal de fond** : 65 % de la gén Z ouverte aux alternatives sans alcool,
  35 % des 16-24 FR totalement abstinents, +21,5 % de croissance du sans-alcool
  en France. Notre store-safety n'est pas une contrainte, c'est un
  positionnement aligné avec la cible 18-30.

## Concurrents (App Store FR, 2025-2026)

| App | Prix | Avis | Faiblesse exploitable |
|---|---|---|---|
| Picolo | mensuel 8,99, annuel 14,99-49,99, packs 3,99-9,99 | 4,5 - ~47 000 | Répétitif, cher, pub en gratuit |
| TOZ | mensuel 8,99-9,99, annuel 39,99-49,99 | 4,7 - ~14 000 | Bascule payante brutale mal vécue |
| Sombre soirée | premium 2,99, annuel 29,99 | 4,5 - 497 | Petit acteur, pub en gratuit |
| Je n'ai jamais | hebdo 9,99 forcé après essai 3 j | 4,4 - 295 | Abo hebdo piège, répétitif |
| Chopine, Insight, Bravo | freemium divers | confidentiels | Peu installés |

**Nos prix (4,99 / 19,99 / 34,99 lifetime) sont sous le marché.** L'annuel est
à -50 % des leaders et aucun concurrent identifié n'affiche de lifetime.

## Décisions actées suite à l'audit

1. **Aucune publicité, jamais.** Le point de churn n°1 de la niche est la pub
   après chaque manche. « Zéro pub, zéro compte » devient un argument de fiche
   store de premier rang. (Déjà le cas techniquement - c'est désormais une
   promesse produit engagée.)
2. **Pas de palier hebdomadaire.** Source n°1 des mauvais avis chez Picolo,
   TOZ et Je n'ai jamais. Notre grille reste mensuel/annuel/lifetime.
3. **Lifetime mis en avant** dans le paywall (option par défaut visuelle),
   c'est l'argument différenciant le plus fort face au tout-abonnement.
4. **ASO élargi hors « jeu à boire »** : viser « jeu de soirée », « jeu entre
   amis », capter le public sober-curious que les 18+ alcool ne peuvent pas
   adresser. Déjà aligné avec la fiche ASO 0.12.1.
5. **Offline comme argument visible** : aucun concurrent ne le met en avant.
   « Ça marche sans réseau » figure dans la description et les captions.

## Segments prioritaires

1. Étudiants premier appart/coloc (18-22) - « 13 jeux, zéro carte à racheter,
   ça marche sans réseau ».
2. Organisateurs de soirées mixtes sober-curious (22-28) - « l'ambiance sans
   l'alcool imposé ».
3. Groupes en vacances (pic été) - « offline, sans compte, prêt en
   10 secondes ».

## Backlog growth priorisé (impact / effort)

| # | Action | Impact | Effort | État |
|---|---|---|---|---|
| 1 | Zéro pub gravé dans la promesse produit | fort | nul | acté |
| 2 | TikTok organique : 3-4 clips/semaine (manche réelle + réactions), 3-5 micro-créateurs FR | fort | moyen | à lancer (Adam) |
| 3 | Paywall : lifetime en option par défaut | fort | faible | à coder (M6) |
| 4 | Parrainage : 1 pack premium débloqué en invitant 2 amis | moyen | moyen | backlog v2 |
| 5 | Comptes stores (Play 25 $, Apple 99 $/an) | condition de tout | - | bloqué Adam |

## Menaces

1. TOZ : SEO/blog agressif sur nos mots-clés génériques, 14 jeux, MAJ hebdo.
2. Picolo : 47 k avis, marque générique (« faire un Picolo ») - imbattable en
   ranking court terme, il faut gagner sur la conversion, pas le volume.
3. Guerre des prix par le bas (Sombre soirée 2,99) : le 4,99 doit être adossé
   à la variété perçue (13 jeux visibles dès le hub).

## Mise a jour 2026-08-03 (re-audit agence)

Second passage d'audit (conseil agence : cadre, chef de produit, marketing,
user researcher, QA). Le diagnostic 2026-08-02 est confirme, deux ajouts
critiques.

### Risque de rejet reel : guideline 4.3 (spam), pas seulement 1.4.3

Le zero-alcool nous protege de la 1.4.3 (contenu encourageant une consommation
excessive). Mais des developpeurs d'apps de ce type se font rejeter sous la
**4.3 Design - Spam** : Apple considere qu'il existe deja beaucoup de jeux de
soiree et qu'un enieme reskin de format "cartes + minuteur" duplique l'existant.
Le zero-alcool ne couvre pas ce motif.

Parade, a appliquer des la premiere soumission :
1. **Mecanique proprietaire demontrable** : nos modes a moteur propre (Le Proces
   ecrit par les joueurs, L'Enchere avec surencheres et "tu mens", Le Podium a
   classement secret, quiz cagnotte, et le nouveau "Tu preferes") ne sont pas un
   simple deck + timer. C'est notre difference fonctionnelle.
2. **Notes de reviewer explicites** a la soumission : decrire la mecanique propre,
   le positionnement sans alcool, l'absence de pub, et pointer que le contenu est
   original (pas un clone). A rediger dans STORE_LISTING.md / notes App Store Connect.
3. **13+ modes distincts** visibles au hub = variete reelle, argument anti-spam.

### ASO 2026 : long-tail plutot que bourrage

65 % des telechargements App Store passent par une recherche par mot-cle, et la
tendance 2026 est au long-tail via Custom Product Pages plutot qu'au bourrage du
titre. Consequence : titre + sous-titre courts et lisibles, mots-cles longue
traine dans le champ dedie ("jeu de societe soiree", "jeu entre
potes", "animation soiree entre amis", "jeu gage", "jeu action verite"), eviter
tout lexique alcool en metadonnee (safe + moins sature). Volumes precis a valider
via un outil ASO dedie (AppTweak / AppFollow / Apptica) avant de figer la fiche.

### Confirmation positionnement

Les prix (4,99 / 19,99 / 34,99 lifetime) restent sous le marche, le lifetime
reste un differenciant qu'aucun concurrent FR n'affiche, et la transparence
tarifaire (pas d'essai gratuit a conversion automatique, prix clair) repond a
l'irritant numero 2 du secteur (paywall opaque). Rien a changer, tout a valoriser
en fiche store et en avis.

## Sources

Dataintelo (party games market), Business of Apps (mobile revenue), Sensor
Tower + Play Store (Picolo), App Store FR (Picolo, TOZ, Sombre soirée, Je n'ai
jamais, Chopine), toz-app.com/blog, onsefaitquoicsoir.fr, Schlouk Map,
letoutpile.com, Statista FR (alcool par génération), Into the Minds
(désalcoolisation), Radio FG (gén Z), Marlvel (Party.io reviews), AppFollow
(monetization insights), Lancaric (UA strategies).
