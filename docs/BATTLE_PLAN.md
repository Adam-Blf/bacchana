# Bacchana - Plan de bataille pour la place de n°1 FR

Synthèse du 2026-08-02 : 4 audits parallèles (teardown Picolo, teardown TOZ,
balayage FR + mondial, facteurs de ranking stores). Complète `docs/MARKET.md`.
Sources détaillées dans les rapports d'audit, URLs en fin de MARKET.md.

## Le champ de bataille en une ligne

Les deux leaders gagnent sur le volume (47 k avis Picolo, SEO TOZ) mais ont
tous les deux **trahi la confiance** : essai gratuit trompeur et prélèvement
immédiat chez Picolo, bascule tout-payant qui a enragé les fidèles chez TOZ
(« plus cher que Netflix », « Adieu Toz »). Bacchana gagne sur la confiance :
**payez une fois, jouez pour toujours - zéro pub, zéro compte, 100 % offline.**

## Positionnement d'attaque (messages verbatim à réutiliser)

1. « Payez une fois, jouez pour toujours. » (lifetime 34,99 vs abos récurrents
   critiqués partout - AUCUN concurrent n'a de lifetime)
2. « Zéro pub, zéro compte, zéro réseau requis. » (le churn n°1 du genre = la
   pub ; la plainte n°3 de Picolo = perte d'accès au changement d'appareil)
3. « 13 jeux dès l'entrée, pas un jeu découpé en packs. » (plainte n°4 Picolo :
   contenu gratuit épuisé en 2-3 parties ; plainte n°3 TOZ : Soft épuisé en
   30 minutes)
4. « L'ambiance sans l'alcool imposé. » (marché sober-curious inadressé,
   Picolo et TOZ assument le 18+ alcool)

## Ce qu'on copie des meilleurs (validé par leurs notes)

- Picolo : zéro setup (déjà le cas), paywall visible en cours de partie (pack
  grisé qui donne envie - à ajouter), gradation d'intensité comme filtre.
- TOZ : cadence de nouveauté hebdomadaire comme récit marketing, palier
  gratuit généreux (leur erreur inverse : trop maigre).
- Bravo : timer + classement live. Sombre soirée : curseur d'intensité.
- Evil Apples : contenu custom joueurs (nos « Mes règles »/« Mes thèmes » ont
  déjà une longueur d'avance - les généraliser).

## Roadmap produit priorisée (impact / effort, solo-dev React)

| P | Feature | Origine | Effort |
|---|---|---|---|
| 1 | Timer visible par manche (pression temporelle) | Bravo | XS |
| 2 | Stats de fin de soirée cross-jeux sur l'addition (le plus voté, le plus menteur, le plus puni) | Most Likely To, Bravo | S |
| 3 | Curseur d'intensité global (Tranquille / Corsé / Coupe-gorge) filtrant les packs | Sombre soirée | S |
| 4 | Paywall in-game : packs premium visibles grisés pendant la partie | Picolo | S |
| 5 | Mode Imposteur (démasquer qui ment parmi les réponses) | Insight Blackout | M |
| 6 | Mode Fusion : 2 des 13 jeux mélangés en une manche | Bravo | M |
| 7 | Partage stories : export image des stats/addition | Heads Up! | M |
| 8 | Mode grand écran + spectateurs votants | Jackbox | L (v2) |

## Mécaniques signature (aucun concurrent ne les a)

1. **L'Ardoise** - les gages perdus s'accumulent sur une ardoise et se règlent
   en mini-jeu final : « la maison distribue le dernier verre ». (Étend notre
   ticket de caisse existant.)
2. **Le Taulier tournant** - rôle méta tiré au sort chaque manche : arbitre,
   double la mise, gracie, impose une règle maison éphémère - transversal aux
   13 jeux.
3. **Le Grand Livre de la Taverne** - badges d'exploits de soirée (bluff
   parfait, gage sans hésiter) gravés en local, consultables en groupe,
   progression inter-soirées 100 % offline. Personne ne fait de progression
   offline sans compte.

## Growth : le SEO de conquête (l'arme de TOZ, retournée)

TOZ construit son trafic avec des pages « Picolo vs TOZ » : on fait pareil,
mieux, sur lataverne.beloucif.com :
- Pages comparatives : « Bacchana vs Picolo », « Bacchana vs TOZ »,
  « Meilleures apps de jeux de soirée 2026 » - tableau chiffré (13 jeux,
  lifetime, offline, zéro pub), FAQ, CTA store, maillage interne.
- On capte la requête « Picolo vs TOZ » elle-même avec un comparatif à trois.
- Factuel uniquement, jamais de dénigrement (droit FR, concurrence déloyale).

## Lancement stores en 5 phases (budget zéro)

0. **J-30** : préinscription Play + fiche complète + 5-10 micro-créateurs
   TikTok briefés (codes anticipés contre posts).
1. **J0-J14** : soft launch **Belgique + Suisse romande** - purger les crashs,
   valider la boucle avant l'algorithme FR.
2. **J15-J30** : lancement France + vague TikTok coordonnée le même jour (pic
   de vélocité concentré, c'est ce que l'algorithme récompense).
3. **J30-J60** : contenu hebdo (deck de la semaine), A/B test screenshots
   (outils natifs des consoles), surveiller D7 (cible 10-20 %) et D30 (5-10 %).
4. **J60-J90** : note ≥ 4.0 stable → dossier de featuring Apple + Google,
   deuxième vague TikTok saisonnière.

**Prompt d'avis** : uniquement après un pic de fun mesuré (fin de partie,
addition affichée), jamais à l'ouverture, max 3/an sur iOS. In-App Review API
des deux plateformes.

## Les 3 erreurs interdites

1. Lancer direct en France sans soft launch (le pic de vélocité ne se rejoue
   pas).
2. Prompt d'avis au mauvais moment (quota grillé, avis négatifs).
3. Acheter installs ou avis (signal négatif actif + risque de suppression).

## Ordre d'exécution proposé

1. v0.15 : paywall lifetime par défaut (fait), timer de manche, stats
   cross-jeux sur l'addition.
2. v0.16 : curseur d'intensité + paywall in-game.
3. v0.17 : mode Imposteur (14e jeu, argument « plus de jeux que TOZ »).
4. Blog SEO : 3 pages de conquête (peut se faire en parallèle, hors app).
5. Stores : dès les comptes ouverts, dérouler les 5 phases.
