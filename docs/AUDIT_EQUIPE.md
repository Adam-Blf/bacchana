# La Tournée - Audit d'équipe (produit, UX, contenu, technique, growth)

Audit du 2026-08-02 mené en parallèle par cinq spécialistes sur le produit réel
(code, contenu, marché) : product management, UX research, éditorial, tech lead,
growth. Complète `MARKET.md` (marché) et `BATTLE_PLAN.md` (stratégie).

## État de traitement au 2026-08-02

L'audit a été suivi le jour même de trois livraisons. Ce qui est corrigé est barré
du reste du document.

| Constat | Livré | Version |
|---|---|---|
| Écrans légaux inatteignables au premier lancement (RGPD) | oui | 0.19.0 |
| Médiopoints interdits dans l'interface | oui | 0.19.0 |
| Précache de 2 Mo imposé à tout visiteur | oui, ramené à 1049 ko | 0.20.0 |
| PostHog chargé avant tout consentement | oui, import dynamique | 0.20.0 |
| Ardoise indexée par prénom (homonymes fusionnés) | oui, indexée par identifiant | 0.20.0 |
| Code mort (handleCardAction, persist vide) | oui | 0.20.0 |
| Trois modes sans fin de partie ni addition | oui | 0.21.0 |
| Quatre modes hors moteur (refonte structurelle) | non, reste à faire | - |
| Quiz : cagnotte distribuée jamais lue | non | - |
| Hasard non injectable (six sites) | non | - |
| Factorisation des écrans de jeu | non | - |

## Ce qui ressort en priorité absolue

Trois constats reviennent dans plusieurs audits à la fois. Ce sont eux qui
bloquent le passage au rang de n°1.

1. **Quatre modes sur neuf n'utilisent pas le moteur.** La Criée, La Roue, Le
   Pilori et une partie du Quiz portent leurs règles dans des `useState` de
   composant. La conséquence la plus visible est réglée en 0.21.0 (les trois
   modes ont désormais une fin de partie, Le Pilori alimente l'ardoise, et
   l'entonnoir d'analyse est complet sur les treize jeux). **La cause reste
   entière** : ces modes ne sont ni testables ni rejouables tant que leurs
   règles vivent dans le composant. À traiter avant d'ajouter le moindre jeu.
2. **Le contenu est suffisant mais répétitif.** 385 items, environ trois à
   quatre soirées avant lassitude. Les doublons sémantiques sont le vrai
   problème (« qui est le plus susceptible » revient 40 fois), pas le volume.
3. **La rétention n'a aucun support.** Rien ne donne envie de rouvrir l'app la
   semaine suivante : ni progression, ni rappel, ni raison de revenir. C'est le
   levier le plus rentable et personne ne l'occupe sur ce marché.

## Produit : le catalogue

Verdict sur les 13 jeux : **9 à garder tels quels**, 4 à retravailler.

| Jeu | Verdict | Action |
|---|---|---|
| Le Coupe-Gorge | AMÉLIORER | Ajouter des cartes, règle des cartes bloquées, retour sur la qualité du bluff |
| Quitte ou Trinque | AMÉLIORER | Repositionner (quiz visuel, mode 2 contre 2), contenu thématisé |
| 7 Secondes | AMÉLIORER | Timer visible (déjà au plan), son de décompte, classement de manche |
| La Roue du Destin | AMÉLIORER | Curseur d'intensité, rôle du Taulier tournant |
| Le Pilori | FUSIONNER | Devient **L'Imposteur** : un joueur ignore le thème et doit bluffer |
| Les 8 autres | GARDER | Mécaniques saines |

**Jeux à ajouter, par priorité** : L'Imposteur (effort M, aucun concurrent FR
n'a la mécanique pure), La Contre-Attaque (mémoire chronométrée, effort S),
L'Écho (coopératif façon Just One, les indices identiques s'annulent, effort M),
La Bande (équipe contre équipe, effort L).

Objectif : **13 jeux au lancement** (la promesse store tient), **16 à 17 en
v0.20** pour dépasser TOZ et pouvoir l'écrire noir sur blanc.

## UX : les frictions à lever

Les cinq plus graves, dans l'ordre :

1. Le bandeau cookies réserve 256 px et repousse le bouton de jeu au premier
   lancement. À remplacer par un bandeau compact de 56 px.
2. **Aucun moyen de changer de jeu sans repasser par le hub.** Un appui long
   sur le bouton quitter devrait ouvrir un sélecteur rapide.
3. **La fin de partie ne propose pas de jeu suivant** : seulement rejouer le
   même ou rentrer. C'est pourtant le moment où le groupe décide de la suite.
4. `alert()` natif au partage du ticket : casse l'ambiance, à remplacer par un
   toast maison.
5. Pas de couleur ni d'avatar par joueur : en soirée, on lit mal les prénoms à
   bout de bras. Une couleur attribuée à la saisie, réutilisée partout, corrige
   à la fois le repérage et la lisibilité.

**Trois moments signature à créer** : un son et une vibration d'impression sur
le ticket, l'Ardoise réglée en mini-jeu final, et un rappel local le lendemain
(« Hier soir, Léa a pris 14 pénalités ») sans compte ni serveur.

## Contenu

385 items, 12 packs. Verdict par pack : trois à réécrire (Je n'ai jamais
Classique, Qui de nous Classique - trop proches de Picolo), deux à étoffer, le
reste suffisant. Le français est bon, une seule vraie faute relevée.

Cinq règles d'écriture à graver : pas de doublon sémantique à plus de 80 %,
15 mots maximum pour une vérité et 20 pour une action, tutoiement constant,
références 2020-2026 et non 1995-2005, et store-safe absolu (aucun alcool,
aucune drogue, aucune incitation dangereuse).

Manque total : la saisonnalité (été, rentrée, fin d'année) et la culture 2026.

## Technique

Les corrections déjà appliquées le 2026-08-02 (v0.19.0) : écrans légaux
inatteignables au premier lancement (RGPD), deux médiopoints interdits dans
l'interface.

Restent, par gravité :

1. Le service worker précache **2 Mo**, dont 777 ko de RevenueCat et 233 ko de
   PostHog qu'un visiteur qui refuse les cookies télécharge quand même.
   `globIgnores` sur ces deux chunks : une ligne, un mégaoctet économisé.
2. PostHog est importé statiquement et préchargé avant tout consentement. Le
   passer en import dynamique, comme le fait déjà `billing.ts`.
3. Les quatre modes hors moteur (voir plus haut).
4. Le quiz calcule `distributedCounts` que personne ne lit : la moitié du jeu
   n'arrive jamais au ticket.
5. L'ardoise indexe par prénom : deux joueurs homonymes fusionnent leurs
   pénalités.
6. `Math.random()` en dur sur six sites alors que `quizSession` a déjà le bon
   motif d'injection. Sans cela, aucun tirage n'est testable ni rejouable, et
   le moteur n'est pas portable tel quel en natif.

**À factoriser avant tout nouveau jeu** : un `GameScreenLayout` (la coquille est
recopiée six fois), un hook `useModeSession` (qui porterait aussi
l'enregistrement à l'ardoise, réglant mécaniquement le point 3), et un contrat
de mode unique dans `ModeDefinition`.

**Tests manquants les plus critiques** : la contestation complète du
Coupe-Gorge (invariant monétaire, zéro couverture), le paquet infini (feature
premium), et la conservation des pénalités entre la partie et le ticket.

## Growth

Trois leviers, dans l'ordre : TikTok UGC coordonné (8 à 12 micro-créateurs,
quatre vidéos par semaine, clips de vraie partie et non de production léchée),
SEO de conquête (trois pages comparatives publiées une semaine avant le
lancement France), et le paywall lifetime mis en avant.

**Cinq mécaniques de viralité à coder**, par rapport impact/effort : partage de
l'addition en image, code de soirée à six caractères, défi entre groupes,
l'Ardoise partageable, et le Grand Livre des exploits.

Métriques à instrumenter dans PostHog avec leurs seuils d'alerte : rétention J1
(alerte sous 18 %), J7 (sous 8 %), coefficient viral (sous 0,2), conversion
lifetime (sous 6 % à J14).

## Ordre d'exécution

1. ~~**v0.20** - précache allégé, PostHog dynamique, ardoise par identifiant,
   code mort~~ (livré).
2. ~~**v0.21** - fin de session pour les trois modes ouverts~~ (livré).
3. **v0.22 - dette structurelle** : les modes ad hoc passent sur le moteur,
   extraction de `GameScreenLayout` et `useModeSession`, injection du hasard.
   C'est ce qui fait baisser le coût de chaque jeu suivant.
4. **v0.23 - rétention** : Grand Livre des exploits, timer de manche, CTA
   « autre jeu » en fin de partie, couleur par joueur.
5. **v0.24 - catalogue** : L'Imposteur, La Contre-Attaque, réécriture des deux
   packs trop proches de Picolo.
6. **v0.25 - viralité** : partage image de l'addition, code de soirée.
7. En parallèle et hors app : les trois pages SEO de conquête et le pipeline
   TikTok.
