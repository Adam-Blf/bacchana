/**
 * Rend les animations de lancement en vraies videos.
 *
 * Le principe : une page qui ne fait QUE composer des transformations, une
 * horloge fixe pilotee depuis Node, et ffmpeg qui encode les trames au vol.
 * Aucune trame n'atterrit sur le disque, et aucune ne depend de la vitesse de
 * la machine - deux proprietes qu'un prototype de maquette n'a jamais.
 *
 *   npm run anim:rendu              tout
 *   npm run anim:rendu -- jour-j    une seule scene
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FORMATS, SCENES } from './scenes.mjs'
import { BRUITAGES } from './bruitage.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(ICI, '../..')
const SORTIE = resolve(RACINE, 'design-system/animations')
const CADENCE = 60
const DOSSIER_EXPORT = 'Bacchana - lancement'

const lisezMoi = (faits) =>
  [
    'BACCHANA - VISUELS DE LANCEMENT',
    '',
    'Rendus image par image a 60 i/s, 1080 x 1920 pour les stories et',
    '1080 x 1350 pour le fil. Codec H.264, son AAC.',
    '',
    ...faits.map(
      (f) =>
        `  ${basename(f.chemin).padEnd(26)} ${f.duree > 0 ? `${f.duree} s, ${f.trames} trames` : 'image fixe'}`,
    ),
    '',
    'LE SON. Les bruitages sont SYNTHETISES, pas telecharges : aucun droit',
    "d'auteur n'est engage. Si une musique est voulue, la prendre dans la",
    "bibliotheque audio d'Instagram, qui est licenciee pour cet usage.",
    '',
    'Refabriquer ces fichiers : npm run anim:rendu',
    'Changer les textes : scripts/animations/marque.mjs, objet TEXTES.',
  ].join('\n')

/* --------------------------------------------------- les quatorze jeux ---- */
/**
 * La liste vit ici, mais elle est CONFRONTEE au registre a chaque rendu.
 *
 * Les trois affiches de store annoncaient « Treize jeux » alors que le registre
 * en declare quatorze. Une liste recopiee a la main derive en silence, et c'est
 * l'affiche publiee qui porte le mensonge. On la verifie donc plutot que de
 * faire confiance.
 */
const JEUX = [
  ['BORDERLAND', 'LONG'],
  ['QUITTE OU DOUBLE', 'MOYEN'],
  ["LE TABLEAU D'HONNEUR", 'MOYEN'],
  ['LA CRIÉE', 'MOYEN'],
  ['LE TAULIER', 'COURT'],
  ['ACTION OU VÉRITÉ', 'COURT'],
  ["JE N'AI JAMAIS", 'COURT'],
  ['QUI DE NOUS', 'COURT'],
  ['TU PRÉFÈRES', 'COURT'],
  ["C'EST UN 10 MAIS", 'COURT'],
  ['7 SECONDES', 'COURT'],
  ['LE PILORI', 'MOYEN'],
  ['LA ROUE DU DESTIN', 'COURT'],
  ['LE FAUX FRÈRE', 'MOYEN'],
]

async function verifierLesJeux() {
  const src = await readFile(resolve(RACINE, 'src/core/engine/modeRegistry.ts'), 'utf8')
  const titres = [...src.matchAll(/^ {4}title: (?:'([^']*)'|"([^"]*)")/gm)].map(
    (m) => (m[1] ?? m[2]).replace(/\\'/g, "'").toUpperCase(),
  )
  const listes = JEUX.map(([n]) => n)
  const manquants = titres.filter((t) => !listes.includes(t))
  const inventes = listes.filter((n) => !titres.includes(n))
  if (titres.length !== JEUX.length || manquants.length || inventes.length) {
    throw new Error(
      `La carte ne correspond plus au registre.\n` +
        `  registre : ${titres.length} jeux, carte : ${JEUX.length}\n` +
        (manquants.length ? `  absents de la carte : ${manquants.join(', ')}\n` : '') +
        (inventes.length ? `  inconnus du registre : ${inventes.join(', ')}\n` : ''),
    )
  }
  return titres.length
}

/* ------------------------------------------------------------ les travaux - */
const OUVERTURE = 'OUVERTURE JEUDI 15 OCTOBRE'
const TRAVAUX = [
  { scene: 'jour-j', nom: 'jour-j', options: {} },
  { scene: 'affiche', nom: 'affiche-fil', options: {} },
  { scene: 'teaser', nom: 'teaser-ouverture', options: {}, boucle: true },
  { scene: 'la-carte', nom: 'la-carte', options: { jeux: JEUX } },
  { scene: 'compte-a-rebours', nom: 'rebours-3', options: { nombre: 3, mention: OUVERTURE } },
  { scene: 'compte-a-rebours', nom: 'rebours-2', options: { nombre: 2, mention: OUVERTURE } },
  { scene: 'compte-a-rebours', nom: 'rebours-1', options: { nombre: 1, mention: OUVERTURE } },
]

/* ------------------------------------------------------------- la page ---- */
const sansModules = (src) =>
  src.replace(/^import[\s\S]*?from '\.\/marque\.mjs'\n/m, '').replace(/^export /gm, '')

async function fabriquerPage() {
  const marque = sansModules(await readFile(resolve(ICI, 'marque.mjs'), 'utf8'))
  const scenes = sansModules(await readFile(resolve(ICI, 'scenes.mjs'), 'utf8'))
  const polices = []
  for (const p of JSON.parse(
    JSON.stringify(
      [...marque.matchAll(/fichier: '([^']+)', famille: '([^']+)', graisse: (\d+)/g)].map((m) => ({
        fichier: m[1],
        famille: m[2],
        graisse: m[3],
      })),
    ),
  )) {
    const b64 = (await readFile(resolve(RACINE, 'public/fonts', p.fichier))).toString('base64')
    polices.push(`@font-face{font-family:'${p.famille}';font-weight:${p.graisse};font-display:block;
      src:url(data:font/woff2;base64,${b64}) format('woff2')}`)
  }
  return { marque, scenes, polices: polices.join('\n') }
}

const html = ({ marque, scenes, polices }, travail, [L, H]) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
${polices}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${L}px;height:${H}px;overflow:hidden;background:#5B2C87}
#scene{position:relative;width:${L}px;height:${H}px;overflow:hidden;background:#5B2C87}
</style><style id="style-scene"></style></head>
<body><div id="scene"></div>
<script type="module">
${marque}
${scenes}
const OPTIONS = ${JSON.stringify(travail.options)}
document.getElementById('style-scene').textContent = STYLE
const scene = SCENES[${JSON.stringify(travail.scene)}]
document.getElementById('scene').innerHTML = scene.html(OPTIONS)
window.__duree = scene.duree
window.poser = (t) => scene.poser(t, (id) => document.getElementById(id), OPTIONS)

/**
 * Quel texte sort du cadre a l'instant courant.
 *
 * « MERCI DE VOTRE VISITE » etait coupe en deux par le bord bas, et je ne
 * l'ai vu qu'en regardant une capture. Une position calculee a la main derive
 * des qu'une marge bouge : on mesure donc le rendu reel, sur la trame qui
 * compte. Le papier a le droit de deborder, le texte non.
 */
window.__debordements = () => {
  const sortis = []
  for (const el of document.querySelectorAll('#scene *')) {
    if (el.children.length || !el.textContent.trim()) continue
    if (getComputedStyle(el).opacity === '0') continue
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    if (r.top < -1 || r.bottom > innerHeight + 1 || r.left < -1 || r.right > innerWidth + 1) {
      sortis.push({
        texte: el.textContent.trim().slice(0, 46),
        haut: Math.round(r.top), bas: Math.round(r.bottom),
        gauche: Math.round(r.left), droite: Math.round(r.right),
      })
    }
  }
  return sortis
}
window.poser(0)
window.__pret = true
</script></body></html>`

/* -------------------------------------------------------------- le rendu - */
function encoder(chemin, cadence, [L, H], son, duree) {
  // Le son entre comme SECOND flux, genere par ffmpeg lui-meme a partir d'une
  // expression : pas de fichier intermediaire, pas de synchronisation a
  // rattraper, et la piste dure exactement ce que dure l'image.
  const entrees = ['-f', 'image2pipe', '-framerate', String(cadence), '-i', '-']
  const pistes = ['-map', '0:v']
  if (son) {
    // L'expression DOIT etre entre quotes simples : elle contient des virgules,
    // et ffmpeg s'en sert pour separer les filtres d'une chaine. Sans elles,
    // « between(t,0.06,0.62) » devient trois filtres et le graphe ne s'ouvre
    // meme pas. Les quotes sont lues par ffmpeg lui-meme, pas par un shell :
    // les arguments partent en tableau, il n'y a aucune interpretation en
    // chemin.
    entrees.push('-f', 'lavfi', '-i', `aevalsrc=exprs='${son}':s=48000:d=${duree.toFixed(3)}`)
    pistes.push('-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest')
  }
  const ff = spawn(
    'ffmpeg',
    ['-y', ...entrees, ...pistes,
     '-vf', `scale=${L}:${H}`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
     '-pix_fmt', 'yuv420p', '-movflags', '+faststart', chemin],
    { stdio: ['pipe', 'ignore', 'pipe'] },
  )
  let bruit = ''
  ff.stderr.on('data', (d) => (bruit += d.toString()))
  // Quand ffmpeg refuse ses arguments il meurt aussitot, et la premiere trame
  // ecrite leve alors « write EOF » - une erreur qui masque la VRAIE cause.
  // On l'absorbe pour que le message de ffmpeg arrive jusqu'ici.
  ff.stdin.on('error', () => {})
  const fini = new Promise((ok, ko) =>
    ff.on('close', (code) => (code === 0 ? ok() : ko(new Error(bruit.slice(-1600))))),
  )
  return { ff, fini }
}

async function rendre(page, atelier, travail) {
  const scene = SCENES[travail.scene]
  const dims = FORMATS[scene.format]
  await page.setViewportSize({ width: dims[0], height: dims[1] })
  await page.setContent(html(atelier, travail, dims), { waitUntil: 'load' })
  await page.waitForFunction('window.__pret === true')
  await page.evaluate('document.fonts.ready')

  // Une scene de duree nulle est une image fixe : une affiche, pas une video.
  if (scene.duree === 0) {
    await page.evaluate('window.poser(0)')
    const png = await page.screenshot({ type: 'png' })
    const chemin = resolve(SORTIE, `${travail.nom}.png`)
    await writeFile(chemin, png)
    return {
      nom: travail.nom,
      trames: 1,
      duree: 0,
      chemin,
      sortis: await page.evaluate('window.__debordements()'),
    }
  }

  // Une boucle ne rend PAS sa derniere trame : elle est superposable a la
  // premiere, et la garder produirait un temps mort d'une image a chaque tour.
  const total = Math.round(scene.duree * CADENCE) - (travail.boucle ? 1 : 0)
  const chemin = resolve(SORTIE, `${travail.nom}.mp4`)
  const son = BRUITAGES[travail.scene]?.(travail.options)
  const { ff, fini } = encoder(chemin, CADENCE, dims, son, total / CADENCE)

  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.poser(t), i / CADENCE)
    const png = await page.screenshot({ type: 'png' })
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r))
    if (i === total - 1) {
      await writeFile(resolve(SORTIE, `${travail.nom}-derniere.png`), png)
    }
  }
  ff.stdin.end()
  await fini

  // La derniere trame est celle qu'on regarde le plus longtemps : c'est la
  // seule ou un debord vaut la peine d'arreter le rendu.
  const sortis = await page.evaluate('window.__debordements()')
  return {
    nom: travail.nom,
    trames: total,
    duree: +(total / CADENCE).toFixed(2),
    chemin,
    sortis,
  }
}

/* ------------------------------------------------------------------ main -- */
const demandes = process.argv.slice(2)
const aFaire = demandes.length
  ? TRAVAUX.filter((t) => demandes.includes(t.nom) || demandes.includes(t.scene))
  : TRAVAUX

if (aFaire.length === 0) {
  console.error(`Rien a rendre. Scenes : ${TRAVAUX.map((t) => t.nom).join(', ')}`)
  process.exit(1)
}

const compteJeux = await verifierLesJeux()
console.log(`Registre confronte : ${compteJeux} jeux, la carte est a jour.\n`)

await mkdir(SORTIE, { recursive: true })
const atelier = await fabriquerPage()
const navigateur = await chromium.launch()
const page = await navigateur.newPage({ deviceScaleFactor: 1 })

const faits = []
for (const travail of aFaire) {
  const debut = process.hrtime.bigint()
  const bilan = await rendre(page, atelier, travail)
  const secondes = Number(process.hrtime.bigint() - debut) / 1e9
  faits.push(bilan)
  console.log(
    `${bilan.nom.padEnd(20)} ${String(bilan.trames).padStart(4)} trames  ` +
      `${String(bilan.duree).padStart(5)} s a ${CADENCE} i/s  ` +
      `rendu en ${secondes.toFixed(1)} s`,
  )
}

await navigateur.close()

/* ------------------------------------------------------- garde de debord -- */
const fautifs = faits.filter((f) => f.sortis.length > 0)
for (const f of fautifs) {
  console.error(`\nDEBORDEMENT dans ${f.nom} :`)
  for (const s of f.sortis) {
    console.error(`  « ${s.texte} »  haut ${s.haut} bas ${s.bas} gauche ${s.gauche} droite ${s.droite}`)
  }
}

/* ------------------------------------------------------------- export ----- */
/**
 * Les fichiers partent aussi sur le Bureau, parce que c'est de la qu'on
 * publie. Le depot garde la source, le Bureau recoit ce qui se poste.
 */
const bureau = resolve(process.env.USERPROFILE ?? process.env.HOME ?? '.', 'Desktop', DOSSIER_EXPORT)
await mkdir(bureau, { recursive: true })
let exportes = 0
for (const f of faits) {
  await copyFile(f.chemin, resolve(bureau, basename(f.chemin)))
  exportes++
  const derniere = resolve(SORTIE, `${f.nom}-derniere.png`)
  if (f.duree > 0) {
    await copyFile(derniere, resolve(bureau, `${f.nom}-derniere.png`)).then(
      () => exportes++,
      () => {},
    )
  }
}
await writeFile(resolve(bureau, 'LISEZ-MOI.txt'), lisezMoi(faits))

console.log(`\n${faits.length} visuel(s) dans design-system/animations/`)
console.log(`${exportes} fichier(s) exportes vers ${bureau}`)
if (fautifs.length) {
  console.error(`\n${fautifs.length} scene(s) avec du texte hors cadre.`)
  process.exit(1)
}
