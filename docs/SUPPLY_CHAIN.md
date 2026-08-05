# Securite de la chaine d'approvisionnement npm

Derniere revue : 5 aout 2026.

## Pourquoi ce document existe

Le 4 aout 2026, l'attaque **ChainDrop**, aussi appelee Mini Shai-Hulud, a frappe le
registre npm. Un ver auto-replicant a contamine plus de deux mille versions de paquets,
en partant du compte GitHub compromis du mainteneur des espaces de noms `keyv` et
`cacheable`.

**Comment il fonctionnait.** Chaque paquet touche recevait deux fichiers, `setup.mjs` et
`Math_Symbol.js`, et une entree `"preinstall": "node setup.mjs"`. Au premier
`npm install`, le crochet telechargeait le runtime Bun et executait un voleur
d'identifiants ciblant les jetons `.npmrc`, les jetons GitHub CLI, les cles AWS, les
jetons Vault, les configurations Kubernetes et les portefeuilles crypto. Avec le jeton
npm vole, il republiait d'autres paquets, d'ou la propagation a douze organisations.

**Trois lecons de cet incident, elles structurent tout ce qui suit.**

1. **La provenance ne prouve rien.** Les versions malveillantes portaient des
   attestations SLSA **valides**, l'attaquant ayant declenche le workflow de release
   legitime du projet. Le ver signait meme lui-meme ce qu'il republiait, via le trusted
   publishing OIDC de npm. `npm audit signatures` renvoie donc **vert** sur un paquet
   empoisonne. Ne jamais s'en servir comme preuve d'innocuite.
2. **Le vecteur ne passe pas forcement par npm.** Le malware posait aussi des hameçons
   d'editeur, un `.vscode/tasks.json` en `folderOpen` et un `.claude/settings.json`
   appelant un `.claude/setup.mjs` en hook `SessionStart`. Ces hameçons ont ete commites
   **31 minutes avant** la premiere publication npm. Ouvrir le depot suffisait.
3. **Revoquer un jeton peut declencher la charge.** Le malware installait un veilleur,
   `gh-token-monitor`, dont la revocation du jeton declenchait un `eval` sur un
   gestionnaire distant. En reponse a incident, on chasse le veilleur **avant** de
   revoquer quoi que ce soit.

## Etat de ce projet au 5 aout 2026

**Sain, verifie contre la liste officielle.** Les 2 235 couples nom plus version publies
par Wiz Research ont ete croises contre les trois lockfiles et le cache npm global.

```
la-taverne           694 paquets   aucune correspondance
la-taverne-content     5 paquets   aucune correspondance
la-tournee-site      127 paquets   aucune correspondance
cache npm          1 281 entrees   aucun tarball empoisonne
```

Aucun `preinstall`, aucun `setup.mjs` a la racine d'un paquet, aucun hameçon d'editeur,
aucun veilleur `gh-token-monitor`, aucun runtime Bun depose sur le poste.

**Point de vigilance.** Trois paquets portent un nom de la liste, dans une version
saine : `keyv@4.5.4` contre la 6.0.0 empoisonnee, `flat-cache@4.0.1` contre la 6.1.24,
`file-entry-cache@8.0.0` contre la 11.1.6. Une montee de version les ferait entrer dans
la zone dangereuse, d'ou l'epinglage par `overrides` dans `package.json`.

## La protection en place

### 1. Les scripts d'installation ne s'executent plus

Le `.npmrc` **versionne** porte `ignore-scripts=true`. Aucun `preinstall`, `postinstall`
ni `install` d'aucune dependance ne s'execute. C'est la parade au vecteur exact de
ChainDrop.

**Ce projet n'a besoin d'aucune exception**, verifie par installation neuve avec
`node_modules` supprime. Cinq dependances declarent pourtant un script :

| Paquet | Pourquoi ce n'est pas un probleme |
|---|---|
| `esbuild` | Livre son binaire par dependance optionnelle de plateforme, `@esbuild/win32-x64`. Verifie : il se charge et le build passe |
| `sharp` | Idem, binaires prebuilts par plateforme. Verifie : il produit un PNG reel |
| `core-js` | N'affiche qu'un message de donation |
| `fsevents` | macOS uniquement, sans objet ici |

Preuve executee : build vert, **79 entrees de precache**, **195 tests verts**, service
worker genere, sans le moindre `npm rebuild`.

### 2. Une garde qui echoue si la protection disparait

`npm run check:supply-chain`, branchee en integration continue sur les trois depots.
Elle echoue si :
- le `.npmrc` perd son `ignore-scripts=true` ;
- une version listee ChainDrop entre dans le lockfile.

Elle a ete **prouvee rouge puis verte** sur les deux regressions, code de sortie 1 dans
les deux cas. Une protection qu'on peut supprimer sans s'en apercevoir n'en est pas une.

### 3. Epinglage defensif

`overrides` dans `package.json` borne `keyv`, `flat-cache` et `file-entry-cache` a leurs
versions saines actuelles.

## Ce que cette protection ne fait pas

`ignore-scripts` ne protege **que** du vecteur crochet d'installation. Une attaque qui
placerait sa charge dans le **code du paquet lui-meme**, execute a l'import, passerait
au travers.

Le contrepoids serait une quarantaine par age de publication : n'installer une version
qu'apres un delai, le temps que la communaute detecte le malware, ce qui prend
generalement quelques heures. **npm ne l'offre pas automatiquement.** pnpm 11 applique
par defaut `minimumReleaseAge` a 1440 minutes, soit 24 heures. Le passage a pnpm a ete
examine et ecarte le 5 aout 2026, la migration coutant trois lockfiles, trois
integrations continues et une configuration Vercel pour un projet a huit dependances de
production.

**Consequence : la quarantaine est humaine, donc faillible.** Dependabot est actif sur
les cinq depots et propose des montees automatiques, ce qui est exactement le canal par
lequel une version empoisonnee entrerait. **Regle : ne jamais fusionner une proposition
Dependabot le jour de la publication de la version.** Attendre au moins vingt-quatre
heures.

## Si un build casse a cause de ce reglage

Ne desactive pas `ignore-scripts`, ce serait rouvrir le vecteur, et la garde te barrera
la route de toute facon. Identifie le paquet fautif, reconstruis-le explicitement, puis
documente pourquoi il en a besoin :

```bash
npm rebuild <paquet> --foreground-scripts --ignore-scripts=false
```

## Comment verifier soi-meme

```bash
npm run check:supply-chain           # la garde, sur les trois depots
npm ls keyv flat-cache file-entry-cache cacheable-request
grep -rn '"preinstall"' node_modules/*/package.json
```

Liste d'IOC faisant autorite, mise a jour par Wiz Research :
`github.com/wiz-sec-public/wiz-research-iocs`, fichier `reports/keyv-packages.csv`.

Aucun CERT-FR, aucun GHSA et aucun CVE n'existent sur cet incident au 5 aout 2026. Le
seul avis etatique publie est celui du CERT-SE suedois.
