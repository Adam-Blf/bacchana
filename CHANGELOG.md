# Changelog

## [0.26.0] - 2026-08-03

- Brand book marketing complet (docs/BRAND.md) : plateforme de marque (mission, vision, valeurs, archetype, positionnement), univers et lexique (13 modes definis), voix de marque (5 principes + do/don't), taglines (12 candidates + recommandations), messaging par persona (etudiant, sober-curious, groupe vacances), activation GTM (campagne lancement, TikTok/Reels, ASO, influenceurs, referral, calendrier saisonnier), identite visuelle (neobrutalisme, palette, typo Anton, logo, motion press-to-squash, templates), checklist d'assets.

## [0.25.0] - 2026-08-03

- Sous-titres de modes reecrits dans le ton taverne : Action ou Verite ("Aveu au comptoir ou gage, choisis"), Je n'ai jamais ("Les confidences de la tablee"), C'est un 10 mais ("Le defaut qui gache tout", anglicisme "deal-breaker" retire), 7 Secondes ("Reponds avant le dernier grain").
- La Roue du Destin etoffee de 8 a 40 segments varies (penalites abstraites, defis d'ambiance, mimes, votes, gages soft), toujours zero alcool et store-safe.
- Le Pilori etoffe de 10 a 40 chefs d'accusation de soiree, toujours zero alcool et store-safe.
- Pack orphelin retire cote web : "Tu preferes" etant desormais un mode de vote embarque sans pack, la copie tu-preferes-classique.json est supprimee de src/content et l'index genere ne l'importe plus (source encore presente cote la-taverne-content, non re-synchronisee volontairement).
- docs/STORE_LISTING.md : nouvelle section "Notes de review App Store" documentant la mecanique proprietaire (vote Tu preferes, enchere La Criee, proces Le Pilori, quiz Quitte ou Trinque, classement Le Tableau d'Honneur), le positionnement sans alcool, l'absence de pub et l'originalite du contenu (parade guideline 4.3), plus une liste de mots-cles ASO FR longue traine.
- Typographie : tirets longs purges de docs/USER_STORIES.md (regle typographique interne).

## [0.24.0] - 2026-08-03

- Contenu des packs gratuits porte a 80 items via sync depuis la-taverne-content 1.10.0. Six packs gratuits (Action ou Verite, C'est un 10, Never, Picolo, Qui de nous, Sept secondes) passent de 30-40 a 80 items ; le catalogue premium reflete les nouveaux itemCount (80). Le pack Tu preferes reste inchange (mecanique de vote proprietaire, sans dependance de pack).

## [0.23.0] - 2026-08-03

- **Tu preferes** passe d'une carte a lire a un vrai mode de jeu a mecanique de **vote**. Un dilemme A ou B s'affiche, le telephone tourne, chaque joueur tape son camp, puis au reveal la **minorite trinque** (egalite ou vote unanime : personne ne trinque). Recap local par joueur en fin de partie.
- **84 dilemmes** originaux et store-safe (34 soft, 30 medium, 20 hot), 100 % sans reference a l'alcool, ecrits main. Le mode ne depend plus d'un pack de contenu.
- Moteur pur teste (13 tests, RNG injectable) sur le meme moule que le quiz et le podium ; la minorite, l'egalite et le cumul des penalites sont couverts. La tuile reste "Tu preferes" au hub, sans doublon.
- Interet produit : une mecanique proprietaire (pas un simple deck a lire) qui appuie la difference fonctionnelle demandee par la review App Store (guideline 4.3).

## [0.22.1] - 2026-08-03

- Editeur declare corrige dans les mentions legales, les CGU et la politique de confidentialite : l'editeur est **Adam Beloucif, exercant sous le nom commercial BLF Labs** (en lieu et place d'Abel Studio), la personne physique restant responsable de traitement et directeur de la publication.
- README : la ligne de direction artistique annoncait Montserrat Black / Poppins, corrigee en Anton / Bricolage Grotesque, conforme a la DA appliquee depuis la 0.12.0.

## [0.22.0] - 2026-08-03

Corrections issues de l'audit juridique mene avec le toolkit claude-for-legal.

- Mentions legales : l'exemption de publication d'adresse invoquee (article 6-III-2 de la LCEN) ne couvre que les editeurs non professionnels. l'editeur exerçant une activite commerciale, c'est l'article 6-III-1 qui s'applique et impose la publication de l'adresse. L'affirmation inexacte est remplacee par une note de revue explicite : publier l'adresse du siege ou passer par une domiciliation commerciale des l'immatriculation.
- Nouvelle section sur les informations commerçant exigees par le reglement europeen sur les services numeriques, que les plateformes de distribution reclament desormais a chaque developpeur.
- TVA : les conditions affirmaient une TVA française applicable a toutes les ventes. Les deux regimes sont desormais distingues - franchise en base (article 293 B du CGI) sur les ventes web tant que le seuil n'est pas franchi, et TVA collectee par Apple et Google en qualite de revendeurs reputes sur les achats effectues depuis les boutiques.
- Droit de retractation : le renoncement etait presente comme implicite ("en validant son achat"). La jurisprudence europeenne exige un consentement expres et distinct. Les conditions decrivent maintenant une case a cocher dediee, non pre-cochee, bloquant le paiement web tant qu'elle n'est pas cochee, avec conservation de la preuve horodatee. Reste a implementer dans le parcours de paiement.
- Mediation de la consommation : la note de revue precise que l'obligation naît des la premiere vente a un consommateur, et non a la mise en production.

## [0.21.1] - 2026-08-03

- L'editeur declare est precise dans les mentions legales, les CGU et la politique de confidentialite : Adam Beloucif, entreprise individuelle, exploitant le service La Taverne. La propriete intellectuelle des contenus lui est rattachee, et la mention d'immatriculation renvoie desormais au guichet unique INPI. (Nom commercial reformule en 0.22.1.)

## [0.21.0] - 2026-08-02

Deuxieme lot issu de l'audit : les trois modes qui ne se terminaient jamais.

- Le Pilori debouche desormais sur l'addition, comme les autres jeux : bouton "Terminer et voir l'addition" apres un verdict, penalites reportees a l'ardoise de la soiree, evenement de fin de session emis. Les penalites accumulees etaient jusqu'ici jetees a la sortie de l'ecran.
- La Criee et La Roue du Destin recoivent une fin de partie explicite qui cloture la session et compte les manches. Ces deux modes ne designent jamais nommement le joueur puni (tout se joue a voix haute), donc pas d'addition chiffree : fabriquer un classement aurait produit des donnees fausses.
- Consequence mesurable : l'evenement de debut de partie partait pour les treize jeux mais celui de fin n'arrivait que pour six. L'entonnoir d'analyse etait faux sur pres de la moitie du catalogue.

## [0.20.0] - 2026-08-02

Premier lot de corrections issues de l'audit d'equipe (docs/AUDIT_EQUIPE.md).

- Poids : le service worker ne precache plus les modules de facturation et d'analytics, charges a la demande. Le precache passe de 2039 a 1049 kilo-octets - un visiteur qui refuse les cookies et n'ouvre jamais le paywall ne telecharge plus un mega-octet pour rien.
- PostHog passe en import dynamique : le module n'est plus preleve au premier rendu alors que tout premier lancement se fait sans consentement. L'evenement de consentement attend desormais que le module soit pret, sinon il etait silencieusement perdu.
- L'ardoise de la soiree est indexee par identifiant de joueur et non plus par prenom : deux joueurs homonymes a la meme table fusionnaient leurs penalites et faussaient le classement.
- Code mort supprime : handleCardAction, une fonction vide exposee dans l'interface du store de jeu, et le middleware de persistance de appStore qui n'ecrivait qu'une cle vide a chaque navigation.

## [0.19.1] - 2026-08-02

- docs/AUDIT_EQUIPE.md : audit mene en parallele par cinq specialistes (produit, UX, editorial, technique, growth) sur le produit reel. Verdict jeu par jeu, jeux a ajouter, frictions UX classees, etat du contenu, dette technique bloquante, leviers de croissance, et ordre d'execution recommande de la v0.20 a la v0.23.

## [0.19.0] - 2026-08-02

- Suppression du mode sombre : l'app est desormais claire en toutes circonstances, y compris quand le systeme est en sombre. Le store de theme, le selecteur du hub et le bloc de tokens sombres disparaissent - une seule palette a maintenir, une seule verification de contraste, zero surprise sur les aplats pop.
- Correction RGPD : les ecrans legaux etaient inatteignables au premier lancement. La garde qui renvoie vers l'accueil tant qu'aucun joueur n'est saisi excluait mentions legales, confidentialite et CGU, or le bandeau cookies renvoie vers la politique de confidentialite avant toute saisie de joueur - le lien rebondissait donc immediatement sur l'accueil.
- Deux mediopoints interdits par la charte typographique subsistaient dans l'interface (RankingScreen, CustomRulesScreen), remplaces par des tirets courts.

## [0.18.0] - 2026-08-02

- Icones des jeux : les pictogrammes filaires generiques de lucide-react sont remplaces par un jeu vendorise localement (Icons8, style Hatch - formes pleines et epaisses, esprit gravure), choisi via le MCP icons8 parce qu'un jeu d'icones passe-partout trahissait la direction artistique neobrutaliste. Script reproductible scripts/fetch-mode-icons.mjs, aucun CDN, les identifiants techniques des modes sont inchanges.
- Mentions legales : nouvelle section credits et ressources tierces (attribution Icons8 requise par la licence gratuite, polices sous licence SIL Open Font, contenus de jeu originaux).

## [0.17.0] - 2026-08-02

- Le hub n'affiche plus que les jeux reellement lancables avec la tablee du moment : proposer une tuile qui refuse de demarrer etait une fausse promesse. A deux joueurs, les quatre jeux qui en exigent trois ou quatre disparaissent et un bandeau annonce combien de jeux s'ouvrent, a partir de quel effectif, avec un raccourci vers l'ecran des joueurs.
- Pied du hub : "Buvez responsable" remplace par "Jouez responsable : la taverne veille sur sa tablee" - derniere mention de consommation dans l'interface, incompatible avec la regle store-safe.

## [0.16.0] - 2026-08-02

- L'ardoise de la soiree : le cumul des penalites de TOUS les jeux joues depuis l'ouverture de l'app s'imprime sur le ticket de caisse des la deuxieme partie (classement, nombre de parties et de jeux, cumul de la maison, meneur d'ardoise). Volontairement non persiste : l'ardoise se remet a zero a chaque lancement, comme la session. Premiere brique de la mecanique signature "l'Ardoise" du plan de bataille.

## [0.15.0] - 2026-08-02

- Paywall : selecteur de formule a trois options (a vie / annuel / mensuel), le lifetime est l'option par defaut avec badge "Meilleure offre" - decision issue de l'audit concurrentiel (aucun concurrent n'a de paiement unique, la colere anti-abonnement est documentee chez Picolo et TOZ). Mentions legales par formule (essai 7 jours sur les abos, paiement unique sur le lifetime).
- docs/BATTLE_PLAN.md : plan de bataille n°1 FR issu de 4 audits paralleles (teardowns Picolo et TOZ, balayage FR + mondial, facteurs de ranking stores) - positionnement d'attaque, roadmap produit priorisee, mecaniques signature (l'Ardoise, le Taulier tournant, le Grand Livre), SEO de conquete, lancement en 5 phases.

## [0.14.1] - 2026-08-02

- docs/STORE_ACCOUNTS.md : runbook d'ouverture des comptes Play Console (25 USD, exigence 12 testeurs / 14 jours en compte perso) et Apple Developer (99 USD/an, Small Business Program 15 %), avec la decision perso vs organisation tant qu'ABEL LABS est en pause et l'ordre optimal de lancement.

## [0.14.0] - 2026-08-02

- Audit WCAG complet des couleurs : 24 paires reelles x 2 themes, 0 echec apres correction. Ajustements light : neon #FA5600 (3.14:1 en display sur creme), card-red #DD2A38 (4.71:1), premium #96690F (4.64:1), success #177C50 (4.97:1). Tout texte pose sur orange passe en encre fixe tile-ink (l'encre themable tombait a 2.2:1 en sombre), boutons primaires inclus.
- docs/MARKET.md : audit de niche et de concurrence (Picolo, TOZ, Sombre soiree...), decisions actees (zero pub, pas de palier hebdo, lifetime en avant, ASO hors "jeu a boire", offline visible), backlog growth priorise.
- design-system/MASTER.md : palette et regles de contraste mises a jour avec les ratios mesures.

## [0.13.0] - 2026-08-02

- La Criee : la tablee peut creer ses propres themes ("Mes themes"). Ils rejoignent la pioche, s'activent/se desactivent d'un interrupteur, se suppriment, et restent enregistres sur l'appareil (localStorage la-taverne-custom-themes, entrees corrompues ecartees a l'hydratation). Le theme tire affiche "Theme de la tablee" quand il vient du groupe.

## [0.12.1] - 2026-08-02

- Fiche stores refondue en passe ASO complete (docs/STORE_LISTING.md) : nom/sous-titre/mots-cles App Store dedupliques et a la limite exacte (27/28/100), texte promotionnel 160, courte description Play 79, description longue restructuree (hook probleme, essai gratuit 7 jours mentionne).
- Purge store-safe de la fiche : suppression de la mention "L'abus d'alcool...", de l'emoji chopes et de "soiree arrosee" - marqueurs de produit alcoolise en review. Risque "Quitte ou Trinque" documente avec fallback "Quitte ou Double".

## [0.12.0] - 2026-08-02

- Typographie de marque refondue : Anton (display, esprit enseigne peinte) + Bricolage Grotesque (UI et corps) remplacent Montserrat/Poppins, jugees trop basiques. Space Mono reste reservee au ticket de caisse.
- Fallback display 'Arial Black' remplace par 'Impact'. Anton declare en 100-900 pour neutraliser le faux gras synthetise.
- `docs/DESIGN.md` reecrit : il decrivait encore la DA Neo-Tokyo abandonnee (dont une mention IBM Plex Mono, police bannie) et contredisait `design-system/la-taverne/MASTER.md`.

## [0.11.0] - 2026-08-02

- Coupe-Gorge : le tirage se fait desormais en touchant le paquet de cartes lui-meme (pile de dos de cartes cliquable avec compteur), plus intuitif que l'ancien bouton "Tirer une carte" en pied d'ecran.

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [SemVer](https://semver.org/).

## [0.10.0] - 2026-08-02

### Added
- **L'addition en ticket de caisse** : l'ecran de fin est imprime comme un
  vrai ticket - Space Mono (auto-hebergee), bords crantes, lignes pointillees,
  TOTAL, code-barres decoratif, « La maison ne fait pas credit. ». Papier fixe
  dans les deux themes (objet physique).
- **Sceau de cire** : les packs et options premium portent un sceau de cire
  rouge au monogramme LT (SVG maison) a la place du cadenas.

### Changed
- **Chaque lancement repart de la tablee** : l'app demarre sur la saisie des
  joueurs et fermer l'app remet la partie a zero. Seuls survivent les reglages
  du paquet, le theme, le consentement et les regles perso.

### Fixed
- **Carte trefle visible en superposition sur iPhone** : les deux faces de la
  carte etaient coplanaires et Safari faisait percer la face cachee a travers
  backface-visibility (enfants z-index promus). Chaque face est maintenant
  poussee de 1px le long de sa normale et les z-index internes retires.
  Verifie sur WebKit : le dos seul est visible sur un trefle face cachee.
- Le pied de page du recap ne mentionne plus la boisson (reliquat store-safe).

## [0.9.1] - 2026-08-02

### Fixed
- Les champs de la tablee ne debordent plus de l'ecran sur mobile : un input
  garde une largeur intrinseque (~20 caracteres) qui empechait flex-1 de
  retrecir, corrige par min-w-0. Verifie sur WebKit en 320 px et 393 px.

## [0.9.0] - 2026-08-02

### Added - Mode sombre « taverne à la bougie »
- Deux thèmes complets : papier crème le jour, bois sombre et lueur de
  lanterne la nuit. Bascule persistée sur l'appareil, « system » suit l'OS
  en direct, meta theme-color synchronisée pour la barre de statut PWA.
- Tokens convertis en canaux RGB : les opacités Tailwind suivent le thème.
  Cartes à jouer et texte des tuiles pop restent en encre fixe (surfaces
  claires dans les deux thèmes). Contrastes AA vérifiés sur WebKit.

### Changed - La carte des jeux passe en langage taverne
- Le Borderland devient **Le Coupe-Gorge**, Le Meneur **Le Taulier**,
  L'Enchère **La Criée**, Le Podium **Le Tableau d'Honneur**, Le Procès
  **Le Pilori**, La Roulette **La Roue du Destin**. Les jeux universels
  (Action ou Vérité, Je n'ai jamais...) gardent leur nom, sous-titres
  thématisés. Identifiants techniques et analytics inchangés.
- Textes d'ambiance : « La tablée », « Une chaise de plus », « Pousser la
  porte », « Au menu ce soir », écran de fin renommé « L'addition ».

## [0.8.1] - 2026-08-02

### Added - Essai gratuit de 7 jours
- Les abonnements mensuel et annuel comportent un essai gratuit de 7 jours,
  reserve aux nouveaux clients (produits RevenueCat recrees avec l'option
  Free trial, identifiants inchanges).
- CGV : nouvel article 11 « Essai gratuit » (information de reconduction,
  aucun debit en cas de resiliation pendant l'essai), articles suivants
  renumerotes.
- Paywall : mention de l'essai et de la resiliation sous le prix.
- Relecture orthographique complete des chaines visibles : aucune faute
  restante detectee (les occurrences remontees par l'outillage sont des
  identifiants techniques).

## [0.8.0] - 2026-08-02

### Changed - Renommage « La Taverne »
- Nom définitif : **La Taverne**. Le nom « La Tournée » retenu en 0.7.0 n'aura
  jamais été publié sur les stores, la direction artistique néobrutaliste et
  l'ensemble des écrans sont conservés tels quels.
- Domaine : `lataverne.beloucif.com`. Identifiant natif `com.beloucif.lataverne`.
- Entitlement RevenueCat renommé `La Taverne Pro`, packages et prix inchangés.
- Clés `localStorage` migrées vers le préfixe `la-taverne-`. La table de
  migration conserve les deux préfixes historiques (`blackout-`, `la-tournee-`)
  afin qu'aucune partie sauvegardée ne soit orpheline.
- Dépôts renommés : `la-taverne`, `la-taverne-content`, `la-taverne-android`,
  `la-taverne-ios`.

## [0.7.0] - 2026-08-01

### Changed - Rebranding « La Tournée »
- Nouveau nom : **La Tournée** (ex-BlackOut), nouvelle direction artistique
  **néobrutalisme** : fond papier crème `#FFF9F0`, encre `#111111`, accent orange
  `#FF5C00`, aplats pop (jaune/rose/bleu/lime), bordures 2 px, ombres dures.
- Typographie : Montserrat 800/900 (display) + Poppins 400-700 (UI et HUD tabulaire),
  Google Fonts auto-hébergées ; correction du bug qui faisait retomber le corps
  de texte sur la police système (tokens Inter/IBM Plex fantômes).
- Nouveau logo (verres qui trinquent), nouveau dos de carte, favicon, jeu complet
  d'icônes iOS (120/152/167/180) et Android/PWA (48→512 + maskable 192/512),
  splash iPhone, manifest et theme-color alignés.
- Migration automatique des clés localStorage `blackout-*` → `la-tournee-*`.
- Brand book réécrit : `design-system/la-tournee/MASTER.md`.

### Added - Nouveaux jeux & personnalisation
- **Quitte ou Trinque** : quiz culture G à cagnotte (60 questions originales) -
  bonne réponse : cumule ou distribue ; mauvaise : tu prends ta cagnotte.
- **Le Podium** : le juge classe la table selon une question secrète, le groupe
  doit retrouver la vraie question parmi 4 propositions (40 questions).
- **L'Enchère** : surenchères sur un thème (« je peux en citer 8 ! »), défi
  « tu mens ! » chronométré 60 s (50 thèmes).
- **Le Procès** (ex-Tribunal, renommé) : chaque joueur écrit désormais une
  accusation secrète en début de partie (pass-the-phone), tirage aléatoire,
  défense, puis vote à main levée.
- **Mes règles** : création de règles personnalisées (texte, pénalité, jetons
  {player}/{player2}, modes ciblés), persistées sur l'appareil, injectées dans
  les modes à prompts et en segments supplémentaires de la Roulette.
- **Borderland** : choix de 1 à 3 paquets (52-156 cartes), jokers (2 par paquet,
  règle « carte blanche »), mode cartes aléatoires à l'infini réservé premium ;
  52 cartes au design unique (pips réels 2-10, figures V/D/R en miroir, jokers).

### Fixed - Zones mortes & « bug du trèfle »
- Couche de navigation history/popstate : le bouton retour Android/navigateur
  navigue dans l'app au lieu de la fermer ; les modales se ferment au retour ;
  toast « Appuie encore pour quitter » sur l'accueil ; confirmation avant de
  quitter une partie de Borderland entamée.
- Plus aucun écran noir (`return null`) ni écran sans issue : bouton retour sur
  l'écran joueurs, boutons « quitter » repositionnés sous l'encoche
  (`top-safe`), utilitaires safe-area en plugin Tailwind, échelle z-index
  tokenisée (le bandeau cookies ne recouvre plus les CTA).
- **Le Guess corrigé** : toutes les cartes arrivent face cachée - une carte
  cachée n'est plus forcément un trèfle, et la mise du contest n'est plus
  révélée avant le retournement de la carte.
- Les pénalités d'un contest perdu sont enfin créditées au récap de session ;
  le texte partagé reflète le vrai classement des modes à prompts.

### Accessibility
- Zoom pinch réactivé (suppression de `user-scalable=no`), `touch-action:
  manipulation`, cibles tactiles ≥ 44 px, `aria-live` sur les résultats,
  fermeture Escape partout, labels français accentués, contrastes AA sur la
  nouvelle palette claire.

## [0.6.0] - 2026-08-01

### Added
- Pages légales (`src/components/legal`) : mentions légales, politique de confidentialité,
  CGU/CGV, rendues depuis le contenu source `blackout-content/legal/*.md` en composants TSX
  (pas de dépendance markdown), nouvelles routes `AppScreen` (`mentions-legales`,
  `confidentialite`, `cgu`), liens accessibles depuis le pied de page du hub.
- Bandeau de consentement cookies RGPD (`CookieConsent`, `consentStore`) conforme à la spec
  CNIL (`cookie-banner-spec.md`) : deux niveaux (bandeau + personnalisation granulaire),
  boutons "Tout refuser" / "Accepter l'analyse" de même poids visuel, aucune case pré-cochée,
  aucun traceur avant choix explicite, consentement versionné et expirant à 6 mois, entrée
  "Cookies" dans le pied de page pour rouvrir le panneau à tout moment.
- Analytics produit consenti (`src/lib/analytics.ts`, PostHog EU Cloud) : initialisation
  uniquement après consentement analytics, `opt_out`/`reset` si le consentement est retiré,
  événements typés `mode_started`, `session_completed`, `premium_paywall_viewed`,
  `consent_updated` branchés sur le hub et `SessionRecap`.
- Infra premium RevenueCat Web (`src/lib/billing.ts`, sandbox `VITE_REVENUECAT_TEST_STORE_KEY`,
  SDK chargé dynamiquement) : `entitlementStore` fait un `getCustomerInfo()` best-effort au
  démarrage avec fallback sur le cache localStorage en cas d'échec (offline, pas de clé),
  `PremiumPaywallModal` affiche les packs premium débloqués et le prix live si l'offering
  RevenueCat est disponible, sinon "Bientôt disponible". Achat réel désactivé derrière
  `VITE_BILLING_ENABLED` tant que Stripe n'est pas connecté dans le dashboard RevenueCat.
- 15 nouveaux tests Vitest (`consentStore`, `CookieConsent`) - 76 tests au total - garantissant
  qu'aucun événement PostHog ne part avant un choix explicite et que le refus fonctionne
  réellement (pas de dark pattern).

### Changed
- `vite.config.ts` : chunks vendor dédiés `vendor-analytics` et `vendor-billing` pour isoler
  ces SDK du bundle principal.

## [0.5.1] - 2026-08-01

### Changed
- Dos de carte : nouvel asset SVG signature (`public/card-back.svg`, pique néon + lettre B en
  path géométrique, double liseret, motif losanges) affiché via `<img>` dans `PlayingCard`,
  remplace les éléments décoratifs CSS du dos ("card back asset").

## [0.5.0] - 2026-08-01

### Added
- Moteur multi-modes générique (`src/core/engine`) : registre de 10 modes (`modeRegistry`),
  session de prompts pure et testée (`promptSession` - pile mélangée sans répétition, rotation
  de tour, règles persistantes avec expiration par nombre de tours, rôles permanents jusqu'à
  remplacement), interpolation `{player}` / `{player2}` (`interpolate`), extension des pénalités
  aux modes de prompts (`penalties`), schéma zod strict aligné sur `content.schema.json`.
- 7 modes de prompts jouables via un écran générique (`PromptGameScreen`) : Le Meneur (picolo),
  Action ou Vérité, Je n'ai jamais, Qui de nous, Tu préfères, C'est un 10 mais, 7 Secondes.
- Le Tribunal (accusé aléatoire, vote coupable/innocent à main levée, verdict majoritaire) et
  La Roulette (roue animée à 8 segments de gages/pénalités) - modes embarqués, sans pack.
- Pipeline de contenu reproductible (`scripts/sync-content.mjs`, `npm run sync-content`) :
  synchronise les 7 packs gratuits du repo `blackout-content` en JSON commité, et extrait la
  métadonnée des 5 packs premium dans `src/content/premium-catalog.json` pour les tuiles
  verrouillées du hub.
- Gating premium (stub `entitlementStore`, `isPremium: false`) : tuiles et packs premium
  affichent un cadenas et une modale "BlackOut Premium arrive bientôt", sans paiement réel (M6).
- Hub refondu : grille bento des 10 modes, sélecteur de pack (gratuit jouable / premium
  verrouillé) pour les modes qui en ont plusieurs, avertissement inline si le nombre de joueurs
  est insuffisant pour un mode.
- 47 nouveaux tests Vitest sur le moteur (rotation, expiration des règles, remplacement de rôle,
  non-répétition, filtrage par `minPlayers`, validation zod, registre de modes) - 61 tests au total.

### Changed
- `App.tsx` route désormais `game` via le registre de modes (lazy loading par mode) ; Le
  Borderland garde son flux dédié (`BorderlandScreen`, extrait tel quel de l'ancien `App.tsx`).
- `SessionRecap` accepte un `penaltyCounts` générique pour être réutilisé par tous les modes de
  prompts, en plus du calcul historique `drinksGorgees`/`drinksShots` du Borderland.
- `appStore` gagne `activeMode` (quel mode du registre est actif) et `setActiveMode`.

### Removed
- `src/data/prompts.ts` et les types `PromptGameType`/`PromptGameConfig` (contenu français en
  dur) - remplacés par le pipeline de contenu `blackout-content` + le moteur multi-modes.

## [0.4.0] - 2026-08-01

### Changed
- Conformite stores (Apple App Store 1.4.3, Google Play) : plus aucune mention d'alcool dans l'app. Le jeu distribue des penalites abstraites, le groupe decide de leur nature dans la vraie vie.
- Sweep complet des chaines FR visibles : "jeux a boire" -> "jeux de soiree", "gorgee(s)" -> "penalite(s)", "SHOT(S)" -> "PENALITE MAJEURE", "il boit" -> "il prend une penalite", "A consommer avec moderation" -> "Jouez responsable."
- `calculatePenalty` affiche "N penalite(s)" et "PENALITE MAJEURE (xN)" - les valeurs internes de `PenaltyUnit` ('gorgees' | 'SHOT') restent inchangees, aucun breaking change de schema.
- SessionRecap : stats et texte de partage neutres (penalites / majeures), icone Wine remplacee par Zap.
- Prompts nettoyes des references a l'alcool, README + meta description + manifest PWA reformules "Collection de jeux de soiree".

## [0.3.0] - 2026-08-01

### Added
- Rebranding complet "Neo-Tokyo Borderland" : palette noir profond + neon rouge, carte blanche geante signature, tokens partages (blackout-content).
- Nouveau logo (carte + pique + halo neon), favicon et icones PWA regenerees (script sharp reproductible).
- Polices self-hosted optimisees (woff2 subset latin, font-display swap, preload) : Anton, Space Grotesk, IBM Plex Mono. Zero CDN.
- Grille bento du hub avec tuiles de modes verrouillees, stagger d'apparition.
- Accessibilite : MotionConfig reducedMotion, cibles 44px, focus ring neon, safe-area, ARIA clavier sur la carte.

### Changed
- Purge du theme casino (vert feutrine, or, Cinzel/Playfair/Montserrat) et de la palette neon legacy (NeonColor).
- Correction des accents sur toutes les chaines FR visibles.

## [0.2.0] - 2026-08-01

### Added
- Vitest test suite covering the pure Borderland game logic (deck integrity, penalty units, contest multipliers, player rotation).
- ESLint 9 flat config (typescript-eslint, react-hooks, react-refresh) - `npm run lint` now works.
- Global `ErrorBoundary` with a recovery screen.
- `vercel.json` (SPA rewrite, immutable asset caching) - deployment moves from Apache to Vercel.
- GitHub Actions CI: lint, tests, build, typography guard, gitleaks secret scanning.
- Defensive `.gitignore` patterns (build artifacts, secrets, `.vercel`).

### Changed
- Pure game logic extracted from the store to `src/core/borderland.ts` (testable without DOM).
- `App.tsx`: store subscription via hook instead of `getState()` in render, screen redirect moved to an effect.
- PWA manifest: name and `theme_color` aligned with the design, removed references to missing assets.

### Fixed
- Clubs cards no longer flash their face before the flip: reveal state is now reset during render (not in an effect after paint) and the card mounts directly back-side up (`initial={false}`). "Le Guess" stays guessable.
- Share recap text: forbidden middle dots replaced, wrong domain corrected to blackout.beloucif.com.

### Removed
- i18next stack (unused: no component consumed translations) - FR only, content schema keeps a `lang` field for later.
- Committed build artifacts (`vite.config.js`, `*.tsbuildinfo`).
- `public/.htaccess` (replaced by Vercel config).

## [0.0.1] - 2026-04-14

Initial version - Le Borderland card game, casino theme, PWA.
