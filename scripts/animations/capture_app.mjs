/**
 * Capture le VRAI produit en train de tourner, pour en faire des demonstrations.
 *
 * POURQUOI. Les premiers visuels de lancement etaient tous de l'affiche : un
 * ticket, un teaser, un compte a rebours. Aucun ne montrait un ecran, une carte
 * ou une partie. Pour vendre un jeu de tablee, c'est le defaut principal : on
 * demande aux gens d'acheter quelque chose qu'ils n'ont jamais vu.
 *
 * On enregistre donc une vraie session, pilotee sur l'application construite,
 * a la taille d'un telephone. Playwright filme la page a la cadence du
 * navigateur, donc les animations de l'application sont capturees telles
 * qu'elles s'affichent, sans recollage de captures fixes.
 *
 *   npm run anim:capture            toutes les demonstrations
 *   npm run anim:capture -- hub     une seule
 */
import { chromium } from 'playwright'
import { mkdir, readdir, rename, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(ICI, '../..')
const SORTIE = resolve(RACINE, 'design-system/animations/captures')
const ADRESSE = process.env.BACCHANA_APERCU ?? 'http://localhost:4319'
const TELEPHONE = { width: 390, height: 844 }

/** Attente lisible a l'ecran : une demonstration n'est pas un test, elle se regarde. */
const pose = (page, ms) => page.waitForTimeout(ms)

/**
 * Le bandeau cookies n'apparait qu'APRES l'ecran d'accueil, et il couvre le bas
 * de l'ecran. Le congedier trop tot ne fait rien, et il bloque ensuite tous les
 * clics de la zone basse : c'est ce qui faisait expirer la mise en place de la
 * tablee. On le chasse donc quand il est la, et on reverifie avant chaque
 * sequence.
 */
async function chasserLeBandeau(page) {
  const refuser = page.getByRole('button', { name: /tout refuser/i }).first()
  if (await refuser.isVisible().catch(() => false)) {
    await refuser.click()
    await pose(page, 450)
    return true
  }
  return false
}

async function ouvrir(page) {
  await page.goto(ADRESSE, { waitUntil: 'networkidle' })
  // L'accueil est un carrousel : on le passe, il ne fait pas partie de ce
  // qu'on montre.
  const passer = page.getByRole('button', { name: /^passer$/i }).first()
  if (await passer.isVisible().catch(() => false)) {
    await passer.click()
    await pose(page, 600)
  }
  await chasserLeBandeau(page)
  // Le bandeau peut arriver avec un temps de retard : on lui laisse sa chance.
  await pose(page, 700)
  await chasserLeBandeau(page)
}

/**
 * Met la tablee en place.
 *
 * La saisie des quatre prenoms prenait six secondes a l'ecran, sur des
 * captures de treize. La mise en place n'est le SUJET d'aucune demonstration :
 * elle se voit assez a vingt millisecondes par caractere, et les secondes
 * gagnees vont au jeu, qui est ce qu'on vient montrer.
 */
async function poserLaTablee(page, prenoms) {
  await chasserLeBandeau(page)
  for (let i = 0; i < prenoms.length; i++) {
    if (i >= 2) {
      const chaise = page.getByRole('button', { name: /une chaise de plus/i })
      await chaise.scrollIntoViewIfNeeded().catch(() => {})
      await chaise.click({ timeout: 8000 })
      await pose(page, 140)
    }
    const champ = page.locator('input[type="text"]').nth(i)
    await champ.click()
    // Frappe visible mais rapide : une saisie instantanee ne se lit pas.
    await champ.pressSequentially(prenoms[i], { delay: 20 })
    await pose(page, 90)
  }
  await pose(page, 420)
  await page.getByRole('button', { name: /pousser la porte/i }).click()
  await page.getByRole('button', { name: /lance la soirée/i }).waitFor({ timeout: 15000 })
  await pose(page, 700)
}

/**
 * Lance un jeu depuis le hub.
 *
 * Chaque tuile est un conteneur qui porte DEUX boutons : la tuile elle-meme et
 * un bouton « Regles ». Viser le jeu par son nom attrapait le second, donc la
 * demonstration ouvrait les regles ou ne faisait rien, et les captures
 * finissaient sur un ecran vide. On vise donc le PREMIER bouton du conteneur
 * dont le texte porte le nom du jeu.
 */
async function lancerLeJeu(page, motif) {
  // On filtre des BOUTONS, pas des div. `filter({hasText})` sur des div
  // remonte jusqu'aux ancetres, donc le premier bouton du conteneur retenu
  // etait le premier bouton de la page : la demonstration de 7 Secondes
  // lancait Quitte ou Double. Le bouton « Regles » d'une tuile ne porte pas le
  // nom du jeu, viser les boutons suffit donc a le distinguer.
  const tuile = page.locator('main button').filter({ hasText: motif }).first()
  await tuile.scrollIntoViewIfNeeded().catch(() => {})
  await pose(page, 400)
  await tuile.click({ timeout: 10000 })
  // On attend que le hub ait vraiment disparu : sans cette garde, la suite du
  // script joue dans le vide et la video ne montre rien.
  await page
    .getByRole('button', { name: /lance la soirée/i })
    .waitFor({ state: 'hidden', timeout: 12000 })
    .catch(() => {})
  await pose(page, 900)
}

const DEMOS = {
  /** Le hub : quatorze jeux, vus d'un coup. C'est l'argument, il doit se voir. */
  hub: async (page) => {
    await poserLaTablee(page, ['Léa', 'Marco', 'Sami', 'Nour'])
    await pose(page, 1200)
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, 260)
      await pose(page, 600)
    }
    await page.mouse.wheel(0, -800)
    await pose(page, 900)
  },

  /** Tu preferes : deux options, un vote, une penalite. Se comprend sans son. */
  'tu-preferes': async (page) => {
    await poserLaTablee(page, ['Léa', 'Marco', 'Sami', 'Nour'])
    await lancerLeJeu(page, /tu préfères/i)
    for (let tour = 0; tour < 3; tour++) {
      const options = page.locator('main button:visible')
      const n = await options.count()
      if (n === 0) break
      await options.nth(tour % Math.max(1, Math.min(n, 2))).click()
      await pose(page, 1500)
      const suivant = page.getByRole('button', { name: /suivant|continuer|manche/i }).first()
      if (await suivant.isVisible().catch(() => false)) {
        await suivant.click()
        await pose(page, 1100)
      }
    }
  },

  /** 7 Secondes : le chronometre est l'argument, il se filme tout seul. */
  'sept-secondes': async (page) => {
    await poserLaTablee(page, ['Léa', 'Marco', 'Sami', 'Nour'])
    await lancerLeJeu(page, /7 secondes/i)
    for (let i = 0; i < 2; i++) {
      const lancer = page.locator('main button:visible').first()
      if (await lancer.isVisible().catch(() => false)) {
        await lancer.click()
        // On laisse le chronometre descendre : c'est LE plan de cette demo.
        await pose(page, 8500)
      }
    }
  },

  /** Les regles, montrees comme une preuve que le jeu s'explique en dix secondes. */
  regles: async (page) => {
    await poserLaTablee(page, ['Léa', 'Marco', 'Sami', 'Nour'])
    await lancerLeJeu(page, /le faux frère/i)
    const regles = page.getByRole('button', { name: /voir les règles/i }).first()
    if (await regles.isVisible().catch(() => false)) {
      await regles.click()
      await pose(page, 3500)
      await page.mouse.wheel(0, 240)
      await pose(page, 2200)
    }
  },
}

const demandes = process.argv.slice(2)
const aFaire = Object.keys(DEMOS).filter((n) => demandes.length === 0 || demandes.includes(n))
if (aFaire.length === 0) {
  console.error(`Rien a capturer. Demonstrations : ${Object.keys(DEMOS).join(', ')}`)
  process.exit(1)
}

// On n'efface QUE ce qu'on refait. Vider le dossier entier detruisait les
// captures qu'on ne redemandait pas, et le montage suivant echouait sur une
// capture absente sans qu'on comprenne pourquoi.
await mkdir(SORTIE, { recursive: true })
for (const nom of aFaire) {
  await rm(resolve(SORTIE, `${nom}.webm`), { force: true })
  await rm(resolve(SORTIE, nom), { recursive: true, force: true })
}

const navigateur = await chromium.launch()
const faits = []

for (const nom of aFaire) {
  const dossier = resolve(SORTIE, nom)
  await mkdir(dossier, { recursive: true })
  const contexte = await navigateur.newContext({
    viewport: TELEPHONE,
    deviceScaleFactor: 2,
    recordVideo: { dir: dossier, size: TELEPHONE },
    locale: 'fr-FR',
    colorScheme: 'dark',
  })
  const page = await contexte.newPage()
  const debut = process.hrtime.bigint()
  try {
    await ouvrir(page)
    await DEMOS[nom](page)
  } catch (e) {
    console.error(`  ${nom} : interrompu, ${e.message.split('\n')[0]}`)
  }
  const secondes = Number(process.hrtime.bigint() - debut) / 1e9
  await contexte.close() // c'est la fermeture qui ecrit le fichier video

  const [fichier] = (await readdir(dossier)).filter((f) => f.endsWith('.webm'))
  if (!fichier) {
    console.error(`  ${nom} : AUCUNE video ecrite`)
    continue
  }
  const chemin = resolve(SORTIE, `${nom}.webm`)
  await rename(resolve(dossier, fichier), chemin)
  await rm(dossier, { recursive: true, force: true })
  faits.push({ nom, chemin, secondes: +secondes.toFixed(1) })
  console.log(`${nom.padEnd(16)} ${String(secondes.toFixed(1)).padStart(5)} s captures`)
}

await navigateur.close()
console.log(`\n${faits.length} capture(s) dans design-system/animations/captures/`)
