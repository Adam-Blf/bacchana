#!/usr/bin/env node
/**
 * Garde : le verrou de dependances dit la meme chose que le paquet.
 *
 * LE DEFAUT, ET IL S'EST PRODUIT TROIS FOIS. `package.json` annoncait une
 * version, `package-lock.json` en gardait une autre :
 *
 *   - 2026-09-13, PR #136 : verrou en 0.54.0 contre un paquet en 0.54.1 ;
 *   - 2026-09-14, PR #138 : verrou en 0.54.1 contre un paquet en 0.55.0 ;
 *   - 2026-09-14, PR #148 : verrou en 0.58.1 contre un paquet en 0.59.0.
 *
 * A chaque fois la meme cause : deux changements touchant les dependances
 * fusionnes l'un apres l'autre, et la fusion retient le verrou du premier. Ce
 * n'est pas une faute d'inattention qu'on apprend a ne plus faire - c'est une
 * consequence mecanique de l'ordre des fusions, donc ca se reproduira.
 *
 * POURQUOI C'EST GRAVE ALORS QUE RIEN NE CASSE. `npm install` corrige la
 * derive en silence, ce qui la rend invisible en developpement. `npm ci`, lui,
 * EXIGE l'accord exact et refuse de s'installer. Autrement dit le defaut dort
 * tant que la CI ne tourne pas - et les Actions de ce depot n'executent rien
 * depuis le 2026-09-02. Le jour ou elles repartent, il se reveille en echec
 * d'installation sur chaque branche, et la cause sera difficile a relier a une
 * fusion vieille de plusieurs semaines.
 *
 * TROIS CONTROLES, tous en lecture de JSON, sans reseau et sans installation.
 *
 *   1. LA VERSION, aux trois endroits ou elle est ecrite : `package.json`, la
 *      racine du verrou, et `packages[""]` du verrou.
 *   2. LES DEPENDANCES DECLAREES. Chaque nom et chaque intervalle de
 *      `dependencies` et `devDependencies` doit se retrouver a l'identique
 *      dans `packages[""]` du verrou, dans les deux sens. C'est ce qui attrape
 *      une dependance ajoutee sans regenerer le verrou - l'autre facon de
 *      faire mourir `npm ci`.
 *   3. LES SURCHARGES SONT REELLEMENT APPLIQUEES. Le verrou n'enregistre PAS
 *      le bloc `overrides` : il n'en garde que le resultat, la version posee
 *      dans `node_modules/<nom>`. Une surcharge ajoutee sans reinstaller ne
 *      provoque donc aucune erreur, elle NE FAIT SIMPLEMENT RIEN. C'est le
 *      cas du correctif de securite du 2026-09-14, qui force `dompurify` hors
 *      de la plage vulnerable (GHSA-55q2-fjhq-7xh7) : une surcharge inerte
 *      laisserait la faille ouverte en production, sans un mot.
 *
 * CE QUE CETTE GARDE NE VOIT PAS.
 *   - Elle ne remplace pas `npm ci`. Elle compare ce que les deux fichiers
 *     DECLARENT ; elle ne verifie pas que l'arbre complet des dependances
 *     transitives est resolvable, ni qu'il s'installe.
 *   - Sa lecture d'intervalle est minimale : `^`, `~`, une version exacte, et
 *     `>=`. Un intervalle compose (`>=1 <2`), une etoile, une URL git ou un
 *     alias `npm:` sont IGNORES au controle 3 plutot que mal juges - une
 *     garde qui se trompe sur un cas rare finit desactivee. Le depot n'utilise
 *     aujourd'hui que `^` et une version exacte.
 *   - Elle ne dit rien des vulnerabilites. C'est le travail de `npm audit`.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// `RACINE_VERROU` sert UNIQUEMENT a la preuve de garde, qui abime des copies
// dans un dossier temporaire plutot que les vrais fichiers du depot.
const RACINE = process.env.RACINE_VERROU ?? join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const paquet = JSON.parse(readFileSync(join(RACINE, 'package.json'), 'utf8'))
const verrou = JSON.parse(readFileSync(join(RACINE, 'package-lock.json'), 'utf8'))
const soi = verrou.packages?.['']

const fautes = []

if (!soi) {
  fautes.push('package-lock.json n a pas d entree `packages[""]` - format inattendu')
}

// 1. La version, aux trois endroits ou elle est ecrite.
{
  const attendue = paquet.version
  if (verrou.version !== attendue) {
    fautes.push(
      `la racine du verrou annonce ${verrou.version}, le paquet ${attendue}. ` +
        `Relancer npm install --package-lock-only.`,
    )
  }
  if (soi && soi.version !== attendue) {
    fautes.push(
      `packages[""] du verrou annonce ${soi.version}, le paquet ${attendue}. ` +
        `Relancer npm install --package-lock-only.`,
    )
  }
}

// 2. Les dependances declarees, dans les deux sens.
for (const champ of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
  const cote = paquet[champ] ?? {}
  const verrouille = soi?.[champ] ?? {}
  for (const [nom, intervalle] of Object.entries(cote)) {
    if (!(nom in verrouille)) {
      fautes.push(`${champ} : ${nom} est dans le paquet mais absent du verrou`)
    } else if (verrouille[nom] !== intervalle) {
      fautes.push(
        `${champ} : ${nom} vaut « ${intervalle} » dans le paquet et « ${verrouille[nom]} » dans le verrou`,
      )
    }
  }
  for (const nom of Object.keys(verrouille)) {
    if (!(nom in cote)) {
      fautes.push(`${champ} : ${nom} est dans le verrou mais absent du paquet`)
    }
  }
}

/**
 * Une lecture d'intervalle volontairement minimale.
 *
 * Rend `null` pour tout ce qu'elle ne sait pas juger, et l'appelant IGNORE
 * alors le cas. Se tromper sur un intervalle compose accuserait une surcharge
 * saine, et une garde qui accuse ce qui va bien finit desactivee.
 */
function satisfait(version, intervalle) {
  const morceaux = (v) => v.split('-')[0].split('.').map(Number)
  if (!/^\d+\.\d+\.\d+/.test(version)) return null
  const [vMaj, vMin, vCor] = morceaux(version)
  const cible = intervalle.trim()

  const auMoins = (a, b, c) =>
    vMaj > a || (vMaj === a && (vMin > b || (vMin === b && vCor >= c)))

  if (/^\d+\.\d+\.\d+/.test(cible)) {
    return cible.split('-')[0] === version.split('-')[0]
  }
  const chapeau = cible.match(/^\^(\d+)\.(\d+)\.(\d+)/)
  if (chapeau) {
    const [, a, b, c] = chapeau.map(Number)
    // `^0.x.y` bloque la mineure, `^x.y.z` bloque la majeure : regle npm.
    if (a === 0) return vMaj === 0 && vMin === b && auMoins(a, b, c)
    return vMaj === a && auMoins(a, b, c)
  }
  const tilde = cible.match(/^~(\d+)\.(\d+)\.(\d+)/)
  if (tilde) {
    const [, a, b, c] = tilde.map(Number)
    return vMaj === a && vMin === b && vCor >= c
  }
  const minimum = cible.match(/^>=\s*(\d+)\.(\d+)\.(\d+)$/)
  if (minimum) {
    const [, a, b, c] = minimum.map(Number)
    return auMoins(a, b, c)
  }
  return null
}

// 3. Les surcharges sont reellement appliquees.
const surcharges = Object.entries(paquet.overrides ?? {})
let ignorees = 0
for (const [nom, intervalle] of surcharges) {
  if (typeof intervalle !== 'string') {
    ignorees++
    continue // surcharge imbriquee : hors de portee de cette garde
  }
  const entrees = Object.entries(verrou.packages ?? {}).filter(
    ([chemin]) => chemin === `node_modules/${nom}` || chemin.endsWith(`/node_modules/${nom}`),
  )
  if (entrees.length === 0) {
    fautes.push(
      `surcharge ${nom} = « ${intervalle} » : aucune installation de ce paquet dans le verrou. ` +
        `Soit la surcharge ne sert plus a rien, soit le verrou n a pas ete regenere.`,
    )
    continue
  }
  for (const [chemin, entree] of entrees) {
    const verdict = satisfait(entree.version, intervalle)
    if (verdict === null) {
      ignorees++
      continue
    }
    if (!verdict) {
      fautes.push(
        `surcharge INERTE : ${chemin} est en ${entree.version}, la surcharge demande « ${intervalle} ». ` +
          `Le verrou n a pas ete regenere, donc la surcharge ne s applique pas - en silence. ` +
          `Relancer npm install.`,
      )
    }
  }
}

if (fautes.length) {
  console.error(`\nVerrou et paquet en desaccord - ${fautes.length} faute(s).\n`)
  for (const f of fautes) console.error(`  - ${f}`)
  console.error(
    `\n  \`npm install\` corrige la derive en silence, ce qui la rend invisible.\n` +
      `  \`npm ci\` exige l accord exact et REFUSE de s installer : c est ce qui\n` +
      `  casse en integration continue, parfois des semaines apres la fusion.\n`,
  )
  process.exit(1)
}

const nbDeps =
  Object.keys(paquet.dependencies ?? {}).length + Object.keys(paquet.devDependencies ?? {}).length
console.log(
  `Verrou : version ${paquet.version} aux trois endroits, ${nbDeps} dependances declarees a ` +
    `l identique, ${surcharges.length} surcharge(s) appliquee(s)` +
    (ignorees ? `, ${ignorees} intervalle(s) non jugeable(s) ignore(s)` : '') +
    '.',
)
