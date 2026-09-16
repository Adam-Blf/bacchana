// Usage: node verif-duo.mjs <baseUrl> <outDir>
//
// LES DEUX POSES DE L'IPHONE DUO, plus les poses voisines que le balayage en
// hauteur 900 ne pouvait pas voir.
//
// Pourquoi un script à part. L'écran ouvert du Duo mesure 890 x 626 : il est
// PLUS LARGE QUE HAUT (1,42:1). Une vérification qui ne fait varier que la
// largeur à hauteur constante ne le rencontre jamais, et c'est justement la
// pose où une mise en page pensée en colonnes peut se retrouver à cheval sur
// la pliure.
//
// Ce que Safari expose de la pliure : rien. Ni Viewport Segments, ni Device
// Posture (référence des classes d'écrans, section 3, vérifié sur les notes de
// version WebKit 26.0, 26.1 et 26.2). L'état ne se déduit donc PAS de la
// largeur seule : il se lit au rapport d'aspect. C'est ce que mesure ce script.
//
// Les valeurs de viewport du Duo sont des CALCULS de bases tierces, pas des
// mesures : l'appareil n'est pas livré à la date de ce contrôle. Elles sont
// traitées comme non vérifiées, et c'est la raison pour laquelle on teste aussi
// les poses voisines plutôt que ce seul couple de nombres.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { amorcerApp } from 'file:///C:/Users/adamb/Documents/Projets/BLF%20Labs/Bacchana/bacchana/.claude/worktrees/design-polish-impeccable/scripts/outils/amorce_app.mjs'
import { amorcerScores } from 'file:///C:/Users/adamb/Documents/Projets/BLF%20Labs/Bacchana/bacchana/.claude/worktrees/design-polish-impeccable/.impeccable/review/amorce_scores.mjs'

const [base, out] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const players = encodeURIComponent('Alice,Bob,Chloé,Dimitri,Églantine,Fabrice,Gwenaëlle,Hyacinthe')

const POSES = [
  { nom: 'duo-plie', w: 466, h: 678, dpr: 3 },
  { nom: 'duo-deplie', w: 890, h: 626, dpr: 3 },
  { nom: 'duo-deplie-portrait', w: 626, h: 890, dpr: 3 },
  { nom: 'fold8-deplie', w: 816, h: 616, dpr: 3 },
  { nom: 'fold8-ultra-deplie', w: 645, h: 715, dpr: 3.5 },
  { nom: 'fold7-deplie', w: 984, h: 1092, dpr: 2 },
  { nom: 'tel-paysage', w: 844, h: 390, dpr: 3 },
  { nom: 'ipad-split-tiers', w: 320, h: 1180, dpr: 2 },
  { nom: 'ipad-split-moitie', w: 507, h: 1180, dpr: 2 },
  { nom: 'min-absolu', w: 320, h: 568, dpr: 2 },
]

const mesure = () => {
  const de = document.documentElement
  const vw = de.clientWidth
  const defauts = []
  if (de.scrollWidth > vw + 1) defauts.push(`document deborde : ${de.scrollWidth} > ${vw}`)
  const coupe = (el) => {
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
    if (coupe(el)) continue
    if (r.right > vw + 1.5 || r.left < -1.5) {
      defauts.push(`hors cadre : <${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 50)}">`)
      if (defauts.length > 5) break
    }
  }
  // Le rapport d'aspect, qui est la SEULE façon de distinguer les poses dans
  // le Safari d'aujourd'hui. On le relève pour le rapport, pas pour décider.
  return { defauts, ratio: +(de.clientWidth / de.clientHeight).toFixed(2) }
}

const navigateur = await chromium.launch()
const rapport = []
let echecs = 0

for (const theme of ['dark', 'light']) {
  for (const p of POSES) {
    const ctx = await navigateur.newContext({
      viewport: { width: p.w, height: p.h },
      deviceScaleFactor: p.dpr,
      isMobile: true,
      hasTouch: true,
    })
    const page = await ctx.newPage()
    await amorcerApp(page, { theme, consentement: true })
    await amorcerScores(page)
    for (const [ecran, q] of [
      ['scores', 'screen=palmares'],
      ['hub', 'screen=hub'],
      ['accueil', 'screen=welcome'],
    ]) {
      await page.goto(`${base}/?${q}&players=${players}`, { waitUntil: 'networkidle' }).catch(() => {})
      await page.waitForTimeout(700)
      const { defauts, ratio } = await page.evaluate(mesure).catch(() => ({ defauts: [], ratio: 0 }))
      if (theme === 'dark') {
        await page.screenshot({ path: `${out}/${p.nom}-${ecran}.png` }).catch(() => {})
      }
      if (defauts.length) {
        echecs += 1
        rapport.push({ theme, pose: p.nom, ecran, ratio, defauts })
        console.log(`ECHEC ${theme} ${p.nom} ${ecran} (ratio ${ratio})`)
        defauts.slice(0, 3).forEach((d) => console.log('   ', d))
      }
    }
    await ctx.close()
  }
}

writeFileSync(`${out}/rapport-duo.json`, JSON.stringify(rapport, null, 2))
await navigateur.close()
console.log(echecs === 0 ? `OK - ${POSES.length} poses x 3 ecrans x 2 themes, aucun defaut` : `${echecs} cas en echec`)
