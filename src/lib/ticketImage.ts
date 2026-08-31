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
 *
 * DEUX PASSES, et c'est la raison pour laquelle ce fichier est ecrit comme il
 * l'est. La premiere mesure la hauteur reelle du contenu, la seconde peint. Une
 * hauteur estimee a l'avance laissait un tiers de papier vide sous le
 * code-barres, et un canevas se redimensionne en s'effacant : on ne peut donc
 * pas l'ajuster en cours de route.
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
  /** Phrase de pied (champion, ou constat quand rien n'est compte). */
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
const ECART_CONDUITE = 18

/**
 * La police est chargee AVANT de mesurer.
 *
 * `measureText` avec une police pas encore prete mesure la police de repli,
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

/**
 * Le contour du ticket : crante en haut et en bas, droit sur les cotes.
 *
 * Le crantage est un DECOUPAGE, pas un decor pose dessus. La premiere version
 * peignait des dents couleur papier sur un fond deja couleur papier : elles
 * etaient invisibles, et le ticket sortait avec deux bords parfaitement droits.
 * On peint donc uniquement l'interieur du contour, et le reste du canevas reste
 * transparent - c'est le trou qui fait la dent.
 */
function tracerContour(ctx: CanvasRenderingContext2D, hauteur: number) {
  const dents = 24
  const pas = LARGEUR / dents

  ctx.beginPath()
  ctx.moveTo(0, DENT)
  for (let i = 0; i < dents; i++) {
    ctx.lineTo(i * pas + pas / 2, 0)
    ctx.lineTo((i + 1) * pas, DENT)
  }
  ctx.lineTo(LARGEUR, hauteur - DENT)
  for (let i = dents; i > 0; i--) {
    ctx.lineTo(i * pas - pas / 2, hauteur)
    ctx.lineTo((i - 1) * pas, hauteur - DENT)
  }
  ctx.closePath()
  ctx.fillStyle = PAPIER
  ctx.fill()
}

type Peintre = CanvasRenderingContext2D | null

function filetPointille(ctx: Peintre, y: number) {
  if (!ctx) return
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
  ctx: Peintre,
  y: number,
  nom: string,
  valeur: string,
  gras: boolean,
  police: string,
) {
  if (!ctx) return
  ctx.font = `${gras ? '700' : '400'} 22px ${police}`
  ctx.fillStyle = ENCRE
  ctx.textAlign = 'left'
  ctx.fillText(nom, MARGE, y)
  ctx.textAlign = 'right'
  ctx.fillText(valeur, LARGEUR - MARGE, y)

  // L'ecart tenait a dix pixels et le dernier point venait toucher le chiffre.
  const debut = MARGE + ctx.measureText(nom).width + ECART_CONDUITE
  const fin = LARGEUR - MARGE - ctx.measureText(valeur).width - ECART_CONDUITE
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
 * Pose le contenu et rend la hauteur atteinte.
 *
 * Appelee une fois sans peintre pour MESURER, une fois avec pour PEINDRE. Une
 * seule description de la mise en page, donc aucun risque que la hauteur
 * calculee et la hauteur dessinee divergent.
 */
function poser(ctx: Peintre, contenu: ContenuTicket, police: string, mesure: CanvasRenderingContext2D): number {
  let y = 92

  const ecrireCentre = (texte: string, taille: number, gras: boolean, couleur: string) => {
    if (!ctx) return
    ctx.textAlign = 'center'
    ctx.font = `${gras ? '700' : '400'} ${taille}px ${police}`
    ctx.fillStyle = couleur
    ctx.fillText(texte, LARGEUR / 2, y)
    ctx.textAlign = 'left'
  }

  ecrireCentre('BACCHANA', 40, true, ENCRE)
  y += 32
  ecrireCentre('Au coin du comptoir - Chevilly-Larue', 18, false, SOURDINE)
  y += 26
  ecrireCentre('bacchana.beloucif.com', 18, false, SOURDINE)
  y += 26

  filetPointille(ctx, y)
  y += 32

  if (ctx) {
    ctx.font = `400 18px ${police}`
    ctx.fillStyle = SOURDINE
    ctx.textAlign = 'left'
    ctx.fillText(contenu.horodatage, MARGE, y)
    ctx.textAlign = 'right'
    ctx.fillText(`TABLE DE ${contenu.effectif}`, LARGEUR - MARGE, y)
    ctx.textAlign = 'left'
  }
  y += 22

  filetPointille(ctx, y)
  y += 34

  if (contenu.lignes.length > 0) {
    if (ctx) {
      ctx.font = `400 16px ${police}`
      ctx.fillStyle = SOURDINE
      ctx.textAlign = 'left'
      ctx.fillText('ARTICLE', MARGE, y)
      ctx.textAlign = 'right'
      ctx.fillText('PÉNALITÉS', LARGEUR - MARGE, y)
      ctx.textAlign = 'left'
    }
    y += 30

    contenu.lignes.forEach((ligne, index) => {
      ligneAvecConduite(ctx, y, ligne.nom, ligne.valeur, index === 0, police)
      y += 34
    })
    y += 6
  } else {
    ecrireCentre('Aucune pénalité distribuée', 20, false, SOURDINE)
    y += 34
  }

  if (contenu.total !== null) {
    filetPointille(ctx, y)
    y += 36
    ligneAvecConduite(ctx, y, 'TOTAL', String(contenu.total), true, police)
    y += 30
  }

  if (contenu.ardoise) {
    filetPointille(ctx, y)
    y += 32
    if (ctx) {
      ctx.font = `400 16px ${police}`
      ctx.fillStyle = SOURDINE
      ctx.textAlign = 'left'
      ctx.fillText(contenu.ardoise.titre.toUpperCase(), MARGE, y)
    }
    y += 28
    contenu.ardoise.lignes.forEach((ligne, index) => {
      ligneAvecConduite(ctx, y, ligne.nom, ligne.valeur, index === 0, police)
      y += 30
    })
    y += 6
  }

  filetPointille(ctx, y)
  y += 36

  // La mention peut etre longue (« Marie-Christine-Alexandra, championne de la
  // tablee ») : on la coupe en lignes plutot que de la laisser sortir du papier.
  mesure.font = `700 20px ${police}`
  const largeurUtile = LARGEUR - 2 * MARGE
  const lignesMention: string[] = []
  let courante = ''
  for (const mot of contenu.mention.split(' ')) {
    const essai = courante ? `${courante} ${mot}` : mot
    if (mesure.measureText(essai).width > largeurUtile && courante) {
      lignesMention.push(courante)
      courante = mot
    } else {
      courante = essai
    }
  }
  if (courante) lignesMention.push(courante)

  for (const ligne of lignesMention) {
    ecrireCentre(ligne, 20, true, ROUGE)
    y += 28
  }
  y += 18

  // Faux code-barres. Sa largeur derive du contenu, donc deux soirees
  // differentes n'ont pas le meme - c'est exactement ce que fait un ticket.
  const graine = contenu.lignes.reduce((n, l) => n + l.valeur.length + l.nom.length, contenu.effectif)
  if (ctx) {
    ctx.fillStyle = ENCRE
    let x = MARGE
    for (let i = 0; x < LARGEUR - MARGE - 4; i++) {
      const largeur = 2 + ((graine + i * 7) % 4)
      const hauteurBarre = i % 5 === 4 ? 28 : 40
      ctx.fillRect(x, y, largeur, hauteurBarre)
      x += largeur + 5
    }
  }
  // 40 px de barres puis 34 d'air : le pied de page venait mordre le bas du
  // code-barres, et les deux se lisaient comme un seul bloc noir.
  y += 74

  ecrireCentre('MERCI DE VOTRE VISITE', 16, false, SOURDINE)
  y += 46

  return y
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
  const police = prete ? '"Space Mono", monospace' : 'monospace'

  const canevas = document.createElement('canvas')
  const mesure = canevas.getContext('2d')
  if (!mesure) return null

  // Passe 1 : la hauteur reelle du contenu.
  const hauteur = Math.ceil(poser(null, contenu, police, mesure))

  const echelle = 2
  canevas.width = LARGEUR * echelle
  canevas.height = hauteur * echelle
  const ctx = canevas.getContext('2d')
  if (!ctx) return null
  ctx.scale(echelle, echelle)

  tracerContour(ctx, hauteur)
  // Passe 2 : le meme trace, avec un peintre.
  poser(ctx, contenu, police, ctx)

  return new Promise((resolve) => {
    canevas.toBlob((blob) => resolve(blob), 'image/png')
  })
}
