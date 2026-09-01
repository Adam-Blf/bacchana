#!/usr/bin/env node
/**
 * Le NUANCIER : toute la palette, les trois themes, et les contrastes mesures.
 *
 * Il manquait une planche de reference. `tokens.css` dit les valeurs et
 * `check_contrast.mjs` dit si les paires passent, mais aucun des deux ne se
 * REGARDE : on ne peut ni comparer deux ambres voisins, ni voir d'un coup ce
 * qu'un theme fait a l'ensemble, ni verifier qu'une encre reste lisible sur les
 * quatre aplats.
 *
 * Il est GENERE, jamais dessine a la main. Une planche dont les pastilles sont
 * peintes a la main et les hexadecimaux recopies a cote diverge au premier
 * correctif - c'est arrive sur un autre projet, trente-deux hexadecimaux faux
 * sur une reference de portage. Ici, la pastille ET son etiquette sortent de la
 * meme lecture de `tokens.css`, par le meme module que la garde de contraste.
 *
 * Sortie : docs/NUANCIER.html (consultable) et docs/nuancier.png (partageable).
 *
 * Lancement :  node scripts/nuancier.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
import { lireThemes, aplatir, contraste } from './lib/tokens.mjs'

const THEMES = lireThemes()

/**
 * Les familles, dans l'ordre ou elles se lisent.
 *
 * Chaque entree dit aussi CE QUI SE POSE dessus, ce qui est la seule question
 * utile devant une pastille. Une planche qui montre des couleurs sans dire
 * lesquelles vont ensemble est une decoration.
 */
const FAMILLES = [
  {
    titre: 'Fonds et surfaces',
    note: "La page, puis ce qui s'y pose. L'elevation se lit au filet, jamais a l'ombre.",
    jetons: ['bg', 'bg-raised', 'surface', 'surface-elevated'],
    encres: ['ink', 'ink-secondary', 'ink-muted'],
  },
  {
    titre: 'Encres',
    note: 'Trois niveaux, du texte courant a la legende. Elles suivent le theme.',
    jetons: ['ink', 'ink-secondary', 'ink-muted'],
    encres: [],
    surFond: 'bg',
  },
  {
    titre: "L'accent",
    note:
      "La surimpression. Elle vaut pourpre sur fond clair et jaune sur fond pourpre : la SEULE encre admise dessus est sur-surimpression, qui bascule avec elle.",
    jetons: ['surimpression', 'neon-deep', 'neon-soft'],
    encres: ['sur-surimpression'],
  },
  {
    titre: 'Aplats de tuile',
    note:
      "Quatre ambres FIXES dans les trois themes. C'est une rotation, pas quatre roles : aucune ne porte de sens propre. Seule tile-ink va dessus.",
    jetons: ['aplat-1', 'aplat-2', 'aplat-3', 'aplat-4'],
    encres: ['tile-ink'],
  },
  {
    titre: 'Cartes a jouer',
    note: "Une carte est un objet physique : elle ne change pas de couleur quand la piece s'assombrit.",
    jetons: ['card-face'],
    encres: ['card-ink', 'card-ink-muted', 'card-danger', 'card-red'],
  },
  {
    titre: 'Etats',
    note:
      "Ils se distinguent par la TEINTE, precisement l'axe que la deutéranopie confond : une icone double donc toujours la couleur.",
    jetons: ['danger', 'success', 'warning', 'premium'],
    encres: [],
    surFond: 'bg',
  },
  {
    titre: 'Profondeur',
    note:
      "depth est un FOND, pas une encre : le panneau sombre pose sur la page, dans les trois themes. Il REDEFINIT ses jetons dans sa portee (.contexte-profond), donc c'est SON encre qu'on mesure ici, pas celle du theme.",
    jetons: ['depth', 'appareil'],
    encres: ['ink', 'ink-secondary', 'surimpression'],
    encresDe: 'profond',
  },
]

const SEUIL = { texte: 4.5, grand: 3, ui: 3 }

function verdict(ratio, seuil) {
  return ratio >= seuil ? 'ok' : 'echec'
}

function pastille(theme, jetons, nomFond, encres, surFond, encresDe) {
  const jetonsEncres = encresDe ? THEMES[encresDe] : jetons
  const brut = jetons[nomFond]
  if (brut === undefined) return ''
  const fondReference = typeof jetons[surFond ?? 'bg'] === 'string' ? jetons[surFond ?? 'bg'] : '#ffffff'
  const fond = aplatir(brut, fondReference)

  // Une famille « encres » se montre a l'envers : la pastille EST l'encre, et
  // on la mesure contre le fond de page.
  if (surFond) {
    const r = contraste(fond, fondReference)
    return `
      <div class="pastille" style="background:${fondReference}">
        <div class="echantillon" style="color:${fond}">Aa</div>
        <div class="etiquette">
          <code>--color-${nomFond}</code>
          <span class="hex">${fond}</span>
          <span class="ratio ${verdict(r, SEUIL.texte)}">${r.toFixed(2)}:1</span>
        </div>
      </div>`
  }

  const lignes = encres
    .map((nomEncre) => {
      const encreBrute = jetonsEncres[nomEncre]
      if (encreBrute === undefined) return ''
      const encre = aplatir(encreBrute, fond)
      const r = contraste(encre, fond)
      return `<div class="sur" style="color:${encre}">
        <span>${nomEncre}</span><span class="ratio ${verdict(r, SEUIL.texte)}">${r.toFixed(2)}:1</span>
      </div>`
    })
    .join('')

  return `
    <div class="pastille" style="background:${fond}">
      ${lignes || '<div class="sur vide">&nbsp;</div>'}
      <div class="etiquette">
        <code>--color-${nomFond}</code>
        <span class="hex">${fond}</span>
      </div>
    </div>`
}

const colonnes = Object.entries(THEMES)
  .filter(([nom]) => nom !== 'profond')
  .map(
    ([nomTheme, jetons]) => `
  <section class="theme">
    <h2>${nomTheme}</h2>
    ${FAMILLES.map(
      (f) => `
      <div class="famille">
        <h3>${f.titre}</h3>
        <p class="note">${f.note}</p>
        <div class="grille">
          ${f.jetons.map((j) => pastille(nomTheme, jetons, j, f.encres, f.surFond, f.encresDe)).join('')}
        </div>
      </div>`,
    ).join('')}
  </section>`,
  )
  .join('')

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Bacchana - nuancier</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 32px; background: #f4f1ea; color: #1c1a17;
         font-family: system-ui, -apple-system, sans-serif; }
  h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: -0.01em; }
  .chapeau { margin: 0 0 28px; color: #5f584c; max-width: 70ch; line-height: 1.5; font-size: 14px; }
  .colonnes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
  .theme { background: #fffdf8; border: 1px solid #d8d2c6; border-radius: 10px; padding: 18px; }
  .theme h2 { margin: 0 0 16px; font-size: 15px; text-transform: uppercase;
              letter-spacing: 0.16em; color: #5f584c; }
  .famille { margin-bottom: 22px; }
  .famille h3 { margin: 0 0 2px; font-size: 14px; }
  .note { margin: 0 0 10px; font-size: 11.5px; line-height: 1.45; color: #6e6759; }
  .grille { display: grid; gap: 8px; }
  .pastille { border: 1px solid rgba(0,0,0,0.28); border-radius: 8px; padding: 10px 12px; }
  .echantillon { font-size: 22px; font-weight: 700; line-height: 1.1; }
  .sur { display: flex; justify-content: space-between; gap: 10px;
         font-size: 12px; font-weight: 600; padding: 1px 0; }
  .sur.vide { height: 8px; }
  .etiquette { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
               margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(0,0,0,0.14); }
  code { font-family: ui-monospace, monospace; font-size: 10.5px; color: #1c1a17;
         background: rgba(255,255,255,0.62); padding: 1px 4px; border-radius: 3px; }
  .hex { font-family: ui-monospace, monospace; font-size: 10.5px;
         background: rgba(255,255,255,0.62); padding: 1px 4px; border-radius: 3px; }
  .ratio { font-family: ui-monospace, monospace; font-size: 10.5px; padding: 1px 5px;
           border-radius: 3px; }
  .ratio.ok { background: #1b6b45; color: #ffffff; }
  .ratio.echec { background: #8e2a14; color: #ffffff; }
  footer { margin-top: 28px; font-size: 11.5px; color: #6e6759; max-width: 80ch; line-height: 1.5; }
</style>
</head>
<body>
  <h1>Bacchana - nuancier</h1>
  <p class="chapeau">
    Genere depuis <code>src/styles/tokens.css</code> par <code>scripts/nuancier.mjs</code>.
    Les pastilles ET leurs etiquettes sortent de la meme lecture : une planche dont les
    couleurs sont peintes a la main et les hexadecimaux recopies a cote ment des le premier
    correctif. Les ratios sont mesures selon WCAG 2.1 ; le vert marque 4,5:1 ou plus, le
    seuil du texte courant.
  </p>
  <div class="colonnes">${colonnes}</div>
  <footer>
    Trois themes, une seule regle de lecture : l'encre admise sur un fond est celle qui
    bascule AVEC lui. L'accent vaut pourpre en clair et jaune en sombre, donc seule
    <code>sur-surimpression</code> tient dessus ; les quatre ambres sont fixes dans les trois
    themes, donc seule <code>tile-ink</code> tient dessus. C'est cette distinction qui avait
    ete manquee sur la tuile du Borderland, a 1,72:1.
  </footer>
</body>
</html>`

mkdirSync('docs', { recursive: true })
writeFileSync('docs/NUANCIER.html', html, 'utf8')
console.log('ecrit docs/NUANCIER.html')

const navigateur = await chromium.launch()
const page = await navigateur.newPage({ viewport: { width: 1500, height: 1200 }, deviceScaleFactor: 2 })
await page.setContent(html, { waitUntil: 'load' })
await page.screenshot({ path: 'docs/nuancier.png', fullPage: true })
await navigateur.close()
console.log('ecrit docs/nuancier.png')
