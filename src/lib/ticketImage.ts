/**
 * L'addition, dessinee en image pour le partage.
 *
 * Le bouton « Partager » envoyait du TEXTE : un classement en lignes, sans
 * papier, sans crantage, sans code-barres. Le ticket de caisse est l'element
 * signature de l'ecran de fin - c'est lui qu'on veut montrer - et il restait a
 * l'ecran pendant qu'on partageait une liste.
 *
 * Dessine au canevas plutot que capture depuis le DOM : aucune dependance a
 * ajouter (html2canvas pese plus lourd que tout le reste de l'ecran), aucun
 * risque de rater une regle CSS au rendu, et le resultat est identique sur les
 * trois themes puisque le papier est un objet physique, toujours creme.
 *
 * Le texte reste joint au partage : une image seule n'est pas lisible par un
 * lecteur d'ecran, et certaines applications ne prennent pas les fichiers.
 */

export interface LigneTicket {
  nom: string
  valeur: string
}

export interface ContenuTicket {
  horodatage: string
  effectif: number
  /** Une ligne par joueur. Vide quand le mode ne compte rien. */
  lignes: LigneTicket[]
  total: number | null
  /** Phrase de pied, sans le total (champion, ou constat quand rien n'est compte). */
  mention: string
  /** L'ardoise de la soiree, affichee des la deuxieme partie. */
  ardoise?: { titre: string; lignes: LigneTicket[] }
}

const LARGEUR = 720
const MARGE = 48
const PAPIER = '#FBF7EE'
const ENCRE = '#1c1a17'
const SOURDINE = '#6e6759'
const ROUGE = '#8E1F26'
const POINTILLE = '#b9b0a2'
const DENT = 14

/**
 * La police est chargee AVANT de mesurer.
 *
 * `ctx.measureText` avec une police pas encore prete mesure la police de repli,
 * donc les points de conduite entre le nom et le chiffre tombent a cote et le
 * total sort du cadre. C'est le meme piege qu'un moteur de rendu qui dessine
 * sans mesurer : rien ne leve, et le defaut ne se voit qu'une fois publie.
 */
async function policePrete(): Promise<boolean> {
  if (typeof document === 'undefined' || !document.fonts) return false
  try {
    await Promise.all([
      document.fonts.load('400 22px "Space Mono"'),
      document.fonts.load('700 22px "Space Mono"'),
    ])
    return document.fonts.check('400 22px "Space Mono"')
  } catch {
    return false
  }
}

function famille(prete: boolean): string {
  return prete ? '"Space Mono", monospace' : 'monospace'
}

/** Bord crante, en haut ou en bas du ticket. */
function dessinerCrantage(ctx: CanvasRenderingContext2D, y: number, versLeBas: boolean) {
  ctx.fillStyle = PAPIER
  ctx.beginPath()
  ctx.moveTo(0, y)
  const pas = LARGEUR / 24
  for (let i = 0; i <= 24; i++) {
    const x = i * pas
    const dy = i % 2 === 0 ? 0 : DENT * (versLeBas ? 1 : -1)
    ctx.lineTo(x, y + dy)
  }
  ctx.lineTo(LARGEUR, y + (versLeBas ? -DENT : DENT))
  ctx.lineTo(0, y + (versLeBas ? -DENT : DENT))
  ctx.closePath()
  ctx.fill()
}

function filetPointille(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = POINTILLE
  ctx.lineWidth = 2
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(MARGE, y)
  ctx.lineTo(LARGEUR - MARGE, y)
  ctx.stroke()
  ctx.setLineDash([])
}

/** Nom a gauche, valeur a droite, points de conduite entre les deux. */
function ligneAvecConduite(
  ctx: CanvasRenderingContext2D,
  y: number,
  nom: string,
  valeur: string,
  gras: boolean,
  police: string,
) {
  ctx.font = `${gras ? '700' : '400'} 22px ${police}`
  ctx.fillStyle = ENCRE
  ctx.textAlign = 'left'
  ctx.fillText(nom, MARGE, y)
  ctx.textAlign = 'right'
  ctx.fillText(valeur, LARGEUR - MARGE, y)

  const debut = MARGE + ctx.measureText(nom).width + 10
  const fin = LARGEUR - MARGE - ctx.measureText(valeur).width - 10
  if (fin > debut) {
    ctx.fillStyle = POINTILLE
    ctx.textAlign = 'left'
    const largeurPoint = ctx.measureText('.').width || 8
    const combien = Math.max(0, Math.floor((fin - debut) / largeurPoint))
    ctx.fillText('.'.repeat(combien), debut, y)
  }
  ctx.textAlign = 'left'
}

/**
 * Dessine le ticket et rend une image PNG.
 *
 * Rend `null` quand le canevas n'est pas disponible (jsdom, contexte refuse) :
 * l'appelant retombe alors sur le partage texte, qui reste toujours possible.
 */
export async function dessinerTicket(contenu: ContenuTicket): Promise<Blob | null> {
  if (typeof document === 'undefined') return null

  const prete = await policePrete()
  const police = famille(prete)

  // Hauteur calculee avant de peindre : un canevas se redimensionne en
  // s'effaçant, donc on ne peut pas l'agrandir en cours de route.
  const lignesArdoise = contenu.ardoise?.lignes.length ?? 0
  const hauteur =
    360 +
    contenu.lignes.length * 34 +
    (contenu.ardoise ? 90 + lignesArdoise * 30 : 0) +
    (contenu.total !== null ? 70 : 0) +
    180

  const echelle = 2
  const canevas = document.createElement('canvas')
  canevas.width = LARGEUR * echelle
  canevas.height = hauteur * echelle
  const ctx = canevas.getContext('2d')
  if (!ctx) return null
  ctx.scale(echelle, echelle)

  ctx.fillStyle = PAPIER
  ctx.fillRect(0, 0, LARGEUR, hauteur)
  dessinerCrantage(ctx, DENT, false)
  dessinerCrantage(ctx, hauteur - DENT, true)

  let y = 92

  ctx.textAlign = 'center'
  ctx.fillStyle = ENCRE
  ctx.font = `700 40px ${police}`
  ctx.fillText('BACCHANA', LARGEUR / 2, y)
  y += 32
  ctx.font = `400 18px ${police}`
  ctx.fillStyle = SOURDINE
  ctx.fillText('Au coin du comptoir - Chevilly-Larue', LARGEUR / 2, y)
  y += 26
  ctx.fillText('bacchana.beloucif.com', LARGEUR / 2, y)
  y += 26

  filetPointille(ctx, y)
  y += 32

  ctx.textAlign = 'left'
  ctx.font = `400 18px ${police}`
  ctx.fillStyle = SOURDINE
  ctx.fillText(contenu.horodatage, MARGE, y)
  ctx.textAlign = 'right'
  ctx.fillText(`TABLE DE ${contenu.effectif}`, LARGEUR - MARGE, y)
  ctx.textAlign = 'left'
  y += 22

  filetPointille(ctx, y)
  y += 34

  if (contenu.lignes.length > 0) {
    ctx.font = `400 16px ${police}`
    ctx.fillStyle = SOURDINE
    ctx.fillText('ARTICLE', MARGE, y)
    ctx.textAlign = 'right'
    ctx.fillText('PÉNALITÉS', LARGEUR - MARGE, y)
    ctx.textAlign = 'left'
    y += 30

    contenu.lignes.forEach((ligne, index) => {
      ligneAvecConduite(ctx, y, ligne.nom, ligne.valeur, index === 0, police)
      y += 34
    })
    y += 6
  }

  if (contenu.total !== null) {
    filetPointille(ctx, y)
    y += 36
    ligneAvecConduite(ctx, y, 'TOTAL', String(contenu.total), true, police)
    y += 34
  }

  if (contenu.ardoise) {
    filetPointille(ctx, y)
    y += 32
    ctx.font = `400 16px ${police}`
    ctx.fillStyle = SOURDINE
    ctx.fillText(contenu.ardoise.titre.toUpperCase(), MARGE, y)
    y += 28
    contenu.ardoise.lignes.forEach((ligne, index) => {
      ligneAvecConduite(ctx, y, ligne.nom, ligne.valeur, index === 0, police)
      y += 30
    })
    y += 6
  }

  filetPointille(ctx, y)
  y += 34

  ctx.textAlign = 'center'
  ctx.font = `700 20px ${police}`
  ctx.fillStyle = ROUGE
  ctx.fillText(contenu.mention, LARGEUR / 2, y)
  y += 46

  // Faux code-barres : sa largeur derive du contenu, donc deux soirees
  // differentes n'ont pas le meme, ce qui est exactement ce qu'un ticket fait.
  const graine = contenu.lignes.reduce((n, l) => n + l.valeur.length + l.nom.length, contenu.effectif)
  ctx.fillStyle = ENCRE
  let x = MARGE
  for (let i = 0; x < LARGEUR - MARGE; i++) {
    const largeur = 2 + ((graine + i * 7) % 4)
    const hauteurBarre = i % 5 === 4 ? 34 : 48
    ctx.fillRect(x, y, largeur, hauteurBarre)
    x += largeur + 3
  }
  y += 70

  ctx.font = `400 16px ${police}`
  ctx.fillStyle = SOURDINE
  ctx.fillText('MERCI DE VOTRE VISITE', LARGEUR / 2, y)

  return new Promise((resolve) => {
    canevas.toBlob((blob) => resolve(blob), 'image/png')
  })
}
