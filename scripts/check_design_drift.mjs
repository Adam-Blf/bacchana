#!/usr/bin/env node
/**
 * Garde : le vocabulaire de design reste celui du design system.
 *
 * LE DEFAUT QU'ELLE VERROUILLE. Un audit du 2026-08-07 a compte, sur des
 * ecrans pourtant tous ecrits dans le meme style : 92 `font-mono` sur une
 * famille qui ne rend aucune chasse fixe, 34 tailles de texte posees a la main
 * en pixels dont 13 sous le plancher d'accessibilite, trois voiles de modale
 * differents pour un seul role, et 32 hauteurs de frappe en dur. Aucune de ces
 * derives n'etait visible sur un ecran isole : elles ne se voient qu'en
 * comptant sur l'ensemble du depot. C'est exactement ce que fait cette garde.
 *
 * CE QU'ELLE NE VOIT PAS.
 *   - Les valeurs passees par prop ou calculees : `className={taille}` lui
 *     echappe entierement, elle lit du texte source.
 *   - Le style inline `style={{ fontSize: 11 }}`, qui contourne Tailwind.
 *   - La coherence SEMANTIQUE : elle verifie qu'on utilise `text-label`, pas
 *     qu'on l'utilise au bon endroit. Un label en `text-caption` passe.
 *   - Les fichiers hors `src/`, dont les maquettes et les scripts.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(RACINE, 'src')

/** Chaque regle nomme le remplacant, sinon le message n'aide personne. */
const INTERDITS = [
  {
    motif: /\bfont-mono\b/g,
    quoi: 'font-mono',
    pourquoi: 'la famille ne rend aucune chasse fixe',
    remplacer: 'font-hud (HUD) ou font-receipt (vraie mono)',
  },
  {
    motif: /\btext-\[\d+px\]/g,
    quoi: 'une taille de texte en pixels',
    pourquoi: 'les paliers vivent dans tailwind.config.js',
    remplacer: 'text-label (11px) ou text-caption (13px)',
  },
  {
    motif: /\bbg-(?:black|white)\/\d+/g,
    quoi: 'un noir ou un blanc brut',
    pourquoi: 'il ne suit pas le theme et duplique un token existant',
    remplacer: 'bg-scrim/80 pour un voile de modale',
  },
  {
    motif: /\bmin-h-\[(?:44|52)px\]/g,
    quoi: 'une hauteur de frappe en dur',
    pourquoi: 'ces deux valeurs sont des tokens',
    remplacer: 'min-h-touch (44px) ou min-h-row (52px)',
  },
]

function fichiers(dossier) {
  const sortie = []
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree)
    if (statSync(chemin).isDirectory()) sortie.push(...fichiers(chemin))
    else if (['.ts', '.tsx', '.css'].includes(extname(entree))) sortie.push(chemin)
  }
  return sortie
}

const echecs = []
for (const fichier of fichiers(SRC)) {
  const contenu = readFileSync(fichier, 'utf8')
  const lignes = contenu.split('\n')
  for (const regle of INTERDITS) {
    lignes.forEach((ligne, i) => {
      // Un commentaire a le droit de citer la valeur interdite, sinon on ne
      // pourrait pas documenter la regle elle-meme.
      if (/^\s*(\/\/|\*|\/\*)/.test(ligne)) return
      const trouves = ligne.match(regle.motif)
      if (trouves) {
        echecs.push({
          fichier: relative(RACINE, fichier),
          ligne: i + 1,
          trouve: trouves[0],
          regle,
        })
      }
    })
  }
}

if (echecs.length) {
  console.error('\nDerive de design : ECHEC\n')
  for (const e of echecs) {
    console.error(`  ${e.fichier}:${e.ligne}  ${e.trouve}`)
    console.error(`      ${e.regle.quoi} - ${e.regle.pourquoi}`)
    console.error(`      utiliser ${e.regle.remplacer}\n`)
  }
  process.exit(1)
}

console.log(
  `Design : ${fichiers(SRC).length} fichiers verifies, aucune valeur hors du systeme.`
)
