// Genere docs/DESIGN_TOKENS.md a partir de src/styles/tokens.css.
// Motif : ce document fait autorite pour les portages Android et Swift. Une
// table recopiee a la main diverge au premier correctif, et personne ne le
// voit - c'est arrive entre la maquette et le code entre le 23/08 et le
// 30/08/2026. Il se regenere : `node scripts/gen_design_tokens_doc.mjs`.
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const css = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8')

const THEMES = {
  clair: /:root\s*\{([\s\S]*?)\n\}/,
  sombre: /\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/,
  daltonien: /\[data-theme='daltonien'\]\s*\{([\s\S]*?)\n\}/,
}
const lire = (bloc) => {
  const out = {}
  for (const m of bloc.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim()
  return out
}
const tables = {}
for (const [nom, re] of Object.entries(THEMES)) {
  const m = css.match(re)
  if (!m) throw new Error(`Bloc de theme introuvable : ${nom}`)
  tables[nom] = lire(m[1])
}
// Le clair porte tous les jetons ; les deux autres n'en redefinissent qu'une
// partie et heritent du reste. On resout l'heritage ici, pour que la table
// dise la valeur EFFECTIVE et non ce qui est ecrit dans le bloc.
const noms = Object.keys(tables.clair)
for (const t of ['sombre', 'daltonien']) {
  for (const n of noms) if (!(n in tables[t])) tables[t][n] = tables.clair[n]
}

const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
const L = (h) => {
  const x = h.replace('#', '')
  if (x.length !== 6) return null
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16) / 255)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
const ratio = (a, b) => {
  const x = L(a), y = L(b)
  if (x === null || y === null) return null
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

let md = `# Jetons de design Bacchana - référence de portage (web, Android, iOS)

> **Ce fichier est GÉNÉRÉ.** Ne pas l'éditer à la main : lancer
> \`node scripts/gen_design_tokens_doc.mjs\`. Il lit \`src/styles/tokens.css\`,
> qui est lui-même le report du fichier Figma \`yw0aNHttIR5oWAw3k2VEiC\`.
> En cas d'écart entre Figma et le CSS, Figma a raison.
>
> Une table de couleurs recopiée à la main diverge au premier correctif, et
> personne ne le voit. C'est exactement ce qui s'est produit entre la maquette
> et le code jusqu'au 2026-08-30 : le CSS décrivait encore un système
> néobrutaliste orange que plus aucun écran ne montrait.

Toute implémentation native (Kotlin/Compose sur \`bacchana-android\`,
Swift/SwiftUI sur \`bacchana-ios\`) reproduit ces valeurs à l'identique, sans
deviner ni réinterpréter.

Les ratios sont calculés par la formule de luminance relative WCAG 2.1,
pas estimés. Seuils : **texte normal 4,5:1**, **texte large 3:1**,
**objet d'interface 3:1**.

## Les trois thèmes

| Jeton | Clair | Sombre (référence) | Daltonien |
|---|---|---|---|
`
for (const n of noms) {
  const c = tables.clair[n], s = tables.sombre[n], d = tables.daltonien[n]
  md += `| \`--color-${n}\` | \`${c}\` | \`${s}\` | \`${d}\` |\n`
}

md += `
## Contraste des encres sur chaque fond

Calculé sur les valeurs ci-dessus, thème par thème. Une case sous son seuil
est un défaut à corriger dans \`tokens.css\`, jamais à contourner dans un
composant.

`
for (const t of ['clair', 'sombre', 'daltonien']) {
  md += `### Thème ${t}\n\n| Encre | sur \`bg\` | sur \`surface-elevated\` | sur \`depth\` |\n|---|---|---|---|\n`
  for (const e of ['ink', 'ink-secondary', 'ink-muted', 'surimpression', 'danger', 'success', 'warning', 'filet-clair']) {
    const f = (fond) => {
      const r = ratio(tables[t][e], tables[t][fond])
      return r === null ? '-' : r.toFixed(2)
    }
    md += `| \`${e}\` | ${f('bg')} | ${f('surface-elevated')} | ${f('depth')} |\n`
  }
  md += '\n'
}

md += `## Les règles qui ne se déduisent pas de la table

1. **Sur un aplat \`surimpression\`, la seule encre admise est
   \`sur-surimpression\`.** L'encre claire n'atteint que 1,4 à 2,6:1 dessus.
2. **\`depth\` est un FOND, pas une encre.** C'est un panneau sombre dans les
   trois thèmes, y compris le clair. Ce qui vit dedans bascule ses jetons via
   la classe \`.contexte-profond\` (voir \`tokens.css\`) : un descendant qui
   repeint le fond sans repeindre le texte donne 1,72:1, mesuré le 2026-08-30.
3. **Les cartes à jouer et les aplats \`pop-*\` sont FIXES** dans les trois
   thèmes. L'encre posée dessus (\`tile-ink\`, \`card-ink\`) ne suit pas le
   thème, donc le fond ne le peut pas non plus.
4. **Le voile de modale (\`scrim\`) ne suit pas le thème.** Un voile qui
   suivrait l'encre virerait au crème en thème sombre et éclaircirait ce qu'il
   masque.
5. **Aucune ombre.** Les six \`--shadow-*\` valent \`none\` : l'élévation passe
   par \`--rule-engraved\`.
6. **La couleur ne porte jamais seule le sens.** \`success\`, \`warning\` et
   \`danger\` se distinguent par la teinte, l'axe que la deutéranopie confond :
   une icône ou un libellé double toujours l'information.

La garde \`scripts/check_contrast.mjs\` vérifie ces paires à chaque exécution
et sort en 1 si l'une d'elles passe sous son seuil.
`
writeFileSync(join(root, 'docs/DESIGN_TOKENS.md'), md)
console.log(`docs/DESIGN_TOKENS.md genere : ${noms.length} jetons, 3 themes`)
