import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { settle } from './settle.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const axeSource = readFileSync(
  join(__dirname, '..', '..', 'node_modules', 'axe-core', 'axe.min.js'),
  'utf-8'
)

/**
 * Mesure le contraste WCAG 2.1 du DOM RÉELLEMENT rendu (styles calculés,
 * inline, opacité composée, SVG) via axe-core - contrairement à
 * check_contrast.mjs (paires écrites à la main depuis tokens.css), cette
 * passe ne peut pas "oublier" une combinaison : elle voit tout ce que le
 * navigateur peint. Retourne les violations avérées (le seuil AA n'est pas
 * respecté) - les entrées "incomplete" d'axe (ombres de texte complexes,
 * fonds partiellement recouverts) sont des limites connues de l'outil sur du
 * contenu décoratif (SVG WaxSeal, segments de roulette en rotation) et ne
 * bloquent pas le build, voir README de ce dossier.
 */
export async function auditScreen(page, label) {
  await settle(page)
  await page.addScriptTag({ content: axeSource })
  const result = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, {
      runOnly: { type: 'rule', values: ['color-contrast'] },
      resultTypes: ['violations'],
    })
  })

  const findings = []
  for (const violation of result.violations) {
    for (const node of violation.nodes) {
      findings.push({
        label,
        selector: node.target.join(' '),
        html: (node.html || '').replace(/\s+/g, ' ').slice(0, 160),
        summary: (node.failureSummary || '').replace(/\s+/g, ' '),
      })
    }
  }
  return findings
}
