#!/usr/bin/env node
/**
 * Prouve que `check_verrou.mjs` echoue quand elle le doit, controle par controle.
 *
 * Regle du chantier : une garde jamais vue rouge ne garde rien (CLAUDE.md
 * 17.5bis). Celle-ci merite la demonstration plus qu'une autre, parce que le
 * defaut qu'elle verrouille est SILENCIEUX : `npm install` le corrige sans
 * rien dire, donc personne ne le voit en developpement, et il n'apparait qu'au
 * `npm ci` d'une integration continue qui, ici, ne tourne plus depuis le
 * 2026-09-02.
 *
 * Les quatre regressions rejouees ne sont pas theoriques. Les trois premieres
 * sont la forme EXACTE des derives survenues les 13 et 14 septembre 2026 ; la
 * quatrieme est celle qui laisserait une faille de securite ouverte.
 *
 * Rien n'est ecrit sur le disque : les fichiers sont copies dans un dossier
 * temporaire, abimes la-bas, et la garde y est lancee par `RACINE_VERROU`.
 */
import { mkdtempSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const GARDE = join(RACINE, 'scripts/gardes/check_verrou.mjs')

let echecs = 0

/** Joue une regression dans un bac a sable, exige le rouge et le bon motif. */
function cas(titre, indice, abimer) {
  const bac = mkdtempSync(join(tmpdir(), 'verrou-'))
  try {
    for (const f of ['package.json', 'package-lock.json']) {
      copyFileSync(join(RACINE, f), join(bac, f))
    }
    const lire = (f) => JSON.parse(readFileSync(join(bac, f), 'utf8'))
    const ecrire = (f, o) => writeFileSync(join(bac, f), JSON.stringify(o, null, 2) + '\n')
    abimer({ lire, ecrire })

    const r = spawnSync('node', [GARDE], {
      encoding: 'utf8',
      env: { ...process.env, RACINE_VERROU: bac },
    })
    const sortie = (r.stdout || '') + (r.stderr || '')
    if (r.status === 0) {
      console.log(`  ECHEC  ${titre} : la garde est restee VERTE`)
      echecs++
    } else if (!sortie.includes(indice)) {
      console.log(`  ECHEC  ${titre} : rouge, mais sans nommer « ${indice} »`)
      console.log(sortie.trim().split('\n').map((l) => '         ' + l).join('\n'))
      echecs++
    } else {
      console.log(`  ok     ${titre}`)
    }
  } finally {
    rmSync(bac, { recursive: true, force: true })
  }
}

console.log('Preuve de la garde du verrou - quatre regressions volontaires\n')

// 1. La derive de version, exactement celle des PR #136, #138 et #148.
cas('version du verrou en retard', 'la racine du verrou annonce', ({ lire, ecrire }) => {
  const v = lire('package-lock.json')
  v.version = '0.0.1'
  v.packages[''].version = '0.0.1'
  ecrire('package-lock.json', v)
})

// 2. Une dependance ajoutee au paquet sans regenerer le verrou.
cas('dependance absente du verrou', 'absent du verrou', ({ lire, ecrire }) => {
  const p = lire('package.json')
  p.dependencies['une-dependance-jamais-verrouillee'] = '^1.0.0'
  ecrire('package.json', p)
})

// 3. Un intervalle modifie a la main dans le paquet, verrou intact.
cas('intervalle divergent', 'dans le paquet et', ({ lire, ecrire }) => {
  const p = lire('package.json')
  const nom = Object.keys(p.devDependencies)[0]
  p.devDependencies[nom] = '^99.0.0'
  ecrire('package.json', p)
})

// 4. LA PLUS IMPORTANTE : une surcharge de securite qui ne s applique pas.
//    Aucune erreur nulle part, la faille reste simplement ouverte.
cas('surcharge de securite inerte', 'surcharge INERTE', ({ lire, ecrire }) => {
  const p = lire('package.json')
  p.overrides = { ...p.overrides, dompurify: '^99.0.0' }
  ecrire('package.json', p)
})

console.log()
if (echecs) {
  console.error(`${echecs} controle(s) de la garde du verrou ne tiennent pas.`)
  process.exit(1)
}
console.log('Les quatre controles de check_verrou.mjs echouent bien quand ils le doivent.')
