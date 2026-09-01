/**
 * Les scenes animees, en donnees et en fonctions du temps.
 *
 * Chaque scene rend son decor UNE fois, puis `poser(t)` repositionne les
 * elements pour l'instant t. Rien n'est recree entre deux trames : le
 * navigateur ne fait que composer des transformations, ce qui est la seule
 * facon d'obtenir un mouvement fluide a soixante images par seconde.
 *
 * Les trajectoires sont ecrites en continu, pas en images cles. Un choc n'est
 * donc pas trois poses successives mais une oscillation amortie, ce qui se voit
 * immediatement : c'est la difference entre un objet qui rebondit et un objet
 * qu'on repose trois fois.
 */
import {
  PALETTE,
  PIECES,
  TEXTES,
  PERIODE_ROSACE,
  acc,
  dec,
  decRebond,
  decoupeDechiree,
  entre,
  melange,
  rosace,
} from './marque.mjs'

export const FORMATS = {
  story: [1080, 1920],
  feed: [1080, 1350],
  reel: [1080, 1920],
  carre: [1080, 1080],
}

/** L'instant du choc, dont tout le reste de la scene du jour J se deduit. */
const CHOC = 0.4

/* ------------------------------------------------------------------- decor */
const ROSACE = rosace(2800)
const E = 2.6

const piece = (id, nom, gauche, haut, e = E) => {
  const p = PIECES[nom]
  return `<div class="piece" id="${id}" style="left:${gauche}px;top:${haut}px;width:${p.l * e}px;height:${p.h * e}px">${p.svg}</div>`
}

const laRosace = (cx, cy) =>
  `<div class="piece" id="rosace" style="left:${cx - ROSACE.cote / 2}px;top:${cy - ROSACE.cote / 2}px;width:${ROSACE.cote}px;height:${ROSACE.cote}px">${ROSACE.svg}</div>`

const decorObjets = (cx = 540, cy = 620, e = E) => `
  ${laRosace(cx, cy - 26)}
  ${piece('gauche', 'objetGauche', cx + (116 - 256) * e, cy + (194 - 250) * e, e)}
  ${piece('droit', 'objetDroit', cx + (234 - 256) * e, cy + (199 - 250) * e, e)}
  ${piece('eclat', 'eclat', cx + (178 - 256) * e, cy + (68 - 250) * e, e)}`

/**
 * L'addition. Les points de conduite sont un filet pointille etire par le
 * calque, pas une suite de caracteres : ils sont donc flush a droite par
 * construction, quels que soient les accents. Compter des caracteres pour les
 * aligner marchait tant qu'aucun « É » compose ne trainait dans la ligne.
 */
const addition = ({ largeur = 880, hauteur = 1180, avecPied = true, avecAdresse = true } = {}) => {
  const poste = ([g, d]) =>
    `<div class="poste"><span>${g}</span><i></i><span>${d}</span></div>`
  return `<div class="addition" id="addition" style="width:${largeur}px;height:${hauteur}px">
    <div class="papier" style="clip-path:${decoupeDechiree(largeur, hauteur)}">
      <div class="dedans">
        <div class="enseigne">${TEXTES.enseigne}</div>
        <div class="sous-enseigne">${TEXTES.sousEnseigne}</div>
        <hr>
        ${TEXTES.postes.map(poste).join('')}
        <hr>
        <div class="poste total"><span>${TEXTES.total[0]}</span><i></i><span>${TEXTES.total[1]}</span></div>
        <hr>
        <div class="accroche">${TEXTES.accroche.replace('\n', '<br>')}</div>
        ${avecAdresse ? `<hr><div class="adresse">${TEXTES.adresse}</div>` : ''}
        ${avecPied ? `<div class="code-barres"></div>
        <div class="merci">${TEXTES.merci}</div>` : ''}
      </div>
    </div>
  </div>`
}

const bandeau = (id, texte, haut) =>
  `<div class="bandeau" id="${id}" style="top:${haut}px">${texte}</div>`

/* ------------------------------------------------------------------ scenes */
export const SCENES = {
  /** Le jour du lancement : les deux objets se percutent, l'addition monte. */
  'jour-j': {
    titre: 'Jour J, on ouvre la tablee',
    format: 'story',
    duree: 4.2,
    html: () => `${decorObjets()}${addition()}`,
    poser: (t, $) => {
      // Le depart etait a 900 px hors cadre sur 0,62 s en acceleration : les
      // trois premieres trames ne montraient QUE du fond, soit un quart de
      // seconde de vide au debut d'une story. C'est ce qui la fait passer.
      // Les objets sont desormais deja visibles a la premiere trame, et le
      // choc tombe a 0,40 s.
      const approche = entre(t, 0, CHOC) ** 1.7

      // Oscillation amortie apres le choc. Une vraie decroissance
      // exponentielle, pas trois poses : c'est ce qui fait qu'on lit un
      // rebond plutot qu'un diaporama.
      const apres = Math.max(0, t - CHOC)
      const rebond = Math.exp(-apres * 12) * Math.sin(apres * 40)

      const dxG = melange(-560, 0, approche) + rebond * 34
      const dxD = melange(560, 0, approche) - rebond * 34
      $('gauche').style.transform = `translate(${dxG}px,0) rotate(${melange(-16, 0, approche) + rebond * 7}deg)`
      $('droit').style.transform = `translate(${dxD}px,0) rotate(${melange(16, 0, approche) - rebond * 7}deg)`

      let ecl = 0
      if (t >= CHOC - 0.02) {
        const pop = decRebond(entre(t, CHOC - 0.02, CHOC + 0.16))
        ecl = melange(1.35 * pop, 0.84, entre(t, CHOC + 0.16, CHOC + 0.52))
        ecl *= 1 + 0.05 * Math.sin(t * 2.4)
      }
      // Pas de rotation continue sur l'eclat : c'est une etoile a QUATRE
      // branches, et au-dela de quelques degres elle cesse d'etre lue comme
      // telle. Elle respire, elle ne tourne pas.
      $('eclat').style.transform = `scale(${ecl})`

      const ros = decRebond(entre(t, CHOC + 0.02, CHOC + 0.66))
      $('rosace').style.transform = `rotate(${t * 2.4}deg) scale(${ros})`

      // Le ticket monte, depasse legerement, puis se cale. Le depassement est
      // amorti lui aussi, sinon l'arrivee est molle.
      // Il se cale a 892 et non a 980 : la derniere ligne tombait sous le bord
      // du cadre. Le debord du bas est voulu, la coupe du texte ne l'etait pas.
      const TICKET = CHOC + 0.42
      const monte = dec(entre(t, TICKET, TICKET + 0.62))
      const calage = Math.max(0, t - (TICKET + 0.62))
      const y = melange(1980, 892, monte) - Math.exp(-calage * 9) * Math.sin(calage * 26) * 12
      $('addition').style.transform = `translate(0,${y}px) rotate(-1.5deg)`
    },
  },

  /**
   * L'affiche du fil, au format 4:5.
   *
   * C'est la MEME image que la fin de l'animation, recadree : une campagne, pas
   * deux visuels. Une affiche qui recompose la scene a sa facon ment des le
   * premier correctif apporte a l'animation.
   */
  affiche: {
    titre: 'Affiche du fil, l addition',
    format: 'feed',
    duree: 0,
    html: () => `${decorObjets(540, 392, 2.1)}${addition({ hauteur: 900, avecPied: false })}`,
    poser: (_t, $) => {
      $('rosace').style.transform = 'rotate(7deg)'
      $('eclat').style.transform = 'scale(0.9)'
      $('gauche').style.transform = 'none'
      $('droit').style.transform = 'none'
      // 508 et non 570 : l'adresse tombait a 1386 pour un cadre de 1350, et
      // c'est la garde de debordement qui l'a dit, pas l'oeil.
      $('addition').style.transform = 'translate(0,508px) rotate(-2deg)'
    },
  },

  /**
   * La photo de profil : le LOGO DE L'APPLICATION, tel quel.
   *
   * Le fichier public/icon.svg est injecté sans une seule retouche. C'est
   * volontaire, et c'est tout l'interet : la photo du compte est alors
   * exactement l'icone que les gens verront sur leur ecran d'accueil apres
   * l'installation. Une recomposition, meme fidele, casse cette
   * reconnaissance - et le fichier reste la source unique du logo.
   */
  avatar: {
    titre: 'Photo de profil, logo de l application',
    format: 'carre',
    duree: 0,
    html: (o) => `<div class="logo" id="logo">${o.logo}</div>`,
    poser: () => {},
  },

  /** Le teaser d'ouverture : une boucle qui ne se voit pas boucler. */
  teaser: {
    titre: 'Ouverture prochaine',
    format: 'story',
    duree: 3,
    html: () => `
      ${laRosace(540, 900)}
      ${bandeau('surtitre', TEXTES.sousEnseigne, 288)}
      <div class="affichette" id="affichette">
        <div class="papier" style="clip-path:${decoupeDechiree(760, 540)}">
          <div class="dedans">
            <div class="accroche teaser">${TEXTES.teaser.replace('\n', '<br>')}</div>
            <hr>
            <div class="marque">${TEXTES.enseigne}</div>
            <hr>
            <div class="mention">${TEXTES.mention}</div>
          </div>
        </div>
      </div>
      ${piece('eclat', 'eclat', 866 - (PIECES.eclat.l * E) / 2, 580 - (PIECES.eclat.h * E) / 2)}
      ${bandeau('adresse', TEXTES.adresse, 1672)}`,
    poser: (t, $) => {
      const p = t / 3
      // Trente degres exactement sur la duree : la derniere trame est
      // superposable a la premiere, donc la boucle est invisible.
      $('rosace').style.transform = `rotate(${p * PERIODE_ROSACE}deg)`
      $('eclat').style.transform = `scale(${0.82 + 0.26 * Math.sin(2 * Math.PI * p)})`
      $('affichette').style.transform = `rotate(${-3 + 0.7 * Math.sin(2 * Math.PI * p)}deg)`
    },
  },

  /** La carte : les quatorze jeux s'ecrivent l'un apres l'autre. */
  'la-carte': {
    titre: 'La carte, quatorze jeux',
    format: 'story',
    duree: 5.6,
    html: (o) => `
      ${laRosace(540, 960)}
      <div class="addition carte" id="addition" style="width:940px;height:1620px">
        <div class="papier" style="clip-path:${decoupeDechiree(940, 1620)}">
          <div class="dedans">
            <div class="enseigne">LA CARTE</div>
            <div class="sous-enseigne">${TEXTES.mention}</div>
            <hr>
            ${o.jeux.map(([n, d], i) => `<div class="poste jeu" id="jeu${i}"><span>${n}</span><i></i><span>${d}</span></div>`).join('')}
            <hr>
            <div class="adresse">${TEXTES.adresse}</div>
          </div>
        </div>
      </div>`,
    poser: (t, $, o) => {
      $('rosace').style.transform = `rotate(${t * 2}deg)`
      o.jeux.forEach((_, i) => {
        const p = dec(entre(t, 0.45 + i * 0.24, 0.45 + i * 0.24 + 0.34))
        const el = $(`jeu${i}`)
        el.style.opacity = p
        el.style.transform = `translate(0,${melange(26, 0, p)}px)`
      })
    },
  },

  /** Le compte a rebours : un chiffre qui se pose comme un tampon. */
  'compte-a-rebours': {
    titre: 'Compte a rebours',
    format: 'story',
    duree: 2.4,
    html: (o) => `
      ${laRosace(540, 820)}
      ${bandeau('surtitre', TEXTES.sousEnseigne, 288)}
      <div class="tampon" id="tampon"><span>${o.nombre}</span></div>
      <div class="tampon-legende" id="legende">JOUR${o.nombre > 1 ? 'S' : ''}</div>
      ${bandeau('adresse', o.mention, 1560)}
      ${bandeau('adresse2', TEXTES.adresse, 1712)}`,
    poser: (t, $) => {
      $('rosace').style.transform = `rotate(${t * 2.4}deg) scale(${decRebond(entre(t, 0.06, 0.66))})`
      const pose = decRebond(entre(t, 0, 0.36))
      $('tampon').style.transform = `scale(${melange(2.6, 1, pose)}) rotate(${melange(-9, -2, pose)}deg)`
      $('tampon').style.opacity = entre(t, 0, 0.14)
      const l = dec(entre(t, 0.34, 0.62))
      $('legende').style.opacity = l
      $('legende').style.transform = `translate(0,${melange(22, 0, l)}px)`
    },
  },
}

/** Les couleurs et les mesures du decor, injectees dans la page. */
export const STYLE = `
  .logo{position:absolute;inset:0}
  .logo svg{width:100%;height:100%;display:block}
  .piece{position:absolute}
  .piece svg{width:100%;height:100%;display:block}
  #rosace{transform-origin:50% 50%}
  #eclat,#gauche,#droit{transform-origin:50% 50%}
  .addition,.affichette{position:absolute;transform-origin:50% 50%}
  .addition{left:100px;top:0}
  .affichette{left:160px;top:690px;width:760px;height:540px}
  .papier{position:relative;width:100%;height:100%;background:${PALETTE.creme};
    box-sizing:border-box;border:8px solid ${PALETTE.noir}}
  .addition .papier,.affichette .papier{filter:drop-shadow(16px 16px 0 ${PALETTE.noir})}
  .dedans{padding:46px 62px 0;color:${PALETTE.noir}}
  .affichette .dedans{padding:62px 56px 0;text-align:center}
  .enseigne{font-family:'Big Shoulders Display';font-weight:900;font-size:84px;line-height:.92;
    text-align:center;letter-spacing:-.01em}
  .sous-enseigne{font-family:'Space Mono';font-size:20px;letter-spacing:.22em;text-align:center;
    margin-top:14px}
  hr{border:0;border-top:3px solid ${PALETTE.noir};opacity:.28;margin:22px 0}
  .poste{display:flex;align-items:baseline;font-family:'Space Mono';font-size:24px;
    line-height:1.42;white-space:nowrap}
  .poste i{flex:1;border-bottom:3px dotted ${PALETTE.noir};margin:0 .35em;position:relative;top:-.24em;
    opacity:.55}
  .poste.total{font-weight:700;color:${PALETTE.rouge}}
  .poste.total i{border-color:${PALETTE.rouge}}
  .poste.jeu{font-size:26px;line-height:1.6;opacity:0}
  .accroche{font-family:'Big Shoulders Display';font-weight:900;font-size:104px;line-height:1.02;
    margin:26px 0 0;letter-spacing:-.015em}
  .accroche.teaser{font-size:118px;margin:0}
  .marque{font-family:'Space Mono';font-weight:700;font-size:46px;letter-spacing:.06em}
  .mention{font-family:'Space Mono';font-size:21px;letter-spacing:.1em}
  .adresse{font-family:'Space Mono';font-weight:700;font-size:34px;text-align:center;margin-top:26px}
  .code-barres{height:72px;margin:26px 19% 0;background:repeating-linear-gradient(90deg,
    ${PALETTE.noir} 0 4px,transparent 4px 8px,${PALETTE.noir} 8px 15px,transparent 15px 19px,
    ${PALETTE.noir} 19px 22px,transparent 22px 28px)}
  .merci{font-family:'Space Mono';font-size:20px;letter-spacing:.2em;text-align:center;margin-top:22px}
  .bandeau{position:absolute;left:60px;right:60px;background:${PALETTE.pourpre};
    border:6px solid ${PALETTE.noir};color:${PALETTE.creme};font-family:'Space Mono';font-weight:700;
    font-size:32px;letter-spacing:.14em;text-align:center;padding:20px 0}
  .tampon{position:absolute;left:0;right:0;top:520px;text-align:center;
    font-family:'Big Shoulders Display';font-weight:900;font-size:640px;line-height:.8;
    color:${PALETTE.aplat1};-webkit-text-stroke:18px ${PALETTE.noir};paint-order:stroke fill;
    transform-origin:50% 50%}
  .tampon-legende{position:absolute;left:0;right:0;top:1170px;text-align:center;
    font-family:'Big Shoulders Display';font-weight:900;font-size:150px;color:${PALETTE.creme};
    -webkit-text-stroke:10px ${PALETTE.noir};paint-order:stroke fill;letter-spacing:.06em}
`
