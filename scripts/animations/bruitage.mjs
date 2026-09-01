/**
 * Les bruitages, SYNTHETISES, pas telecharges.
 *
 * Pourquoi les fabriquer. Un fichier de bruitage trouve en ligne arrive avec
 * une licence qu'il faudrait lire, tracer et respecter sur chaque publication,
 * et une piste sous licence incertaine sur un compte de marque est un risque
 * pour rien. Une somme de sinusoides amorties ne pose aucune question de
 * droits, se regle au millieme de seconde, et tient dans une ligne de commande.
 *
 * La limite, et il faut la dire : c'est du bruitage de synthese. Ca sonne juste
 * pour un choc, un souffle et une imprimante a ticket, pas pour de la musique.
 * Si une bande-son est voulue au moment de publier, elle se prend dans la
 * bibliotheque audio d'Instagram, qui est licenciee pour cet usage - et c'est
 * la seule facon d'avoir de la musique sans exposer le compte.
 *
 * UNE LECON, PAYEE ICI. Une garde qui multiplie par zero ne protege pas contre
 * un NaN. La premiere version ecrivait `between(t,a,b) * pow((t-a)/(b-a), 2.2)`
 * en croyant que la fenetre suffisait : avant l'instant a, la base est
 * negative, `pow` rend NaN, et `0 * NaN` vaut NaN. L'encodeur refusait tout le
 * flux avec « Input contains (near) NaN », sans dire ou. Le temps local est
 * donc BORNE a l'interieur de chaque evenement, pas seulement fenetre autour.
 */

/** Temps ecoule depuis `t0`, jamais negatif : borne les exponentielles. */
const depuis = (t0) => `max(0,t-${t0})`

/** Avancement de 0 a 1 entre deux instants, borne aux deux bouts. */
const avance = (t0, t1) => `min(1,max(0,(t-${t0})/${(t1 - t0).toFixed(4)}))`

/** Du bruit blanc centre. L'index choisit un generateur distinct. */
const bruit = (i) => `(2*random(${i})-1)`

/** Le choc de deux verres : quatre partiels qui s'eteignent a des vitesses differentes. */
export const choc = (t0, gain = 0.62) => {
  const u = depuis(t0)
  return (
    `gt(t,${t0})*${gain}*(` +
    `exp(-13*${u})*sin(2*PI*2637*${u})` +
    `+0.70*exp(-17*${u})*sin(2*PI*3520*${u})` +
    `+0.45*exp(-26*${u})*sin(2*PI*5274*${u})` +
    `+0.30*exp(-40*${u})*sin(2*PI*7040*${u})` +
    `+0.35*exp(-150*${u})*${bruit(1)})`
  )
}

/** Le coup sourd d'un objet qui se pose : une basse qui tombe. */
export const sourd = (t0, gain = 0.55) => {
  const u = depuis(t0)
  return `gt(t,${t0})*${gain}*exp(-11*${u})*sin(2*PI*(96-40*${u})*${u})`
}

/** Un souffle qui monte : du bruit dont l'enveloppe croit puis se coupe net. */
export const souffle = (t0, t1, gain = 0.2) =>
  `between(t,${t0},${t1})*${gain}*pow(${avance(t0, t1)},2.2)*${bruit(2)}`

/** Le papier qui glisse : du bruit plus doux, qui decroit. */
export const glissement = (t0, t1, gain = 0.16) =>
  `between(t,${t0},${t1})*${gain}*(1-${avance(t0, t1)})*${bruit(3)}`

/**
 * L'imprimante a ticket : une impulsion tous les `pas`.
 *
 * Ecrit avec `mod` plutot qu'en additionnant quatorze impulsions : une seule
 * expression, et le nombre de lignes peut changer sans toucher au son.
 */
export const impressions = (t0, pas, nombre, gain = 0.34) =>
  `between(t,${t0},${(t0 + pas * nombre).toFixed(3)})*${gain}` +
  `*exp(-130*mod(${depuis(t0)},${pas}))*${bruit(4)}`

/** Une brillance douce, pour un plan qui respire sans evenement. */
export const brillance = (periode, gain = 0.1) =>
  `${gain}*pow(max(0,sin(2*PI*t/${periode})),6)*sin(2*PI*3140*t)`

/**
 * L'expression complete d'une scene, bornee pour ne jamais saturer.
 *
 * `tanh` ecrete en douceur : deux evenements qui se superposent ne produisent
 * plus un claquement numerique, ce qu'une simple somme aurait fait.
 */
export const mixer = (parties) => `0.92*tanh(1.15*(${parties.filter(Boolean).join('+')}))`

/** Ce que chaque scene entend, cale sur ses propres instants. */
export const BRUITAGES = {
  'jour-j': () =>
    mixer([
      souffle(0.06, 0.62, 0.22),
      choc(0.62),
      sourd(0.66, 0.4),
      glissement(1.12, 1.8),
      sourd(1.82, 0.42),
    ]),
  teaser: () => mixer([brillance(3, 0.12)]),
  'la-carte': (o) =>
    mixer([impressions(0.45, 0.24, o.jeux.length), sourd(0.2, 0.28), choc(4.5, 0.4)]),
  'compte-a-rebours': () => mixer([souffle(0, 0.1, 0.28), sourd(0.08, 0.62), choc(0.12, 0.3)]),
}
