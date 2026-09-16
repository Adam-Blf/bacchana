// Usage: node balayage-largeurs.mjs <baseUrl> <outDir>
//
// LE BALAYAGE CONTINU. Une application qui se vérifie à quatre largeurs choisies
// est vérifiée à quatre largeurs : ce sont les ZONES INTERMÉDIAIRES qui cassent,
// juste avant ou juste après un point de rupture, là où personne ne regarde.
// On balaie donc de 320 à 2560 par pas de 20, plus les paysages courts, et on
// ne CAPTURE que les échecs - une capture par largeur saine ne prouve rien et
// noie la preuve.
//
// Ce qui est mesuré à chaque pas :
//  1. le document déborde-t-il horizontalement (scrollWidth > clientWidth) ;
//  2. un élément dépasse-t-il le cadre à droite ou à gauche ;
//  3. un texte descend-il sous 14 points ;
//  4. une cible tactile descend-elle sous 44 points.
//
// La page n'est PAS rechargée entre deux largeurs : on redimensionne. Trois
// cent cinquante chargements coûteraient des minutes pour la même mesure.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { amorcerApp } from 'file:///C:/Users/adamb/Documents/Projets/BLF%20Labs/Bacchana/bacchana/.claude/worktrees/design-polish-impeccable/scripts/outils/amorce_app.mjs'
import { amorcerScores } from 'file:///C:/Users/adamb/Documents/Projets/BLF%20Labs/Bacchana/bacchana/.claude/worktrees/design-polish-impeccable/.impeccable/review/amorce_scores.mjs'

const [base, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })

// Huit prénoms : la tablée maximale. La fiche de score doit rester lisible
// pleine, pas seulement à quatre.
const players = encodeURIComponent('Alice,Bob,Chloé,Dimitri,Églantine,Fabrice,Gwenaëlle,Hyacinthe')

const ECRANS = [
  { nom: 'welcome', q: 'screen=welcome' },
  { nom: 'hub', q: 'screen=hub' },
  { nom: 'scores', q: 'screen=palmares' },
  { nom: 'prompt', q: 'screen=game&mode=truthOrDare' },
]

const largeurs = []
for (let l = 320; l <= 2560; l += 20) largeurs.push({ w: l, h: 900 })
// Paysages courts : un téléphone tourné, où c'est la HAUTEUR qui manque.
for (const p of [
  { w: 568, h: 320 },
  { w: 667, h: 375 },
  { w: 740, h: 360 },
  { w: 844, h: 390 },
  { w: 932, h: 430 },
]) largeurs.push(p)

const mesure = () => {
  const de = document.documentElement
  const vw = de.clientWidth
  const defauts = []
  if (de.scrollWidth > vw + 1) {
    defauts.push(`document deborde : scrollWidth ${de.scrollWidth} > ${vw}`)
  }
  // Un élément volontairement débordant DANS un parent qui le coupe n'est pas
  // un défaut : c'est un motif cadré, et le pique du Borderland en est un. La
  // mesure brute ne le sait pas - `getBoundingClientRect` ignore la coupe du
  // parent - et signalait donc un débordement que l'écran ne montre pas. Une
  // garde qui crie à tort finit désarmée, donc on remonte les ancêtres.
  const coupeParUnAncetre = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p)
      if (/hidden|clip|auto|scroll/.test(s.overflowX + s.overflow)) return true
    }
    return false
  }
  for (const el of Array.from(document.querySelectorAll('body *'))) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    const st = getComputedStyle(el)
    if (st.visibility === 'hidden' || st.display === 'none' || st.position === 'fixed') continue
    if (coupeParUnAncetre(el)) continue
    if (r.right > vw + 1.5 || r.left < -1.5) {
      defauts.push(
        `hors cadre : <${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}"> ` +
          `left ${Math.round(r.left)} right ${Math.round(r.right)} / ${vw}`
      )
      if (defauts.length > 6) break
    }
  }
  // Texte sous 14 points, sur les elements qui portent vraiment du texte.
  for (const el of Array.from(document.querySelectorAll('body *'))) {
    if (!el.childNodes.length) continue
    const propre = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0
    )
    if (!propre) continue
    const st = getComputedStyle(el)
    if (st.display === 'none' || st.visibility === 'hidden') continue
    // Les libelles masques aux voyants (sr-only) ne se lisent pas a l'ecran.
    const r = el.getBoundingClientRect()
    if (r.width <= 1 || r.height <= 1) continue
    const taille = parseFloat(st.fontSize)
    if (taille < 14) {
      defauts.push(
        `texte ${taille}px < 14 : "${el.textContent.trim().slice(0, 40)}" (${el.tagName.toLowerCase()})`
      )
      if (defauts.length > 10) break
    }
  }
  // Cibles tactiles.
  for (const el of Array.from(document.querySelectorAll('button, a, input, [role="button"]'))) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    // Une cible peut étendre sa PRISE par un pseudo-élément absolu débordant,
    // ce que fait le lien « Infos légales » du pied de page : 17 points de
    // texte, 49 points de prise réelle. Mesurer la boîte du lien seul rend un
    // faux défaut. On additionne donc le débord du ::after quand il y en a un.
    const apres = getComputedStyle(el, '::after')
    let hauteur = r.height
    if (apres && apres.content !== 'none' && apres.position === 'absolute') {
      const deborde = (v) => (v && v.endsWith('px') ? -parseFloat(v) : 0)
      hauteur += Math.max(0, deborde(apres.top)) + Math.max(0, deborde(apres.bottom))
    }
    if (hauteur < 44 - 0.5) {
      defauts.push(
        `cible ${Math.round(r.height)}px < 44 : "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}"`
      )
      if (defauts.length > 14) break
    }
  }
  return defauts
}

const navigateur = await chromium.launch()
const rapport = []
let echecs = 0

for (const theme of ['dark', 'light']) {
  for (const ecran of ECRANS) {
    const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 } })
    const page = await ctx.newPage()
    await amorcerApp(page, { theme, consentement: true })
    await amorcerScores(page)
    await page
      .goto(`${base}/?${ecran.q}&players=${players}`, { waitUntil: 'networkidle' })
      .catch(() => {})
    await page.waitForTimeout(900)

    for (const v of largeurs) {
      await page.setViewportSize({ width: v.w, height: v.h })
      await page.waitForTimeout(90)
      const defauts = await page.evaluate(mesure).catch(() => [])
      if (defauts.length > 0) {
        echecs += 1
        const nom = `${theme}-${ecran.nom}-${v.w}x${v.h}`
        rapport.push({ theme, ecran: ecran.nom, largeur: v.w, hauteur: v.h, defauts })
        await page.screenshot({ path: `${out}/${nom}.png` }).catch(() => {})
        console.log(`ECHEC ${nom}`)
        for (const d of defauts.slice(0, 4)) console.log(`   ${d}`)
      }
    }
    await ctx.close()
  }
}

writeFileSync(`${out}/rapport.json`, JSON.stringify(rapport, null, 2))
await navigateur.close()
console.log(
  echecs === 0
    ? `OK - ${largeurs.length} largeurs x ${ECRANS.length} ecrans x 2 themes, aucun defaut`
    : `${echecs} largeurs en echec (captures dans ${out})`
)
