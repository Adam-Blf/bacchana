/**
 * Monte les demonstrations : le fond de marque, plus la VRAIE session
 * enregistree dans l'application, posee dans son chassis.
 *
 * Deux etapes separees, et c'est voulu. `capture_app.mjs` enregistre le
 * produit qui tourne, ce qui demande un serveur et prend du temps. Ce
 * fichier-ci ne fait que composer, donc on peut retoucher un titre ou une
 * cadence sans rejouer une seule partie.
 *
 *   npm run anim:montage            toutes les demonstrations
 *   npm run anim:montage -- hub     une seule
 */
import { spawn } from 'node:child_process'
import { access, copyFile, mkdir, readFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(ICI, '../..')
const SORTIE = resolve(RACINE, 'design-system/animations')
const CAPTURES = resolve(SORTIE, 'captures')
const BUREAU = resolve(
  process.env.USERPROFILE ?? process.env.HOME ?? '.',
  'Desktop',
  'Bacchana - lancement',
  '1 - Demonstrations',
)

/**
 * La geometrie du chassis vient de scenes.mjs, elle n'est pas recopiee ici.
 *
 * Une seconde copie en dur derive au premier ajustement, et c'est le montage
 * qui se decale sans que rien ne le signale. On la LIT.
 */
async function chassis() {
  const css = await readFile(resolve(ICI, 'scenes.mjs'), 'utf8')
  const bloc = css.match(/\.chassis\{position:absolute;left:(\d+)px;top:(\d+)px;width:(\d+)px;height:(\d+)px/)
  if (!bloc) throw new Error("La regle .chassis a change de forme : le montage ne sait plus ou poser la video.")
  const [, x, y, l, h] = bloc.map(Number)
  // `.chassis` est desormais l'ECRAN exactement, pas la coque : la coque et le
  // rail se dessinent autour, et le calque avant arrondit les angles. Aucune
  // marge a retrancher, sinon la capture est decalee de 16 px dans le cadre.
  return { x, y, l, h }
}

/**
 * `debut` coupe le chargement de l'application, qui apparait en blanc puis en
 * pourpre vide pendant la premiere seconde. Personne ne regarde une seconde de
 * page blanche sur un reseau social.
 */
const DEMOS = [
  {
    nom: 'demo-hub',
    capture: 'hub',
    titre: 'QUATORZE JEUX\nUN SEUL TÉLÉPHONE',
    surtitre: 'AU COIN DU COMPTOIR',
    vitesse: 1.35,
    debut: 2.6,
  },
  {
    nom: 'demo-tu-preferes',
    capture: 'tu-preferes',
    titre: 'TU PRÉFÈRES ?\nLA MINORITÉ PAIE',
    surtitre: 'UN DES QUATORZE JEUX',
    vitesse: 1.15,
    debut: 2.6,
  },
  {
    nom: 'demo-sept-secondes',
    capture: 'sept-secondes',
    // Titre raccourci : « POUR CITER TROIS TRUCS » debordait du cadre a 104 px
    // et se coupait a « TROIS ». Deux lignes courtes valent mieux qu'une
    // phrase tronquee.
    titre: 'SEPT SECONDES\nCHRONO EN MAIN',
    surtitre: 'UN DES QUATORZE JEUX',
    vitesse: 1,
    debut: 2.6,
  },
  {
    nom: 'demo-regles',
    capture: 'regles',
    titre: 'LES RÈGLES\nEN DIX SECONDES',
    surtitre: 'AU COIN DU COMPTOIR',
    vitesse: 1.25,
    debut: 2.6,
  },
]

const existe = (p) => access(p).then(() => true, () => false)

function lancer(commande, args) {
  const p = spawn(commande, args, { stdio: ['ignore', 'ignore', 'pipe'] })
  let bruit = ''
  p.stderr.on('data', (d) => (bruit += d.toString()))
  return new Promise((ok, ko) =>
    p.on('close', (code) => (code === 0 ? ok() : ko(new Error(bruit.slice(-1400))))),
  )
}

const demandes = process.argv.slice(2)
const aFaire = DEMOS.filter((d) => demandes.length === 0 || demandes.includes(d.nom) || demandes.includes(d.capture))
if (aFaire.length === 0) {
  console.error(`Rien a monter. Demonstrations : ${DEMOS.map((d) => d.nom).join(', ')}`)
  process.exit(1)
}

const zone = await chassis()
console.log(`Chassis lu dans scenes.mjs : ${zone.l} x ${zone.h} a (${zone.x}, ${zone.y})\n`)
await mkdir(BUREAU, { recursive: true })

const faits = []
for (const demo of aFaire) {
  const capture = resolve(CAPTURES, `${demo.capture}.webm`)
  if (!(await existe(capture))) {
    console.error(`${demo.nom.padEnd(22)} capture absente, lance d'abord npm run anim:capture`)
    continue
  }

  // Le fond se rend par le moteur existant, avec ses propres gardes.
  await lancer('node', [
    resolve(ICI, 'rendu.mjs'),
    'plateau',
    '--options',
    JSON.stringify({ titre: demo.titre, surtitre: demo.surtitre }),
  ])
  const fond = resolve(SORTIE, 'plateau.png')
  if (!(await existe(fond))) throw new Error('Le plateau ne s est pas rendu.')

  // Le calque avant ne depend d'aucun titre : on ne le rend qu'une fois.
  const avant = resolve(SORTIE, 'chassis-avant.png')
  if (!(await existe(avant))) {
    await lancer('node', [resolve(ICI, 'rendu.mjs'), 'chassis-avant', '--options', '{}'])
  }

  const sortie = resolve(SORTIE, `${demo.nom}.mp4`)
  // `setpts` accelere la capture : une session jouee a vitesse humaine est
  // trop lente pour un reseau social, mais la rejouer plus vite fausserait le
  // pilotage. On accelere au montage, pas a la capture.
  // Trois couches, dans cet ordre : le plateau, la capture, puis le calque
  // avant du telephone. C'est la troisieme qui arrondit reellement les angles
  // de l'ecran et pose l'ilot dynamique par-dessus l'image.
  await lancer('ffmpeg', [
    '-y', '-loop', '1', '-i', fond,
    '-ss', String(demo.debut ?? 0), '-i', capture,
    '-loop', '1', '-i', avant,
    '-filter_complex',
    `[1:v]setpts=PTS/${demo.vitesse},scale=${zone.l}:${zone.h}:flags=lanczos[app];` +
      `[0:v][app]overlay=${zone.x}:${zone.y}:shortest=1[bg];` +
      `[bg][2:v]overlay=0:0:shortest=1[v]`,
    '-map', '[v]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-r', '30', '-movflags', '+faststart',
    sortie,
  ])

  await copyFile(sortie, resolve(BUREAU, basename(sortie)))
  faits.push(demo.nom)
  console.log(`${demo.nom.padEnd(22)} monte, vitesse x${demo.vitesse}`)
}

console.log(`\n${faits.length} demonstration(s) dans ${BUREAU}`)
