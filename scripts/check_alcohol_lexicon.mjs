#!/usr/bin/env node
/**
 * Garde mécanique du lexique alcool - le validateur du dépôt de contenu
 * (`bacchana-content`) bloque tout terme d'alcool dans les packs JSON, mais il ne
 * couvre pas ce dépôt : `src/**\/*.ts(x)` (moteurs de jeu, écrans, contenu embarqué en
 * dur comme `src/content/*.ts`) est du CODE et échappe à cette garde-là. Ce script
 * échoue (exit 1) si un terme du lexique apparaît dans ces fichiers.
 *
 * Contexte : bug réel corrigé le 2026-08-05 - `src/core/engine/modeRegistry.ts`
 * prescrivait "tu bois", "trinque" (mode "Quitte ou Trinque") dans des chaînes
 * affichées à l'écran. Guideline App Store 1.4.3 : rejet quasi certain pour toute
 * app qui encourage la consommation d'alcool. Ce script transforme "on l'a nettoyé
 * une fois" en garde permanente.
 *
 * Portée volontairement limitée à `src/**\/*.ts(x)`, hors `*.test.ts(x)` (fixtures de
 * test non expédiées en production) et hors `src/content/packs/**\/*.json` (JSON
 * synchronisé depuis `bacchana-content`, déjà gardé côté dépôt de contenu).
 *
 * "alcool" seul n'est PAS dans le lexique : les écrans légaux et l'onboarding
 * affirment légitimement "sans alcool" / "n'encourage pas l'alcool" - c'est le
 * positionnement recherché, pas une violation.
 *
 * `gorgees` (sans accent) et `SHOT`/`shots`/`sips` restent des identifiants
 * techniques internes (PenaltyUnit, schéma de pack) jamais affichés tels quels à
 * l'écran (voir `calculatePenalty` dans `src/core/borderland.ts` : le texte réellement
 * affiché est toujours "N pénalité(s)" ou "PÉNALITÉ MAJEURE"). Le lexique ci-dessous
 * cible donc la prose accentuée ("gorgée"/"gorgées"), jamais l'enum technique.
 *
 * Usage : node scripts/check_alcohol_lexicon.mjs
 * Branché dans `npm test` (voir package.json) et la CI (.github/workflows/ci.yml).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = join(__dirname, '..', 'src')

// ============================================================
// 1. Lexique - mots/expressions qui n'ont aucune raison légitime d'apparaître dans
//    une chaîne de code, sauf pour prescrire ou décrire la consommation d'alcool.
//    Chaque entrée est un couple [étiquette, RegExp] - la RegExp porte ses propres
//    \b pour éviter les faux positifs sur des mots plus longs (ex. "livrer" contient
//    "ivre", "boisson" contient "bois", "verrouille" ne contient PAS "verre").
// ============================================================

const LEXICON = [
  ['trinquer/trinque(nt)', /\btrinqu\w*/i],
  ['boire/bois/boit/boivent', /\bboi(s|t|re|vent)\b/i],
  ['gorgée(s) (prose accentuée, distincte de l\'enum technique "gorgees")', /gorgées?\b/i],
  ['cul sec', /cul[- ]sec/i],
  ['verre (contenant à boire)', /\bverres?\b/i],
  // (?<!-) exclut le jargon dev anglais légitime ("one-shot" = exécution unique,
  // rencontré dans les commentaires de migration) sans rouvrir la porte au terme
  // alcool : "shot" reste banni partout ailleurs, espace compris ("un shot").
  ['shot (prose, minuscule - distinct de l\'enum technique "SHOT")', /(?<!-)\bshot\b/],
  ['cuite (ivresse)', /\bcuites?\b/i],
  ['"la maison ne fait pas crédit"', /fait pas crédit/i],
  ['apéro', /\bap[ée]ro\b/i],
  ['ivre', /\bivres?\b/i],
  ['soûl/saoul', /\bso[uû]l(e|s|es)?\b/i],
  ['biture', /\bbitures?\b/i],
  ['beuverie', /\bbeuveries?\b/i],
  ['whisky', /\bwhisky\b/i],
  ['vodka', /\bvodkas?\b/i],
  ['rhum', /\brhums?\b/i],
  ['bière', /\bbi[eè]res?\b/i],
  ['cocktail (boisson)', /\bcocktails?\b/i],
  ['tequila', /\btequilas?\b/i],
  ['champagne', /\bchampagnes?\b/i],
  ['vin (boisson)', /\bvins?\b/i],
]

// ============================================================
// 2. Portée : src/**\/*.ts(x), hors *.test.ts(x). Le contenu JSON synchronisé
//    (src/content/packs/**) est déjà hors périmètre (extension .json, pas .ts(x)).
// ============================================================

function collectSourceFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stats = statSync(full)
    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(full))
      continue
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue
    if (/\.test\.(ts|tsx)$/.test(entry)) continue
    files.push(full)
  }
  return files
}

const files = collectSourceFiles(SRC_DIR)

// ============================================================
// 3. Évaluation
// ============================================================

const findings = []

for (const file of files) {
  const content = readFileSync(file, 'utf-8')
  const lines = content.split('\n')
  for (const [label, pattern] of LEXICON) {
    lines.forEach((line, i) => {
      if (pattern.test(line)) {
        findings.push({ file: relative(join(__dirname, '..'), file), line: i + 1, label, text: line.trim() })
      }
    })
  }
}

console.log('\nGarde du lexique alcool (scripts/check_alcohol_lexicon.mjs)\n')
console.log(`${files.length} fichier(s) source scannés (src/**/*.ts(x), hors *.test.ts(x)).\n`)

if (findings.length > 0) {
  console.error(`${findings.length} occurrence(s) interdite(s) détectée(s) :\n`)
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  [${f.label}]`)
    console.error(`    ${f.text}`)
  }
  console.error(
    '\nTerme du lexique alcool trouvé dans du code (chaîne potentiellement visible à l\'écran).' +
      '\nApple guideline 1.4.3 : reformuler en pénalité abstraite avant de committer.\n'
  )
  process.exit(1)
}

console.log('Aucun terme du lexique alcool détecté dans le code source.')
