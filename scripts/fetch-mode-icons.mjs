// Vendorise les icones des modes en local (regle zero CDN) - script reproductible.
// Source : Icons8, style "Hatch" (formes pleines et epaisses, esprit gravure), choisi
// via le MCP icons8 parce que les jeux d'icones filaires generiques ne tiennent pas
// la DA neobrutaliste de La Taverne.
//
// Licence : plan Icons8 gratuit, attribution obligatoire - le lien vers icons8.com
// figure dans les mentions legales de l'app (src/components/legal/MentionsScreen.tsx).
//
// Les icones sont NORMALISEES apres telechargement : rognage sur l'encre reelle,
// mise a une masse optique commune, marge garantie. Sans cette passe, six des
// treize touchaient le bord de leur cadre et les tailles allaient de 240x150 a
// 170x210 : cote a cote, ca ne se lisait pas comme un jeu d'icones.
//
// Usage: node scripts/fetch-mode-icons.mjs
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons', 'modes')
mkdirSync(outDir, { recursive: true })

// Cle = valeur du champ `icon` d'un mode dans modeRegistry.ts (identifiant technique,
// inchange), valeur = id Icons8 du style hatch.
const ICONS = {
  // Le pique lui-meme, pas un porte-cartes : l'ancien glyphe (gbWhbq6znvTd)
  // etait un paquet vu de face, illisible a 32 pixels dans une tuile.
  Spade: 'VgjdTXf6ZKaD',      // enseigne pique - Le Coupe-Gorge
  Brain: 'ynJJpl0grKW6',      // cerveau - Quitte ou Trinque
  Medal: 'ZdmUKWCpj6JV',      // medaille - Le Tableau d'Honneur
  Megaphone: 'WCCI8L2xmjKt',  // megaphone - La Criee
  Crown: 'dv11MNIjLZvH',      // couronne medievale - Le Taulier
  Flame: '6kJL0jix2nVs',      // flamme - Action ou Verite
  HandMetal: 'xMYTX1mcJNWD',  // main - Je n'ai jamais
  Users: 'QN1t7yytS1zq',      // groupe - Qui de nous
  Scale: 'buSCkgPTDWHw',      // balance - C'est un 10 mais
  Heart: '3mCZ36yWoNsf',      // coeur - Tu preferes
  Timer: 'ggkq7ZKoggie',      // chronometre - 7 Secondes
  Gavel: 'Pay3czT9Oynm',      // justice - Le Pilori
  Disc3: 'wUAb4st0wH3H',      // roulette - La Roue du Destin
}

// On telecharge plus grand que la cible pour avoir de la matiere avant recadrage.
const SOURCE = 480
const SIZE = 240
// Encombrement maximal du sujet dans le cadre. Le reste est une marge garantie,
// sans laquelle une icone dessinee bord a bord se retrouve rognee dans la tuile.
const ENCOMBREMENT_MAX = 0.86

/** Boite englobante de l'encre (pixels non transparents) d'une image brute. */
function boiteEncre(data, width, height) {
  let x0 = width, y0 = height, x1 = -1, y1 = -1, aire = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 16) {
        aire++
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  return { x0, y0, largeur: x1 - x0 + 1, hauteur: y1 - y0 + 1, aire }
}

// --- Passe 1 : telechargement et mesure ------------------------------------
const mesures = []
for (const [glyph, id] of Object.entries(ICONS)) {
  const url = `https://img.icons8.com/?id=${id}&format=png&size=${SOURCE}`
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`echec ${glyph} (${id}) : ${res.status}`)
    continue
  }
  const brut = Buffer.from(await res.arrayBuffer())
  const { data, info } = await sharp(brut).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const b = boiteEncre(data, info.width, info.height)
  mesures.push({ glyph, brut, boite: b, cadre: info.width })
}

// --- Cible : l'aire d'encre mediane du jeu ---------------------------------
// La mediane plutot que la moyenne : une seule icone tres pleine ou tres fine ne
// doit pas tirer tout le jeu vers elle.
const parts = mesures.map((m) => m.boite.aire / (m.cadre * m.cadre)).sort((a, b) => a - b)
const partCible = parts[Math.floor(parts.length / 2)]
console.log(`aire d'encre cible : ${(partCible * 100).toFixed(1)} pourcent du cadre`)

// --- Passe 2 : recadrage, mise a l'echelle, centrage ------------------------
for (const { glyph, brut, boite, cadre } of mesures) {
  const partActuelle = boite.aire / (cadre * cadre)
  // Facteur qui amene l'icone a la masse optique commune...
  const parAire = Math.sqrt(partCible / partActuelle)
  // ...plafonne par l'encombrement, pour qu'aucune ne touche le bord.
  const parEncombrement = (SIZE * ENCOMBREMENT_MAX) / Math.max(boite.largeur, boite.hauteur)
  const echelle = Math.min(parAire * (SIZE / cadre), parEncombrement)

  const l = Math.max(1, Math.round(boite.largeur * echelle))
  const h = Math.max(1, Math.round(boite.hauteur * echelle))
  const sujet = await sharp(brut)
    .extract({ left: boite.x0, top: boite.y0, width: boite.largeur, height: boite.hauteur })
    .resize(l, h)
    .png()
    .toBuffer()

  const sortie = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: sujet, left: Math.round((SIZE - l) / 2), top: Math.round((SIZE - h) / 2) }])
    .png()
    .toBuffer()

  const name = `${glyph.toLowerCase()}.png`
  writeFileSync(join(outDir, name), sortie)
  console.log(`ok ${name} ${l}x${h} centre (${(sortie.length / 1024).toFixed(1)} kB)`)
}
console.log('done')
