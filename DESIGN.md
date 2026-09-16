# Bacchana - Direction artistique

Version « Loto », troisième état, arrêtée le 2026-09-16. Elle succède au
néobrutalisme (v3), à « Tirage de nuit » (v4) et aux deux premiers états de la
direction Loto, dont l'histoire se relit dans le CHANGELOG.

## Le concept, en une phrase

Une affiche de loto de salle des fêtes, imprimée à DEUX ENCRES - le pourpre du
logo et un jaune de tirage - sur du bristol.

## Les deux plaques

| Encre | Valeur | Ce qu'elle fait |
|---|---|---|
| Pourpre | `#5B2C87` (marque), `#3B1C5A` (texte courant), `#2E1547` (encre sur aplat) | L'encre de tout ce qui s'écrit, et le fond de nuit du thème sombre |
| Jaune | `#F2C230` (clair), `#F5CC3A` (sombre) | Ce qu'on presse et ce qu'on tire : bouton, pion, sélection, aplat |

**La règle qui gouverne le reste.** Le jaune ne peut pas servir d'encre sur le
papier : mesuré, `#F2C230` sur le bristol chamois donne 1,35:1. Le jaune est
donc toujours un APLAT, jamais une lettre posée sur le papier. L'encre d'accent
(`orange-ink`) BASCULE avec le fond - violet sur le papier, jaune sur la nuit.
C'est ce que fait une presse deux couleurs quand le support change de teinte.

Corollaire : ce qui est écrit sur un aplat jaune l'est en pourpre profond
(`sur-surimpression`), dans les trois thèmes, parce que l'aplat, lui, ne
bascule pas.

## Quelle encre sur quel écran

| Écran | Pourpre | Jaune |
|---|---|---|
| Accueil | nom d'affiche, encre des champs, tampon de la tablée | pions numérotés, bouton « Pousser la porte », second passage décalé du nom |
| Hub | numéros de lot (violet sur papier), titres, filets des cases | bouton « Lance la soirée », pastille « Jouer » |
| Panneau Borderland | fond du panneau (`depth`) | accent et bouton dans le panneau |
| Fiche de score | bandeau d'en-tête de colonnes, filets, chiffres | soulignement du meneur, rang du meneur, anneau de focus (sombre) |
| Règles d'un mode | titre d'affiche, filets des étapes | pions numérotés |
| Paywall | bandeau pourpre de l'en-tête | accent et sceau dans le bandeau |
| Ticket de l'addition | encre du ticket | néant : le ticket est un objet physique, papier crème et encre sombre |
| Cartes à jouer | encre des figures | néant : une carte garde ses pips rouges, c'est un objet |

## Les cinq règles, non négociables

1. **Deux encres.** Le pourpre écrit, le jaune se presse. Rien d'autre, sauf
   les objets physiques (ticket, carte à jouer) qui gardent leurs couleurs.
2. **Aucune ombre douce, aucun dégradé, aucun flou.** L'élévation est un trait
   de contact d'un point qui disparaît à l'appui.
3. **Angles francs.** Seuls le pion de tirage et la carte à jouer sont ronds.
4. **Un libellé s'imprime une fois**, en tête de colonne, jamais sous chaque
   nombre.
5. **La couleur ne porte jamais seule le sens.** Chaque état porte aussi une
   icône, un libellé ou une marque.

## Typographie

| Rôle | Police | Note |
|---|---|---|
| Affiche, titres, numéros | **Big Shoulders Display** | grotesque condensée ; tient un libellé de colonne lisible en 16 points dans une colonne étroite |
| Corps, interface | **Chivo** | vrais chiffres tabulaires, c'est la raison du choix |
| Ticket de l'addition | **Space Mono** | élément signature, réservé à cet écran |

**Plancher de lisibilité : 14 points.** Aucun texte à l'écran ne descend en
dessous, y compris les libellés de colonne et les légendes. Le balayage continu
le vérifie à chaque largeur.

## Les classes d'écran

Bacchana ne se met pas à l'échelle : chaque classe a sa composition. Les seuils
ne sont pas choisis au confort, ils viennent de la référence
`~/.claude/design/classes-ecrans.md`, section 10, dont la règle est qu'un seuil
se pose dans un TROU de largeurs réelles. Un seuil posé sur une largeur peuplée
fait basculer la moitié des appareils d'un côté et l'autre moitié de l'autre.

**Quatre classes changent la composition.**

| Classe | Seuil | Composition |
|---|---|---|
| **Téléphone** | < 600 | Une colonne. La feuille de score se réduit à rang, prénom, parties, ardoise. Le règlement et l'action tombent sous la feuille, donc dans le pouce. Le nom d'affiche est fluide (`clamp`) pour tenir dès 320. |
| **Pliant ouvert, tablette portrait** | 600 (`pliant`, trou 572-625) | Même colonne unique, mais la colonne des palmes réapparaît et les corps grandissent. |
| **Deux colonnes** | 860 ET hauteur >= 600 (`deuxcol`) | La feuille occupe la colonne large, le règlement et l'action passent dans une colonne latérale. |
| **Téléviseur** | `hover: none` et `pointer: coarse` au-delà de 1240, ou >= 2000 (`tv`) | On lit à trois mètres. Titre à 112 points, chiffres doublés, notes secondaires retirées, marges écartées des bords que le téléviseur rogne. Contenu borné à 2200 points : au-delà on ajoute de la marge, pas de la ligne. |

**Le seuil de 860 ne se pose jamais seul**, et c'est le point le plus important
de la référence. À cette largeur cohabitent deux choses sans rapport : un pliant
ouvert ou une tablette en paysage, qui ont de la hauteur, et un téléphone
tourné, qui n'en a pas. D'où la condition de hauteur. L'iPhone Duo ouvert
(890 x 626) passe à deux colonnes ; un iPhone tourné (844 x 390) garde sa
colonne unique.

**Le téléviseur ne se déduit pas d'une largeur.** Un téléviseur connecté rend en
1920 ou en 1280, largeurs que partagent un bureau 1080p et un portable : un
seuil à 1920 rangerait tous les ordinateurs de bureau dans le salon. On teste
donc l'entrée - pas de survol, pointeur grossier - et on garde le très grand
écran comme second cas.

**Ce qui partage une composition, et pourquoi.** Le petit téléphone (320-359),
le téléphone standard (360-399) et le grand téléphone (400-440) partagent la
colonne unique : même usage, un écran tenu en main, un seul objet à la fois ;
seule l'échelle fluide change. L'écran de couverture d'un pliant (323-466) et la
fenêtre partagée d'un iPad (320-981) retombent sur la classe de leur largeur,
sans cas particulier. Le portable, le bureau et l'ultra-large partagent la
composition à deux colonnes, bornée à 2200 points pour ne jamais étirer une
ligne de texte. Le zoom à 400 % équivaut à un viewport de 320 points, déjà
couvert par le plancher du balayage.

**Ce qui ne change pas la mise en page mais change le rendu.** Le mode installé
ajoute les encoches, reprises par `pt-safe` et `pb-safe`. Le pointeur grossier
supprime les survols (`hoverOnlyWhenSupported`). Le mouvement réduit conserve
les fondus et retire les déplacements.

**Le cas du pliant, et sa limite honnête.** Safari n'expose ni Viewport Segments
ni Device Posture : aucune API web ne dit qu'un iPhone Duo est plié. L'état ne
se déduit donc pas de la largeur seule, il se lit au rapport d'aspect - ouvert,
l'écran fait 1,42:1, il est plus LARGE que haut. La condition de hauteur du
seuil `deuxcol` capte ce cas sans prétendre détecter la pliure. Les valeurs de
viewport du Duo (466 x 678 plié, 890 x 626 ouvert) sont des calculs de bases
tierces et non des mesures : l'appareil n'est pas livré, et la référence les
range parmi les nombres non sourcés (section 13). Elles sont traitées comme
non vérifiées, ce qui est la raison pour laquelle les poses voisines sont
testées elles aussi plutôt que ce seul couple de nombres.

## Trois thèmes

`:root` (clair, papier), `[data-theme='dark']` (la salle lumière éteinte, fond
pourpre, thème de référence), `[data-theme='daltonien']`. Le troisième n'invente
pas d'autres teintes : il écarte les mêmes en luminosité. Les 93 paires de
contraste sont vérifiées dans les trois par `npm run check:contrast`.

## La fiche de score

Elle part de deux objets réels, pas de souvenirs : la **feuille de marque** des
jeux de cartes français (prénoms en tête de colonnes, une ligne par manche,
total en bas) et l'**ardoise** du cafetier, qui a donné son nom au compte ouvert
au client. D'où les colonnes réglées, le libellé imprimé une seule fois, la
ligne de total, et le meneur souligné plutôt que repeint - sur une feuille tenue
à la main, on souligne.
