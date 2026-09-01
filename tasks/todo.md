# Bacchana (ex-Bacchus, ex-La Taverne) / BLF Lab's - checkpoint de session

## Session 2026-09-01 - refonte UX, animations de lancement, audit du poste

Worktree `.claude/worktrees/bacchana-refonte-ux`, branche
`fix/mode-actif-et-marqueurs`, PR #130 ouverte.

**Pourquoi ce checkpoint existe.** Cette session a ete coupee quatre fois, dont
une par une erreur serveur en pleine reponse et une par la limite de session.
Une coupure ne se previent pas depuis le poste : elle vient de l'API. Ce qui se
previent, c'est qu'elle COUTE quelque chose. Tout ce qui suit est ecrit ici pour
qu'une reprise n'ait rien a re-deriver.

### Livre et prouve

- [x] **Egalite parfaite au palmares.** `rangsPalmares` et `meneursExAequo`
      dans `src/stores/palmaresStore.ts` : rangs PARTAGES facon classement
      sportif, 1 / 1 / 3. L'ecran sacrait le premier dans l'ordre ALPHABETIQUE,
      parce que `classementPalmares` departage en dernier recours sur le prenom
      et que l'ecran numerotait `index + 1`. L'aplat ambre va desormais a tous
      les meneurs, le rang s'affiche `=1`, et une phrase nomme l'egalite.
      Vue rouge d'abord : 6 echecs sur 10, puis 11 tests verts.
- [x] **Suite complete verte** : 400 tests, 45 fichiers, `tsc -b` propre.
- [x] **Les affiches annoncaient « Treize jeux »**, le registre en declare 14
      (13 tuiles au hub plus Borderland lance a part). Corrige dans Figma.
- [x] **Moteur d'animation, image par image.** `scripts/animations/`, trois
      modules : `marque.mjs` (palette, geometrie reprise de `public/icon.svg`,
      TOUS les textes en donnees), `scenes.mjs` (trajectoires continues),
      `rendu.mjs` (Playwright echantillonne, ffmpeg encode). `npm run anim:rendu`.
      1080x1920 a 60 i/s, H.264, son AAC. Six visuels : jour-j, affiche du fil,
      teaser, la carte, et trois compte a rebours.
      Un prototype Figma a ete abandonne pour ca : il re-rasterise un vectoriel
      de 2800 px a chaque trame sans horloge fixe, et Instagram ne prend pas un
      prototype.
- [x] **Bruitages synthetises** dans `bruitage.mjs`, aucun droit engage.

### Deux pieges qui ont coute du temps, a ne pas refaire

1. **Une garde qui multiplie par zero ne protege pas d'un NaN.**
   `between(t,a,b) * pow((t-a)/(b-a), 2.2)` : avant `a` la base est negative,
   `pow` rend NaN, et `0 * NaN` vaut NaN. ffmpeg refusait tout le flux avec
   « Input contains (near) NaN » sans dire ou, et l'erreur visible etait un
   `write EOF` cote Node qui masquait la vraie cause. Le temps local est
   desormais BORNE dans chaque evenement, pas seulement fenetre autour.
2. **Une expression ffmpeg doit etre quotee.** Elle contient des virgules, et
   ffmpeg s'en sert pour separer les filtres d'une chaine. Sans quotes,
   `between(t,0.06,0.62)` devient trois filtres et le graphe ne s'ouvre pas.

### Lancement decale au 12 novembre 2026

Adam a tranche le 01/09 : communaute d'abord, la date se decale s'il le faut.
Deux stories et un reel par semaine, sur Instagram et TikTok.

La contrainte qui commande tout : Play impose aux comptes personnels crees
apres le 13/11/2023 un test FERME de 12 testeurs pendant 14 jours consecutifs,
puis jusqu'a 7 jours de revue d'acces a la production. Le test INTERNE ne
compte pas. Au 15 octobre il n'y avait aucune marge. **Verifier d'abord si le
compte Play est un compte organisation ou anterieur au 13/11/2023 : dans ce
cas l'obligation tombe et 21 jours disparaissent du chemin critique.**

Le plan complet, dix semaines, dix scripts de reels avec leurs crochets, la
voie technique datee et les trois mesures qui comptent : page Notion « Plan de
lancement communautaire », enfant de la page projet Bacchana. Dix taches datees
creees dans la base Tasks.

### Compte Instagram bacchana_fr, mis en marque le 01/09

Fait : photo de profil = `public/icon.svg` rendu en 1080 carre, nom
« Bacchana | Jeux de soiree », bio a 142 caracteres sur 150.

Pas faisable depuis le web, a finir dans l'application mobile :
- le lien de la bio, la page l'annonce elle-meme
- la bascule en compte professionnel, categorie Produit/service, essayee deux
  fois et jamais appliquee. Elle conditionne l'acces aux statistiques, donc la
  mesure de retention a 3 secondes sur laquelle repose le plan.

### La tablee est de 2 a 8, pas de 4 a 8

Signale par Adam le 01/09. Les visuels annoncaient « 4 A 8 » alors que le
registre declare `minPlayers: 2` sur la majorite des modes et que l'ecran de
saisie affiche « Minimum 2 joueurs, maximum 8 ». Corrige partout, bio
Instagram comprise, et une garde `verifierLaTablee` confronte desormais
l'affiche aux DEUX sources du code a chaque rendu.

C'est la deuxieme fois qu'un chiffre recopie a la main ment sur une affiche
publiee, apres « Treize jeux » pour quatorze. Les deux sont maintenant tenus
par une garde.

### TROIS CONCLUSIONS QUI CHANGENT LE PLAN (audit marche du 01/09, 12 enquetes)

Le plan communautaire ecrit plus haut a ete mis a l'epreuve. Trois hypotheses
cassent, et elles sont classees FATALES par la passe adverse. A trancher avant
le 8 septembre.

**1. Le marche n'est pas celui qu'on croyait, et personne n'y fait payer le
telechargement.** Bermuda et Paco n'existent pas sur l'App Store francais. Les
vrais concurrents sont Vakarm (49 034 avis), Picolo (46 646), Action ou Verite
de Chouic (35 776), Insight (15 313), TOZ (14 091), JUDUKU (9 979). Les SEIZE
applis du marche sont gratuites au telechargement et vivent d'abonnements.
Picolo vend deja un achat unique a 9,99 EUR, soit 3 EUR sous Bacchana, avec 5
millions de telechargements. Un mur de paiement a l'installation place donc
Bacchana hors du comportement d'achat de sa categorie.
*Proposition de la passe adverse : ouvrir GRATUIT du 12 novembre au 20 decembre,
quatorze jeux, zero mur, et ne mesurer qu'une chose, le nombre de parties
terminees par installation. Vendre ensuite, sur une preuve d'usage.*

**2. La contrainte alcool touche l'ORGANIQUE, pas seulement le payant.** La
Branded Content Policy de TikTok, publiee le 04/08/2026 et effective le
31/08/2026, range dans la categorie Alcohol les « drinking accessories or
games » ET les « no-alcohol alternatives ». Purger le vocabulaire de la fiche
de store, comme le fait Insight, rouvre la publicite mais ne rachete rien cote
distribution organique. Tout le plan de contenu repose sur cette hypothese, et
personne ne l'avait verifiee.

**3. La cadence hebdomadaire n'est pas tenable, et le depot le prouve.** Le
CHANGELOG porte 78 versions publiees sur 10 journees distinctes entre le 14
avril et le 31 aout : le rythme reel d'Adam est en RAFALES, jamais en cadence.
*Proposition : supprimer la cadence, la remplacer par trois blocs de production
de deux jours, dates maintenant - 19 et 20 septembre, 17 et 18 octobre, 7 et 8
novembre - chacun produisant dix pieces tournees, montees et programmees d'un
seul geste.*

Dossier complet : Bureau, `Bacchana - lancement/7 - Strategie`.

### Contenu produit le 01/09

- **63 scripts video** en un fichier Markdown chacun, Bureau, `6 - Scripts
  video`, ranges par angle, avec un « 00 - A tourner en premier ». Vingt sont
  en FACE CAMERA, Adam seul, ce qui supprime la contrainte de reunir une
  tablee pour tourner.
- **4 demonstrations du vrai produit**, `1 - Demonstrations`. Le produit tourne
  reellement dans un chassis de telephone : hub aux quatorze jeux, Tu preferes,
  le chronometre de 7 Secondes, les regles. Elles sont MUETTES a dessein, la
  voix ou la musique de plateforme passe dessus.

### Ouvert

- [ ] « Pas de tableau de bord sur les pages qui ne menent a rien » : la demande
      est ambigue, deux lectures possibles. Le palmares est le seul tableau de
      bord non cliquable identifie. A trancher avec Adam.
- [ ] Plan de lancement date au 15 octobre 2026. Le workflow a rendu 4 enquetes
      sur 6 avant la limite de session : Play Store, App Store, reseaux, droit
      francais. Sortie complete dans le fichier de tache `wv21ztv66.output`.
      **Fait dur a retenir** : Play impose aux comptes personnels crees apres le
      13/11/2023 un test FERME de 12 testeurs pendant 14 jours consecutifs, puis
      une revue d'acces a la production de 7 jours. Le test interne ne compte
      pas. C'est le chemin critique du lancement.
- [ ] Audit d'infra du poste, en cours en fond.

## Session 2026-08-13 - finition renommage Bacchana sur les 3 depots

Branche `feat/rename-bacchana` sur les 3 depots (`Adam-Blf/bacchana`,
`Adam-Blf/bacchana-site`, `Adam-Blf/bacchana-content`). Point de depart :
depots GitHub deja renommes cote Adam, remotes locaux encore sur les anciens
noms, gros du texte visible deja bascule par les sessions precedentes.

### Livre, ce depot (web)

- [x] Remote `origin` -> `Adam-Blf/bacchana.git`, verifie par `git fetch`
- [x] `package-lock.json` resynchronise sur `package.json` (name `bacchana`
      aux deux emplacements ; le mismatch faisait echouer `npm ci` en EUSAGE)
- [x] `design-system/bacchana/maquette-bacchana.svg` regenere (remplace
      `maquette-bacchus.svg`), zero occurrence BACCHUS residuelle
- [x] Commentaires SVG `public/`, `tailwind.config.js`,
      `scripts/generate-icons.js` passes en Bacchana. Le chemin vers le
      dossier Xcode du depot voisin `bacchus-ios` reste volontairement
      `Bacchus` (dossier reel jamais renomme, ce depot est hors perimetre) -
      documente en commentaire pour eviter une re-casse
- [x] `migrateStorage.test.ts` etendu : `it.each` sur les 5 prefixes
      ancetres (consent + anon-user-id RevenueCat) jusqu'a `bacchana-`, plus
      cas d'idempotence sur le 6e nom. Vu rouge (13 echecs) en retirant le
      maillon bacchus->bacchana, vert (21 tests) restaure
- [x] Entitlement RevenueCat verifie : `PREMIUM_ENTITLEMENT_ID` est deja
      `Bacchana Pro` depuis le 2026-08-06 (commit c50cb95), meme pattern que
      chaque renommage precedent (recreation apres verification API zero
      produit attache, CHANGELOG L.393). Aucune action requise.
- [x] Verification finale : `tsc --noEmit` vert, `vitest run` 233/233,
      `build` vert, les 4 gardes vertes (contrast 42/42, tile-ink 37
      fichiers, alcohol 88 fichiers, supply-chain conforme). Grep final
      `git grep -i bacchus` ne rend plus que les 4 fichiers attendus :
      `migrateStorage.ts`/`.test.ts` (cles historiques, exclusion explicite
      du sujet), `generate-icons.js` (chemin reel vers `bacchus-ios`),
      `tasks/todo.md` (journal, ce fichier)

### A la reprise, ailleurs

- [x] Renommer les 3 depots GitHub `bacchus*` -> `bacchana*` (deja fait cote
      Adam avant cette session, remotes locaux mis a jour ici)
- [x] `bacchus-content` : la pile `#35 -> #36 -> #37` etait deja mergee sur
      main au moment de cette session (verifie par `git log`)

### Note - travail concurrent sur ce meme repertoire

Un autre processus/session a modifie ce meme repertoire de travail en
parallele (memes fichiers, meme plan : commentaires de marque, regeneration
de la maquette, tests table-driven). Dans l'ensemble correct, sauf le chemin
Xcode `bacchus-ios` reecrit en `Bacchana` par erreur - corrige deux fois
(voir ci-dessus). Commits de cette session sur `feat/rename-bacchana` :
`ae3a726`, `e9caec5`, `4f96c53`, plus le reste de l'etape 3/4 qui suit.

## Session 2026-08-06 (soir) - icones SVG, renommage Bacchana, Borderland

Branche de travail : `feat/icons8-iconography` sur `Adam-Blf/bacchus`
(worktree `.claude/worktrees/icons8`). Build, 222 tests et 4 gardes verts.

### Livre, en PR ouvertes

| Depot | PR | Contenu |
|---|---|---|
| bacchus | [#95](https://github.com/Adam-Blf/bacchus/pull/95) | Icones Icons8 SVG, 13 tuiles raccordees, renommage Bacchana, mode Borderland, gardes |
| bacchus | [#96](https://github.com/Adam-Blf/bacchus/pull/96) | Francais des pages legales, compteur de joueurs |
| bacchus-ios | [#23](https://github.com/Adam-Blf/bacchus-ios/pull/23) | **Bundle ID** `com.beloucif.bacchana` |
| bacchus-android | [#36](https://github.com/Adam-Blf/bacchus-android/pull/36) | **Package** `com.beloucif.bacchana` |
| bacchus-content | #35, #36, #37 | Empilees, rebasees sur main, CI a relancer |

Merges deja faits : `bacchus-content#34` et `bacchus-site#12` (domaine mort).

### Decisions actees ce jour

| Sujet | Decision | Motif mesure |
|---|---|---|
| Style d'icones | **iOS 27 Filled** | Planche comparative : le contour iOS perd 17/17 traits sous 2 px au rendu 20 px, la coche du bouton valider disparait. Le plein en perd 12, Forma 8. Catalogue 10 662 contre 3 054. |
| Format | **SVG**, plan Icons8 paye | Supprime toute la classe des defauts de downscale |
| Mode carte | **Borderland** | Annule le renommage en « Le Coupe-Gorge » |
| Produit | **Bacchana** | Sur les 3 depots de code, bundle ID et package inclus |
| Icone roue | Icons8 « Roulette » | La roue a rayons se lisait comme une barre de bateau |
| Marqueur premium | Icone `cadenas` | Le sceau de cire `WaxSeal` est supprime |

### Defauts trouves et corriges

- **`pique` livrait une beche de jardin.** L'icone Icons8 s'appelle "Spade", le
  nom correspondait, le dessin non. C'etait la tuile du mode carte principal.
- **Six epingles etaient etrangeres au style.** Un identifiant Icons8 appartient
  a un seul style et l'URL de telechargement ne prend que l'identifiant : apres
  la bascule elles ramenaient des filets fins dans un jeu plein, sans erreur.
- **Un `<button>` dans un `<button>`** sur la tuile vedette, signale par React a
  chaque rendu. Les deux controles de regles sont maintenant freres de leur tuile.
- **Le Hub tournait sur un 3e jeu d'icones** (PNG Hatch dans `public/icons/modes`,
  clefs en noms de composants lucide). Supprime.
- **Le sceau premium estampait un `M`** herite de Meskova, affiche 4 fois.
- **Le brand book decrivait une grappe de raisin jamais livree.** L'asset reel
  n'a jamais cesse d'etre les deux verres qui trinquent.
- `hors-ligne` dessinait des barres de signal, donc la presence de reseau.

### Gardes ajoutees, toutes vues rouges avant d'etre crues

- `verifier_epingles` : enseignes epinglees, et epingles au style courant.
- Controle de sous-categorie `card-suits` : le seul controle qui porte sur le
  DESSIN. Devenu possible quand l'API SVG a expose la sous-categorie.
- `npm run check:icons` : fichiers presents, zero lucide, un seul style.
- `scripts/verif_gardes_icones.py` rejoue les 11 regressions et exige l'echec.
- 3 tests de migration `bacchus-*` -> `bacchana-*`, vus rouges sans le maillon.

### Reste a faire, code

- [ ] Merger la pile `bacchus-content` (#35 -> #36 -> #37), CI a relancer
- [ ] Lots 5 a 13 du plan `~/.claude/plans/reprend-l-ancien-plan-lazy-swing.md`
- [ ] Bouton « Lance la soiree » propose a l'audit produit : enchainement
      automatique des modes, pour ne plus demander un choix parmi 13 a 23h
- [ ] `bacchus-site` et `bacchus-content` n'ont pas encore le renommage Bacchana
- [ ] Renommer les depots GitHub `bacchus*` en `bacchana*`

### Bloque sur Adam

- **Rotation de la cle Icons8** : passee en clair dans le chat du 2026-08-06,
  donc sur disque dans le transcript. Elle vit dans `.env` (gitignore),
  `.env.example` la documente.
- **Passage en production** : Stripe est encore en mode Test. La lecture du
  compte live est refusee par le garde-fou de securite - action a portee
  financiere reelle, elle demande un accord explicite.
- **L'entreprise EXISTE.** Correction du 2026-08-06 : la formalite INPI est
  validee par l'INSEE et l'URSSAF depuis le **04/08/2026**. SIREN **108386855**,
  SIRET 10838685500010, APE 6201Z, entrepreneur individuel. Les mentions legales
  de l'app les portent deja. Les checkpoints precedents annonçaient un brouillon
  non signe : c'etait faux, et ca a servi a repousser l'activation de Stripe.
  **Plus rien ne bloque la verification d'identite Stripe.**
- **Restent a acheter** : compte Apple Developer (99 $/an) et Play Console
  (25 $). Sans eux, RevenueCat ne peut pas creer de produits, puisque les
  applications n'existent pas encore dans les stores.
- **RevenueCat n'est PAS vide.** J'ai ecrit le contraire une heure plus tot,
  c'etait faux : le tableau de bord ouvre la page de creation par defaut, ce qui
  ressemble a un compte vide. Le selecteur « All projects » liste **Bacchus, La
  Taverne, La Tournee, Let Me Cook, Meskova**. Creer un projet « Bacchana »
  aurait fait un doublon et orpheline les produits existants. Le projet a donc
  ete **renomme** : `proj896fa1e2`, desormais nomme **Bacchana**. Son vrai
  identifiant est `896fa1e2`, et non `2b8d469c` comme l'annonçaient les
  checkpoints precedents.
- **Les 3 projets morts** (La Taverne, La Tournee, Meskova) restent a supprimer,
  ainsi que les entitlements orphelins qu'ils portent.

### Configure ce jour dans les tableaux de bord

| Service | Etat |
|---|---|
| RevenueCat | Projet renomme **Bacchana** (`proj896fa1e2`). Cle SDK publique « Test Store » recuperee. Aucune cle secrete existante. |
| Sentry | Organisation `blf-labs`, projet renomme `bacchus` -> **`bacchana`**. DSN recupere. Le slug n'est reference par aucun script de build, seul le DSN l'est, et il porte l'identifiant numerique du projet. |
| PostHog | Projet 238190 EU, cle publique de projet recuperee. |
| Stripe | Toujours en **mode Test**. |

Les trois cles PUBLIQUES sont dans `.env` (gitignore). Les cles SECRETES n'ont
volontairement pas ete recuperees : elles ne doivent jamais transiter par un
chat ni par un transcript.
- **Anteriorite « Borderland »** : proche de **Borderlands**, franchise
  Gearbox/2K deposee en classe 9 (logiciels de jeu), soit la classe du produit.
  Risque signale, choix assume, a faire trancher par un professionnel du droit.
- Domaine `bacchana.beloucif.com` chez OVH, rotation des 3 identifiants
  d'administration.

### Pour reprendre

```
cd .claude/worktrees/icons8
npm run build && npm run test && npm run lint
npm run check:icons && npm run check:contrast && npm run check:tile-ink
python scripts/verif_gardes_icones.py
npm run dev -- --port 4311 --strictPort
```

Poste sous Windows : ni `xcodebuild` ni `gradle` ne tournent ici, les deux PR
mobiles n'ont donc **pas** ete compilees localement. Leur CI est le premier
controle reel.

---

## Session 2026-08-05/06 - neobrutalisme, icones, aplats clairs

Tout est **merge sur main et deploye**. Web `bacchus` v0.40.3, vitrine
`bacchus-site` v0.3.2, plus les icones iOS et Android.

### Le fil conducteur

Une seule question expliquait presque tous les defauts trouves : **qu'est-ce qui
depend du theme, et qu'est-ce qui n'en depend pas ?** Un fond qui reste clair
dans les deux themes - aplat pop, neon, face de carte - ne peut pas porter un
cerne ni une ombre indexes sur `--color-ink`, qui vire au creme en sombre.
Mesure : 1.21:1. C'etait le meme bug que « du blanc sur du jaune c'est
illisible », corrige la veille sur le TEXTE et jamais etendu aux bordures.

**Il existait a une trentaine d'endroits dans l'app, plus 8 dans la vitrine.**

Precision importante, trouvee par la mesure : ce qui decide n'est pas la couleur
de l'objet mais **ce que le cerne borde**. Le cerne d'une tuile borde la tuile,
donc fixe. Le cerne de la roue de la roulette borde la PAGE, qui s'inverse, donc
thematique - noir y donnerait 1.01:1 et effacerait le contour. Ne pas
« corriger » la roulette, le commentaire porte les chiffres.

### Livre

- [x] `bacchus` v0.37.1 a v0.40.3, PR #87 #88 #89 - bordures et ombres
      invariantes, sortie complete du flou (texture `.bg-hatch` a bords nets en
      remplacement), couleur des tuiles porteuse de sens par famille de jeu,
      rouge semantique, verdict du Tribunal double par la forme, recuperation
      automatique apres deploiement, fin du renommage dans 4 chaines visibles.
- [x] `bacchus-site` v0.3.2, PR #11 - report du meme correctif, plus un controle
      de derive dans sa garde de contraste, qui recopiait `tokens.css` en dur.
- [x] `bacchus-android` PR #35, `bacchus-ios` PR #22 - icones a la marque
      Bacchus. Echelle Android calculee sur le **cercle englobant minimal mesure
      sur les pixels**, pas sur la diagonale de la boite : la premiere version
      etait 21 pour cent trop petite. Verifiee sous les 3 masques de lanceur.
- [x] Garde `check:tile-ink` en CI sur l'app. **Elle a ete fausse trois fois**,
      les trois defauts trouves en la faisant echouer expres. Le dernier : elle
      s'exemptait sur le texte de son propre commentaire.

### Regle gravee

`CLAUDE.md` section 17.5bis + memoire `feedback_guards_must_fail_first.md` :
toute garde doit etre vue ROUGE sur regression volontaire avant d'etre crue
verte, et son en-tete doit dire ce qu'elle NE voit PAS. Celle de l'app est
aveugle des qu'un fond vient d'une prop ou d'une image - les 3 dos du paquet
n'ont ete vus qu'a l'ecran.

### Reste, cote Adam

- [x] **Dossier local renomme** (2026-08-14). Il s'appelle desormais `bacchana`,
      et les cinq depots sont ranges sous `Documents/Projets/BLF Labs/Bacchana/`.
      Le verrou venait d'un serveur Vite laisse en marche sur le port 4310, tue
      depuis. Les quatre autres dossiers, encore en `bacchus-*`, ont ete alignes
      sur le nom de leur depot GitHub au passage.
- [ ] **Domaine** : la prod repond encore sur `lataverne.beloucif.com`.
      Decider si un domaine au nom de Bacchana est cree (DNS OVH + domaine
      Vercel). Tant que ce n'est pas tranche, toutes les mentions du domaine dans
      la documentation restent justes et ne doivent pas etre reecrites.
- [ ] **Projet Sentry** : `docs/MONITORING.md` annonce un projet React nomme
      `la-taverne`. A verifier dans Sentry. Si le projet a ete renomme, la doc est
      fausse ; s'il porte toujours ce nom, elle est juste et il ne faut pas y
      toucher. Non verifiable depuis le depot.
- [ ] **Icone = deux verres qui trinquent**, imagerie d'alcool explicite.
      Risque reel face a la guideline Apple 1.4.3 et a la classification Play au
      moment de la soumission. Choix assume, signale au moment ou il part.
- [ ] Stripe encore en mode Test, RevenueCat a 0 produit : aucun achat ne peut
      aboutir nulle part tant que ce n'est pas bascule.
- [ ] Entitlements orphelins a supprimer dans RevenueCat : `La Tournee Pro`,
      `Meskova Pro`.
- [ ] Rotation des 3 identifiants d'administration.
- [ ] Comptes Apple Developer (99 $/an) et Play Console (25 $).
- [ ] Dossier de travail `_taverne-audit` (1,4 Mo) a supprimer.


## Session 2026-08-05 (branche fix/legal-pricing-mediation-cm2c)
- [x] v0.31.3 : écrans légaux (CGU/CGV, mentions légales, confidentialité)
  réalignés sur le pricing à vie sans abonnement (14,99 EUR + packs 2,99 EUR)
  et sur l'adhésion CM2C effective. Détail complet dans CHANGELOG.md.
- Reste : DPA à archiver avec Stripe/RevenueCat/PostHog/Vercel (note de
  suivi conservée dans ConfidentialiteScreen.tsx, section 3).

## Session 2026-08-04 (branche feat/bacchus-rebrand-dark-theme)
- [x] Renommage produit La Taverne -> Bacchus : app, manifest PWA, ecrans,
  pages legales, migration localStorage (nouvelle etape bacchus- ajoutee a
  la chaine historique), design-system/bacchus/MASTER.md (succede a
  design-system/la-taverne/MASTER.md, garde comme archive). Entitlement
  RevenueCat `Bacchus Pro` volontairement inchange (id technique non
  renommable) - seul le libelle affiche devient "Bacchus Premium".
- [x] Refonte theme sombre (retour "fait fade") : nouvelle rampe d'elevation
  a 4 paliers mesures (1.14:1/1.31:1/1.57:1 vs bg, contre 1.09-1.20:1 avant),
  alpha bordure sombre 0.20 -> 0.38, ink-muted eclairci, nouveau token
  `danger` separe de `card-red` (7 ecrans corriges), animation glow-pulse
  morte supprimee. Documentation complete : docs/DESIGN_TOKENS.md (pour
  portage Android/iOS).
- [x] v0.31.0 : 165 tests Vitest verts, build + lint verts.
- Reste cote Adam : decider si un domaine bacchus.beloucif.com est cree ou
  si lataverne.beloucif.com reste le domaine technique (references legales
  et manifest laissees inchangees dans cette session, pas de DNS touche).

## Session 2026-08-04 (branche feat/survey-pricing-blf-labs)
- [x] Étude bêta n=16 : docs/ETUDE_BETA_2026-08.md (pricing 14,99 lifetime,
  abos supprimés, packs 1,99, features priorisées, outils gratuits)
- [x] Rebrand studio BLF Lab's : STORE_ACCOUNTS.md (ex-ABEL LABS), BRAND.md
  (section éditeur + pricing révisé), MASTER.md, STORE_LISTING.md (champ
  développeur), LICENSE, README, package.json (author), index.html (meta)
- [ ] Écrans manquants (agent en cours) : règles des 13 modes, onboarding,
  fin de session Criée/Roue/Tu préfères
- [ ] Fixes bugs P0/P1 (rapport d'audit du jour) : RGPD toggle analytics,
  entitlement infini forçable, CTA paywall inerte, billing offline
- [ ] Maquette Figma (agent en cours, création du fichier)
- Côté Adam : appliquer le nouveau pricing dans RevenueCat (lifetime 14,99,
  retirer mensuel/annuel de l'offering default, promo lancement 9,99),
  TestFlight prioritaire (13/16 répondants iPhone), répercuter BLF Lab's
  dans les repos frères (content/android/ios : LICENSE, README, legal/)

## Livré (2026-08-01, branche feat/la-taverne-rebrand, v0.7.0)
- [x] M1-M6 historiques (fondations, contenu, moteur 10 modes, légal/RGPD/PostHog consenti/RevenueCat sandbox v0.6.0) - déployés
- [x] **Rebranding « La Taverne »** : néobrutalisme (crème #FFF9F0 / encre #111 / orange #FF5C00 / aplats pop), typo Montserrat Black + Poppins auto-hébergées, logo verres qui trinquent, dos de carte rayé, jeu complet d'icônes iOS/Android + maskable, migration localStorage lataverne-* → la-taverne-*
- [x] **Navigation réparée** : couche history/popstate (retour matériel in-app, plus de fermeture sauvage), modales fermées au retour, zéro écran noir, bouton retour sur l'écran joueurs, safe-area sur tous les contrôles fixes, z-index tokenisé
- [x] **Fix trèfle** : toutes les cartes face cachée (Le Guess non déductible), mise du contest masquée avant révélation, pénalités du contest créditées au récap
- [x] **52 cartes uniques** : pips réels 2-10, figures V/D/R en miroir, jokers étoilés
- [x] **Borderland options** : 1-3 paquets, jokers (2/paquet, carte blanche), mode cartes aléatoires ∞ (premium)
- [x] **4 nouveaux modes** : Quitte ou Double (quiz cagnotte, 60 questions), Le Podium (classement secret + vraie question parmi 4, 40 questions), L'Enchère (surenchères + « tu mens ! » 60 s, 50 thèmes), Le Procès (accusations écrites par les joueurs)
- [x] **Mes règles** : règles perso persistées sur l'appareil, injectées dans les modes à prompts + segments roulette
- [x] Orthographe : ~35 corrections (UI + packs), textes humanisés, 100 % store-safe
- [x] A11y : zoom réactivé, cibles 44px, aria-live, Escape partout, contrastes AA
- [x] Docs agence : design-system/la-taverne/MASTER.md (brand book), docs/USER_STORIES.md, docs/STORE_LISTING.md, README + CHANGELOG 0.7.0
- 103 tests Vitest verts (dont history, quizSession, rankingSession, customRulesStore), lint propre, build PWA OK

## 2026-08-02 - Renommage La Taverne (v0.8.0) + RevenueCat / PostHog

Fait ce jour :
- Renommage complet **La Tournée -> La Taverne** sur les 4 repos (code, assets, docs, chemins).
  Packages Kotlin `com.beloucif.lataverne`, cibles et dossiers Xcode `LaTaverne`, dossier
  `design-system/la-taverne`, domaine `lataverne.beloucif.com`.
- Dépôts GitHub renommés : `la-taverne`, `bacchus-content`, `bacchus-android`,
  `bacchus-ios`. Remotes, dossiers locaux et registre de ports mis à jour.
  4 PR mergées, toutes les CI vertes (dont build Kotlin et xcodebuild sur runner macOS).
- Migration `localStorage` : préfixe `la-taverne-`, les deux préfixes historiques
  (`blackout-`, `la-tournee-`) restent dans la table, aucune partie sauvegardée orpheline.
- RevenueCat : projet renommé « La Taverne », 3 produits créés (premium_monthly 4,99 /
  premium_yearly 19,99 / premium_lifetime 34,99 EUR, aucun essai gratuit), nouvel entitlement
  `Bacchus Pro` (l'identifiant d'un entitlement n'étant pas modifiable, l'ancien
  `BlackOut Pro` a été recréé sous le bon nom puis supprimé), 6 produits rattachés,
  offering `default` complété sur les 3 packages.
- PostHog : projet renommé, tableau de bord `Produit - activation et conversion premium`
  (dashboard 867195) avec entonnoir paywall, modes joués, DAU, consentement RGPD.
- Vercel : projet renommé `la-taverne`.
- Flake corrigé dans `src/core/navigation/history.test.ts` (délai de traversée porté à 100 ms
  après deux échecs observés).

## Fait (session 2026-08-02, suite)
- Audit d'équipe en 5 volets (docs/AUDIT_EQUIPE.md) puis 3 lots de corrections livrés :
  v0.19.0 (mode sombre retiré, écrans légaux atteignables, médiopoints), v0.20.0
  (précache 2 Mo -> 1049 ko, PostHog dynamique, ardoise par id, code mort),
  v0.21.0 (fin de session pour Le Pilori, La Criée, La Roue).
- Icônes des jeux vendorisées (Icons8 Hatch) en v0.18.0, hub filtré par nombre de
  joueurs en v0.17.0.
- Questionnaire Google Forms refait par script (API Apps Script, 7 pages, 33 questions,
  https://forms.gle/EkXunVuGsw9TJGZHA) + bannière et thème orange.

## Fait (session 2026-08-02)
- v0.12.0 : purge typo - Anton (display) + Bricolage Grotesque (UI) remplacent Montserrat/Poppins, docs/DESIGN.md realigne sur MASTER.md (plus aucune mention Neo-Tokyo ni IBM Plex), prod verifiee (Anton en ligne, Poppins 404).
- bacchus-content v1.5.0 : marketing facon happn (mockup iPhone, tout en mode clair), tokens.json v2 synchronise sur la DA taverne, guidelines stores integrees (captions < 20 %, feature graphic zone sure).
- Purge Neo-Tokyo terminee sur les 4 repos : bacchus-android v0.2.0 et bacchus-ios v0.2.0 mergees (palette light taverne, Le Coupe-Gorge, icone iOS regeneree). Seuls les historiques de CHANGELOG gardent la mention (archive).
- v0.11.0 : tirage du Coupe-Gorge en touchant le paquet (pile de dos de cartes + compteur), PR #21 mergée, prod vérifiée.
- bacchus-content v1.4.0 (PR #4) : 10 captures fraîches + 10 compositions marketing néobrutalistes taverne, icône Play, feature graphic, textures Unsplash supprimées.
- Tâches #5/#6/#7 requalifiées : code fini côté web, blocages administratifs côté Adam ; parité contenu à porter sur Android/iOS.

## Prochaine feature demandée
- (fait en 0.13.0) La Criée : thèmes de la tablée persistés sur l'appareil (customThemesStore).

## Reste à faire côté Adam
- Vérifier la disponibilité de « La Taverne » (INPI classes 9/41) avant tout dépôt de marque.

## À reporter dans les repos frères
- bacchus-content : répercuter les corrections orthographiques des packs JSON (sync-content écrase src/content/packs)
- bacchus-android / bacchus-ios : reprendre le rebranding La Taverne (nom, icônes, couleurs)
- PostHog projet 238190 + RevenueCat 2b8d469c : renommer « La Taverne » côté dashboards ; l'entitlement « Bacchus Pro » NE DOIT PAS être renommé (id technique référencé dans billing.ts)
- DNS : créer CNAME lataverne.beloucif.com (l'app référence ce domaine), rediriger lataverne.beloucif.com

## Micro-entreprise (INPI, brouillon 41165109) - nom commercial BLF Lab's
- Immatriculation au patronyme **Adam Beloucif**, nom commercial retenu :
  **BLF Lab's** (verrouillé le 2026-08-03, domaine blflabs.com ; les anciens
  noms Abel Studio / ABEL LABS sont abandonnés). Fait : micro-entrepreneur Oui, identité (NIR saisi par Adam), domicile 6 imp. Édouard Vaillant, activités Édition de logiciels (principale) + Organisation d'événements, versement libératoire Non, ACRE à demander après (éligible 18-25)
- Pièces prêtes dans `00_Sensible/` (2026-08-03, générées par scripts/gen_pieces_inpi.py, jamais versionnées) :
  `01_declaration_non_condamnation.pdf` (à signer avec la mention « Lu et approuvé »),
  `02_attestation_hebergement.pdf` (à faire signer par **Nawel Beloucif**, qui héberge),
  `03_attestation_filiation.pdf`. Marche à suivre complète : `00_Sensible/00_A_IMPRIMER_INPI.md`.
- État civil des pièces : né le 20/06/2004 à Paris 14e, père Mohand Beloucif, mère Nawel Boukachabia épouse Beloucif.
- Nawel doit fournir : sa signature, sa CNI, et un justificatif de domicile à son nom de moins de 3 mois (RIB refusé).
- Étape 8/9 : consentement prospection = **Non**, destinataire = L'entreprise.
- Reste : imprimer et signer les 3 pièces, les déposer (étape 7/9), étapes 8-9, signature + paiement greffe (Adam)
- Après : ACRE sous 45 j, dépôt de marque (190 euros, classes 9/41/42) - vérifier la disponibilité de « La Taverne » en classes 9/41 avant dépôt

## Bloqué sur Adam
- Signature + soumission INPI, comptes Apple Developer (99 $/an) + Play Console (25 $), SIRET pour activer les paiements, connexion Stripe dans RevenueCat (OAuth), rotation des clés sk_/phx_ collées en chat

## Ports / infra
- Preview : 4173 (vite preview). Vercel linké. RC projet 2b8d469c, PostHog projet 238190 EU.
