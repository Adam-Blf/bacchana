# La Tournée - Fiche stores (ASO, prête à coller)

> Textes prêts à coller dans App Store Connect / Play Console / la landing page.
> Ton : chaleureux, complice, zéro jargon. Store-safe : on parle de « pénalités »
> et de « gages », jamais d'alcool - ni dans les textes, ni dans les mots-clés,
> ni dans les emojis. Optimisé selon les règles ASO : déduplication
> nom/sous-titre/mots-clés, mots-clés sans espaces ni pluriels, captions de
> screenshots indexées par OCR.

**Nom du développeur / éditeur** : « Adam Beloucif » tant que les comptes
stores sont personnels, « BLF Lab's » après passage en compte organisation
(cf. `docs/STORE_ACCOUNTS.md`). Le copyright App Store Connect se remplit
« © 2026 Adam Beloucif (BLF Lab's) ».

## App Store (iOS)

| Champ | Valeur | Car. |
|---|---|---|
| **Nom** (30) | `La Tournée - Jeux de soirée` | 27 |
| **Sous-titre** (30) | `Party game, défis entre amis` | 28 |
| **Mots-clés** (100) | `ambiance,groupe,gage,verite,action,jamais,carte,roue,quiz,fete,rire,anniversaire,couple,potes,tablee` | 100 |

Aucun mot n'est répété entre les trois champs (Apple combine les champs :
« jeux entre amis », « party game soirée », « quiz de groupe », etc. sont
couverts). Pas de « app », pas de « gratuit », pas de marque concurrente.

**Texte promotionnel** (170, modifiable sans review) :

`Pose le téléphone au milieu de la table, entre les prénoms, et c'est parti : 13 jeux, des centaines de cartes, une seule app. Nouveau : crée tes propres règles.`

## Play Store (Android)

| Champ | Valeur | Car. |
|---|---|---|
| **Titre** (30) | `La Tournée : jeux de soirée` | 27 |
| **Courte description** (80) | `13 jeux de soirée dans ta poche : cartes, quiz, procès, enchères et fous rires.` | 79 |

## Description longue (commune aux deux stores)

Un téléphone au milieu de la table, les prénoms de la tablée, et la soirée
démarre. La Tournée réunit 13 jeux de soirée dans une seule app : plus de
règles à expliquer pendant dix minutes, plus de jeu introuvable au fond du
placard.

**Au menu :**
- 🂠 **Le Coupe-Gorge** - le jeu de cartes signature : 52 à 156 cartes, 4 règles,
  des contestations qui montent jusqu'à x4… et des jokers qui renversent la table.
- 🧠 **Quitte ou Trinque** - le quiz culture G où tu fais grimper ta cagnotte…
  ou tu perds tout sur une question de trop.
- 🏆 **Le Tableau d'Honneur** - le juge classe ses potes selon une question
  secrète ; à vous de deviner laquelle.
- 📣 **La Criée** - « Je peux en citer 8 en une minute ! » - « Tu mens ! » Chrono.
- ⚖️ **Le Pilori** - chacun écrit une accusation anonyme, l'accusé se défend,
  la table vote.
- 👑 **Le Taulier**, **Action ou Vérité**, **Je n'ai jamais**, **Qui de nous**,
  **Tu préfères**, **C'est un 10 mais**, **7 Secondes**, **La Roue du Destin**…

**Et surtout :**
- ✏️ **Tes règles à toi** - crée tes propres gages, ils se glissent dans les
  parties et restent enregistrés sur ton téléphone.
- 📴 **Zéro compte, zéro réseau requis** - tout fonctionne hors ligne, tes
  données restent sur ton appareil.
- 🎨 Un design brut et coloré qui se voit de l'autre bout de la table.
- 🧾 **L'addition** - le récap de fin de partie imprimé comme un ticket de
  caisse, à partager à la tablée.

**La Tournée Premium** débloque les packs les plus corsés et se teste avec
**7 jours d'essai gratuit** - tous les jeux de base restent gratuits, sans
publicité.

La Tournée distribue des « pénalités » : c'est votre table qui décide de ce
qu'elles valent. Jouez comme vous êtes, et prenez soin les uns des autres.

Réservé à un public adulte.

## Notes de version type (0.12.0)

Du neuf au comptoir !
- Tirage plus naturel au Coupe-Gorge : touche le paquet pour tirer ta carte.
- Nouvelle identité typographique, plus lisible de l'autre bout de la table.
- Mode sombre « chandelle » et écran d'accueil repensé.
- Corrections d'affichage sur iPhone (saisie des prénoms, cartes).

## Captions des screenshots (indexées par OCR - garder les mots-clés)

1. `LA TOURNÉE` - Les meilleurs jeux de soirée, servis au comptoir.
2. `LE COUPE-GORGE` - 52 cartes, 0 pitié
3. `AVOUE OU PAIE` - 13 jeux, des centaines de cartes 100 % originales
4. `LA ROUE DU DESTIN` - Fais-la tourner, assume le sort
5. `L'ADDITION` - Le récap de fin qui pique

## Disclaimer conso responsable (bas de fiche + site)

La Tournée est un jeu d'ambiance destiné à un public majeur. L'application ne
vend, ne nomme et n'encourage aucune boisson : elle distribue des pénalités
abstraites dont chaque table décide librement. Ne jouez jamais avec des
personnes qui ne le souhaitent pas, et veillez les uns sur les autres après la
soirée.

## Notes de review App Store (à coller dans « App Review Information »)

> Ces notes anticipent la guideline **4.3 (Design - Spam)**, motif de rejet le
> plus probable pour une app de ce format (voir l'analyse dans `docs/MARKET.md`).
> Le zéro-alcool nous protège de la 1.4.3, pas de la 4.3 : la parade est de
> démontrer une mécanique propriétaire et un contenu original.

**Mécanique propriétaire, pas un clone « deck + minuteur ».** La Tournée n'est
pas un simple jeu de cartes avec un chrono. Cinq modes tournent sur un moteur
de jeu propre, écrit maison, sans équivalent direct chez les concurrents :

- **Tu préfères** - moteur de vote embarqué : la table tranche entre deux
  options, la minorité prend la pénalité (aucun paquet de contenu, logique de
  vote native).
- **La Criée** - moteur d'enchère : les joueurs surenchérissent (« je peux en
  citer 8 ! ») jusqu'au « tu mens ! », puis un chrono valide le pari.
- **Le Pilori** - moteur de procès : les joueurs écrivent des accusations
  secrètes, un accusé se défend, la table vote son verdict à main levée.
- **Quitte ou Trinque** - moteur de quiz à cagnotte : bonnes réponses cumulées,
  choix de sécuriser ou de tout risquer sur une question de trop.
- **Le Tableau d'Honneur** - moteur de classement secret : un juge ordonne ses
  amis selon une question cachée que le groupe doit ensuite retrouver.

**Positionnement sans alcool assumé.** L'application ne vend, ne nomme et
n'encourage aucune boisson. Elle distribue des « pénalités » abstraites dont
chaque table décide librement le sens. C'est un choix de positionnement (public
sober-curious, 18-30), pas seulement une contrainte de conformité.

**Zéro publicité, zéro compte.** Aucune régie publicitaire, aucune création de
compte, aucune donnée envoyée avant le consentement cookies. Tout fonctionne
hors ligne, les données restent sur l'appareil.

**Contenu 100 % original.** Cartes, questions, chefs d'accusation, segments de
roue et gages sont écrits en interne, en français. Ce n'est pas un reskin d'un
format existant : 13 modes distincts sont visibles dès le hub, preuve de
variété réelle (argument anti-spam).

### Mots-clés ASO longue traîne (FR)

Le champ mots-clés (100 car.) reste court et dédupliqué. La longue traîne se
place en **Custom Product Pages** et dans le référencement de la landing page,
conformément à la tendance ASO 2026 (long-tail plutôt que bourrage du titre) :

`jeu apero`, `jeu de societe soiree`, `jeu entre potes`, `jeu entre amis`,
`animation soiree entre amis`, `jeu gage`, `jeu action verite`, `jeu de soiree
sans alcool`, `jeu ambiance groupe`, `jeu anniversaire adulte`, `jeu couple
soiree`, `party game francais`.

Aucun lexique alcool en métadonnée (plus sûr côté review, et champ moins
saturé). Volumes à valider via un outil ASO dédié (AppTweak / AppFollow /
Apptica) avant de figer la fiche.

## Risques review à arbitrer (Adam)

- **« Quitte ou Trinque »** : « trinquer » évoque l'alcool. Risque modéré de
  friction Apple 1.4.3. Fallback prêt si rejet : « Quitte ou Double » (aucun
  identifiant technique à changer, seulement le libellé).
- L'ancienne fiche contenait « L'abus d'alcool est dangereux pour la santé »,
  un 🍻 et « soirée arrosée » : retirés, cette phrase est un marqueur de
  produit alcoolisé pour la review.
- Classification : 17+/18 (Apple), PEGI 16-18 via questionnaire IARC (Play).
