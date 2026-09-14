# `scripts/` - ce qui garde, ce qui outille, ce qui dessine

Trente-sept fichiers vivaient ici a plat, sans qu'aucun nom ne dise s'il
verrouille quelque chose, s'il fabrique un livrable, ou s'il n'a servi qu'une
fois lors d'une migration. Ils sont desormais ranges par ROLE, parce que c'est
la seule question qu'on se pose en arrivant : « est-ce que ce fichier m'empeche
de casser quelque chose, ou est-ce qu'il produit quelque chose ? »

## `gardes/` - elles disent non

Des controles qui rendent un code de sortie non nul. Chacune porte, en tete de
fichier, le DEFAUT REEL qu'elle verrouille et - tout aussi important - ce
qu'elle ne voit pas. Une garde sans cette section finit par etre prise pour une
preuve qu'elle n'apporte pas.

| Garde | Ce qu'elle refuse | En CI |
|---|---|---|
| `check_contrast.mjs` | Une paire encre/fond sous le seuil WCAG AA | oui |
| `check_contrast_visual.mjs` | Les memes paires, mesurees a l'ecran | non (navigateur) |
| `check_alcohol_lexicon.mjs` | Un terme d'alcool dans le code (Apple 1.4.3) | oui |
| `check_tile_ink.mjs` | De l'encre thematique sur un aplat invariant | oui |
| `check_entree.mjs` | Du contenu de jeu dans le morceau de demarrage | oui |
| `check_fichiers_confidentiels.mjs` | Un document qu'on ne voulait pas publier | oui |
| `check_supply_chain.mjs` | Une dependance compromise (ChainDrop) | oui |
| `check_contenu.mjs` | Les defauts de fabrication des cartes | non |
| `check_accents.mjs` | Un accent manquant dans du texte affiche | non |
| `check_typo_fr.mjs` | Une ponctuation double collee, un vouvoiement | non |
| `check_icons.mjs` | Une icone sans fichier, un orphelin, un ecusson | oui |
| `verif_garde_icones.mjs` | Que `check_icons` reste vert sur six regressions | non (lent) |
| `check_defilement.mjs` | Une coupe qui interdit le defilement de la racine | oui |
| `check_sequenceur.mjs` | Un mode sans les attributs de « Lance la soiree » | non |
| `check_boot_js.mjs` | Du JavaScript inutile demande au demarrage | non (navigateur) |

Les gardes hors CI le sont parce qu'elles demandent un navigateur ou plusieurs
minutes. Ce n'est pas une hierarchie de valeur : `check_contenu` a attrape 240
cartes qui commencaient par les memes quatre mots.

## `outils/` - ils fabriquent

Rien ici n'echoue en cas de probleme de code : ces scripts produisent un
fichier, une image, une mesure, ou peuplent un service.

- `sync-content.mjs` : rapatrie les paquets depuis `bacchana-content`, ecrit le
  manifeste et les cartes. **Verifie la source AVANT de faire le menage.**
- `amorce_app.mjs` : l'etat local minimal (porte d'age, consentement, intro)
  pour qu'un navigateur pilote atteigne l'application. Importe par tous les
  scripts qui l'ouvrent.
- `audit_navigateur.mjs`, `parcours_navigateur.mjs` : mesures sur les vrais
  ecrans (LCP, CLS, debordement, cibles tactiles, alignement).
- `apercu_ticket.mjs`, `nuancier.mjs`, `gen_design_tokens_doc.mjs` : livrables
  visuels et documentaires.
- `fetch-fonts.mjs`, `generate-icons.js`, `vendor_phosphor.mjs` : rapatriement des
  polices et des icones. Zero CDN, tout est servi depuis `public/`.
- `posthog-setup.mjs` : pousse les insights de `docs/posthog/insights.json`.
- `build_fig.py`, `gen_pen.py`, `pen_core.py` : outillage de migration, garde
  pour memoire.

## `maquettes/` - elles dessinent

`gen_maquette.py` assemble les planches SVG a partir des lots. Les jetons sont
LUS dans `src/styles/tokens.css` : une maquette avec ses couleurs recopiees a la
main derive des la premiere correction, et une reference qui ment coute plus
cher que pas de reference.

## `animations/`, `visual-contrast/`, `lib/`

Modules partages, deja groupes avant ce rangement : les visuels de lancement,
les scenarios de l'audit de contraste, et la lecture des jetons de couleur.
