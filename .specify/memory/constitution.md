<!--
Sync Impact Report
Version change: aucune (document non ratifie) -> 1.0.0
Modified principles: aucune, adoption initiale
Added sections:
  - Core Principles, cinq principes, deux marques NON NEGOCIABLE
  - Contraintes produit et techniques
  - Flux de developpement et portes qualite
  - Governance
Removed sections: aucune
Templates requiring updates:
  - .specify/templates/*.md : non modifies, ils lisent la constitution a l'execution
Follow-up TODOs: aucun. Les cinq principes ne sont pas inventes ici, ils sont
extraits de decisions deja prises et deja outillees dans le depot : la garde
check:alcohol, la promesse affichee dans index.html, la note du README sur
l'univers narratif, et la section du todo intitulee "Gardes ajoutees, toutes vues
rouges avant d'etre crues".
-->

# Constitution de Bacchana

Bacchana reunit 13 jeux de soiree dans une seule application. Un telephone passe
de main en main autour d'une table, dans une piece bruyante et mal eclairee, a une
heure tardive. Tout ce qui suit decoule de cette scene.

## Core Principles

### I. Conformite aux stores par construction (NON NEGOCIABLE)

Le contenu ne nomme pas l'alcool. Les gages, les regles et les textes affiches
parlent de la soiree, du jeu et de la tablee, jamais de la boisson. Une garde
automatisee, `npm run check:alcohol`, fait echouer l'integration continue sur un
terme du lexique.

Cette contrainte s'applique aussi aux visuels, aux fiches de store et aux
captures. Un element graphique qui evoque explicitement la consommation d'alcool
est un risque de rejet, pas un choix esthetique neutre.

Rationale : la guideline Apple 1.4.3 et la classification Play sanctionnent
l'incitation a la consommation. Un rejet coute des semaines et se decouvre au
moment de la soumission, c'est a dire trop tard pour negocier. La contrainte est
donc verifiee en continu et non a la fin.

### II. L'univers narratif ne se renomme pas (NON NEGOCIABLE)

La taverne, le comptoir, le taulier, la tablee, la penalite. Ce vocabulaire est le
decor du jeu, pas le nom du produit. Le produit a change de nom cinq fois, le
decor jamais.

Aucun renommage de marque ne touche ce registre. Un remplacement global du mot
taverne dans le depot est interdit : il viderait la marque de sa substance et
casserait, au passage, les cles de stockage historiques dont depend la migration
des donnees des utilisateurs existants.

Rationale : le caractere francais et l'univers assume sont ce qui distingue
Bacchana d'un clone americain. C'est ecrit dans `docs/BRAND.md` et rappele dans le
README.

### III. Un telephone, une table, une piece sombre

Chaque ecran est concu pour etre lu a bout de bras, par plusieurs personnes a la
fois, dans une lumiere faible et avec du bruit. Les consequences sont concretes :
typographie large, contrastes forts, aucune information critique en petit, aucune
interaction qui exige de la precision, aucun texte qui demande d'etre lu en
silence.

Le telephone tourne. L'application ne suppose jamais qu'une seule personne la
tient du debut a la fin de la soiree.

### IV. Hors ligne, sans compte, sans publicite, achat unique

L'application fonctionne integralement sans reseau. Elle ne demande pas de compte.
Elle n'affiche pas de publicite. Le premium est un achat unique a vie, jamais un
abonnement.

Ces quatre promesses sont affichees publiquement dans la fiche du produit. Toute
fonctionnalite qui en romprait une exige d'abord de changer la promesse, ce qui
est une decision de marque et non une decision technique.

### V. Une garde doit avoir ete vue rouge

Toute garde ecrite pour verrouiller un invariant DOIT etre validee en introduisant
volontairement la regression qu'elle pretend attraper, et en constatant l'echec,
avant d'etre acceptee verte.

Chaque garde documente ce qu'elle NE voit PAS. Une garde dont on surestime la
portee fait cesser de regarder, ce qui est pire que pas de garde.

Rationale : ce depot en compte cinq, contraste, lexique alcool, chaine
d'approvisionnement, aplats, icones. Elles ont toutes ete vues rouges, et
plusieurs defauts n'ont ete trouves que par regression volontaire, aucun par
relecture.

## Contraintes produit et techniques

**Interface** : React 19, Vite, TypeScript, Zustand. Application web progressive
installable. Neobrutalisme, papier creme, encre noire, aplats pop, ombres dures.
Le design system courant vit dans `design-system/bacchana/MASTER.md`, l'archive de
l'ere precedente sous `design-system/_archive/`.

**Aucun CDN.** Polices et icones rapatriees en local. Une application qui promet le
hors ligne ne peut pas dependre d'un service distant pour s'afficher.

**Accessibilite** : contrastes verifies par garde, cibles tactiles genereuses,
mode sombre. Le principe III rend ces exigences plus strictes que la moyenne, pas
moins.

**Migration des donnees** : les prefixes de stockage historiques, `blackout-`,
`la-tournee-`, `la-taverne-`, `meskova-`, sont conserves dans la chaine de
migration. Les supprimer ferait perdre leurs donnees aux utilisateurs installes de
longue date.

**Contenu** : les paquets de jeux vivent dans le depot `bacchana-content` et sont
synchronises. Ils sont valides par un script avant publication.

## Flux de developpement et portes qualite

**Jamais de commit direct sur la branche principale.** Branche, pull request,
integration continue verte, puis fusion.

**Preuve avant termine.** Build vert, tests verts, gardes vertes, ou verification
en production. Une declaration ne remplace pas une execution.

**Documentation dans le meme lot.** Toute pull request touche au moins le README
ou le CHANGELOG. La version semver suit les fonctionnalites livrees. Les entrees
de changelog anterieures ne se reecrivent jamais : elles racontent les faits au
moment ou ils ont eu lieu.

**Code mort supprime.** `npm run check:dead-code` fait foi. L'outil est configure
pour connaitre les points d'entree reels, sans quoi il classait les gardes
elles-memes en fichiers inutilises.

**Zero faute de francais** dans les chaines visibles, accents compris.

## Governance

Cette constitution prime sur toute autre pratique du projet. En cas de conflit
entre un delai, une preference esthetique ou une facilite technique et l'un des
principes ci-dessus, le principe l'emporte.

**Procedure d'amendement.** Un amendement se propose par pull request modifiant ce
fichier, avec un rapport d'impact en tete. Un amendement touchant un principe
marque NON NEGOCIABLE exige une justification ecrite de ce qui a change dans le
contexte reglementaire, de marque ou de store.

**Politique de versionnage.** MAJEUR pour un retrait ou une redefinition
incompatible d'un principe. MINEUR pour un principe ou une section ajoutee.
CORRECTIF pour une clarification sans effet semantique.

**Revue de conformite.** Le principe I est couvert par une garde automatisee. Le
principe V l'est par la revue de chaque garde ajoutee. Les principes II, III et IV
se verifient a la revue humaine : aucune garde ne peut prouver qu'un ecran est
lisible a bout de bras dans une piece sombre.

Le detail operationnel vit dans le depot : `docs/BRAND.md` pour la marque,
`design-system/bacchana/MASTER.md` pour l'interface, `tasks/todo.md` pour l'etat
courant.

**Version**: 1.0.0 | **Ratified**: 2026-08-14 | **Last Amended**: 2026-08-14
