// Garde de contenu. Elle ne juge pas le gout : elle attrape les defauts de
// FABRICATION qu'un relecteur ne voit plus au bout de vingt cartes.
//
// Origine, 2026-08-30 : trois paquets de 80 cartes commencaient chacun par les
// MEMES quatre mots sur 80 items sur 80. « Cite 3 », « Qui est le plus
// susceptible de », « C'est un 10 mais ». 240 cartes, trois phrases. Une
// tablee arrete de lire une phrase dont elle connait la premiere moitie : au
// troisieme tour, elle ne lit plus que les cinq derniers mots. Ce n'est pas
// une question de style, c'est mecanique - et c'est ce qui fait dire que les
// questions sont « du niveau du cheval blanc d'Henri IV ».
//
// Les sept controles sont volontairement SYNTAXIQUES. Une garde qui pretend
// juger si une carte est drole serait fausse la moitie du temps, et une garde
// qui crie a tort finit desactivee - ce qui est pire que pas de garde.
//
// Usage : node scripts/check_contenu.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dossier = join(root, 'src/content/packs')

/** Mots qui designent quelqu'un a la table. Une carte qui n'en contient aucun
 *  parle du monde, pas de la tablee. */
const PIVOTS = [
  '{player}', '{player2}', 'ton voisin', 'ta voisine', 'la tablée', 'la tablee',
  "qui d'entre nous", 'désigne', 'designe', 'choisis', 'vote', 'chacun',
  'tout le monde', 'la table', 'quelqu', 'celui', 'celle',
]

/** Ce qui ne se choisit pas, ou ce qui sort de la piece. Une carte qui vise un
 *  trait subi ne se rattrape pas : le joueur vise ne peut pas en rire.
 *  Une carte dont la consequence sort de la piece implique un absent qui n'a
 *  rien accepte, et elle survit a la soiree. */
const INTERDITS = [
  // Le corps et ce qui ne se choisit pas
  'pompes', 'squats', 'gainage', 'planche pendant', 'chauve', 'calvitie',
  'kilos', 'ton poids', 'obèse', 'obese', 'maigre',
  // Ce qui sort de la piece, vers quelqu'un qui n'a rien demande
  'appelle un', 'appelle ton', 'appelle ta', 'envoie un message', 'envoie un sms',
  'poste ', 'publie ', 'story', 'photo de profil',
  // Les vrais debats, qui divisent pour de bon et pas pour rire
  'terre est plate', 'complotist', 'vaccin',
  // L'ingestion forcee, y compris d'eau : c'est aussi ce qui attire l'oeil
  // d'un examinateur de magasin sur toute la mecanique de penalite.
  'refuse de boire', 'oblige à boire', 'oblige a boire', 'hydratation forcée',
]

/** Un litige que la carte ouvre sans nommer d'arbitre reste ouvert a table. */
const LITIGES = ["si c'est nul", "si c'est bien", 'le groupe décide si', 'le groupe decide si']

// Bornes de longueur. Le plancher a d'abord ete pose a 40 signes : il faisait
// echouer 93 cartes dont beaucoup de vraies questions breves et bonnes
// (« C'est qui ton crush secret ici ? », 32 signes). Une garde qui crie a tort
// finit desactivee, ce qui est pire que pas de garde : le plancher descend a
// 28, la longueur ou une question cesse de porter une contrainte.
const MIN = 28
const MAX = 140
const SEUIL_ATTAQUE = 0.15
const SEUIL_DOUBLON = 0.7

const normaliser = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()

const echecs = []
let sansCible = 0
const ajouter = (pack, id, controle, detail) => echecs.push({ pack, id, controle, detail })

const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.json'))
let cartes = 0

for (const f of fichiers) {
  const pack = JSON.parse(readFileSync(join(dossier, f), 'utf8'))
  const items = pack.items ?? []
  if (!items.length) continue
  cartes += items.length

  // 2. Attaque repetee. Le defaut qui a motive cette garde.
  //
  //    NUANCE apprise en calibrant, 2026-08-30 : certaines formules SONT la
  //    mecanique du mode. « Je n'ai jamais X » et « C'est un 10 mais X »
  //    ouvrent 100 % de leur paquet parce que c'est le nom du jeu. Exiger 80
  //    ouvertures differentes reviendrait a demander de casser le mode - et
  //    une garde qui reclame l'impossible se fait contourner, pas corriger.
  //
  //    On detecte donc la formule dominante, on la RETIRE, et on mesure la
  //    repetition de ce qui SUIT. C'est la que le defaut vit vraiment : une
  //    tablee ne decroche pas parce que la formule revient, elle decroche
  //    parce que ce qui vient apres se ressemble.
  const compter = (n) => {
    const m = new Map()
    for (const it of items) {
      const mots = normaliser(it.text ?? '').split(' ').slice(0, n).join(' ')
      m.set(mots, (m.get(mots) ?? 0) + 1)
    }
    return m
  }
  const attaques4 = compter(4)
  let formule = null
  for (const [mots, n] of attaques4) {
    if (n / items.length >= 0.6) formule = mots
  }
  const attaques = new Map()
  for (const it of items) {
    let norm = normaliser(it.text ?? '')
    if (formule && norm.startsWith(formule)) norm = norm.slice(formule.length).trim()
    const mots = norm.split(' ').slice(0, 4).join(' ')
    if (mots) attaques.set(mots, (attaques.get(mots) ?? 0) + 1)
  }
  for (const [mots, n] of attaques) {
    const part = n / items.length
    if (part > SEUIL_ATTAQUE) {
      const apres = formule ? ` (après la formule « ${formule} »)` : ''
      ajouter(f, '—', 'attaque répétée',
        `« ${mots} »${apres} ouvre ${n} cartes sur ${items.length} (${Math.round(part * 100)} %, plafond ${SEUIL_ATTAQUE * 100} %)`)
    }
  }

  // Les modes ou la consigne s'adresse a toute la table par construction :
  // le pivot de designation y serait un pleonasme.
  const collectifParMecanique = /never|jamais|prefere|préfère|would-you|qui-de-nous|cest-un-10|10-classique/.test(f)

  const vus = []
  for (const it of items) {
    const txt = it.text ?? ''
    const bas = txt.toLowerCase()
    const norm = normaliser(txt)

    // 1. Longueur. Trop court = pas de contrainte ; trop long = illisible a
    //    voix haute dans une piece bruyante.
    if (txt.length < MIN || txt.length > MAX) {
      ajouter(f, it.id, 'longueur', `${txt.length} signes, hors bornes ${MIN} à ${MAX}`)
    }

    // 3. Pivot absent.
    //
    //    DEUX recalibrages, le meme jour, pour la meme raison : ce controle
    //    accusait des cartes justes.
    //    - D'abord 355 echecs sur 480, parce qu'il exigeait un pivot sur
    //      « Je n'ai jamais X », qui interroge toute la table par sa mecanique.
    //    - Puis 84, parce qu'il exigeait un pivot sur une verite adressee au
    //      joueur dont c'est le tour : le mode designe deja qui repond.
    //
    //    Il ne se prononce donc plus que sur ce qu'il peut PROUVER : une carte
    //    qui DECLARE viser quelqu'un d'autre (`chosen`, `pair`, `all`) et dont
    //    le texte ne designe personne. Partout ailleurs la donnee manque, et
    //    un controle qui accuse sur une donnee absente est un controle faux.
    const cible = it.targets
    const viseAutrui = cible === 'chosen' || cible === 'pair' || cible === 'all'
    if (viseAutrui && !PIVOTS.some((p) => bas.includes(p))) {
      ajouter(f, it.id, 'ne désigne personne', `déclare viser « ${cible} » mais le texte ne nomme personne`)
    }
    if (!cible) sansCible++

    // 4. Barre trop basse sur un mode chronometre : un chrono que personne ne
    //    rate n'est plus un chrono.
    const m = bas.match(/cite\s+(\d+)/)
    if (m && Number(m[1]) <= 3) {
      ajouter(f, it.id, 'barre trop basse', `« cite ${m[1]} » se réussit sans effort`)
    }

    // 5. Quasi-doublon dans le meme pack.
    const motsA = new Set(norm.split(' ').filter((w) => w.length > 3))
    for (const [autreId, motsB] of vus) {
      if (!motsA.size || !motsB.size) continue
      let communs = 0
      for (const w of motsA) if (motsB.has(w)) communs++
      const part = communs / Math.min(motsA.size, motsB.size)
      if (part > SEUIL_DOUBLON) {
        ajouter(f, it.id, 'quasi-doublon', `${Math.round(part * 100)} % de mots communs avec ${autreId}`)
        break
      }
    }
    vus.push([it.id, motsA])

    // 6. Liste noire.
    for (const mot of INTERDITS) {
      if (bas.includes(mot)) { ajouter(f, it.id, 'hors périmètre', `contient « ${mot} »`); break }
    }

    // 7. Litige sans arbitre.
    for (const l of LITIGES) {
      if (bas.includes(l)) { ajouter(f, it.id, 'litige non arbitré', `« ${l} » sans juge nommé`); break }
    }
  }
}

const parControle = new Map()
for (const e of echecs) parControle.set(e.controle, (parControle.get(e.controle) ?? 0) + 1)

console.log(`\n${cartes} cartes lues dans ${fichiers.length} paquets.\n`)
if (!echecs.length) {
  console.log('Aucun défaut de fabrication détecté.')
  process.exit(0)
}
if (sansCible) {
  // Information, pas defaut : on ne peut pas reprocher a une carte de ne pas
  // declarer un champ que le schema n'exige pas encore. Mais tant qu'il
  // manque, le controle 3 est aveugle sur ces cartes-la, et rendre ce champ
  // obligatoire est le prochain pas structurel du lot contenu.
  console.log(`  info  ${sansCible} cartes ne declarent pas de champ targets.`)
  console.log("        Le controle « ne designe personne » est aveugle sur elles.")
  console.log('')
}
for (const [controle, n] of [...parControle].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${controle}`)
  for (const e of echecs.filter((x) => x.controle === controle).slice(0, 3)) {
    console.log(`        ${e.pack} ${e.id} : ${e.detail}`)
  }
  const reste = n - 3
  if (reste > 0) console.log(`        … et ${reste} autres`)
}
console.log(`\n${echecs.length} défauts. Cette garde attrape la FABRICATION, pas le goût :`)
console.log('une carte qui passe ces sept contrôles peut rester plate, mais une')
console.log("carte qui en échoue un ne peut pas être bonne.\n")
process.exit(1)
