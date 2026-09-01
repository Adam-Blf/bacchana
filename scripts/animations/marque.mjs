/**
 * La matiere de marque des animations : palette, geometrie, textes, courbes.
 *
 * POURQUOI CE FICHIER EXISTE. Les animations vivaient dans un prototype Figma.
 * Un prototype interpole entre deux images en re-rasterisant un vectoriel de
 * 2800 pixels a chaque trame, dans un navigateur, sans horloge fixe : ce n'est
 * pas un moteur d'animation, et ca ne sera jamais ni rapide ni fluide. Et
 * Instagram ne prend pas un prototype, il prend un fichier video.
 *
 * On rend donc de vraies trames a cadence fixe, avec la MEME geometrie que le
 * logo et les MEMES fichiers de polices que l'application, puis on encode.
 *
 * TOUT LE TEXTE EST ICI, en donnees. Une affiche par jeu, une adresse qui
 * change, une accroche a reprendre : ca se definit au lancement du rendu, ca ne
 * se retrouve pas en dur au milieu d'un calcul de trajectoire.
 */

export const PALETTE = {
  pourpre: '#5B2C87',
  aplat1: '#FFD029',
  aplat4: '#E8B81C',
  orange: '#FF5C00',
  creme: '#FFF9F0',
  noir: '#111111',
  rouge: '#A3202F',
}

export const POLICES = [
  { fichier: 'big-shoulders-latin-900.woff2', famille: 'Big Shoulders Display', graisse: 900 },
  { fichier: 'space-mono-latin-regular.woff2', famille: 'Space Mono', graisse: 400 },
  { fichier: 'space-mono-latin-700.woff2', famille: 'Space Mono', graisse: 700 },
  { fichier: 'chivo-latin-regular.woff2', famille: 'Chivo', graisse: 400 },
]

/** Le contenu de l'addition. Tout est modifiable sans toucher aux scenes. */
export const TEXTES = {
  enseigne: 'BACCHANA',
  sousEnseigne: 'AU COIN DU COMPTOIR',
  postes: [
    ['TABLÉE', '4 À 8'],
    ['JEUX', '14'],
    ['PUB', '0'],
    ['RÉSEAU', 'FACULTATIF'],
  ],
  total: ['TOTAL', 'PAYÉ UNE FOIS'],
  accroche: 'ON OUVRE\nLA TABLÉE',
  adresse: 'bacchana.beloucif.com',
  merci: 'MERCI DE VOTRE VISITE',
  teaser: 'OUVERTURE\nPROCHAINE',
  mention: 'QUATORZE JEUX, 4 À 8 PERSONNES',
}

/* ------------------------------------------------------------------ courbes */
/** Progression bornee de `t` entre deux instants, 0 avant, 1 apres. */
export const entre = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
export const melange = (a, b, p) => a + (b - a) * p
export const acc = (p) => p * p
export const dec = (p) => 1 - (1 - p) ** 3
export const decRebond = (p) => {
  const c = 1.70158
  return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2
}
export const douce = (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2)

/* --------------------------------------------------------------- geometrie */
/**
 * Les deux objets et l'eclat, repris TELS QUELS de public/icon.svg.
 *
 * Chacun est un dessin autonome dans son propre repere, ce qui permet de le
 * deplacer et de l'incliner independamment - impossible tant que les trois
 * vivaient dans un seul fichier. Les chemins, eux, ne sont pas redessines : le
 * logo n'a qu'une source.
 */
const OBJET_GAUCHE = `<g transform="rotate(-14 190 300)">
  <rect x="160" y="236" width="108" height="164" rx="16" fill="${PALETTE.noir}"/>
  <rect x="146" y="222" width="108" height="164" rx="16" fill="${PALETTE.orange}" stroke="${PALETTE.noir}" stroke-width="12"/>
  <rect x="146" y="222" width="108" height="42" rx="16" fill="${PALETTE.creme}" stroke="${PALETTE.noir}" stroke-width="12"/>
  <circle cx="180" cy="310" r="9" fill="${PALETTE.creme}"/>
  <circle cx="214" cy="342" r="7" fill="${PALETTE.creme}"/></g>`

const OBJET_DROIT = `<g transform="rotate(14 322 300)">
  <rect x="282" y="236" width="108" height="164" rx="16" fill="${PALETTE.noir}"/>
  <rect x="268" y="222" width="108" height="164" rx="16" fill="${PALETTE.aplat1}" stroke="${PALETTE.noir}" stroke-width="12"/>
  <rect x="268" y="222" width="108" height="42" rx="16" fill="${PALETTE.creme}" stroke="${PALETTE.noir}" stroke-width="12"/>
  <circle cx="306" cy="312" r="9" fill="${PALETTE.creme}"/>
  <circle cx="338" cy="344" r="7" fill="${PALETTE.creme}"/></g>`

const ECLAT = `<path d="M256 74 L272 130 L328 146 L272 162 L256 218 L240 162 L184 146 L240 130 Z"
  fill="${PALETTE.aplat1}" stroke="${PALETTE.noir}" stroke-width="12" stroke-linejoin="round"/>`

const svg = (vb, contenu) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet">${contenu}</svg>`

export const PIECES = {
  objetGauche: { svg: svg('116 194 179 220', OBJET_GAUCHE), l: 179, h: 220 },
  objetDroit: { svg: svg('234 199 180 220', OBJET_DROIT), l: 180, h: 220 },
  eclat: { svg: svg('178 68 156 156', ECLAT), l: 156, h: 156 },
}

/**
 * La rosace d'aplats : douze coins ambres sur le pourpre.
 *
 * Vingt-quatre dents, donc une periode de 30 degres : une rotation de 30
 * degres exactement rend une image IDENTIQUE. C'est ce qui permet a une boucle
 * de se refermer sans le moindre saut, la ou un retour de 14 a 0 sautait a
 * chaque tour.
 */
export const PERIODE_ROSACE = 30

export function rosace(cote = 2800, dents = 24) {
  const c = cote / 2
  let d = ''
  for (let i = 0; i < dents; i += 2) {
    const a = (k) => ((k + 0.5) / dents) * Math.PI * 2 - Math.PI / 2
    const p = (k) =>
      `${(c + c * 1.45 * Math.cos(a(k))).toFixed(1)} ${(c + c * 1.45 * Math.sin(a(k))).toFixed(1)}`
    d += `M${c} ${c} L${p(i)} L${p(i + 1)} Z `
  }
  return { svg: svg(`0 0 ${cote} ${cote}`, `<path d="${d}" fill="${PALETTE.aplat4}"/>`), cote }
}

/** Le bord dechire du haut d'un ticket, en polygone de decoupe CSS. */
export function decoupeDechiree(largeur, hauteur, dent = 22) {
  const points = []
  for (let x = 0; x <= largeur; x += dent) {
    points.push(`${((x / largeur) * 100).toFixed(3)}% ${(x / dent) % 2 === 0 ? (dent / hauteur) * 100 : 0}%`)
  }
  points.push('100% 100%', '0% 100%')
  return `polygon(${points.join(',')})`
}
